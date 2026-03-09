import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { SelectModule } from 'primeng/select';
import { Router, RouterLink } from "@angular/router";
import { InputMaskModule } from 'primeng/inputmask';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FileUploadModule } from 'primeng/fileupload';
import { PasswordModule } from 'primeng/password';
import { QRCodeComponent } from 'angularx-qrcode';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';
import { MessageService } from 'primeng/api';

import { twoAccess } from '../../interface/login.interfaces';
import { After } from 'node:v8';
import { Spinner } from "../../../../shared/components/spinner/spinner";


@Component({
  selector: 'app-login2',
  providers: [MessageService],
  imports: [SelectModule, FormsModule, ButtonModule, InputMaskModule, CommonModule, SelectButtonModule, ToggleButtonModule, FileUploadModule, PasswordModule, PasswordModule, QRCodeComponent, DialogModule, ToastModule, ReactiveFormsModule, Spinner],
  templateUrl: './login2fase.html',
  styleUrl: './login2fase.css',
})
export class Login2 implements OnInit {




  //* === FORMULARIOS ===
  llavePrivadaForm!: FormGroup;
  llaveFile: File | null = null;

  //* === LISTAS Y DATOS TEMPORALES ===

  // objectTwoAccess : twoAccess = {
  //       activo: true,
  //       encodedSecret: '',
  //       user: '',
  //       lastLoginUTC: new Date() };

  objectTwoAccess: twoAccess | null = null;


  codigo: string = '';
  qrData: string = '';

  //* === ESTADOS DE UI Y MODALES ===
  visible: boolean = false;

  //* === FLAGS Y VARIABLES DE CONTROL ===
  isLoading: boolean=false;

  constructor(private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private mensaje: MessageService,
    private fb: FormBuilder,
    private el: ElementRef,
    private cd: ChangeDetectorRef


  ) { }


  ngOnInit() {
    this.getGoogle();
    this.llavePrivadaForm = this.fb.group({
      password: ['', Validators.required]
    });
  }

  step: 1 | 2 = 1;

  onValidarCodeAthenticator() {
    if (this.codigo === '') {
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Campo vacío, ingrese el código  para continuar.',
        life: 3000
      });
      return;
    } else {
      this.isLoading=true;
      this.cd.detectChanges();
      this.authService.postSendTwoFactorCodeAuthenticator(this.codigo).subscribe({
        next: (response) => {
          if (response.success) {
            this.tokenService.setTwoFactorValidated(true);
            this.router.navigate(['/perfil']);
          }
          else {
            this.mensaje.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Código incorrecto',
              life: 3000
            });

            return;
          }
        },
        error: (error) => {
          this.mensaje.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error al intentar validar.',
            life: 3000
          });
          this.isLoading=false;
          this.cd.detectChanges();
          return;
        },
        complete:()=>{
          this.isLoading=false;
          this.cd.detectChanges();
        }
      });

    }

  }

  loginOptions = [
    { label: 'Google Autenticator', value: 1 },
    { label: 'Llave Privada', value: 2 },
  ];


  getGoogle() {
    this.isLoading=true;
    this.cd.detectChanges();
    this.authService.GetTwoValidation().subscribe({
      next: (response) => {
        if (response.success) {

          this.objectTwoAccess = response.data;


          this.objectTwoAccess.encodedSecret = (this.objectTwoAccess.encodedSecret === null ? '' : this.objectTwoAccess.encodedSecret);

          this.qrData = 'otpauth://totp/Oaxaca-TV-' + this.objectTwoAccess.user + '?secret=' + this.objectTwoAccess.encodedSecret;
          // 
          // refresca el tap para el uso del  QR
          this.step = 2;
          this.step = 1;
          
        }
        else {
          this.mensaje.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Usuario o contraseña incorrectos.',
            life: 3000
          });
        }
      },
      error: (error) => {
        // this.mensaje.add({
        //   severity: 'error',
        //   summary: 'Error',
        //   detail: 'Ocurrió un error al intentar ingresar.',
        //   life: 3000
        // });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  // eventos del fileupload (solo .pfx)
  onFileSelect(event: any) {
    const file: File | undefined = event.files?.[0];
    if (!file) {
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pjo') {
      this.llaveFile = null;
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo se permiten archivos con extensión .pjo',
        life: 3000
      });
      return;
    }

    this.llaveFile = file;
  }

  onFileClear() {
    this.llaveFile = null;
  }

  onValidarLlavePrivada() {
    if (!this.llaveFile || this.llavePrivadaForm.invalid) {
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Seleccione un archivo .pjo y capture la contraseña.',
        life: 3000
      });
      return;
    }

    const password = this.llavePrivadaForm.get('password')!.value;

    const formData = new FormData();
    formData.append('file', this.llaveFile, this.llaveFile.name);

    this.isLoading=true;
    this.cd.detectChanges();
    this.authService.postValidaPrivateKey(formData, password).subscribe({
      next: (response) => {
        if (response.success) {
          this.tokenService.setTwoFactorValidated(true);
          this.router.navigate(['/perfil']);
        } else {
          this.mensaje.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Llave privada o contraseña incorrectas.',
            life: 3000
          });
        }
      },
      error: () => {
        this.mensaje.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al validar la llave privada.',
          life: 3000
        });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }


  codigoEnter() {
    if (!this.codigo || this.codigo.trim() === '' || this.codigo === undefined) {
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, ingrese el codigo de autenticator.',
        life: 3000
      });
      return;
    }
    else
      this.onValidarCodeAthenticator();
  }
  contraseniaEnter() {
    const pass = this.llavePrivadaForm.get('password')!.value;
    if (!pass || pass.trim() === '' || pass === undefined) {
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, ingrese su contraseña!.',
        life: 3000
      });
    }
    else
      this.onValidarLlavePrivada();
  }

  onLogout(): void {
    this.tokenService.logout();

    //this.router.navigate(['/login'], { replaceUrl: true });
  }
}







import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router';
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
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-login2',
  providers: [MessageService],
  imports: [
    SelectModule, FormsModule, ButtonModule, InputMaskModule, CommonModule,
    SelectButtonModule, ToggleButtonModule, FileUploadModule, PasswordModule,
    QRCodeComponent, DialogModule, ToastModule, ReactiveFormsModule, Spinner,
  ],
  templateUrl: './login2fase.html',
  styleUrl: './login2fase.css',
})
export class Login2 implements OnInit {

  llavePrivadaForm!: FormGroup;
  llaveFile: File | null  = null;
  objectTwoAccess: twoAccess | null = null;
  codigo: string   = '';
  qrData: string   = '';
  visible: boolean = false;
  isLoading: boolean = false;
  step: 1 | 2 = 1;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private mensaje: MessageService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getGoogle();
    this.llavePrivadaForm = this.fb.group({
      password: ['', Validators.required],
    });
  }

  // ── Validar código Authenticator ─────────────────────────────────────────

  onValidarCodeAthenticator() {
    if (!this.codigo?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Ingrese el código para continuar.', life: 3000 });
      return;
    }

    this.isLoading = true;
    this.cd.detectChanges();

    this.authService.postSendTwoFactorCodeAuthenticator(this.codigo).subscribe({
      next: async (response) => {
        if (response.success) {
          await this.tokenService.setTwoFactorValidated(true);
          // Confirma que quedó guardado antes de navegar
          const ok = await this.tokenService.isTwoFactorValidated();
          if (ok) {
            this.router.navigate(['/perfil']);
          } else {
            this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la sesión, intente de nuevo.', life: 3000 });
          }
        } else {
          this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Código incorrecto.', life: 3000 });
        }
      },
      error: () => {
        this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al intentar validar.', life: 3000 });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  loginOptions = [
    { label: 'Google Authenticator', value: 1 },
    { label: 'Llave Privada',        value: 2 },
  ];

  // ── Obtener datos 2FA ────────────────────────────────────────────────────

  getGoogle() {
    this.isLoading = true;
    this.cd.detectChanges();

    this.authService.GetTwoValidation().subscribe({
      next: (response) => {
        if (response.success) {
          this.objectTwoAccess = response.data;
          this.objectTwoAccess!.encodedSecret ??= '';
          this.qrData = `otpauth://totp/Oaxaca-TV-${this.objectTwoAccess!.user}?secret=${this.objectTwoAccess!.encodedSecret}`;
          this.step = 2;
          this.step = 1;
        } else {
          this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la configuración 2FA.', life: 3000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  // ── Llave privada ────────────────────────────────────────────────────────

  onFileSelect(event: any) {
    const file: File | undefined = event.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pjo') {
      this.llaveFile = null;
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Solo se permiten archivos con extensión .pjo', life: 3000 });
      return;
    }
    this.llaveFile = file;
  }

  onFileClear() { this.llaveFile = null; }

  onValidarLlavePrivada() {
    if (!this.llaveFile || this.llavePrivadaForm.invalid) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Seleccione un archivo .pjo y capture la contraseña.', life: 3000 });
      return;
    }

    const password = this.llavePrivadaForm.get('password')!.value;
    const formData = new FormData();
    formData.append('file', this.llaveFile, this.llaveFile.name);

    this.isLoading = true;
    this.cd.detectChanges();

    this.authService.postValidaPrivateKey(formData, password).subscribe({
      next: async (response) => {
        if (response.success) {
          await this.tokenService.setTwoFactorValidated(true);
          const ok = await this.tokenService.isTwoFactorValidated();
          if (ok) {
            this.router.navigate(['/perfil']);
          } else {
            this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la sesión, intente de nuevo.', life: 3000 });
          }
        } else {
          this.mensaje.add({ severity: 'error', summary: 'Error', detail: response.message || 'Llave privada o contraseña incorrectas.', life: 3000 });
        }
      },
      error: () => {
        this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al validar la llave privada.', life: 3000 });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  // ── Helpers de Enter ─────────────────────────────────────────────────────

  codigoEnter() {
    if (!this.codigo?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingrese el código de Authenticator.', life: 3000 });
      return;
    }
    this.onValidarCodeAthenticator();
  }

  contraseniaEnter() {
    const pass = this.llavePrivadaForm.get('password')!.value;
    if (!pass?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingrese su contraseña.', life: 3000 });
      return;
    }
    this.onValidarLlavePrivada();
  }

  onLogout(): void { this.tokenService.logout(); }
}
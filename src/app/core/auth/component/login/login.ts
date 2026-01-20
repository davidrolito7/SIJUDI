import { CommonModule } from '@angular/common';
import { Component, OnInit,HostListener,ViewChild,ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from "@angular/router";
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, CheckboxModule,ToastModule],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  @HostListener('window:beforeunload', ['$event'])
  usuario: string = '';
  contrasenia: string = '';
  idSistema: number = 4169;
  recordar: boolean = false;
  @ViewChild('passwordInput')
  passwordInput!:ElementRef;
  verPassword:boolean=false;

  constructor(
    private authService: AuthService,
    private router: Router,
    //private renderer: Renderer2,
    private el: ElementRef,
    private tokenService: TokenService,
    private mensaje: MessageService
  ) {}

  ngOnInit() {
    /*const container = this.el.nativeElement.querySelector('#container');

    if (container) {
      setTimeout(() => {
        this.renderer.addClass(container, 'sign-in');
      }, 200);
    }*/
  }

  /*toggle() {
    const container = this.el.nativeElement.querySelector('#container');

    if (container) {
      if (container.classList.contains('sign-in')) {
        this.renderer.removeClass(container, 'sign-in');
        this.renderer.addClass(container, 'sign-up');
      } else {
        this.renderer.removeClass(container, 'sign-up');
        this.renderer.addClass(container, 'sign-in');
      }
    }
  }*/

  forgotPassword() {
    window.open('https://virtual.tribunaloaxaca.gob.mx/ForgotPassword', '_blank');
  }
  passwordFocus(){
    if (this.usuario || this.usuario.trim()!=='' ) {
      this.passwordInput.nativeElement.focus();
    }
  }
  passwordEnter(){
    if(!this.contrasenia || this.contrasenia.trim()==='' || this.contrasenia === undefined)
    {
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, ingrese su contraseña.',
        life: 3000
      });
      return;
    }else{
      this.validarUsuario();
    }
  }

  validarUsuario() {
    if (!this.usuario || this.usuario.trim()==='' || this.usuario=== undefined) {
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, ingrese su usuario.',
        life: 3000
      });
      return;
    }
    if(!this.contrasenia || this.contrasenia.trim()==='' || this.contrasenia === undefined)
    {
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, ingrese su contraseña.',
        life: 3000
      });
      return;
    }

    this.authService.login(this.usuario, this.contrasenia, this.idSistema, this.recordar).subscribe({
      next: (response) => {
        if (response.success) {
          //console.log('Respuesta API:', response.success)

          this.authService.actualizaPerfilSeleccionado("");
          this.router.navigate(['login2fase']);
          //this.router.parseUrl('login2fase');

        } else {
          this.mensaje.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Usuario o contraseña incorrectos.',
            life: 3000
          });
        }
      },
      error: (error) => {
        //console.error('Error al validar usuario:', error);
        this.mensaje.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al intentar ingresar.',
          life: 3000
        });
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  clearSession(event: Event) {
    if (!localStorage.getItem('userSession')) {
      sessionStorage.removeItem('userSession');
    }
  }
  alternarPassword(){
    this.verPassword=!this.verPassword;
  }

}

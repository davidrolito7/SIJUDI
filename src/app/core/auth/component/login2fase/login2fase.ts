import { Component } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { SelectModule } from 'primeng/select';
import { Router, RouterLink } from "@angular/router";
import { InputMaskModule } from 'primeng/inputmask';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FileUploadModule } from 'primeng/fileupload';
import { PasswordModule } from 'primeng/password';
import { QRCodeComponent } from 'angularx-qrcode';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';
import { MessageService } from 'primeng/api';

import{twoAccess} from '../../interface/login.interfaces';


interface City {
  name: string;
  code: string;
}
@Component({
  selector: 'app-login2',
  providers: [MessageService],
  imports: [SelectModule, FormsModule, ButtonModule, InputMaskModule, CommonModule, SelectButtonModule, ToggleButtonModule, FileUploadModule, PasswordModule, PasswordModule,QRCodeComponent,DialogModule,ToastModule],
  templateUrl: './login2fase.html',
  styleUrl: './login2fase.css',
})
export class Login2 {

  code:string = '';

  constructor(private authService: AuthService,
    private router: Router,
  private tokenService: TokenService,
    private mensaje: MessageService
  ) { }
objectTwoAccess! :  twoAccess;
//  objectTwoAccess :  twoAccess= {
//          activo: false,
//     encodedSecret: '' ,
//     user: '',
//     LastLoginUTC : new Date()
//       };
 
  cities: City[] | undefined;

  selectedCity: City | undefined;

   qrData: string = '';
   visible:boolean = false;
   

  ngOnInit() {
    // this.cities = [
    //   { name: 'New York', code: 'NY' },
    //   { name: 'Rome', code: 'RM' },
    //   { name: 'London', code: 'LDN' },
    //   { name: 'Istanbul', code: 'IST' },
    //   { name: 'Paris', code: 'PRS' }
    // ];

   this.getGoogle();
  }

  step: 1 | 2 = 1;

  goToStep2() {

   if(this.code === ''){
     this.mensaje.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Campo vacío, ingrese el código  para continuar.',
          life: 3000
        });
    return;
   } else{

   

    this.authService.GetConfirmationTwoValidation(this.code.replace('-','')).subscribe({
      next: (response) => {
        if (response.success) {
         console.log('Respuesta API:', response.data);

// this.objectTwoAccess = response.data;

       this.goToStep2();


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
      error : (error) => {
        //console.error('Error al validar usuario:', error);
        this.mensaje.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al intentar validar.',
          life: 3000
        });
        return;
      }
  });

   }



   
  }

  loginOptions = [
    { label: 'Google Autenticator', value: 1 },
    { label: 'Llave Privada', value: 2 },
  ];


 getGoogle(){
  this.authService.GetTwoValidation().subscribe({
      next: (response) => {
        if (response.success) {
       //   console.log('Respuesta API:', response.data);

          this.objectTwoAccess = response.data;

          this.qrData = 'otpauth://totp/Oaxaca-TV-'+ this.objectTwoAccess.user +'?secret='+this.objectTwoAccess.encodedSecret ;


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
      error : (error) => {
        //console.error('Error al validar usuario:', error);
        this.mensaje.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al intentar ingresar.',
          life: 3000
        });
      }
  });
  } // end getGoogle()


salir(){
   this.router.navigate(['/login']);
}
}


  




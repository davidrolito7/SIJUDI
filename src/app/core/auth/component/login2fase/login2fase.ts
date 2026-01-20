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
interface City {
  name: string;
  code: string;
}
@Component({
  selector: 'app-login2',
  imports: [SelectModule, FormsModule, ButtonModule, RouterLink, InputMaskModule, CommonModule, SelectButtonModule, ToggleButtonModule, FileUploadModule, PasswordModule],
  templateUrl: './login2fase.html',
  styleUrl: './login2fase.css',
})
export class Login2 {

  constructor(private router: Router) { }

  cities: City[] | undefined;

  selectedCity: City | undefined;

  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
    ];
  }

  step: 1 | 2 = 1;

  goToStep2() {
    this.router.navigate(['/perfil']);
  }

  loginOptions = [
    { label: 'Google Autenticator', value: 1 },
    { label: 'Llave Privada', value: 2 },
  ];



}

import { Component } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { SelectModule } from 'primeng/select';
import { RouterLink } from "@angular/router";
import { InputMaskModule } from 'primeng/inputmask';
import { CommonModule } from '@angular/common';
interface City {
  name: string;
  code: string;
}
@Component({
  selector: 'app-login2',
  imports: [SelectModule, ButtonModule, RouterLink, InputMaskModule, CommonModule],
  templateUrl: './login2fase.html',
  styleUrl: './login2fase.css',
})
export class Login2 {
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

  step = 1;

  goToStep2() {
    this.step = 2;
  }


}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputMaskModule } from 'primeng/inputmask';

import { TokenService } from '../../service/token.service';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, SelectModule, ButtonModule, InputMaskModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  cities: City[] | undefined;
  selectedCity: City | undefined;

  constructor(private router: Router, private tokenService: TokenService) {}

  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];
  }

  continuar(): void {
    this.tokenService.setPerfilCompleted(true);
    this.router.navigate(['/tramites-juicio-oral'], { replaceUrl: true });
  }
}

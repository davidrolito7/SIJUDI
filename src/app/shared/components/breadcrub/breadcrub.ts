import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TokenService } from '../../../core/auth/service/token.service';

@Component({
  selector: 'app-breadcrub',
  imports: [BreadcrumbModule, AvatarModule],
  templateUrl: './breadcrub.html',
  styleUrl: './breadcrub.css',
})
export class Breadcrub {
  private readonly tokenService = inject(TokenService);

  items: MenuItem[] = [{ label: 'Exhortos' }, { label: 'Crear' }, { label: 'Listar', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  get abogadoNombre(): string {
    return this.tokenService.getAbogadoNombre() || 'Abogado';
  }

  get abogadoFotoUrl(): string {
    return this.tokenService.getAbogadoFotoUrl();
  }

  get areaNombre(): string {
    return this.tokenService.getAreaNombre();
  }

  get perfilNombre(): string {
    return this.tokenService.getPerfilNombre();
  }
}

import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TokenService } from '../../../core/auth/service/token.service';
import { DrawerModule } from "primeng/drawer";
import { AuthService } from '../../../core/auth/service/auth.service';
import { Router } from '@angular/router';
import { Button } from "primeng/button";

@Component({
  selector: 'app-breadcrub',
  imports: [BreadcrumbModule, AvatarModule, DrawerModule, Button],
  templateUrl: './breadcrub.html',
  styleUrl: './breadcrub.css',
})
export class Breadcrub {
visibleDrawer: boolean = false; 
  items: MenuItem[] = [{ label: 'Exhortos' }, { label: 'Crear' }, { label: 'Listar', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

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

    onLogout(): void {
    this.tokenService.logout();

    // limpia datos en memoria
    this.authService.vaciarPantallasUsuario();
    this.authService.setPantallasCargadas(false);

    // oculta menú lateral si estuviera abierto
   // this.showMenu.set(false);

    this.router.navigate(['/login'], { replaceUrl: true });
  }
    onChangeProfile(): void {
    // mantiene tokens y 2FA, pero obliga a completar perfil de nuevo
    this.tokenService.startProfileChange();

    // limpia estado del menú
   // this.showMenu.set(false);

    this.router.navigate(['/perfil'], { replaceUrl: true });
  }

  
  verPerfil(): void {
    this.router.navigate(['/datos-personales'], { replaceUrl: true });
  }
}

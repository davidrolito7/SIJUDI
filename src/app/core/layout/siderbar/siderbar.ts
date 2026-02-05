import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { iconForPantalla, svgSrcForModulo } from './icon/menu-icons.map';

import { UserMenuStore } from './user-menu.store';
import { ModulosUsuario } from '../../auth/interface/login.interfaces';
import { TokenService } from '../../auth/service/token.service';
import { AuthService } from '../../auth/service/auth.service';
import { filter } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-siderbar',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TooltipModule,
    DividerModule,
    AvatarModule,
    MenuModule,
    DrawerModule,
    ButtonModule
  ],
  templateUrl: './siderbar.html',
  styleUrl: './siderbar.css',

})
export class Siderbar {
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);
  private readonly menuStore = inject(UserMenuStore);

  readonly iconForPantalla = iconForPantalla;
  readonly svgSrcForModulo = svgSrcForModulo;
  visibleDrawer: boolean = false;
  readonly modulos = this.menuStore.modulos;

  readonly showMenu = signal(false);

  readonly userMenuItems: MenuItem[] = [
    {
      label: 'Cambiar perfil',
      icon: 'pi pi-user-edit',
      command: () => this.onChangeProfile(),
    },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout(),
    },
  ];

  @ViewChild('userMenu') private userMenu?: Menu;

  readonly menuVisible = signal(false);

  toggleUserMenu(event: Event): void {
    this.userMenu?.toggle(event);
  }

  private closeUserMenu(): void {
    this.menuVisible.set(false);
    this.userMenu?.hide();
  }

  private onLogout(): void {
    this.closeUserMenu();
    this.tokenService.logout();

    // limpia datos en memoria
    this.authService.vaciarPantallasUsuario();
    this.authService.setPantallasCargadas(false);

    // oculta menú lateral si estuviera abierto
    this.showMenu.set(false);

    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onChangeProfile(): void {
    this.closeUserMenu();
    // mantiene tokens y 2FA, pero obliga a completar perfil de nuevo
    this.tokenService.startProfileChange();

    // limpia estado del menú
    this.showMenu.set(false);

    this.router.navigate(['/perfil'], { replaceUrl: true });
  }

  readonly selectedModuloId = signal<number | null>(null);

  readonly selectedModulo = computed(() =>
    this.modulos().find((m) => m.idSistemaModulo === this.selectedModuloId()) ?? null
  );

  readonly pantallasVisibles = computed(() => {
    const mod = this.selectedModulo();
    if (!mod) return [];
    return (mod.pantallas ?? []).filter((p) => p.visibleMenu);
  });

  constructor() {
    this.menuStore.ensureLoaded().pipe(takeUntilDestroyed()).subscribe({
      next: (mods) => {
        if (!this.selectedModuloId() && mods.length > 0) {
          this.selectedModuloId.set(mods[0].idSistemaModulo);
        }
      },
    });

    effect(() => {
      this.showMenu.set(!!this.selectedModulo());
    });
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationStart),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.closeUserMenu(); // esto hace hide() y baja tu signal
      });
  }

  toggleModulo(mod: ModulosUsuario): void {
    const same = this.selectedModuloId() === mod.idSistemaModulo;
    this.selectedModuloId.set(same ? null : mod.idSistemaModulo);
    if (same) this.showMenu.set(false);
  }

  closeMenu(): void {
    this.showMenu.set(false);
    this.selectedModuloId.set(null);
  }
}

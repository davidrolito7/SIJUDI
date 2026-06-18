import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { svgSrcForPantalla, svgSrcForModulo } from './icon/menu-icons.map';

import { UserMenuStore } from './user-menu.store';
import { ModulosUsuario } from '../../auth/interface/login.interfaces';
import { TokenService } from '../../auth/service/token.service';
import { AuthService } from '../../auth/service/auth.service';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AppIcon } from "./icon/app-icon.component";
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { DrawerService } from '../../../shared/service/drawer.service';
import { ContadoresService } from '../../../juicio-oral/services/contadores.service';
import { Observable } from 'rxjs';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

export const sidebarAnimations = [
  trigger('sidebarWidth', [
    state('expanded', style({ width: '17rem' })),
    state('collapsed', style({ width: '5rem' })),
    transition('expanded <=> collapsed', [
      animate('280ms cubic-bezier(0.4, 0, 0.2, 1)'),
    ]),
  ]),

  trigger('fadeText', [
    state('visible', style({ opacity: 1, maxWidth: '14rem' })),
    state('hidden', style({ opacity: 0, maxWidth: '0px' })),
    transition('hidden => visible', [animate('220ms 60ms ease-out')]),
    transition('visible => hidden', [animate('150ms ease-in')]),
  ]),

  trigger('accordion', [
    state('closed', style({ height: '0px', opacity: 0 })),
    state('open', style({ height: '*', opacity: 1 })),
    transition('closed => open', [
      animate('220ms cubic-bezier(0.4, 0, 0.2, 1)'),
    ]),
    transition('open => closed', [
      animate('180ms cubic-bezier(0.4, 0, 0.2, 1)'),
    ]),
  ]),

  trigger('chevronRotate', [
    state('closed', style({ transform: 'rotate(0deg)' })),
    state('open', style({ transform: 'rotate(180deg)' })),
    transition('closed <=> open', [animate('200ms ease')]),
  ]),

  trigger('railScale', [
    state('off', style({ transform: 'scaleY(0)' })),
    state('on', style({ transform: 'scaleY(1)' })),
    transition('off <=> on', [animate('180ms ease')]),
  ]),
];

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
    DrawerModule,
    ButtonModule,
    StyleClassModule,
    RippleModule,
    BadgeModule,
    OverlayBadgeModule,

  ],
  templateUrl: './siderbar.html',
  styleUrl: './siderbar.css',
  animations: sidebarAnimations,
})
export class Siderbar {
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);
  private readonly menuStore = inject(UserMenuStore);
  readonly drawerService = inject(DrawerService);

  visibleDrawer: boolean = false;

  readonly svgSrcForPantalla = svgSrcForPantalla;
  readonly svgSrcForModulo = svgSrcForModulo;


  readonly modulos = this.menuStore.modulos;
  readonly showMenu = signal(true);

  readonly selectedModuloId = signal<number | null>(null);

  readonly selectedModulo = computed(() =>
    this.modulos().find((m) => m.idSistemaModulo === this.selectedModuloId()) ?? null
  );

  readonly pantallasVisibles = computed(() => {
    const mod = this.selectedModulo();
    if (!mod) return [];
    return (mod.pantallas ?? []).filter((p) => p.visibleMenu);
  });

  constructor(private contadoresService: ContadoresService) {
    this.menuStore
      .ensureLoaded()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (mods) => {
          // if (!this.selectedModuloId() && mods.length > 0) {
          //   this.selectedModuloId.set(mods[0].idSistemaModulo);
          // }
        },
      });
  }

  // ngOnInit(): void {
  //   this.contadoresService.cargarContadores();
  // }

  // ngOnDestroy(): void {
  //   this.contadoresService.detenerPolling();
  // }


  onLogout(): void {
    this.tokenService.logout();

    // limpia datos en memoria
    this.authService.vaciarPantallasUsuario();
    this.authService.setPantallasCargadas(false);

    // oculta menú lateral si estuviera abierto
    this.showMenu.set(false);

    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onChangeProfile(): void {
    // mantiene tokens y 2FA, pero obliga a completar perfil de nuevo
    this.tokenService.startProfileChange();

    // limpia estado del menú
    this.showMenu.set(false);

    this.router.navigate(['/perfil'], { replaceUrl: true });
  }

  toggleSidebar(): void {
    const nextState = !this.showMenu();
    this.showMenu.set(nextState);

    if (!nextState) {
      this.selectedModuloId.set(null);
    }
  }

  toggleModulo(mod: ModulosUsuario): void {
    const same = this.selectedModuloId() === mod.idSistemaModulo;

    if (!this.showMenu()) {
      this.showMenu.set(true);
      this.selectedModuloId.set(mod.idSistemaModulo);
      return;
    }

    this.selectedModuloId.set(same ? null : mod.idSistemaModulo);
  }

  closeMenu(): void {
    this.showMenu.set(false);
    this.selectedModuloId.set(null);
  }
  // Agrega junto a los otros métodos
  pantallasDeModulo(mod: ModulosUsuario) {
    return (mod.pantallas ?? []).filter((p) => p.visibleMenu);
  }

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
  getBadge(IdPantalla: number): Observable<number | null> {
    return this.contadoresService.getContadorParaPantalla(IdPantalla);
  }
}

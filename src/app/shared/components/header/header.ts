import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, finalize, Subscription } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { TokenService } from '../../../core/auth/service/token.service';
import { AuthService } from '../../../core/auth/service/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { NotificacionResponse } from '../../interface/shared.interface';
import { NotificacionToastComponent } from '../notificacion-toast/notificacion-toast';
import { estiloNotificacion, origenResumen } from '../notificacion-toast/notificacion-estilos';
import { UserMenuStore } from '../../../core/layout/siderbar/user-menu.store';
import { svgSrcForPantalla, svgSrcForModulo } from '../../../core/layout/siderbar/icon/menu-icons.map';
import { ModulosUsuario } from '../../../core/auth/interface/login.interfaces';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    AvatarModule,
    DrawerModule,
    Button,
    CommonModule,
    BadgeModule,
    OverlayBadgeModule,
    NotificacionToastComponent,
    RouterLink,
    RouterLinkActive,
    StyleClassModule,
    RippleModule,
    TooltipModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideOutRight', [
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class Header implements OnInit, OnDestroy {
  readonly visibleDrawer = signal(false);
  readonly visibleNotificaciones = signal(false);
  readonly visibleMenuDrawer = signal(false);
  readonly temaOscuro = signal(false);
  readonly temaIcono = computed(() => this.temaOscuro() ? 'pi pi-sun' : 'pi pi-moon');
  readonly temaAriaLabel = computed(() => this.temaOscuro() ? 'Activar modo claro' : 'Activar modo oscuro');

  notificaciones = signal<NotificacionResponse[]>([]);
  notificacionToast = signal<NotificacionResponse | null>(null);
  pendientes = signal(0);
  cargandoNotificaciones = signal(false);
  drawerMobileTab: 'perfil' | 'notificaciones' = 'perfil';

  readonly svgSrcForPantalla = svgSrcForPantalla;
  readonly svgSrcForModulo = svgSrcForModulo;

  private socketSub?: Subscription;
  private navigationSub?: Subscription;
  private readonly tokenService = inject(TokenService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly authService = inject(AuthService);
  private readonly menuStore = inject(UserMenuStore);
  readonly modulos = this.menuStore.modulos;
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly marcandoLeida = new Set<number>();

  pantallasDeModulo(mod: ModulosUsuario) {
    return (mod.pantallas ?? []).filter((p) => p.visibleMenu);
  }

  closeMenuDrawer(): void {
    this.visibleMenuDrawer.set(false);
    this.scheduleOverlayMaskCleanup();
  }

  closeNotificacionesDrawer(): void {
    this.visibleNotificaciones.set(false);
    this.scheduleOverlayMaskCleanup();
  }

  closePerfilDrawer(): void {
    this.visibleDrawer.set(false);
    this.scheduleOverlayMaskCleanup();
  }

  // Bug conocido de PrimeNG (primefaces/primeng#19498): al cerrar un Drawer al mismo
  // tiempo que el router reemplaza el contenido de la página, la máscara del overlay
  // puede quedar atascada a mitad de su animación de salida (nunca llega 'animationend'),
  // bloqueando todos los clics. Si sigue en el DOM pasado el tiempo de la transición y
  // ningún drawer sigue abierto, la limpiamos manualmente.
  private scheduleOverlayMaskCleanup(): void {
    setTimeout(() => {
      if (this.visibleMenuDrawer() || this.visibleNotificaciones() || this.visibleDrawer()) return;

      this.document.querySelectorAll('.p-drawer-mask').forEach((mask) => mask.remove());
      this.document.body.classList.remove('p-overflow-hidden');
    }, 400);
  }

  ngOnInit(): void {
    this.cargarTemaGuardado();

    this.socketSub = this.notificacionesService.escucharNotificaciones().subscribe({
      next: (resp) => {
        this.agregarNotificacionSocket(resp.data);
      }
    });

    this.notificacionesService.conectarSocket();
    this.cargarNotificaciones();

    this.navigationSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenuDrawer();
        this.closeNotificacionesDrawer();
        this.closePerfilDrawer();
      });
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
    this.navigationSub?.unsubscribe();
    this.notificacionesService.desconectarSocket();
  }

  toggleTema(): void {
    const switchTheme = (): void => {
      const esOscuro = !this.temaOscuro();
      this.temaOscuro.set(esOscuro);

      const root = this.document.documentElement;
      root.classList.toggle('dark', esOscuro);
      root.style.colorScheme = esOscuro ? 'dark' : 'light';
      this.document.defaultView?.localStorage.setItem('sijudi-theme', esOscuro ? 'dark' : 'light');
    };

    if (!this.document.startViewTransition) {
      switchTheme();
      return;
    }

    this.document.startViewTransition(switchTheme);
  }

  cargarNotificaciones(): void {
    this.cargandoNotificaciones.set(true);

    this.notificacionesService.obtenerMisNotificaciones().subscribe({
      next: (resp) => {
        this.notificaciones.set((resp.data?.notificaciones ?? []).filter(n => !n.leida));
        this.pendientes.set(resp.data?.pendientes ?? 0);
        this.cargandoNotificaciones.set(false);
      },
      error: () => {
        this.cargandoNotificaciones.set(false);
      }
    });
  }

  marcarNotificacionLeida(notif: NotificacionResponse): void {
    if (!notif?.id || notif.leida || this.marcandoLeida.has(notif.id)) {
      return;
    }

    const notificacionesPrevias = this.notificaciones();
    const pendientesPrevios = this.pendientes();

    this.marcandoLeida.add(notif.id);

    this.notificaciones.update(n => n.filter(notif2 => notif2.id !== notif.id));
    this.pendientes.update(p => Math.max(0, p - 1));

    this.notificacionesService.marcarLeida(notif.id)
      .pipe(
        finalize(() => {
          this.marcandoLeida.delete(notif.id);
        })
      )
      .subscribe({
        error: () => {
          this.notificaciones.set(notificacionesPrevias);
          this.pendientes.set(pendientesPrevios);
        }
      });
  }

  //Estilos compartidos con el toast para que las notificaciones se vean igual en ambos lugares
  readonly estilo = estiloNotificacion;
  readonly origenResumen = origenResumen;

  onToastCerrada(): void {
    this.notificacionToast.set(null);
  }

  //Marca la notificacion como leida y lleva a la ruta de su tipo de tramite; el idTramite viaja en window.history.state.id
  abrirNotificacion(notif: NotificacionResponse): void {
    this.marcarNotificacionLeida(notif);

    const route = notif?.tipoTramite?.route;
    if (!route) return;

    const url = `/${route.replace(/^\/+/, '')}`;
    const navegar = () => this.router.navigateByUrl(url, { state: { id: notif.idTramite } });

    //Si ya estamos en esa ruta Angular ignora la navegacion y el componente no se recrea;
    //se pasa por una ruta intermedia sin tocar la URL para que vuelva a ejecutar ngOnInit con el nuevo state
    if (this.router.url.split('?')[0] === url) {
      this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => navegar());
    } else {
      navegar();
    }
  }

  get abogadoNombre(): string {
    return this.tokenService.getAbogadoNombre() || 'Abogado';
  }

  get abogadoFotoUrl(): string {
    return this.tokenService.getAbogadoFotoUrl() || '/profile.png';
  }

  get areaNombre(): string {
    return this.tokenService.getAreaNombre();
  }

  get perfilNombre(): string {
    return this.tokenService.getPerfilNombre();
  }

  get subAreaNombre(): string {
    return this.tokenService.getSubAreaNombre();
  }

  onLogout(): void {
    this.tokenService.logout();
    this.authService.vaciarPantallasUsuario();
    this.authService.setPantallasCargadas(false);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onChangeProfile(): void {
    this.tokenService.startProfileChange();
    this.router.navigate(['/perfil'], { replaceUrl: true });
  }

  verPerfil(): void {
    this.router.navigate(['/datos-personales'], { replaceUrl: true });
  }

    verLlaveAcceso(): void {
    this.router.navigate(['/llave-acceso'], { replaceUrl: true });
  }


  private cargarTemaGuardado(): void {
    const temaGuardado = this.document.defaultView?.localStorage.getItem('sijudi-theme') === 'dark';
    this.temaOscuro.set(temaGuardado);

    const root = this.document.documentElement;
    root.classList.toggle('dark', temaGuardado);
    root.style.colorScheme = temaGuardado ? 'dark' : 'light';
  }

  private agregarNotificacionSocket(notif: NotificacionResponse): void {
    const nueva: NotificacionResponse = {
      ...notif,
      leida: notif.leida ?? false
    };

    if (nueva.leida) {
      this.notificaciones.update(n => n.filter(notificacion => notificacion.id !== nueva.id));
      return;
    }

    const yaExiste = this.notificaciones().some(n => n.id === nueva.id);
    if (yaExiste) {
      this.notificaciones.update(n =>
        n.map(notificacion =>
          notificacion.id === nueva.id ? { ...notificacion, ...nueva } : notificacion
        )
      );
      return;
    }

    this.notificaciones.update(n => [nueva, ...n]);
    this.pendientes.update(p => p + 1);
    this.notificacionToast.set({ ...nueva });
  }

    eresEmpleado(): boolean {
    const idSistemaPerfil = this.tokenService.getUserFromToken()?.idSistemaPerfil;

    return ![10,1011,1012].includes(idSistemaPerfil);
  }
}


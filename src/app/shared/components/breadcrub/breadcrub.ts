import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router, NavigationEnd, ActivatedRoute, RouterModule, UrlSegment } from '@angular/router';
import { filter, finalize, Subscription } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { TokenService } from '../../../core/auth/service/token.service';
import { DrawerModule } from "primeng/drawer";
import { AuthService } from '../../../core/auth/service/auth.service';
import { Button } from "primeng/button";
import { DrawerService } from '../../service/drawer.service';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { NotificacionesService } from '../../services/notificaciones.service';
import { NotificacionResponse } from '../../interface/shared.interface';
import { NotificacionToastComponent } from '../notificacion-toast/notificacion-toast';

export interface BreadcrumbItem {
  label: string;
  routerLink?: string;
}

@Component({
  selector: 'app-breadcrub',
  imports: [AvatarModule, DrawerModule, Button, CommonModule, RouterModule, BadgeModule, OverlayBadgeModule, NotificacionToastComponent],
  templateUrl: './breadcrub.html',
  styleUrl: './breadcrub.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideOutRight', [
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class Breadcrub implements OnInit, OnDestroy {

  breadcrumbs: BreadcrumbItem[] = [];
  visibleDrawer: boolean = false;
  visibleNotificaciones: boolean = false;
  
  notificaciones = signal<NotificacionResponse[]>([]);
  notificacionToast = signal<NotificacionResponse | null>(null);
  pendientes = signal(0);
  cargandoNotificaciones = signal(false);

  private sub!: Subscription;
  private socketSub?: Subscription;
  private readonly tokenService = inject(TokenService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly authService = inject(AuthService);
  readonly drawerService = inject(DrawerService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly marcandoLeida = new Set<number>();

  ngOnInit(): void {
    this.buildBreadcrumbs();

    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.buildBreadcrumbs());

    this.socketSub = this.notificacionesService.escucharNotificaciones().subscribe({
      next: (resp) => {
        this.agregarNotificacionSocket(resp.data);
      }
    });

    this.notificacionesService.conectarSocket();
    this.cargarNotificaciones();
  }
  private agregarNotificacionSocket(notif: NotificacionResponse): void {
    const nueva: NotificacionResponse = {
      ...notif,
      leida: notif.leida ?? false
    };

    if (nueva.leida) {
      this.notificaciones.update(n => n.filter(notif => notif.id !== nueva.id));
    } else {
      const yaExiste = this.notificaciones().some(n => n.id === nueva.id);
      if (yaExiste) {
        this.notificaciones.update(n => 
          n.map(notif =>
            notif.id === nueva.id ? { ...notif, ...nueva } : notif
          )
        );
      } else {
        this.notificaciones.update(n => [nueva, ...n]);
        this.pendientes.update(p => p + 1);
        // Mostrar en el toast
        this.notificacionToast.set({ ...nueva });
      }
    }
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.socketSub?.unsubscribe();
    this.notificacionesService.desconectarSocket();
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

  onToastCerrada(): void {
    this.notificacionToast.set(null);
  }
  
  private buildBreadcrumbs(): void {
    const crumbs: BreadcrumbItem[] = [];
    let route: ActivatedRoute | null = this.activatedRoute.root;
    let url = '';

    while (route) {
      const children: ActivatedRoute[] = route.children;
      if (!children.length) break;

      let found = false;
      for (const child of children) {
        const segment = child.snapshot.url.map((s: UrlSegment) => s.path).join('/');
        if (segment) url += '/' + segment;

        const title = child.snapshot.data?.['title'];
        if (title) {
          crumbs.push({ label: title, routerLink: url });
        }

        route = child;
        found = true;
        break;
      }

      if (!found) break;
    }

    this.breadcrumbs = crumbs;
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
}
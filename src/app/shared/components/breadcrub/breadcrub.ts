import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { NotificacionesService, Notificacion } from '../../services/notificaciones.service';
export interface BreadcrumbItem {
  label: string;
  routerLink?: string;
}

@Component({
  selector: 'app-breadcrub',
  imports: [AvatarModule, DrawerModule, Button, CommonModule, RouterModule, BadgeModule, OverlayBadgeModule],
  templateUrl: './breadcrub.html',
  styleUrl: './breadcrub.css',
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
  notificaciones: Notificacion[] = [];
  pendientes = 0;
  cargandoNotificaciones = false;

  private sub!: Subscription;
  private socketSub?: Subscription;
  private readonly tokenService = inject(TokenService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly authService = inject(AuthService);
  readonly drawerService = inject(DrawerService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly marcandoLeida = new Set<number>();

  ngOnInit(): void {
    this.buildBreadcrumbs();

    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.buildBreadcrumbs());

    this.socketSub = this.notificacionesService.escucharNotificaciones().subscribe({
      next: (notif) => {
        this.agregarNotificacionSocket(notif);
      }
    });

    this.notificacionesService.conectarSocket();
    this.cargarNotificaciones();
  }
  private agregarNotificacionSocket(notif: Notificacion): void {
    const nueva: Notificacion = {
      ...notif,
      leida: notif.leida ?? false
    };

    if (nueva.leida) {
      this.notificaciones = this.notificaciones.filter(n => n.id !== nueva.id);
    } else {
      const yaExiste = this.notificaciones.some(n => n.id === nueva.id);
      if (yaExiste) {
        this.notificaciones = this.notificaciones.map(n =>
          n.id === nueva.id ? { ...n, ...nueva } : n
        );
      } else {
        this.notificaciones = [nueva, ...this.notificaciones];
        this.pendientes += 1;
      }
    }

    this.cdr.markForCheck();
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.socketSub?.unsubscribe();
    this.notificacionesService.desconectarSocket();
  }

  cargarNotificaciones(): void {
    this.cargandoNotificaciones = true;

    this.notificacionesService.obtenerMisNotificaciones().subscribe({
      next: (resp) => {
        this.notificaciones = (resp.notificaciones ?? []).filter(n => !n.leida);
        this.pendientes = resp.pendientes ?? 0;
        this.cargandoNotificaciones = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoNotificaciones = false;
        this.cdr.markForCheck();
      }
    });
  }

  marcarNotificacionLeida(notif: Notificacion): void {
    if (!notif?.id || notif.leida || this.marcandoLeida.has(notif.id)) {
      return;
    }

    const notificacionesPrevias = this.notificaciones;
    const pendientesPrevios = this.pendientes;

    this.marcandoLeida.add(notif.id);

    this.notificaciones = this.notificaciones.filter(n => n.id !== notif.id);

    this.pendientes = Math.max(0, this.pendientes - 1);
    this.cdr.markForCheck();

    this.notificacionesService.marcarLeida(notif.id)
      .pipe(
        finalize(() => {
          this.marcandoLeida.delete(notif.id);
        })
      )
      .subscribe({
        error: () => {
          this.notificaciones = notificacionesPrevias;
          this.pendientes = pendientesPrevios;
          this.cdr.markForCheck();
        }
      });
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
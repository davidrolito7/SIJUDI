import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterModule, UrlSegment } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { TokenService } from '../../../core/auth/service/token.service';
import { DrawerModule } from "primeng/drawer";
import { AuthService } from '../../../core/auth/service/auth.service';
import { Button } from "primeng/button";
import { DrawerService } from '../../service/drawer.service';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  routerLink?: string;
}

@Component({
  selector: 'app-breadcrub',
  imports: [AvatarModule, DrawerModule, Button, CommonModule, RouterModule],
  templateUrl: './breadcrub.html',
  styleUrl: './breadcrub.css',
})
export class Breadcrub implements OnInit, OnDestroy {

  breadcrumbs: BreadcrumbItem[] = [];
  visibleDrawer: boolean = false;

  private sub!: Subscription;
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);
  readonly drawerService = inject(DrawerService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.buildBreadcrumbs();
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.buildBreadcrumbs());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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
  get subAreaNombre(): string{
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
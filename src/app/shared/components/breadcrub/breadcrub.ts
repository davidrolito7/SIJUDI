import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, UrlSegment } from '@angular/router';
import { filter, Subscription } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  routerLink?: string;
}

@Component({
  selector: 'app-breadcrub',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrub.html',
  styleUrl: './breadcrub.css',
})
export class Breadcrub implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];

  private sub?: Subscription;
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
      if (!children.length) {
        break;
      }

      let found = false;
      for (const child of children) {
        const segment = child.snapshot.url.map((s: UrlSegment) => s.path).join('/');
        if (segment) {
          url += '/' + segment;
        }

        const title = child.snapshot.data?.['title'];
        if (title) {
          crumbs.push({ label: title, routerLink: url });
        }

        route = child;
        found = true;
        break;
      }

      if (!found) {
        break;
      }
    }

    this.breadcrumbs = crumbs;
  }
}

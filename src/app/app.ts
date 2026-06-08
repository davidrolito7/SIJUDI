import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('SIJUDI');
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }
}

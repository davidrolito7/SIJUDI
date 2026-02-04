import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserMenuStore } from './user-menu.store'; // ajusta ruta
import { ModulosUsuario } from '../../auth/interface/login.interfaces';

function iconForModule(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes('exhort')) return 'pi pi-home';
  if (n.includes('ampar')) return 'pi pi-comment';
  if (n.includes('oficial')) return 'pi pi-inbox';
  return 'pi pi-th-large';
}

@Component({
  selector: 'app-siderbar',
  imports: [CommonModule, RouterOutlet,RouterLink, RouterLinkActive, TooltipModule, DividerModule, AvatarModule],
  templateUrl: './siderbar.html',
  styleUrl: './siderbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Siderbar {
  private readonly menuStore = inject(UserMenuStore);

  readonly modulos = this.menuStore.modulos;

  readonly showMenu = signal(false);
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
      // si hay módulo seleccionado, abre panel; si no, cierra
      this.showMenu.set(!!this.selectedModulo());
    }, { allowSignalWrites: true });
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

  moduleIcon(mod: ModulosUsuario): string {
    return iconForModule(mod.nombre);
  }
}

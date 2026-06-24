import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificacionResponse } from '../../interface/shared.interface';

@Component({
  selector: 'app-notificacion-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible && notificacion) {
      <div class="fixed top-4 right-4 z-[9999] max-w-md w-full" @slideInDown>
        <div class="bg-white dark:bg-surface-800 rounded-lg shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <!-- Breadcrub con icono y botón cerrar -->
          <div class="flex items-center justify-between p-4 bg-gradient-to-r" [ngClass]="getGradient()">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- Icono según acción -->
              <div class="h-10 w-10 rounded-full flex items-center justify-center text-sm flex-shrink-0" [ngClass]="getIconColor()">
                <i class="pi text-lg" [ngClass]="getIcon()"></i>
              </div>
              
              <!-- Contenido -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-sm text-white truncate">
                    {{ notificacion.accion }}
                  </span>
                  <span class="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                    {{ notificacion.folio }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Botón cerrar -->
            <button
              type="button"
              (click)="cerrar()"
              class="ml-2 flex-shrink-0 text-white hover:bg-white/20 rounded-md p-1 transition-colors"
              aria-label="Cerrar notificación">
              <i class="pi pi-times text-lg"></i>
            </button>
          </div>

          <!-- Mensaje -->
          <div class="p-4">
            <p class="text-sm text-surface-600 dark:text-surface-300 leading-snug">
              {{ notificacion.mensaje }}
            </p>
            
            <!-- Metadata -->
            <div class="mt-3 flex gap-1 text-xs font-semibold">
              <span class="text-surface-500 dark:text-surface-400">
                {{ notificacion.origen.area.descripcion }}
              </span>
              <span class="text-surface-300 dark:text-surface-600">•</span>
              <span class="text-surface-500 dark:text-surface-400">
                {{ notificacion.origen.sistemaPerfil.descripcion }}
              </span>
              <span class="text-surface-300 dark:text-surface-600">•</span>
              <span class="text-surface-500 dark:text-surface-400">
                {{ notificacion.origen.subArea.descripcion }}
              </span>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="h-1 bg-surface-100 dark:bg-surface-700">
            <div class="h-full" [ngClass]="getProgressColor()" [style.animation]="'progress 5s linear'"></div>
          </div>
        </div>
      </div>
    }

    <style>
      @keyframes progress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
    </style>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  animations: [
    trigger('slideInDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificacionToastComponent implements OnChanges, OnDestroy {
  @Input() notificacion: NotificacionResponse | null = null;
  @Output() cerrada = new EventEmitter<void>();

  visible = false;
  private timeoutId?: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notificacion'] && this.notificacion) {
      this.limpiarTimer();
      this.visible = true;
      this.iniciarTimer();
    }
  }

  ngOnDestroy(): void {
    this.limpiarTimer();
  }

  private iniciarTimer(): void {
    this.timeoutId = window.setTimeout(() => {
      this.cerrar();
    }, 5000);
  }

  private limpiarTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  cerrar(): void {
    this.limpiarTimer();
    this.visible = false;
    setTimeout(() => {
      this.cerrada.emit();
    }, 300);
  }

  getIcon(): string {
    if (!this.notificacion) return 'pi-bell';
    switch (this.notificacion.accion) {
      case 'NUEVO_TRAMITE':
      case 'NUEVO':
        return 'pi-inbox';
      case 'TURNADO':
        return 'pi-send';
      case 'FORANEO':
        return 'pi-globe';
      default:
        return 'pi-bell';
    }
  }

  getIconColor(): string {
    if (!this.notificacion) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400';
    switch (this.notificacion.accion) {
      case 'NUEVO_TRAMITE':
      case 'NUEVO':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400';
      case 'TURNADO':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400';
      case 'FORANEO':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400';
      default:
        return 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400';
    }
  }

  getGradient(): string {
    if (!this.notificacion) return 'from-blue-500 to-blue-600';
    switch (this.notificacion.accion) {
      case 'NUEVO_TRAMITE':
      case 'NUEVO':
        return 'from-blue-500 to-blue-600';
      case 'TURNADO':
        return 'from-orange-500 to-orange-600';
      case 'FORANEO':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-green-500 to-green-600';
    }
  }

  getProgressColor(): string {
    if (!this.notificacion) return 'bg-blue-500';
    switch (this.notificacion.accion) {
      case 'NUEVO_TRAMITE':
      case 'NUEVO':
        return 'bg-blue-500';
      case 'TURNADO':
        return 'bg-orange-500';
      case 'FORANEO':
        return 'bg-purple-500';
      default:
        return 'bg-green-500';
    }
  }
}

import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificacionResponse } from '../../interface/shared.interface';
import { EstiloAccion, estiloNotificacion, origenDetalle, origenResumen } from './notificacion-estilos';

const DURACION_MS = 6000;

@Component({
  selector: 'app-notificacion-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible() && notificacion) {
      <div
        class="fixed inset-x-4 top-4 z-9999 sm:left-auto sm:right-4 sm:w-96"
        role="status" aria-live="polite" @slideIn
        (mouseenter)="pausar()" (mouseleave)="reanudar()" (click)="abrirToast()">
        <div
          class="relative overflow-hidden rounded-lg border border-surface-200 bg-white shadow-lg cursor-pointer dark:border-surface-700 dark:bg-surface-900">
          <!-- Acento de color a la izquierda -->
          <span class="absolute inset-y-0 left-0 w-1" [ngClass]="estilo.acento"></span>

          <div class="flex gap-3 p-4 pl-5">
            <!-- Icono -->
            <div class="flex h-9 w-9 shrink-0 rounded-md items-center justify-center border" [ngClass]="estilo.iconoColor">
              <i class="pi" [ngClass]="estilo.icono"></i>
            </div>

            <div class="min-w-0 flex-1">
              <!-- Titulo + folio -->
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-sm font-semibold leading-5 text-surface-900 dark:text-surface-0">
                    {{ estilo.etiqueta }}
                  </p>
                  <p class="mt-0.5 font-mono text-xs text-surface-500 dark:text-surface-400 truncate">
                    Folio {{ notificacion.folio }}
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <span class="text-xs text-surface-400 dark:text-surface-500">Ahora</span>
                  <button type="button" (click)="cerrar(); $event.stopPropagation()" aria-label="Cerrar notificación"
                    class="flex h-6 w-6 rounded-md items-center justify-center text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200">
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Mensaje -->
              <p class="mt-2 text-sm leading-5 text-surface-600 dark:text-surface-300 line-clamp-3">
                {{ notificacion.mensaje }}
              </p>

              <!-- Origen -->
              @if (origen) {
                <p class="mt-2 flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                  <i class="pi pi-building text-[0.7rem]"></i>
                  <span class="truncate" [title]="origenCompleto">{{ origen }}</span>
                </p>
              }
            </div>
          </div>

          <!-- Barra de progreso (se detiene mientras el cursor esta encima) -->
          <div class="h-0.5 bg-surface-100 dark:bg-surface-800">
            @for (n of [notificacion]; track n.id) {
              <div class="barra-progreso h-full" [ngClass]="estilo.acento"
                [style.animation-duration.ms]="duracion"
                [style.animation-play-state]="pausado() ? 'paused' : 'running'"></div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
    .barra-progreso {
      animation-name: progreso;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }
    @keyframes progreso {
      from { width: 100%; }
      to { width: 0%; }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificacionToastComponent implements OnChanges, OnDestroy {
  @Input() notificacion: NotificacionResponse | null = null;
  @Output() cerrada = new EventEmitter<void>();
  @Output() abrir = new EventEmitter<NotificacionResponse>();

  readonly duracion = DURACION_MS;
  visible = signal(false);
  pausado = signal(false);

  private timeoutId?: number;
  private inicioTimer = 0;
  private restanteMs = DURACION_MS;

  get estilo(): EstiloAccion {
    return estiloNotificacion(this.notificacion);
  }

  get origen(): string {
    return origenResumen(this.notificacion);
  }

  //Descripcion completa del origen al pasar el cursor (las descripciones de area pueden ser muy largas)
  get origenCompleto(): string {
    return origenDetalle(this.notificacion);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notificacion'] && this.notificacion) {
      this.limpiarTimer();
      this.restanteMs = DURACION_MS;
      this.pausado.set(false);
      this.visible.set(true);
      this.iniciarTimer();
    }
  }

  ngOnDestroy(): void {
    this.limpiarTimer();
  }

  //Mientras el usuario tenga el cursor encima, la notificacion no se cierra
  pausar(): void {
    if (this.pausado()) return;
    this.limpiarTimer();
    this.restanteMs -= Date.now() - this.inicioTimer;
    this.pausado.set(true);
  }

  reanudar(): void {
    if (!this.pausado()) return;
    this.pausado.set(false);
    this.iniciarTimer();
  }

  private iniciarTimer(): void {
    this.inicioTimer = Date.now();
    this.timeoutId = window.setTimeout(() => this.cerrar(), Math.max(this.restanteMs, 0));
  }

  private limpiarTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  //Click en el toast: avisa al header para navegar y lo cierra
  abrirToast(): void {
    if (!this.notificacion) return;
    this.abrir.emit(this.notificacion);
    this.cerrar();
  }

  cerrar(): void {
    this.limpiarTimer();
    this.visible.set(false);
    setTimeout(() => {
      this.cerrada.emit();
    }, 150);
  }
}

import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, Confirmation } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog implements OnInit, OnDestroy {
  @Input() key = 'confirm';
  @Input() title = 'Confirmación';
  @Input() message = '¿Está seguro?';
  @Input() icon = 'pi pi-question';
  @Input() circleClass = 'bg-red-500';
  @Input() acceptLabel = 'Aceptar';
  @Input() rejectLabel = 'Cancelar';
  @Input() acceptStyleClass = 'btn-rojo';
  @Input() showAccept = true;
  @Input() showReject = true;

  private confirmationService = inject(ConfirmationService, { optional: true });
  private subscription?: Subscription;

  visible = signal(false);
  private activeConfirmation?: Confirmation;

  ngOnInit(): void {
    this.subscription = this.confirmationService?.requireConfirmation$.subscribe(
      (confirmation) => {
        if (!confirmation) {
          this.visible.set(false);
          return;
        }
        if ((confirmation.key ?? 'confirm') !== this.key) {
          return;
        }
        this.activeConfirmation = confirmation;
        this.visible.set(true);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onAccept(): void {
    this.activeConfirmation?.accept?.();
    this.visible.set(false);
  }

  onReject(): void {
    this.activeConfirmation?.reject?.();
    this.visible.set(false);
  }
}

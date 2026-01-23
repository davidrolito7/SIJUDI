import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, ConfirmDialogModule, ButtonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
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
}

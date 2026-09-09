import { Component, EventEmitter, Output, Input, OnDestroy, signal } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal-component',
  imports: [],
  templateUrl: './modal-component.html',
  styleUrl: './modal-component.css',
})
export class ModalComponent implements OnDestroy {
  @Input() id!: string;
  readonly isOpen = signal(false);

  @Output() modalClosed = new EventEmitter<void>();

  private afterPrintHandler = () => {
    // Restaurar estado después de imprimir
    document.body.style.overflow = 'hidden'; // el modal sigue abierto
    this.isOpen.set(true);
  };

  constructor(private modalService: ModalService) {
    this.modalService.add(this);
    window.addEventListener('afterprint', this.afterPrintHandler);
  }

  ngOnDestroy() {
    this.modalService.remove(this.id);
    window.removeEventListener('afterprint', this.afterPrintHandler);
  }

  openModal() {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isOpen.set(false);
    document.body.style.overflow = 'auto';
    this.modalClosed.emit();
  }
}
import { Component, EventEmitter, Output, Input, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal-component',
  imports: [],
  templateUrl: './modal-component.html',
  styleUrl: './modal-component.css',
})
export class ModalComponent implements OnDestroy {
  @Input() id!: string;
  isOpen = false;

  @Output() modalClosed = new EventEmitter<void>();

  private readonly cdr = inject(ChangeDetectorRef);
  private afterPrintHandler = () => {
    // Restaurar estado después de imprimir
    document.body.style.overflow = 'hidden'; // el modal sigue abierto
    this.isOpen = true;
    this.cdr.detectChanges(); // forzar re-render
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
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
    this.modalClosed.emit();
  }
}
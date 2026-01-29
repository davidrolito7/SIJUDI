import { Component, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
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

  constructor(private modalService: ModalService) {
    this.modalService.add(this);
  }

  ngOnDestroy() {
    this.modalService.remove(this.id);
  }

  openModal() {
    this.isOpen = true;
    // Opcional: evitar scroll en el body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isOpen = false;
    // Restaurar scroll en el body
    document.body.style.overflow = 'auto';
    this.modalClosed.emit();
  }
}

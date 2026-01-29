import { Injectable } from '@angular/core';
import { ModalComponent } from '../components/modal-component/modal-component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: ModalComponent[] = [];

  add(modal: ModalComponent) {
    this.modals.push(modal);
  }

  remove(id: string) {
    this.modals = this.modals.filter(x => x.id !== id);
  }

  open(id: string) {
    const modal = this.modals.find(x => x.id === id);
    if (modal) {
      modal.openModal();
    }
  }

  close(id: string) {
    const modal = this.modals.find(x => x.id === id);
    if (modal) {
      modal.closeModal();
    }
  }
}

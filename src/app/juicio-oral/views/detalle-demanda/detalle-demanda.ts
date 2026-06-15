import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { JuicioService } from '../../services/juicioenlinea.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
import { Header } from "../../../shared/components/header/header";
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { TooltipModule } from 'primeng/tooltip';
import { base64ToFile } from '../../../shared/functions/utils';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { DetalleDemandaResponse } from '../../interfaces/juicioenlinea.model';
import { TokenService } from '../../../core/auth/service/token.service';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ContadoresService } from '../../services/contadores.service';

@Component({
  selector: 'app-detalle-demanda',
  imports: [CommonModule, TableModule, Header, ButtonModule, TagModule, PdfDialog, TooltipModule, Spinner, ConfirmDialog, DialogModule, ɵInternalFormsSharedModule, ReactiveFormsModule, ToastModule],
  templateUrl: './detalle-demanda.html',
  styleUrl: './detalle-demanda.css',
  providers: [ConfirmationService, MessageService],
})
export class DetalleDemanda implements OnInit {

  idDemanda: number | undefined;
  nombre: string = '';
  documentoUrl: SafeResourceUrl | null = null;
  detalleDemanda: DetalleDemandaResponse | null = null;
  isLoading = false;
  modalTurnar = false;
  mostrarDocumento = signal<boolean>(false);
  turnarForm!: FormGroup;

  constructor(
    private juicioService: JuicioService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private readonly fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private contadoresService: ContadoresService,
    private router: Router
  ) {
    this.turnarForm = this.fb.group({
      observaciones: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  ngOnInit(): void {
    const state = window.history.state as { idDemanda: number };

    if (state?.idDemanda) {
      this.idDemanda = state.idDemanda;
      this.getDetalleInicio(this.idDemanda);
    } else {
      console.warn('No se proporcionó idDemanda. Redirigiendo a la página de inicio.');
      // this.router.navigate(['/layout/inicio']);
    }

  }


  getDetalleInicio(idDemanda: number): void {
    this.juicioService.getDetalleDemanda(idDemanda).subscribe({
      next: (response: any) => {
        this.detalleDemanda = response.data || null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error:', error);
        this.detalleDemanda = null;
        this.cdr.markForCheck();
      }
    });
  }

  onVerDocumento(fileBase64: string, nombre: string, mime: string): void {
    const file = base64ToFile(fileBase64, nombre, mime);
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento.set(true);
    } else {
      console.error('Documento inválido');
    }
  }

  openModal(idDocumento: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.juicioService.getDocumento(idDocumento).subscribe({
      next: (response) => {
        if (response?.data?.file) {
          this.nombre = response.data.nombre ?? 'documento.pdf';
          this.onVerDocumento(response.data.file, this.nombre, 'application/pdf');
        }
      },
      error: (error) => {
        console.error('Error al obtener el documento:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  permisoBoton(): boolean {
    const user = this.tokenService.getUserFromToken();
    if (user && (user.idSistemaPerfil === 7180 || user.idSistemaPerfil === 7181)) { //oficialia y secretaria 0.o
      return true;
    } else {
      return false;
    }
  }

  get ultimoMovimiento() {
    const movimientos = this.detalleDemanda?.movimientos;
    if (!movimientos || movimientos.length === 0) return null;
    return movimientos[movimientos.length - 1];
  }

  get mostrarBotonRecibir(): boolean {
    const movimientos = this.detalleDemanda?.movimientos || [];

    // Si viene movimientos[] vacío, el oficial puede recibir la demanda 0.o
    if (movimientos.length === 0) {
      return this.esOficialia();
    }

    const mov = this.ultimoMovimiento;
    if (!mov) return false;

    // Si idMovimiento es 8 e idGeneralTurna está asignado, secretario puede recibir
    if (Number(mov.idMovimiento) === 8 && mov.idGeneralTurna) {
      return this.esSecretaria();
    }

    return false;
  }

  get mostrarBotonTurnar(): boolean {
    const movimientos = this.detalleDemanda?.movimientos || [];

    // Si no hay movimientos, no se puede turnar 0.o
    if (movimientos.length === 0) {
      return false;
    }

    const mov = this.ultimoMovimiento;
    if (!mov) return false;

    // Si idMovimiento es 8 e idGeneralTurna es null, oficial puede turnar 0.o
    if (Number(mov.idMovimiento) === 8 && !mov.idGeneralTurna) {
      return this.esOficialia();
    }

    // Si idGeneralTurna está vacío e idMovimiento es 9, puede turnar 0.o
    // if (Number(mov.idMovimiento) === 9 && !mov.idGeneralTurna) {
    //   return this.esSecretaria();
    // }

    return false;
  }

  get mostrarBotonAcordar(): boolean {
    const movimientos = this.detalleDemanda?.movimientos || [];

    // Si no hay movimientos, no se puede turnar 0.o
    if (movimientos.length === 0) {
      return false;
    }

    const mov = this.ultimoMovimiento;
    if (!mov) return false;

    // Si idGeneralTurna está vacío e idMovimiento es 9, puede turnar 0.o
    if (Number(mov.idMovimiento) === 9 && !mov.idGeneralTurna) {
      return this.esSecretaria();
    }

    return false;
  }
  // ============================
  // Navegación
  // ============================
  onRedirectCrearAcuerdo(idExpediente: number): void {
    this.router.navigate(['/juicioenlinea/acuerdos/crear'], { state: { idExpediente } });
  }


  onModalRecibir() {
    this.confirmationService.confirm({
      key: 'confirmar-recepcion',
      accept: () => { this.onSiguienteMovimientoDemanda(); },
      reject: () => { }
    }
    );
  }

  onModalTurnar() {
    this.modalTurnar = true;
    this.turnarForm.reset();
  }

  onSiguienteMovimientoDemanda() {
    this.modalTurnar = false;
    this.isLoading = true;
    const payload: any = {
      idTramite: [this.detalleDemanda?.idTramite],
    };
    const observaciones = this.turnarForm.get('observaciones')?.value;
    if (observaciones) {
      payload.observaciones = observaciones;
    }
    this.juicioService.putSiguienteMovimientoTramite(payload).subscribe({
      next: (response) => {
        this.contadoresService.refrescar()
        this.isLoading = false;
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Existoso', detail: response.message || 'Demanda turnada correctamente' });
        } else {
          this.messageService.add({ severity: 'info', summary: 'Aviso', detail: response.message || 'No se pudo turnar la demanda' });
        }
        this.getDetalleInicio(this.idDemanda!);
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: error.error?.message || 'Error al conectar con el servidor'
        });
      }
    });
  }


  esOficialia(): boolean {
    const user = this.tokenService.getUserFromToken();
    if (user && (user.idSistemaPerfil === 7180)) {
      return true;
    } else {
      return false;
    }
  }
  esSecretaria(): boolean {
    const user = this.tokenService.getUserFromToken();
    if (user && (user.idSistemaPerfil === 7181)) {
      return true;
    } else {
      return false;
    }
  }

}


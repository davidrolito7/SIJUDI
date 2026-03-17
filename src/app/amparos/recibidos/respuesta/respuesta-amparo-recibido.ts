import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Toast } from "primeng/toast";
import { TableModule } from "primeng/table";
import { EnviarPromocionResponse, PromocionDocumentos, UI_PromocionResponse } from '../../interfaces/amparos.models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { Router } from '@angular/router';
import { AmparosService } from '../../services/amparo.service';
import { Button } from "primeng/button";
import { CommonModule } from '@angular/common';
import { base64ToFile, downloadBase64 } from '../../../shared/functions/utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-RespuestaAmparoRecibido',
  imports: [
    Toast,
    TableModule,
    Breadcrub,
    Spinner,
    Button,
    PdfDialog,
    ConfirmDialog,
    CommonModule,
    TagModule,
    ConfirmDialogModule   // <-- agregado para el dialog de respuesta
  ],
  templateUrl: './respuesta-amparo-recibido.html',
  styleUrl: './respuesta-amparo-recibido.css',
  providers: [MessageService, ConfirmationService]
})
export class RespuestaAmparoRecibido {

  expandedRows: { [key: number]: boolean } = {};
  detallesPromocion: UI_PromocionResponse[] = [];
  idNotificacion: number | 0 = 0;
  isLoading: boolean = false;

  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
  dialogData: any = {};

  // Signal para mostrar los datos de respuesta en el dialog tras enviar
  responsePromocion = signal<EnviarPromocionResponse | null>(null);


  constructor(
    private messageService: MessageService,
    private router: Router,
    private amparosService: AmparosService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit() {
    const state = window.history.state as { idNotificacion: number };

    if (state && state.idNotificacion) {
      this.idNotificacion = state.idNotificacion;
      this.cargarDetallesPromocion(this.idNotificacion);
    }

    this.testDialog();
  }
  testDialog(): void {
    this.responsePromocion.set({
      respuestaGenericaCJF: {
        folioConfirmacion: "202621400010000105",
        codigoRetorno: 1,
        mensaje: 'Exito',
        fechaRecepcion: '2026-03-13T10:44:24-06:00'
      },
      respuestaGenericaCJO: {
        folioConfirmacion: "26",
        codigoRetorno: 1,
        mensaje: 'Exito',
        fechaRecepcion: '2026-03-13T10:44:38.0405595-06:00'
      }
    });
    this.confirmationService.confirm({
      key: 'responsePromocion',
      header: 'Promoción Enviada',
    });
  }
  // ─── Carga ─────────────────────────────────────────────────────────────────

  cargarDetallesPromocion(idNotificacion: number): void {
    this.idNotificacion = idNotificacion;
    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.getPromocionDetalles(idNotificacion).subscribe({
      next: (response) => {
        if (response.success) {
          this.detallesPromocion = response.data;
          this.isLoading = false;
          this.cd.detectChanges();
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
        }
      },
      error: (error) => {
        console.error('Error al cargar detalle de promoción', error);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ─── Tabla expandible ──────────────────────────────────────────────────────

  toggleRow(promocion: any) {
    if (this.expandedRows[promocion.idRespuesta]) {
      delete this.expandedRows[promocion.idRespuesta];
    } else {
      this.expandedRows[promocion.idRespuesta] = true;
    }
  }

  // ─── Navegación ────────────────────────────────────────────────────────────

  redirectToPromocion(idNotificacion: number, idRespuesta: number): void {
    this.router.navigate(['/amparos/acuerdo'], {
      state: { idNotificacion, idRespuesta }
    });
  }

  // ─── Enviar promoción ──────────────────────────────────────────────────────

  // Guarda el idRespuesta del registro y abre el confirm
  enviarPromocion(idPromocion: number | undefined): void {
    if (!idPromocion) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Promoción inválida' });
      return;
    }
    this.confirmationService.confirm({
      key: 'enviarPromocion',
      accept: () => this.onEnviar(idPromocion),
      reject: () => { }
    });
  }

  // Llama al servicio con el idRespuesta guardado y muestra el dialog de respuesta
  onEnviar(idPromocion: number): void {
    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.enviarPromocion(idPromocion).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Promoción enviada exitosamente' });
          response.data.respuestaGenericaCJF.folioConfirmacion =
            String(response.data.respuestaGenericaCJF.folioConfirmacion);
          this.responsePromocion.set(response.data); this.confirmationService.confirm({
            key: 'responsePromocion',
            header: 'Promoción Enviada',
          });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
        // Recarga la tabla para reflejar el nuevo estatus
        this.cargarDetallesPromocion(this.idNotificacion);
      }
    });
  }

  // ─── Archivos ──────────────────────────────────────────────────────────────

  mostrarArchivo(documento: PromocionDocumentos): void {
    const FIVE_MB = 5 * 1024 * 1024;
    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.getFilePromocion(documento.idArchivo).subscribe({
      next: (response) => {
        if (response.success) {
          const base64String = response.data.documento;
          if (documento.longitud <= FIVE_MB && response.data.fileName.split('.')[1] === 'pdf') {
            this.onVerDocumento(base64String, documento.nombreDocumento ?? 'documento', 'application/pdf');
          } else {
            const nombre = response.data.fileName;
            this.dialogData.fileName = nombre;
            const ext = nombre.split('.')[1];
            downloadBase64(base64String, nombre, ext);
          }
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
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

  eliminarDocumento(documento: PromocionDocumentos) {
    this.confirmationService.confirm({
      key: 'eliminarArchivo',
      accept: () => this.onEliminarDocumento(documento),
      reject: () => { }
    });
  }

  onEliminarDocumento(documento: PromocionDocumentos) {
    this.isLoading = true;
    this.cd.detectChanges();
    const tipoDocumento = 2;

    this.amparosService.eliminarArchivo(documento.idArchivo, tipoDocumento).subscribe({
      next: (response: any) => {
        if (response.success) {
          const indexRespuesta = this.detallesPromocion.findIndex(resp => resp.idRespuesta === documento.idRespuesta);
          if (indexRespuesta !== -1) {
            const indexDoc = this.detallesPromocion[indexRespuesta].archivos.findIndex(doc => doc.idArchivo === documento.idArchivo);
            if (indexDoc !== -1) {
              this.detallesPromocion[indexRespuesta].archivos.splice(indexDoc, 1);
            }
          }
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento eliminado' });
        } else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  get hayPromocionEditable(): boolean {
  return this.detallesPromocion.some(
    p => p.estatus.idEstatus !== 3 && p.estatus.idEstatus !== 4
  );
}
}
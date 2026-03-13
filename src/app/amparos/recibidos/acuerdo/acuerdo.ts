import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  CatalogoClasificacionArchivo,
  CatalogoOrganoDestino,
  CatalogoTipoCuaderno,
  EnviarPromocionResponse,
  PromocionDocumentos,
  PromocionGeneralesRequest,
  PromocionGeneralesUpdate,
  UI_PromocionResponse,
  guardaFirmaTmpRequest
} from '../../interfaces/amparos.models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AmparosService } from '../../services/amparo.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { Select } from "primeng/select";
import { FileSelectEvent, FileUpload } from "primeng/fileupload";
import { TableModule } from "primeng/table";
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { base64ToFile, downloadBase64, downloadFile, validaPdf } from '../../../shared/functions/utils';
import { ToastModule } from "primeng/toast";
import ValidateForm from '../../../helpers/validateform';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { TokenService } from '../../../core/auth/service/token.service';
import { validarFirmasUsuarioAmparoRespuesta } from '../../../exhortos/functions/firmas';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-acuerdo',
  imports: [
    CommonModule,
    ButtonModule,
    Breadcrub,
    Spinner,
    Select,
    ReactiveFormsModule,
    FileUpload,
    TableModule,
    PdfDialog,
    ToastModule,
    CheckboxModule,
    InputTextModule,
    ConfirmDialog,
    ConfirmDialogModule,
    DialogModule,
    PasswordModule,
    FormsModule
  ],
  templateUrl: './acuerdo.html',
  styleUrl: './acuerdo.css',
  providers: [MessageService, ConfirmationService]
})
export class Acuerdo {

  // ─── Formularios ───────────────────────────────────────────────────────────

  acuerdoForm = new FormGroup({
    organoDestino: new FormControl(null as CatalogoOrganoDestino | null, Validators.required),
    noExpediente: new FormControl('', Validators.required),
    expDigital: new FormControl(false as boolean, Validators.required),
    direccionExpediente: new FormControl(''),
    cuaderno: new FormControl(null as CatalogoTipoCuaderno | null, Validators.required),
  });

  // Solo contraseña — no se necesita .pfx en este flujo
  formularioFirma = new FormGroup({
    password: new FormControl('', Validators.required),
  });

  doctosForm = new FormGroup({
    clasificacion: new FormControl(null as CatalogoClasificacionArchivo | null, Validators.required),
  });

  // ─── IDs ───────────────────────────────────────────────────────────────────

  idNotificacion: number = 0;
  idRespuesta: number = 0;

  // ─── Signals ───────────────────────────────────────────────────────────────

  promocion = signal<UI_PromocionResponse | null>(null);
  responsePromocion = signal<EnviarPromocionResponse | null>(null);
  organo = signal<CatalogoOrganoDestino[]>([]);
  cuaderno = signal<CatalogoTipoCuaderno[]>([]);
  catalogo = signal<CatalogoClasificacionArchivo[]>([]);
  seleccionadosParaFirma = signal<boolean>(false);
  mostrarDocumento = signal<boolean>(false);
  hayArchivoFirmado = signal<boolean>(false);

  // ─── Variables de control ──────────────────────────────────────────────────

  mostrarBotonGuardar: boolean = true;
  isLoading: boolean = false;
  firmaDialog: boolean = false;
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  idEstatus: number = 0;
  dialogData: any = {};
  uploadedFiles: any[] = [];

  // ───────────────────────────────────────────────────────────────────────────

  constructor(
    private messageService: MessageService,
    private amparosService: AmparosService,
    private confirmationService: ConfirmationService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cd: ChangeDetectorRef,
    private tokenService: TokenService,
  ) { }

  // ─── Getter archivos seleccionados ─────────────────────────────────────────

  get archivosSeleccionadosCount(): number {
    return this.promocion()?.archivos.filter(a => a.selecParaFirma && !a.firmado).length ?? 0;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit() {
    const state = window.history.state as { idNotificacion: number, idRespuesta?: number };

    this.cargarCatalogoOrganoDestino();
    this.cargarCatalogoTipoCuaderno();
    this.cargarCatalogoClasificacionArchivo();

    if (state && state.idNotificacion) {
      this.idNotificacion = state.idNotificacion;

      if (state.idRespuesta !== undefined) {
        this.idRespuesta = state.idRespuesta;
        this.cargarPromocion();
      } else {
        console.log(`Modo Creación: idNotificacion = ${this.idNotificacion}`);
      }
    } else {
      this.router.navigate(['/amparos/respuesta-amparo-recibido'], {
        state: { idNotificacion: this.idNotificacion, idRespuesta: this.idRespuesta }
      });
    }


  }

  // ─── Guardar / Actualizar ──────────────────────────────────────────────────

  guardarOActualizar() {
    this.confirmationService.confirm({
      key: 'guardarPromocion',
      accept: () => this.onGuardarOActualizar(),
      reject: () => { }
    });
  }

  onGuardarOActualizar() {
    this.acuerdoForm.get('expDigital')?.valueChanges.subscribe(value => {
      const direccionCtrl = this.acuerdoForm.get('direccionExpediente');
      if (value) {
        direccionCtrl?.setValidators([Validators.required]);
      } else {
        direccionCtrl?.clearValidators();
      }
      direccionCtrl?.updateValueAndValidity();
    });

    if (this.acuerdoForm.valid && this.idRespuesta !== 0) {
      this.actualizarPromocion();
    } else if (this.acuerdoForm.valid) {
      this.guardarPromocion();
    } else {
      this.acuerdoForm.markAllAsTouched();
      this.acuerdoForm.updateValueAndValidity();
      ValidateForm.validateAllFormFields(this.acuerdoForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' });
    }
  }

  guardarPromocion() {
    const promocion: PromocionGeneralesRequest = {
      idNotificacion: this.idNotificacion,
      organoImpartidorJusticia: this.acuerdoForm.value.organoDestino?.clave ?? 0,
      numeroExpedienteOIJ: this.acuerdoForm.value.noExpediente ?? '',
      existeEE: this.acuerdoForm.value.expDigital ?? false,
      urlEE: this.acuerdoForm.value.expDigital ? this.acuerdoForm.value.direccionExpediente ?? null : null,
      idTipoCuaderno: this.acuerdoForm.value.cuaderno?.idTipoCuaderno ?? 0,
      tipoCuaderno: this.acuerdoForm.value.cuaderno?.descripcion ?? ''
    };

    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.guardarPromocion(promocion).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Promoción guardada exitosamente' });
          response.data.respuestaGenericaCJF.folioConfirmacion =
            String(response.data.respuestaGenericaCJF.folioConfirmacion);
          this.responsePromocion.set(response.data); 
          this.confirmationService.confirm({
            key: 'responsePromocion',
            header: 'Promoción Guardada',
          });
          this.idRespuesta = response.message;
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
        this.cargarPromocion();
      }
    });
  }

  actualizarPromocion() {
    const promocion: PromocionGeneralesUpdate = {
      idRespuesta: this.idRespuesta,
      organoImpartidorJusticia: this.acuerdoForm.value.organoDestino?.clave ?? 0,
      numeroExpedienteOIJ: this.acuerdoForm.value.noExpediente ?? '',
      existeEE: this.acuerdoForm.value.expDigital ?? false,
      urlEE: this.acuerdoForm.value.expDigital ? this.acuerdoForm.value.direccionExpediente ?? null : null,
      idTipoCuaderno: this.acuerdoForm.value.cuaderno?.idTipoCuaderno ?? 0,
      tipoCuaderno: this.acuerdoForm.value.cuaderno?.descripcion ?? ''
    };

    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.actualizarPromocion(promocion).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Promoción actualizada exitosamente' });
          this.cargarPromocion();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'No se pudo actualizar la promoción' });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la promoción' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ─── Enviar ────────────────────────────────────────────────────────────────

  enviar() {
    this.confirmationService.confirm({
      key: 'enviarPromocion',
      accept: () => this.onEnviar(),
      reject: () => { }
    });
  }

  onEnviar() {
    if (!this.idRespuesta) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Primero guarda la promoción' });
      return;
    }

    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.enviarPromocion(this.idRespuesta).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Promoción enviada exitosamente' });
          this.responsePromocion.set(response.data);
          this.confirmationService.confirm({
            key: 'responsePromocion',
            header: 'Promoción Enviada',
          });
          this.mostrarBotonGuardar = false;
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
      }
    });
  }

  // ─── Firma ─────────────────────────────────────────────────────────────────

  openNewFirma() {
    this.formularioFirma.reset();
    this.firmaDialog = true;
  }

  hideDialogFirma() {
    this.firmaDialog = false;
    this.formularioFirma.reset();
  }

  // Registra la firma temporal por cada archivo seleccionado.
  // POST /EFirma/GuardaFirmaTemporal
  // { idUsuario, idArchivo, idClasificacionArchivo, passwordFirma }
  iniciarFirmaDocumentos(): void {
    if (!this.formularioFirma.value.password) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Ingresa la contraseña' });
      return;
    }

    const seleccionados = this.promocion()?.archivos.filter(a => a.selecParaFirma && !a.firmado) ?? [];
    if (seleccionados.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Selecciona al menos un archivo para firmar' });
      return;
    }

    let procesados = 0;
    this.isLoading = true;
    this.cd.detectChanges();
    const Usuario = this.tokenService.getUserFromToken();

    // forkJoin para que todas las peticiones se lancen en paralelo y al final se ejecute finalizarFirma() 
    // sin necesidad de manejar contadores manuales:
    const peticiones = seleccionados.map(archivo => {
      const param: guardaFirmaTmpRequest = {
        idUsuario: Usuario.idGeneral,
        idArchivo: archivo.idArchivo,
        idClasificacionArchivo: archivo.clasificacionArchivo?.idClasificacionArchivo ?? 0,
        passwordFirma: this.formularioFirma.value.password as string,
      };

      return this.amparosService.guardaFirmaTemporal(param).pipe(
        tap(response => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Firma registrada: ${archivo.nombreDocumento}`,
              life: 7000
            });
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Error',
              detail: response.message || `No se pudo registrar la firma en: ${archivo.nombreDocumento}`, life: 0
            });
          }
        }),
        // Para que forkJoin no se corte si alguna petición falla
        catchError(e => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: e.message || `Error en: ${archivo.nombreDocumento}`,
            life: 0 //con 0 se queda hasta que el usuario lo cierre
          });
          return of(null); // devolvemos un observable vacío para que forkJoin continúe
        })
      );
    });

    forkJoin(peticiones).subscribe({
      next: () => {
        // Aquí ya terminaron todas las peticiones
        this.finalizarFirma();
      }
    });

    /*for (const archivo of seleccionados) {
      const param: guardaFirmaTmpRequest = {

        idUsuario: Usuario.idGeneral, // reemplaza con el id real del usuario en sesión
        idArchivo: archivo.idArchivo,
        idClasificacionArchivo: archivo.clasificacionArchivo?.idClasificacionArchivo ?? 0,
        passwordFirma: this.formularioFirma.value.password as string,
      };

      this.amparosService.guardaFirmaTemporal(param).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Firma registrada: ${archivo.nombreDocumento}`
            });
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Error',
              detail: response.message || `No se pudo registrar la firma en: ${archivo.nombreDocumento}`
            });
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
        },
        complete: () => {
          procesados++;
          if (procesados === seleccionados.length) {
            this.finalizarFirma();
          }
        }
      });
    }*/
  }

  finalizarFirma(): void {
    this.firmaDialog = false;
    this.formularioFirma.reset();
    this.isLoading = false;
    this.cd.detectChanges();
    this.cargarPromocion(); // Recarga para mostrar firmantes actualizados en la tabla
  }

  verificarArchivosFirmados(): void {
    const hayFirmado = this.promocion()?.archivos?.some(a => a.firmado) ?? false;
    this.hayArchivoFirmado.set(hayFirmado);
  }

  // ─── Firmas por archivo ────────────────────────────────────────────────────

  eliminarFirma(idFirmaTmp: number, idArchivo: number) {
    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.eliminarUnaFirma(idFirmaTmp).subscribe({
      next: (response: any) => {
        if (response.success) {
          const index = this.promocion()?.archivos.findIndex(doc => doc.idArchivo === idArchivo);
          if (index !== undefined && index !== -1) {
            const indexFirmas = this.promocion()?.archivos[index].firmantes.findIndex(f => f.idFirmaTmp === idFirmaTmp);
            if (indexFirmas !== undefined && indexFirmas !== -1) {
              this.promocion()?.archivos[index].firmantes.splice(indexFirmas, 1);
            }
          }
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? '' : response.errors.join(', ')}` });
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
      }
    });
  }

  aplicarFirmas(idArchivo: number) {
    this.confirmationService.confirm({
      key: 'aplicarFirmas',
      accept: () => this.onAplicarFirmas(idArchivo),
      reject: () => { }
    });
  }

  // Aplica firmas registradas al documento.
  // POST /EFirma/AplicarFirmasAcuerdos?idArchivo={idArchivo}
  onAplicarFirmas(idArchivo: number) {
    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.aplicarFirmasAcuerdo(idArchivo).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
          this.cargarPromocion();
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? '' : response.errors.join(', ')}` });
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
      }
    });
  }

  // ─── Archivos ──────────────────────────────────────────────────────────────

  onUpload(file: File) {
    if (this.doctosForm.valid) {
      this.uploadedFiles.push(file);
      this.guardarDocumento(file);
    } else {
      ValidateForm.validateAllFormFields(this.doctosForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Clasificación de archivo requerido' });
    }
  }

  guardarDocumento(file: File) {
    const tipoDocId = Number(this.doctosForm.value.clasificacion?.idClasificacionArchivo);

    if (!tipoDocId || tipoDocId === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Seleccione una clasificación de archivo' });
      return;
    }

    const tipoSeleccionado = this.catalogo().find(doc => doc.idClasificacionArchivo === tipoDocId);
    if (!tipoSeleccionado) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Clasificación de documento inválida' });
      return;
    }

    if (this.idRespuesta === null || this.idRespuesta === undefined) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se ha recibido idRespuesta' });
      return;
    }

    const formData = new FormData();
    formData.append('idPromocion', this.idRespuesta.toString());
    formData.append('archivo', file, file.name);
    formData.append('clasificacionArchivo', this.doctosForm.value.clasificacion?.idClasificacionArchivo.toString() ?? '0');

    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.guardarDocumento(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cargarPromocion();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento guardado exitosamente' });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el documento' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  onAnexosSelect(event: FileSelectEvent) {
    if (!event || !event.files || event.files.length === 0) return;

    for (const file of event.files) {
      if (!validaPdf(file)) {
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'El archivo no es un PDF' });
        return;
      }

      const nuevo: PromocionDocumentos = {
        idArchivo: 0,
        idRespuesta: this.idRespuesta ?? 0,
        nombreDocumento: file.name,
        clasificacionArchivo: null as any,
        longitud: file.size ?? 0,
        nombrePKCS7: '',
        NombreEvidencia: '',
        extension: file.name.split('.').pop() ?? '',
        hashDocumentoOriginal: '',
        ruta: '',
        firmado: false,
        fechaFirmado: null as any,
        activo: true,
        selecParaFirma: false,
        firmantes: [],
        file: file,
        usrYaFirmo: false
      };

      // @ts-ignore
      nuevo.tam = file.size ?? 0;
      this.promocion()?.archivos.push(nuevo);
    }
  }

  archivo_seleccionado(item: any) {
    // item.selecParaFirma = !item.selecParaFirma;
    const algunoSeleccionado = this.promocion()?.archivos.some(a => a.selecParaFirma);
    this.seleccionadosParaFirma.set(algunoSeleccionado ?? false);
  }

  eliminarDocumento(documento: PromocionDocumentos, tipoDocumento: number, index: number) {
    this.confirmationService.confirm({
      key: 'eliminarArchivo',
      accept: () => this.onEliminarDocumento(documento, tipoDocumento, index),
      reject: () => { }
    });
  }

  onEliminarDocumento(documento: PromocionDocumentos, tipoDocumento: number, index: number) {
    if (documento.idArchivo == 0) {
      this.onEliminarIndex(index);
    } else {
      this.amparosService.eliminarArchivo(documento.idArchivo, tipoDocumento).subscribe({
        next: (response: any) => {
          if (response.success) {
            const idx = this.promocion()?.archivos.findIndex(doc => doc.idArchivo === documento.idArchivo) ?? -1;
            if (idx !== -1) {
              this.promocion()?.archivos.splice(idx, 1);
            }
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: 'Documento eliminado' });
          } else {
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
          }
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        }
      });
    }
  }

  onEliminarIndex(index: number): void {
    this.promocion()?.archivos.splice(index, 1);
  }

  // ─── Ver archivo ───────────────────────────────────────────────────────────

  getFile(documento: PromocionDocumentos): void {
    const FIVE_MB = 5 * 1024 * 1024;

    if (documento.idArchivo == 0) {
      if (documento.longitud <= FIVE_MB && documento.nombreDocumento.split('.')[1] === 'pdf') {
        this.onVerDocumentoFile(documento.file);
      } else {
        downloadFile(documento.file);
      }
    } else {
      this.isLoading = true;
      this.cd.detectChanges();

      this.amparosService.getFilePromocion(documento.idArchivo).subscribe({
        next: (response: any) => {
          if (response.success) {
            const fileData = response.data.documento;
            if (documento.longitud <= FIVE_MB && response.data.fileName.split('.')[1] === 'pdf') {
              this.onVerDocumentoBase64(fileData, documento.nombreDocumento, 'application/pdf');
            } else {
              const nombre = response.data.fileName;
              this.dialogData.fileName = nombre;
              const ext = nombre.split('.')[1];
              downloadBase64(fileData, nombre, ext);
            }
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
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
        }
      });
    }
  }

  onVerDocumentoFile(file: File): void {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.nombre = file.name;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento.set(true);
    } else {
      console.error('Documento inválido');
    }
  }

  onVerDocumentoBase64(fileBase64: string, nombre: string, mime: string): void {
    const file = base64ToFile(fileBase64, nombre, mime);
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento.set(true);
    } else {
      console.error('Documento inválido');
    }
  }

  // ─── Catálogos ─────────────────────────────────────────────────────────────

  cargarCatalogoTipoCuaderno(): void {
    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.getCatalogoTipoCuaderno().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.cuaderno.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de tipo de cuadernos' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  cargarCatalogoOrganoDestino(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.cd.detectChanges();

      this.amparosService.getCatalogoOrganoDestino().subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.organo.set(response.data);
            resolve();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
            reject(response.message);
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de órganos' });
          this.isLoading = false;
          this.cd.detectChanges();
          reject(e.message);
        },
        complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    });
  }

  cargarCatalogoClasificacionArchivo(): void {
    this.isLoading = true;
    this.cd.detectChanges();

    this.amparosService.getCatalogoClasificacionArchivo().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.catalogo.set(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de clasificación de archivos' });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ─── Cargar promoción ──────────────────────────────────────────────────────

  cargarPromocion(): void {
    if (this.idNotificacion && this.idRespuesta !== undefined) {
      this.isLoading = true;
      this.cd.detectChanges();

      this.amparosService.getPromocionDetalles(this.idNotificacion, this.idRespuesta).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.promocion.set(response.data.length > 0 ? response.data[0] : null);

            if (this.promocion()) {
              const organoSelect = this.organo().find(o => o.clave === this.promocion()?.organoImpartidorJusticia.clave) || null;
              this.acuerdoForm.patchValue({ organoDestino: organoSelect });
              this.acuerdoForm.patchValue({ noExpediente: this.promocion()?.numeroExpedienteOIJ ?? '' });
              this.acuerdoForm.patchValue({ expDigital: this.promocion()?.existeEE ?? false });
              this.acuerdoForm.patchValue({ direccionExpediente: this.promocion()?.urlEE ?? '' });

              // tipoCuaderno en UI_PromocionResponse es number | null — buscar por idTipoCuaderno
              const cuadernoMatch = this.cuaderno().find(c =>
                c.idTipoCuaderno === this.promocion()?.idTipoCuaderno
              ) || null;
              this.acuerdoForm.patchValue({ cuaderno: cuadernoMatch });

              this.idRespuesta = this.promocion()?.idRespuesta ?? 0;
              this.idEstatus = this.promocion()?.estatus.idEstatus ?? 0;

              this.verificarArchivosFirmados();

              //obtenemos el idUsuario del token
              const userData = this.tokenService.getUserFromToken();
              var idUsuario = 0;
              if (userData !== null) {
                idUsuario = userData.idGeneral;
              }
              //valida si el usuario loqueado ya firmó
              if (this.promocion()?.archivos != null) {
                const documentosValidados = validarFirmasUsuarioAmparoRespuesta(this.promocion()?.archivos ?? [], idUsuario);
                this.promocion()!.archivos = documentosValidados.map((archivo: any) => ({
                  ...archivo
                }));
              }

            }
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los detalles de la promoción' });
          this.isLoading = false;
          this.cd.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Faltan parámetros para cargar la promoción' });
    }
  }
}
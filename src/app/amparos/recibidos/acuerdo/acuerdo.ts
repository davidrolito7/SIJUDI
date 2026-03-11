import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogoClasificacionArchivo, CatalogoOrganoDestino, CatalogoTipoCuaderno, PromocionDocumentos, PromocionGeneralesRequest, PromocionGeneralesUpdate, UI_PromocionResponse } from '../../interfaces/amparos.models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AmparosService } from '../../services/amparo.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, ValidationErrors, AbstractControl } from '@angular/forms';
import { Button } from "primeng/button";
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
//import { response } from 'express';
//import { error } from 'console';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-acuerdo',
  imports: [CommonModule, ButtonModule, Breadcrub, Spinner, Select, ReactiveFormsModule, FileUpload, TableModule, PdfDialog, ToastModule, CheckboxModule, InputTextModule, ConfirmDialog, ConfirmDialogModule],
  templateUrl: './acuerdo.html',
  styleUrl: './acuerdo.css',
  providers: [MessageService, ConfirmationService]
})
export class Acuerdo {

  acuerdoForm = new FormGroup({
    organoDestino: new FormControl(null as CatalogoOrganoDestino | null, Validators.required),
    noExpediente: new FormControl('', Validators.required),
    expDigital: new FormControl(false as boolean, Validators.required),
    direccionExpediente: new FormControl(''),
    cuaderno: new FormControl(null as CatalogoTipoCuaderno | null, Validators.required),
  });

  formularioFirma = new FormGroup({
    password: new FormControl(''),
    file_pfx: new FormControl(''),

  });

  doctosForm = new FormGroup({
    clasificacion: new FormControl(null as CatalogoClasificacionArchivo | null, Validators.required),
  });

  idNotificacion: number = 0;
  idRespuesta: number = 0; // Nueva variable para guardar el idRespuesta
  promocion = signal<UI_PromocionResponse | null>(null); //
  responsePromocion = signal<UI_PromocionResponse | null>(null); //Eloy para guardar la respuesta de la promoción y mostrar datos en el dialog de respuesta
  organo = signal<CatalogoOrganoDestino[]>([]);

  cuaderno = signal<CatalogoTipoCuaderno[]>([]);

  catalogo = signal<CatalogoClasificacionArchivo[]>([]);

  // Variables para la gestión de archivos
  mostrarBotonGuardar: boolean = true; // Controla la visibilidad del botón Guardar
  tienePermisoGuardar = signal<boolean>(false); // Simulación de permiso, ajusta según tu lógica de permisos
  tienePermisoFirmarArchivo = signal<boolean>(false); // Simulación de permiso, ajusta según tu lógica de permisos
  seleccionadosParaFirma = signal<boolean>(false); // Controla si hay archivos seleccionados para firma
  isLoading: boolean = false; // para bloquear la pantalla
  firmaDialog: boolean = false; // para mostrar el dialog de firma
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false); //Eloy para mostrar el dialog de documento firmado
  tienePermisoEliminarArchivo = signal<boolean>(false); // Simulación de permiso, ajusta según tu lógica de permisos
  idEstatus: number = 0; // para controlar el estatus de la promoción y mostrar o no botones de acción
  dialogData: any = {}; // Para almacenar la información del archivo del diálogo


  uploadedFiles: any[] = [];

  contador_firmas: any = ""; //Eloy
  archivos_firmados: any = ""; //Eloy



  constructor(
    private messageService: MessageService,
    private amparosService: AmparosService,
    private confirmationService: ConfirmationService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }



  ngOnInit() {
    const state = window.history.state as { idNotificacion: number, idRespuesta?: number };


    // Cargar catálogos compartidos
    this.cargarCatalogoOrganoDestino();
    this.cargarCatalogoTipoCuaderno();
    this.cargarCatalogoClasificacionArchivo();

    if (state && state.idNotificacion) {
      this.idNotificacion = state.idNotificacion;

      if (state.idRespuesta !== undefined) {
        // Modo edición
        this.idRespuesta = state.idRespuesta;

        this.cargarPromocion(); // Cargar datos de la promoción para editar
      } else {
        // Modo creación
        console.log(`Modo Creación: idNotificacion = ${this.idNotificacion}`);
        // Carga la lógica necesaria para una nueva promoción si es necesario
      }


    } else {
      // Si no hay state, redirigir a una página segura

      this.router.navigate(['/amparos/respuesta-amparo-recibido'], {
        state: { idNotificacion: this.idNotificacion, idRespuesta: this.idRespuesta }
      });
    }
          this.confirmationService.confirm({
            key: 'responsePromocion',
            header: 'Acuerdo enviado',

          });
  }

  confirm() {
    this.confirmationService.confirm({
      key: 'responsePromocion',
      header: 'Promoción Guardada',

    });
  }

  guardarOActualizar() {
    this.confirmationService.confirm({
      key: 'guardarPromocion',
      accept: () => this.onguardarOActualizar(),
      reject: () => { }
    });
  }
  onguardarOActualizar() {
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
    } else if (!this.acuerdoForm.valid) {
      // datos generales
      this.acuerdoForm.markAllAsTouched();
      this.acuerdoForm.updateValueAndValidity();
      ValidateForm.validateAllFormFields(this.acuerdoForm);

      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' })
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Formulario inválido', detail: 'Revisa los campos requeridos' });
      //datos generales
      this.acuerdoForm.markAllAsTouched();
      ValidateForm.validateAllFormFields(this.acuerdoForm);

    }
  }


  // Método para guardar la promoción despues de rellenas los campos
  guardarPromocion() {
    // Verificación de campos obligatorios
    /*if (this.acuerdoForm.valid  && this.idRespuesta !== 0) {
     this.actualizarPromocion(); // Si ya existe una promoción (idRespuesta != 0), actualiza en lugar de crear 
     return;
    }*/
    // Creación del objeto de promoción con los datos ingresados
    const promocion: PromocionGeneralesRequest = {
      idNotificacion: this.idNotificacion, // Valor dinámico según
      organoImpartidorJusticia: this.acuerdoForm.value.organoDestino?.clave ?? 0,
      numeroExpedienteOIJ: this.acuerdoForm.value.noExpediente ?? '',
      existeEE: this.acuerdoForm.value.expDigital ?? false,
      urlEE: this.acuerdoForm.value.expDigital ? this.acuerdoForm.value.direccionExpediente ?? null : null,
      tipoCuaderno: this.acuerdoForm.value.cuaderno?.idTipoCuaderno ?? 0
    };
    this.isLoading = true;
    this.cd.detectChanges();
    // Envío de la solicitud para guardar la promoción
    this.amparosService.guardarPromocion(promocion).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Promoción guardada exitosamente' });
          this.responsePromocion.set(response.data);
          this.confirmationService.confirm({
            key: 'responsePromocion',
            header: 'Promoción Guardada',

          });
          //console.log('Promoción guardada exitosamente', response);
          this.idRespuesta = response.message;
          // this.cargarUltimaRespuesta(this.idNotificacion); // Guardar el idRespuesta
          //console.log('idRespuesta después de guardar promoción:', this.idRespuesta);
          // this.resetForm();
        }
        else {
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
        this.cargarPromocion(); // Carga la promoción guardada para mostrar los datos actualizados, incluyendo el idRespuesta

      }
    });
  }

  onUpload(file: File) {
    if (this.doctosForm.valid) {

      // for (let file of event.files) {
      this.uploadedFiles.push(file);
      //this.nombreDocumento = file.name;  // Establece el nombre del documento
      this.guardarDocumento(file);  // Llama a guardarDocumento para cada archivo subido
    }
    //}
    else {
      ValidateForm.validateAllFormFields(this.doctosForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Clasificación de archivo requerido' })
    }

  }

  // Método para guardar el documento subido
  guardarDocumento(file: File) {
    const tipoDocId = Number(this.doctosForm.value.clasificacion?.idClasificacionArchivo);

    if (!tipoDocId || tipoDocId === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Seleccione una clasificación de archivo' });
      return;
    }

    const tipoSeleccionado = this.catalogo().find(doc => doc.idClasificacionArchivo === tipoDocId);
    if (!tipoSeleccionado) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'clasificación de documento inválido' });
      return;
    }
    if (this.idRespuesta === null || this.idRespuesta === undefined) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se ha recibido idRespuesta' });
      return;
    }
    // Creación del objeto FormData para la solicitud
    const formData = new FormData();
    formData.append('idPromocion', this.idRespuesta.toString());
    formData.append('archivo', file, file.name);
    formData.append('clasificacionArchivo', this.doctosForm.value.clasificacion?.idClasificacionArchivo.toString() ?? '0');

    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.guardarDocumento(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cargarPromocion(); // Cargar datos de la promoción para refrescar la lista de archivos
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
  /*onRemove(event: FileRemoveEvent) {
    this.nombreDocumento = '';
  }*/


  // Método para cargar el catálogo de tipo de cuaderno
  cargarCatalogoTipoCuaderno(): void {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoTipoCuaderno().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          // Asume que la respuesta tiene una estructura como response.data
          this.cuaderno.set(response.data);
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de tipos de cuaderno', error);
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

  // Método para cargar el catálogo de órganos de destino
  cargarCatalogoOrganoDestino(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.cd.detectChanges();
      this.amparosService.getCatalogoOrganoDestino().subscribe({
        next: (response: any) => {
          if (response && response.success) {
            //console.log('Datos recibidos del catálogo:', response);
            this.organo.set(response.data);
            resolve();
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
            reject(response.message);
          }
        },
        error: (e) => {
          //console.error('Error al cargar el catálogo de órganos', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de órganos' });
          this.isLoading = false;
          this.cd.detectChanges();
          reject(e.message);
        },
        complete: () => {
          //console.log('Catálogo de órganos cargado');
          this.isLoading = false;
          this.cd.detectChanges();
        }

      });
    });
  }
  // Método para cargar la clasificacion de archivos
  cargarCatalogoClasificacionArchivo(): void {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getCatalogoClasificacionArchivo().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          // Asume que la respuesta tiene una estructura como response.data
          this.catalogo.set(response.data);
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: (e) => {
        //console.error('Error al cargar la clasificacion de archivos', error);
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

  //Metodo que se activa cuado vamos a editar un promocion desde la vista de ver-promociones
  cargarPromocion(): void {
    if (this.idNotificacion && this.idRespuesta !== undefined) {
      // Llama al servicio con ambos parámetros
      this.isLoading = true;
      this.cd.detectChanges();
      this.amparosService.getPromocionDetalles(this.idNotificacion, this.idRespuesta).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            // Caso de edición: usar directamente la respuesta del endpoint
            this.promocion.set(response.data.length > 0 ? response.data[0] : null);
            if (this.promocion) {
              // Asignar valores del objeto `promocion` a las variables del componente
              var organoSelect = this.organo().find(o => o.clave === this.promocion()?.organoImpartidorJusticia.clave) || null;
              this.acuerdoForm.patchValue({ organoDestino: organoSelect });
              this.acuerdoForm.patchValue({ noExpediente: this.promocion()?.numeroExpedienteOIJ ?? '' });
              this.acuerdoForm.patchValue({ expDigital: this.promocion()?.existeEE ?? false });
              this.acuerdoForm.patchValue({ direccionExpediente: this.promocion()?.urlEE ?? '' });
              this.acuerdoForm.patchValue({ cuaderno: this.cuaderno().find(c => c.idTipoCuaderno === this.promocion()?.idTipoCuaderno) || null });
              // Asigna idRespuesta desde la promoción si no se ha asignado previamente
              this.idRespuesta = this.promocion()?.idRespuesta ?? 0;
              this.idEstatus = this.promocion()?.estatus.idEstatus ?? 0;

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

  //Método para actualizar la promocion
  actualizarPromocion() {
    // Creación del objeto de promoción con los datos ingresados
    const promocion: PromocionGeneralesUpdate = {
      idRespuesta: this.idRespuesta, // Valor dinámico según
      organoImpartidorJusticia: this.acuerdoForm.value.organoDestino?.clave ?? 0,
      numeroExpedienteOIJ: this.acuerdoForm.value.noExpediente ?? '',
      existeEE: this.acuerdoForm.value.expDigital ?? false,
      urlEE: this.acuerdoForm.value.expDigital ? this.acuerdoForm.value.direccionExpediente ?? null : null,
      idTipoCuaderno: this.acuerdoForm.value.cuaderno?.idTipoCuaderno ?? 0,
      tipoCuaderno: this.acuerdoForm.value.cuaderno?.descripcion ?? ''
    };
    this.isLoading = true;
    this.cd.detectChanges();
    // Envío de la solicitud para guardar la promoción
    this.amparosService.actualizarPromocion(promocion).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Promoción actualizada exitosamente' });
          this.cargarPromocion(); // Carga la promoción actualizada para mostrar los datos actualizados
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


  ///////////////////////
  hideDialogFirma() {
    this.firmaDialog = false;

  }
  openNewFirma() {
    this.firmaDialog = true;
  }
  onAnexosSelect(event: FileSelectEvent) {
    // Agregar archivos seleccionados a la lista local de documentos con valores por defecto
    if (!event || !event.files || event.files.length === 0) return;

    for (const file of event.files) {
      if (!validaPdf(file)) {
        this.messageService.add({ severity: 'warn', summary: 'error', detail: "El archivo no es un pdf" });
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
        file: file
      };

      // Añadir campo auxiliar `tam` que se usa en otras partes del componente
      // @ts-ignore
      nuevo.tam = file.size ?? 0;

      this.promocion()?.archivos.push(nuevo);
    }
  }
  archivo_seleccionado(item: any) {
    item.selecParaFirma = !item.selecParaFirma;

    //ponemos un señal para saber cuando se haya seleccionado al menos una fila para firmar
    //Verifica si al menos un archivo está seleccionado
    const algunoSeleccionado = this.promocion()?.archivos.some(a => a.selecParaFirma);
    this.seleccionadosParaFirma.set(algunoSeleccionado ?? false);
  }
  eliminarFirma(idFirmaTmp: number, idArchivo: number) {
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.eliminarUnaFirma(idFirmaTmp).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Encuentra el índice del documento que quieres eliminar
          const index = this.promocion()?.archivos.findIndex(doc => doc.idArchivo === idArchivo);
          if (index !== -1) {
            const indexFirmas = this.promocion()?.archivos[index!].firmantes.findIndex(f => f.idFirmaTmp == idFirmaTmp);
            if (indexFirmas !== -1) {
              // Elimina el elemento del arreglo
              this.promocion()?.archivos[index!].firmantes.splice(indexFirmas!, 1);

            }
          }
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
        }
        else {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message });
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
  onAplicarFirmas(idArchivo: number) {
    this.isLoading = true;
    this.cd.detectChanges;
    this.amparosService.aplicarFirmasAcuerdo(idArchivo).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
          this.cargarPromocion();
        } else {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message });
        this.isLoading = false;
        this.cd.detectChanges;
      },
      complete: () => {
        //this.confirmacionAplicarFirmas=false;
        this.isLoading = false;
        this.cd.detectChanges;
      }
    });
  }
  getFile(documento: PromocionDocumentos): void {
    const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
    if (documento.idArchivo == 0) // son archivos que no se han guardado
    {
      if (documento.longitud <= FIVE_MB && documento.nombreDocumento.split('.')[1] === 'pdf')
        this.onVerDocumentoFile(documento.file); // se visualiza en modal
      else {
        downloadFile(documento.file); // se descarga
      }


    }
    else { // aqui ya son archivos guardados
      this.isLoading = true;
      this.cd.detectChanges();
      this.amparosService.getFilePromocion(documento.idArchivo).subscribe({
        next: (response: any) => {

          if (response.success) {
            const fileData = response.data.documento;
            //console.log(fileData);
            if (documento.longitud <= FIVE_MB && response.data.fileName.split('.')[1] === 'pdf')
              this.onVerDocumentoBase64(fileData, documento.nombreDocumento, 'application/pdf'); // se visualiza en modal
            else {
              const nombre = response.data.fileName;
              this.dialogData.fileName = nombre;
              const ext = nombre.split('.')[1];
              downloadBase64(fileData, nombre, ext);
            }
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
          }
        },
        error: (e) => {
          //console.error('Error al recibir el archivo', e);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
          this.isLoading = false;
          this.cd.detectChanges();
        },
        complete: () => {
          //console.log('FIN:');
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
      //this.nombre = file.name;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento.set(true);
    } else {
      console.error('Documento inválido');
    }
  }
  onEliminarIndex(index: number): void {
    this.promocion()?.archivos.splice(index, 1);
  }
  eliminarDocumento(documento: PromocionDocumentos, tipoDocumento: number, index: number) {
    //tipoDocumento=2 que son archivos de exhortos enviados
    this.confirmationService.confirm({
      key: 'eliminarArchivo',
      accept: () => this.onEliminarDocumento(documento, tipoDocumento, index),
      reject: () => { }
    });
  }

  onEliminarDocumento(documento: PromocionDocumentos, tipoDocumento: number, index: number) {
    //validamos si idArchivo no trae nada, quiere decir que son archivos nuevos que no se han guardado y se 
    //eliminan solo en el array, sin llamar la api
    if (documento.idArchivo == 0) {
      this.onEliminarIndex(index);
    }
    else {
      // Llamada al servicio para eliminar el documento
      this.amparosService.eliminarArchivo(documento.idArchivo, tipoDocumento).subscribe({
        next: (response: any) => {
          //console.log('¿Se eliminó archivo?:', response);
          //console.log('ID archivo:', idArchivo);
          //console.log('Tipo documento:', tipoDocumento);
          if (response.success) {
            // Encuentra el índice del documento que quieres eliminar
            const index = this.promocion()?.archivos.findIndex(doc => doc.idArchivo === documento.idArchivo) ?? -1;
            if (index !== -1) {
              // Elimina el elemento del arreglo
              this.promocion()?.archivos.splice(index, 1);
            }
            //console.log("Documento eliminado");
            this.messageService.add({ severity: 'success', summary: 'Error', detail: 'Documento eliminado' });
          } else {
            //console.error('Error al eliminar el archivo:', response.message);
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
          }
        },
        error: (error) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        },
        complete: () => {

        }
      });
    }
    //this.confirmacionEliminarDocumento = false
  }

}


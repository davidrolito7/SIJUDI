import { Component, inject, ChangeDetectorRef, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormsModule, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FieldsetModule } from 'primeng/fieldset';
import { Router } from '@angular/router';
import { TerminosService } from '../../service/terminos.service';
import { InputMask } from 'primeng/inputmask';
import { InputNumber } from 'primeng/inputnumber';
import { forkJoin } from 'rxjs';
import { AfterViewInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { Base64ToBlob, base64ToFile } from '../../../shared/functions/utils';


// Definición de tipo para partes y anexos, para mayor claridad en el código. No es estrictamente necesario, pero ayuda a entender mejor qué propiedades se esperan en cada caso.
type Item = { id: number; nombre: string; cantidad?: number };

// El componente principal para términos de primera instancia
@Component({
  selector: 'app-terminos',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    DatePickerModule,
    DividerModule,
    ReactiveFormsModule,
    InputNumberModule,
    InputMaskModule,
    SelectModule,
    TextareaModule,
    TableModule,
    ToastModule,
    FieldsetModule,
    DialogModule,
    ConfirmDialog,
    Breadcrub,
    Spinner
  ],
  // Inyección de MessageService para mostrar mensajes al usuario
  providers: [MessageService, ConfirmationService],
  templateUrl: './terminosprimerainstancia.html',
  styleUrl: './terminosprimerainstancia.css',
})

/**
 * Componente encargado de la captura, edición y consulta
 * de términos de primera instancia.
 *
 * Funcionalidades principales:
 * - Manejo de formulario reactivo con validaciones.
 * - Carga de catálogos (juzgados, trámites y anexos).
 * - Administración dinámica de partes y anexos.
 * - Guardado y modificación de escritos.
 * - Control de modos: nuevo, edición y lectura.
 */

export class Terminosprimerainstancia implements OnInit, AfterViewInit {

  //focus para el input de "Presentado por" al guardar sin partes
  @ViewChild('presentadoPorInput') presentadoPorInput!: ElementRef<HTMLInputElement>;

  //focus para campos numéricos
  @ViewChild('expedienteInput') expedienteInput!: InputMask;

  //focus para el input de "Secretaría
  @ViewChild('secretariaInput') secretariaInput!: InputNumber;

  //focus para el input de "Fojas"
  @ViewChild('fojasInput') fojasInput!: InputNumber;

  //focus para el input de "Traslados"
  @ViewChild('trasladosInput') trasladosInput!: InputNumber;

  //focus para el input de "Juzgado"
  @ViewChild('juzgadoCveInput') juzgadoCveInput!: ElementRef<HTMLInputElement>;

  //focus para el input de "Trámite"
  @ViewChild('tramiteCveInput') tramiteCveInput!: ElementRef<HTMLInputElement>;

  //focus para el input de "Folio" después de guardar exitosamente
  @ViewChild('folioInput') folioInput!: ElementRef<HTMLInputElement>;

  //focus para los inputs de cantidad de anexos
  @ViewChildren('cantidadInput') cantidadInputs!: QueryList<ElementRef<HTMLInputElement>>;

  // Inyección de servicios
  private messageService = inject(MessageService);

  // Controla el modo actual del formulario
  modo: 'nuevo' | 'edicion' | 'lectura' = 'nuevo';

  // Formulario principal del escrito
  terminosForm!: FormGroup;

  // Almacena cantidades capturadas por anexo
  cantidadesAnexos: Record<number, number | null> = {};
  isLoading: boolean = false;

  constructor(
    // Inyección de servicios a través del constructor
    private fb: FormBuilder,
    private apiService: TerminosService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService

  ) {
    // Inicialización del formulario con validaciones
    this.terminosForm = this.fb.group({
      folio: [{ value: '', disabled: true }],
      fecha: [{ value: null, disabled: true }],
      hora: [{ value: null, disabled: true }],
      presentadoPor: ['', [Validators.maxLength(120)]],
      expediente: ['', [Validators.required, Validators.maxLength(9)]],
      secretaria: [null, [Validators.required]],
      juzgadoCve: ['', [Validators.required, Validators.maxLength(4)]],
      juzgadoId: [undefined], // 👈 QUITADO required
      tramiteCve: ['', [Validators.required, Validators.maxLength(4)]],
      tramiteId: [undefined], // 👈 QUITADO required
      fojas: [null, [Validators.required]],
      traslados: [null, [Validators.required]],
      otroAnexo: ['', [Validators.maxLength(150)]],
      observaciones: ['', [Validators.maxLength(400)]]
    });

    // Inicializar fecha y hora con el momento actual
    const ahora = new Date();
    this.terminosForm.patchValue({
      fecha: ahora,
      hora: ahora
    });
  }

  // En este método solo debe ir lógica que NO cambie el estado del template, para evitar problemas de detección de cambios
  ngOnInit() {
    // solo lógica que NO cambie el template
  }

  /**
 * Se ejecuta después de renderizar la vista.
 * Aquí se cargan los catálogos necesarios y se sincronizan
 * los controles dependientes del formulario.
 */
  ngAfterViewInit() {
    forkJoin({
      juzgados: this.apiService.getCatalogoJuzgadosPrimeraInstancia(),
      tramites: this.apiService.getCatalogoTramitesPrimeraInstancia(),
      anexos: this.apiService.getCatalogoAnexosPrimeraInstancia()
    }).subscribe({
      next: res => {
        this.catalogoJuzgados = res.juzgados.success ? res.juzgados.data ?? [] : [];
        this.catalogoTramites = res.tramites.success ? res.tramites.data ?? [] : [];
        this.catalogoAnexos = res.anexos.success ? res.anexos.data ?? [] : [];

        this.cdr.detectChanges(); // Forzamos detección de cambios tras cargar catálogos
        this.forceUpperCase('juzgadoCve');
        this.forceUpperCase('tramiteCve');
        this.sincronizarJuzgadoDesdeSelect();
        this.sincronizarTramiteDesdeSelect();

        this.route.queryParams.subscribe(params => {
          if (params['folio']) {
            this.cargarEscrito(params['folio']);
          }
        });

        setTimeout(() => {
          this.presentadoPorInput?.nativeElement.focus();
        });
      }
    });
  }
  // Variable para almacenar los presentados agregados dinámicamente
  presentados: string[] = [];

  // Variable para almacenar los otros anexos agregados dinámicamente
  otrosAnexosLista: string[] = [];

  puedeCertificar = false;
  esModoEdicion = false;


  isSaving = false;
  mostrarExito = false;
  folioGenerado = '';


  // -------------------------
  agregarPresentado() {
    const valor = this.terminosForm.get('presentadoPor')?.value?.trim();
    if (valor && !this.presentados.includes(valor)) { //permite evitar duplicados
      this.presentados.push(valor);
      this.terminosForm.get('presentadoPor')?.setValue('');
    }
  }
  // -------------------------
  eliminarPresentado(index: number) {
    this.presentados.splice(index, 1);
  }
  // -------------------------
  agregarOtroAnexo() {
    const valor = this.terminosForm.get('otroAnexo')?.value?.trim();
    if (valor) { //acepta duplicados, ya que no hay un catálogo que limite los valores
      this.otrosAnexosLista.push(valor);
      this.terminosForm.get('otroAnexo')?.setValue('');
    }
  }
  // -------------------------
  eliminarOtroAnexo(index: number) {
    this.otrosAnexosLista.splice(index, 1);
  }

  // -------------------------
  catalogoJuzgados: any[] = [];
  catalogoTramites: any[] = [];
  catalogoAnexos: any[] = [];

  // Carga catálogo de juzgados desde el backend.
  cargarCatalogoJuzgados() {
    this.apiService.getCatalogoJuzgadosPrimeraInstancia().subscribe({
      next: res => {
        if (res.success) {
          this.catalogoJuzgados = res.data ?? [];
        } else {
          this.catalogoJuzgados = [];
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: res.message
          });
        }
      },
      error: e => console.error(e)
    });
  }

  // Carga catálogo de trámites desde el backend.
  cargarCatalogoTramites() {
    this.apiService.getCatalogoTramitesPrimeraInstancia().subscribe({
      next: res => {
        if (res.success) {
          this.catalogoTramites = res.data ?? [];
        } else {
          this.catalogoTramites = [];
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: res.message
          });
        }
      },
      error: e => console.error(e)
    });
  }

  // Carga catálogo de anexos desde el backend.
  cargarCatalogoAnexos() {
    this.apiService.getCatalogoAnexosPrimeraInstancia().subscribe({
      next: res => {
        if (res.success) {
          this.catalogoAnexos = res.data ?? [];
          this.cdr.detectChanges();
        } else {
          this.catalogoAnexos = [];
        }
      },
      error: e => console.error(e)
    });
  }

  // Sincroniza clave de juzgado cuando cambia el select.
  sincronizarJuzgadoDesdeSelect() {
    this.terminosForm.get('juzgadoId')?.valueChanges.subscribe(id => {
      if (!id || !Array.isArray(this.catalogoJuzgados)) return;

      const juzgado = this.catalogoJuzgados.find(j => j.idCveJuzgado === id);

      if (juzgado) {
        this.terminosForm.get('juzgadoCve')
          ?.setValue(juzgado.cve, { emitEvent: false });
      }
    });
  }

  // Sincroniza clave de trámite cuando cambia el select.
  sincronizarTramiteDesdeSelect() {
    this.terminosForm.get('tramiteId')?.valueChanges.subscribe(id => {
      if (!id || !Array.isArray(this.catalogoTramites)) return;

      const tramite = this.catalogoTramites.find(t => t.idElemencat === id);
      if (tramite) {
        this.terminosForm.get('tramiteCve')
          ?.setValue(tramite.clave, { emitEvent: false });
      }
    });
  }

  // -------------------------
  buscarJuzgadoPorCve() {
    let cve = this.terminosForm.get('juzgadoCve')?.value?.trim();
    if (!cve) {
      this.resetearJuzgado();
      return;
    }

    cve = cve.toUpperCase();
    this.terminosForm.get('juzgadoCve')?.setValue(cve, { emitEvent: false });

    const juzgado = this.catalogoJuzgados.find(j => j.cve === cve);

    if (juzgado) {
      this.terminosForm.get('juzgadoId')?.setValue(juzgado.idCveJuzgado);
    } else {
      this.resetearJuzgado();

      this.messageService.add({
        severity: 'warn',
        summary: 'Juzgado no encontrado',
        detail: `No existe la clave ${cve} en el catálogo de juzgados`
      });
    }
  }

  // -------------------------
  buscarTramitePorCve() {
    let clave = this.terminosForm.get('tramiteCve')?.value?.trim();
    if (!clave) {
      this.resetearTramite();
      return;
    }

    clave = clave.toUpperCase();
    this.terminosForm.get('tramiteCve')?.setValue(clave, { emitEvent: false });

    const tramite = this.catalogoTramites.find(
      t => t.clave?.toUpperCase() === clave
    );

    if (tramite) {
      this.terminosForm.get('tramiteId')?.setValue(tramite.idElemencat);
    } else {
      this.resetearTramite();

      this.messageService.add({
        severity: 'warn',
        summary: 'Trámite no encontrado',
        detail: `No existe la clave ${clave} en el catálogo de trámites`
      });
    }
  }

  // -------------------------
  resetearJuzgado() {
    this.terminosForm.patchValue({ juzgadoId: null });
  }

  // -------------------------
  resetearTramite() {
    this.terminosForm.patchValue({ tramiteId: null });
  }

  // -------------------------
  anexosSeleccionados: {
    idCatCveAnexos: number;
    cantidad: number | null;
  }[] = [];

  // -------------------------
  estaAnexoSeleccionado(id: number): boolean {
    return this.anexosSeleccionados.some(a => a.idCatCveAnexos === id);
  }

  // -------------------------
  toggleAnexo(id: number) {
    const index = this.anexosSeleccionados.findIndex(
      a => a.idCatCveAnexos === id
    );

    if (index >= 0) {
      this.anexosSeleccionados.splice(index, 1);
      this.cantidadesAnexos[id] = null;
    } else {
      this.anexosSeleccionados.push({ idCatCveAnexos: id, cantidad: null });
      this.cantidadesAnexos[id] = null;
      setTimeout(() => this.focusCantidad(id));
    }
  }

  // -------------------------
  actualizarCantidad(id: number, event: any) {
    const cantidad = typeof event === 'number' ? event : event?.value;
    this.cantidadesAnexos[id] = cantidad ?? null;

    const anexo = this.anexosSeleccionados.find(a => a.idCatCveAnexos === id);
    if (anexo) {
      anexo.cantidad = cantidad ?? null;
    }
  }


  // -------------------------
  focusCantidad(id: number) {
    const input = document.getElementById('cantidad-' + id) as HTMLInputElement;
    if (input) input.focus();
  }

  // -------------------------
  nuevo() {
    // Cambiar a modo nuevo
    this.modo = 'nuevo';

    // Cambiar a false para certificar new
    this.puedeCertificar = false;

    this.esModoEdicion = false;

    // Habilitar folio temporalmente
    this.terminosForm.get('folio')?.enable();

    // Resetear formulario
    this.terminosForm.reset();

    // Limpiar presentados
    this.presentados = [];

    // Limpiar otros anexos
    this.otrosAnexosLista = [];

    // Limpiar anexos seleccionados
    this.anexosSeleccionados = [];

    // Limpiar cantidades de anexos
    this.cantidadesAnexos = {};

    // Volver a poner fecha y hora actuales
    const ahora = new Date();
    this.terminosForm.patchValue({
      fecha: ahora,
      hora: ahora
    })
    setTimeout(() => {
      this.presentadoPorInput?.nativeElement.focus();
    });;

    // Habilitar formulario
    this.terminosForm.enable();

    // Bloquear fecha y hora (siempre)
    this.terminosForm.get('fecha')?.disable();
    this.terminosForm.get('hora')?.disable();
    this.terminosForm.get('otrosAnexos')?.disable();

    // 👉 Volver a deshabilitar folio
    this.terminosForm.get('folio')?.disable();
  }

  /**
 * Valida el formulario y envía la información al backend
 * para crear un nuevo escrito.
 *
 * Incluye validaciones manuales adicionales
 * y control para evitar doble envío.
 */
  guardar() {
    this.isLoading = false;

    const ahora = new Date();

    this.terminosForm.patchValue({
      fecha: ahora,
      hora: ahora
    });

    // =====================================================
    // Sincronizar cantidades seleccionadas antes de enviar
    // =====================================================
    this.anexosSeleccionados.forEach(a => {
      a.cantidad = this.cantidadesAnexos[a.idCatCveAnexos] ?? null;
    });

    // =====================================================
    // Obtener valores actuales del formulario (incluye campos deshabilitados)
    // =====================================================
    const form = this.terminosForm.getRawValue();

    // =====================================================
    // Construcción de colecciones relacionadas
    // =====================================================

    // Partes (Presentado por)
    const partes = this.presentados.map(nombre => ({ nombre }));

    // Otros anexos (capturados manualmente)
    const otrosAnexos = this.otrosAnexosLista.map(nombre => ({
      descripcion: nombre
    }));

    // Anexos del catálogo con cantidad
    const anexos = this.anexosSeleccionados.map(a => {
      const anexoCatalogo = this.catalogoAnexos.find(
        x => x.idCatCveAnexos === a.idCatCveAnexos
      );

      return {
        cveAnexo: anexoCatalogo?.cveAnexo ?? '', // fallback defensivo
        cantidad: a.cantidad!
      };
    });

    // =====================================================
    // Armado del payload a enviar al backend
    // =====================================================
    const payload = {
      instancia: 'P',
      materia: 'P',
      expediente: form.expediente,
      secretaria: String(form.secretaria),
      juzgado: form.juzgadoCve,
      tramite: form.tramiteCve,
      fojas: Number(form.fojas),
      traslados: Number(form.traslados),
      observaciones: form.observaciones ?? '',
      toca: '',
      sala: '',
      anexos,
      partes,
      otrosAnexos
    };

    // =====================================================
    // Prevención de doble envío
    // =====================================================
    if (this.isSaving) return;

    this.isSaving = true;
    this.terminosForm.disable(); // Bloquea el formulario mientras se procesa

    // =====================================================
    // Llamada al servicio para guardar el escrito
    // =====================================================
    this.apiService.guardarEscrito(payload).subscribe({

      next: (resp: any) => {
        this.isLoading = false;

        // -------------------------------------------------
        // Validación lógica de respuesta del backend
        // (Aunque sea HTTP 200, puede venir success = false)
        // -------------------------------------------------
        if (!resp.success) {

          this.isSaving = false;
          this.terminosForm.enable();

          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: resp.message ?? 'No se pudo registrar el escrito'
          });

          return;
        }

        // -------------------------------------------------
        // Éxito real
        // -------------------------------------------------
        this.folioGenerado = resp.data?.folio;
        this.puedeCertificar = true;


        // Si deseas mostrar el folio en el formulario
        this.terminosForm.patchValue({
          folio: this.folioGenerado
        });

        // Mostrar modal de éxito
        this.mostrarExito = true;
      },

      error: (err) => {
        this.isLoading = false;

        // -------------------------------------------------
        // Error técnico (500, red, servidor, etc.)
        // -------------------------------------------------
        this.isSaving = false;
        this.terminosForm.enable();

        console.error(err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error del sistema',
          detail: err?.error?.message ?? 'No se pudo guardar el escrito'
        });
      }
    });
  }

  /**
 * Valida y actualiza un escrito existente.
 * Reutiliza la misma estructura de validaciones que guardar().
 */
  modificar() {
    this.isLoading = true;

    // =====================================================
    // Sincronizar cantidades seleccionadas antes de enviar
    // =====================================================
    this.anexosSeleccionados.forEach(a => {
      a.cantidad = this.cantidadesAnexos[a.idCatCveAnexos] ?? null;
    });

    // =====================================================
    // Obtener valores actuales del formulario
    // =====================================================
    const form = this.terminosForm.getRawValue();

    // =====================================================
    // Construcción de colecciones relacionadas
    // =====================================================

    const partes = this.presentados.map(nombre => ({ nombre }));

    const otrosAnexos = this.otrosAnexosLista.map(nombre => ({
      descripcion: nombre
    }));

    const anexos = this.anexosSeleccionados.map(a => {
      const anexoCatalogo = this.catalogoAnexos.find(
        x => x.idCatCveAnexos === a.idCatCveAnexos
      );

      return {
        cveAnexo: anexoCatalogo?.cveAnexo ?? '',
        cantidad: a.cantidad!
      };
    });

    // =====================================================
    // Armado de payload para actualización
    // =====================================================
    const payload = {
      folio: form.folio,
      expediente: form.expediente,
      secretaria: String(form.secretaria),
      juzgado: form.juzgadoCve,
      tramite: form.tramiteCve,
      fojas: Number(form.fojas),
      traslados: Number(form.traslados),
      observaciones: form.observaciones ?? '',
      toca: '',
      sala: '',
      anexos,
      partes,
      otrosAnexos
    };

    // =====================================================
    // Prevención de doble envío
    // =====================================================
    if (this.isSaving) return;

    this.isSaving = true;
    this.terminosForm.disable();

    // =====================================================
    // Llamada al servicio
    // =====================================================
    this.apiService.modificarEscrito(form.folio, payload).subscribe({

      next: (resp: any) => {
        this.isLoading = false;

        // Validación lógica del backend
        if (!resp.success) {

          this.isSaving = false;
          this.terminosForm.enable();

          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: resp.message ?? 'No se pudo actualizar el escrito'
          });

          return;
        }

        // Éxito real
        this.messageService.add({
          severity: 'success',
          summary: 'Escrito actualizado',
          detail: 'Los cambios se guardaron correctamente',
          life: 2500
        });

        this.puedeCertificar = true;


        setTimeout(() => {
          this.nuevo();
          this.isSaving = false;
          //this.terminosForm.enable();
        }, 3000);
      },

      error: err => {
        this.isLoading = false;

        this.isSaving = false;
        this.terminosForm.enable();

        console.error(err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error del sistema',
          detail: 'No se pudo actualizar el escrito'
        });
      }
    });
  }


  // -------------------------
  unirFechaHora(fecha: Date, hora: Date): Date {
    const result = new Date(fecha);
    result.setHours(hora.getHours());
    result.setMinutes(hora.getMinutes());
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result;
  }

  // -------------------------
  irABuscar() {
    this.router.navigate(['/terminos/buscar']);
  }

  // -------------------------
  irAReporteDocumentos(): void {
    this.router.navigate(['/terminos/reportes/documentos']);
  }

  /**
   * Obtiene un escrito por folio y carga su información
   * en el formulario en modo lectura.
   */
  cargarEscrito(folio: string) {
    // Cambiar a modo lectura
    this.apiService.obtenerEscritoPorFolio(folio).subscribe({
      next: (resp: any) => {
        // Validar que la respuesta tenga éxito y datos antes de intentar cargar el escrito. Si no, se muestra un mensaje de advertencia y se mantiene en modo nuevo para evitar confusiones
        if (!resp || !resp.success || !resp.data) {
          return;
        }
        // Si la respuesta es exitosa y tiene datos, se carga el escrito en el formulario
        const escrito = resp.data;

        // Cambiar a modo lectura para mostrar el formulario con los datos cargados pero sin permitir modificaciones
        this.modo = 'lectura';

        this.esModoEdicion = true;

        // DATOS PRINCIPALES
        this.terminosForm.patchValue({
          folio: escrito.folio,
          expediente: escrito.expediente,
          secretaria: escrito.secretaria,
          fojas: escrito.fojas,
          traslados: escrito.traslados,
          observaciones: escrito.observaciones ?? ''
        });

        // mandar a sincronizar juzgado y trámite desde los select para que se muestren las claves correspondientes, ya que el escrito trae los IDs. Se hace con un pequeño delay para asegurar que los catálogos estén cargados y el formulario esté listo para recibir los cambios
        setTimeout(() => {
          this.terminosForm.patchValue({
            juzgadoId: escrito.juzgadoId,
            tramiteId: escrito.tramiteId
          });
        });

        // Sincronizar claves de juzgado y trámite en los inputs correspondientes
        this.terminosForm.patchValue({
          tramiteCve: escrito.tramite ?? null,
          tramiteId: escrito.tramiteId ?? null
        });

        // PARTES
        this.presentados = Array.isArray(escrito.partes)
          ? escrito.partes.map((p: any) => p.nombre)
          : [];

        // ANEXOS
        this.anexosSeleccionados = [];
        this.cantidadesAnexos = {};

        // Si el escrito trae anexos, se recorren para cargar los seleccionados y sus cantidades correspondientes. Se hace buscando la información del anexo en el catálogo para asegurar que se tenga la información completa y correcta
        if (Array.isArray(escrito.anexos)) {
          escrito.anexos.forEach((a: any) => {
            const anexoCatalogo = this.catalogoAnexos.find(
              c => c.cveAnexo === a.cveAnexo
            );
            // Si encuentra el anexo en el catálogo, se agrega a los seleccionados y se asigna su cantidad. Si no lo encuentra, se omite para evitar inconsistencias, aunque idealmente esto no debería pasar
            if (anexoCatalogo) {
              this.anexosSeleccionados.push({
                idCatCveAnexos: anexoCatalogo.idCatCveAnexos,
                cantidad: a.cantidad ?? null
              });

              // Se asigna la cantidad en el objeto de cantidadesAnexos para que se muestre correctamente en el input correspondiente
              this.cantidadesAnexos[anexoCatalogo.idCatCveAnexos] =
                a.cantidad ?? null;
            }
          });
        }

        // OTROS ANEXOS
        this.otrosAnexosLista = Array.isArray(escrito.otrosAnexos)
          ? escrito.otrosAnexos.map((o: any) => o.anexo)
          : [];
      },
      // En caso de error al cargar el escrito, se muestra un mensaje de error y se mantiene en modo nuevo para evitar confusiones
      error: err => {
        console.error('Error al cargar escrito:', err);
      }
    });
  }

  /**
   * Método utilitario para enfocar campos dinámicamente.
   * Soporta tanto ElementRef nativos como componentes PrimeNG.
   */
  private focusCampo(ref: any) {
    setTimeout(() => {
      if (!ref) {
        return;
      }

      // Componentes de PrimeNG (InputNumber, InputMask, etc.)
      if (ref.el?.nativeElement) {
        const input = ref.el.nativeElement.querySelector('input');
        input?.focus();
        return;
      }

      // ElementRef de un input nativo
      if (ref.nativeElement) {
        ref.nativeElement.focus();
      }
    }, 0);
  }

  onCerrarDialogo() {

    this.mostrarExito = false;

    if (this.esModoEdicion) {
      this.nuevo();
      this.isSaving = false;
      this.terminosForm.enable();
      return;
    }

    setTimeout(() => {

      this.confirmationService.confirm({
        key: 'certificarDocumento',
        accept: () => {
          this.isSaving = false;
          this.terminosForm.enable();
          this.certificar();
        },
        reject: () => {
          this.nuevo();
          this.isSaving = false;
          this.terminosForm.enable();
        }
      });

    }, 150);
  }

  moveNext(event: Event): void {
    event.preventDefault();

    const current = event.target as HTMLElement;

    const focusableElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        'input, select, textarea'
      )
    ).filter(el =>
      !el.hasAttribute('disabled') &&
      el.tabIndex !== -1 &&
      el.offsetParent !== null
    );

    const index = focusableElements.indexOf(current);

    if (index > -1 && index < focusableElements.length - 1) {
      focusableElements[index + 1].focus();
    }
  }

  /**
 * Fuerza el valor de un control a mayúsculas
 * sin disparar eventos adicionales.
 */
  private forceUpperCase(controlName: string): void {
    const control = this.terminosForm.get(controlName);

    control?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        control.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });
  }

  onEnterBuscar(controlName: string, event: Event): void {

    event.preventDefault();

    const control = this.terminosForm.get(controlName);
    const value = control?.value;

    if (!value || String(value).trim().length < 4) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Clave inválida',
        detail: 'Debe capturar una clave válida de 4 caracteres.'
      });
      return;
    }

    // Ejecutar método correcto según campo
    if (controlName === 'juzgadoCve') {
      this.buscarJuzgadoPorCve();
    }

    if (controlName === 'tramiteCve') {
      this.buscarTramitePorCve();
    }
  }

  /**
   * Muestra diálogo de confirmación antes de guardar o actualizar.
   */

  confirmarGuardar() {

    // Primero validar antes de preguntar confirmación
    if (!this.validarFormularioAntesDeConfirmar()) {
      return;
    }

    this.confirmationService.confirm({
      key: 'guardarEscrito',
      accept: () => this.onGuardarOActualizar(),
      reject: () => { }
    });
  }

  onGuardarOActualizar() {
    this.esActualizar ? this.modificar() : this.guardar();
  }

  private validarFormularioAntesDeConfirmar(): boolean {

    // Validar Presentado por (al menos uno)
    if (this.presentados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe agregar al menos una persona en "Presentado por"'
      });

      // Marcar el campo como tocado para mostrar validación
      // 
      setTimeout(() => {
        this.presentadoPorInput?.nativeElement.focus();
      }, 0);

      return false;
    }

    // Validar  Expediente
    if (!this.terminosForm.get('expediente')?.value?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe capturar el expediente'
      });

      // Marcar el campo como tocado para mostrar validación
      this.terminosForm.get('expediente')?.markAsTouched();

      // Llevas el foco ahí
      setTimeout(() => {
        this.expedienteInput?.focus();
      }, 0);

      return false;
    }

    // Validar  Secretaría
    if (!this.terminosForm.get('secretaria')?.value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe capturar la secretaría'
      });

      // Marcar el campo como tocado para mostrar validación
      this.terminosForm.get('secretaria')?.markAsTouched();

      // Llevas el foco ahí
      this.focusCampo(this.secretariaInput);

      return false;
    }
    // Validar Fojas
    if (!this.terminosForm.get('fojas')?.value ||
      this.terminosForm.get('fojas')?.value <= 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe capturar el número de fojas'
      });

      // Marcar el campo como tocado para mostrar validación
      this.terminosForm.get('fojas')?.markAsTouched();

      // Llevas el foco ahí
      this.focusCampo(this.fojasInput);

      return false;
    }

    //  Validar Traslados
    const traslados = this.terminosForm.get('traslados')?.value;

    if (traslados == null || traslados < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe capturar el número de traslados'
      });

      this.terminosForm.get('traslados')?.markAsTouched();
      this.focusCampo(this.trasladosInput);

      return false;
    }
    //  Validar Juzgado
    if (!this.terminosForm.get('juzgadoId')?.value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe seleccionar un juzgado'
      });

      // Marcar el campo como tocado para mostrar validación
      this.terminosForm.get('juzgadoCve')?.markAsTouched();

      // Llevas el foco ahí
      this.focusCampo(this.juzgadoCveInput);

      return false;
    }

    //  Validar trámite
    if (!this.terminosForm.get('tramiteId')?.value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe seleccionar un trámite'
      });

      // Marcas el campo visible
      this.terminosForm.get('tramiteCve')?.markAsTouched();

      // Llevas el foco ahí
      this.focusCampo(this.tramiteCveInput);

      return false;
    }

    // Validar anexos con cantidad
    const anexoInvalido = this.anexosSeleccionados.find(a => {
      const cantidad = this.cantidadesAnexos[a.idCatCveAnexos];
      return !cantidad || cantidad <= 0;
    });

    // Si encuentra un anexo inválido, muestra mensaje y enfoca el input de cantidad correspondiente
    if (anexoInvalido) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Todos los anexos seleccionados deben tener cantidad'
      });

      // Llevas el foco al input de cantidad del anexo inválido después de un pequeño delay para asegurar que el DOM esté actualizado
      setTimeout(() => {
        const input = document.getElementById(
          `cantidad-${anexoInvalido.idCatCveAnexos}`
        ) as HTMLInputElement | null;

        input?.focus();
        input?.select();
      }, 100);

      return false;
    }

    // NUEVA VALIDACIÓN: límite máximo permitido por Int32
    const MAX_INT = 2147483647;

    // Detectar si algún valor fue ajustado al máximo
    const cantidadEnLimite = this.anexosSeleccionados.find(a => {
      const cantidad = this.cantidadesAnexos[a.idCatCveAnexos];
      return cantidad != null && cantidad === MAX_INT;
    });

    // Si se detecta un valor en el límite, mostrar mensaje y enfocar el input correspondiente para que el usuario pueda corregirlo
    if (cantidadEnLimite) {
      this.messageService.add({
        severity: 'info',
        summary: 'Límite alcanzado',
        detail: `El valor máximo permitido es ${MAX_INT}.`,
        life: 4000
      });

      // Enfocar el input del anexo que tiene la cantidad en el límite después de un pequeño delay para asegurar que el DOM esté actualizado
      setTimeout(() => {
        const input = document.getElementById(
          `cantidad-${cantidadEnLimite.idCatCveAnexos}`
        ) as HTMLInputElement | null;

        input?.focus();
        input?.select();
      }, 100);

      return false;
    }

    return true;
  }

  eliminarPresentadoPor(index: number) {
    this.confirmationService.confirm({
      key: 'presentadoPor',
      accept: () => this.eliminarPresentado(index),
      reject: () => { }
    });
  }

  eliminarOtrosAnexos(index: number) {
    this.confirmationService.confirm({
      key: 'otrosAnexos',
      accept: () => this.eliminarOtroAnexo(index),
      reject: () => { }
    });
  }

  /**
 * Indica si el formulario está en modo actualización.
 * Se determina si existe un folio cargado.
 */
  get esActualizar(): boolean {
    return !!this.terminosForm.get('folio')?.value;
  }

  // ================================
  // CERTIFICAR ESCRITO
  // ================================
  certificar() {
    this.isLoading = true;
    this.cdr.detectChanges();
    const folio = this.terminosForm.get('folio')?.value;
    if (!folio) return;

    this.apiService.obtenerCertificacion(folio)
      .subscribe({
        next: (response: any) => {
          if(response.success){
            this.isLoading = false;
            this.cdr.detectChanges();

            var pdfBlob = base64ToFile(response.data.documento,response.data.nombre, response.data.mimetype);
            const blobUrl = URL.createObjectURL(pdfBlob);

            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;

            document.body.appendChild(iframe);

            iframe.onload = () => {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();

              setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                document.body.removeChild(iframe);
              }, 1000);
            };

            // 🔥 Limpiar formulario después de certificar
            setTimeout(() => {
              this.nuevo();
              this.isSaving = false;
              // this.terminosForm.enable();
            }, 800);
          }else{
              this.messageService.add({
              severity: 'error',
              summary: 'No se pudo generar la certificación',
              detail: response.message
            });
          }
        },
        error: (e) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          this.messageService.add({
              severity: 'error',
              summary: 'No se pudo generar la certificación',
              detail: e.message
            });
        }

      });
  }

}





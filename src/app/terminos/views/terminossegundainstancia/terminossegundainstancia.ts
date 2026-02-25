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

// Definición de tipo para partes y anexos, para mayor claridad en el código. No es estrictamente necesario, pero ayuda a entender mejor qué propiedades se esperan en cada caso.
type Item = { id: number; nombre: string; cantidad?: number };

// El componente principal para términos de segunda instancia
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
    Breadcrub
],
  // Inyección de MessageService para mostrar mensajes al usuario
  providers: [MessageService,ConfirmationService],
  templateUrl: './terminossegundainstancia.html',
  styleUrl: './terminossegundainstancia.css',
})

// Exportación de la clase del componente, que implementa OnInit y AfterViewInit para manejar la lógica de inicialización y carga de datos
export class Terminossegundainstancia implements OnInit, AfterViewInit {

  //focus para el input de "Presentado por" al guardar sin partes
  @ViewChild('presentadoPorInput') presentadoPorInput!: ElementRef<HTMLInputElement>;

  //focus para campos numéricos
  @ViewChild('expedienteInput') expedienteInput!: InputMask;

  //focus para el input de "Toca"
  @ViewChild('tocaInput') tocaInput!: InputMask;

  //focus para el input de "Fojas"
  @ViewChild('fojasInput') fojasInput!: InputNumber;

  //focus para el input de "Traslados"
  @ViewChild('trasladosInput') trasladosInput!: InputNumber;

  //focus para el input de "Salas"
  @ViewChild('salaCveInput') salaCveInput!: ElementRef<HTMLInputElement>;

  //focus para el input de "Trámite"
  @ViewChild('tramiteCveInput') tramiteCveInput!: ElementRef<HTMLInputElement>;

  //focus para el input de "Folio" después de guardar exitosamente
  @ViewChild('folioInput') folioInput!: ElementRef<HTMLInputElement>;

  //focus para los inputs de cantidad de anexos
  @ViewChildren('cantidadInput') cantidadInputs!: QueryList<ElementRef<HTMLInputElement>>;

  // Inyección de servicios
  private messageService = inject(MessageService);

  // Variable para controlar el modo de operación: nuevo, edición o lectura
  modo: 'nuevo' | 'edicion' | 'lectura' = 'nuevo';

  // Formulario principal
  terminosForm!: FormGroup;

  // Variable para almacenar las cantidades de anexos, clave: idCatCveAnexos, valor: cantidad
  cantidadesAnexos: Record<number, number | null> = {};

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
      toca: ['', [Validators.required, Validators.maxLength(9)]],
      salaCve: ['', [Validators.required, Validators.maxLength(4)]],
      salaId: [undefined],
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
  // En este método sí se pueden hacer cambios que afecten al template, ya que se llama después de que Angular haya renderizado la vista
  ngAfterViewInit() {
    forkJoin({
      // Cargar catálogos de salas, trámites y anexos en paralelo para optimizar tiempos de carga
      salas: this.apiService.getCatalogoSalasSegundaInstancia(),
      tramites: this.apiService.getCatalogoTramitesSegundaInstancia(),
      anexos: this.apiService.getCatalogoAnexosPrimeraInstancia()
    }).subscribe({
      next: res => {

        // Asignar catálogos a variables locales para usarlos en selects y lógica de búsqueda. Si la respuesta indica éxito, se asignan los datos; de lo contrario, se asigna un array vacío para evitar errores en el template
        this.catalogoSalas = res.salas.success ? res.salas.data ?? [] : [];
        this.catalogoTramites = res.tramites.success ? res.tramites.data ?? [] : [];
        this.catalogoAnexos = res.anexos.success ? res.anexos.data ?? [] : [];

        // Después de cargar los catálogos, se llama a detectChanges para asegurar que el template se actualice con los datos cargados, especialmente porque algunos campos dependen de estos catálogos para mostrar opciones o sincronizar valores
        this.cdr.detectChanges();

        this.forceUpperCase('salaCve');
        this.forceUpperCase('tramiteCve');

        // Sincronizar campos de sala y trámite para que al cargar un escrito en modo lectura o edición, los selects muestren la opción correcta basada en el ID, y no solo en la clave
        this.sincronizarSalaDesdeSelect();
        this.sincronizarTramiteDesdeSelect();

        // Verificar si hay un folio en los parámetros de la URL para cargar un escrito específico. Esto permite que al navegar a esta página con un folio, se muestre directamente la información de ese escrito en modo lectura
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
  catalogoSalas: any[] = [];
  catalogoTramites: any[] = [];
  catalogoAnexos: any[] = [];

  // -------------------------
  cargarCatalogoSalas() {
    this.apiService.getCatalogoSalasSegundaInstancia().subscribe({
      next: res => {
        if (res.success) {
          this.catalogoSalas = res.data ?? [];
        } else {
          this.catalogoSalas = [];
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
  // -------------------------
  cargarCatalogoTramites() {
    this.apiService.getCatalogoTramitesSegundaInstancia().subscribe({
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
  // -------------------------
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

  // -------------------------
  sincronizarSalaDesdeSelect() {
    this.terminosForm.get('salaId')?.valueChanges.subscribe(id => {
      if (!id || !Array.isArray(this.catalogoSalas)) return;

      const sala = this.catalogoSalas.find(
        s => s.idCveSalas === id
      );

      if (sala) {
        this.terminosForm.get('salaCve')
          ?.setValue(sala.cve, { emitEvent: false });
      }
    });
  }

  // -------------------------
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
  buscarSalaPorCve() {
    let cve = this.terminosForm.get('salaCve')?.value?.trim();
    if (!cve) {
      this.resetearSala();
      return;
    }

    cve = cve.toUpperCase();
    this.terminosForm.get('salaCve')?.setValue(cve, { emitEvent: false });

    const sala = this.catalogoSalas.find(
      s => s.cve?.toUpperCase() === cve
    );

    if (sala) {
      this.terminosForm.get('salaId')
        ?.setValue(sala.idCveSalas);
    } else {
      this.resetearSala();

      this.messageService.add({
        severity: 'warn',
        summary: 'Sala no encontrada',
        detail: `No existe la clave ${cve} en el catálogo de salas`
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
  resetearSala() {
    this.terminosForm.patchValue({ salaId: null });
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

  // -------------------------
  guardar() {

    // ============================================
    // Sincronizar cantidades antes de enviar
    // ============================================
    this.anexosSeleccionados.forEach(a => {
      a.cantidad = this.cantidadesAnexos[a.idCatCveAnexos] ?? null;
    });

    const form = this.terminosForm.getRawValue();

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

    const payload = {
      instancia: 'S',
      materia: 'S',
      expediente: form.expediente,
      toca: form.toca,
      juzgado: form.salaCve, // Backend espera JUZGADO
      sala: form.salaCve,    // Se mantiene por trazabilidad
      tramite: form.tramiteCve,
      fojas: Number(form.fojas),
      traslados: Number(form.traslados),
      observaciones: form.observaciones ?? '',
      anexos,
      partes,
      otrosAnexos
    };

    // ============================================
    // Evitar doble envío
    // ============================================
    if (this.isSaving) return;

    this.isSaving = true;
    this.terminosForm.disable();

    this.apiService.guardarEscrito(payload).subscribe({

      next: (resp: any) => {

        // 🔴 Validación lógica backend
        if (!resp.success) {

          this.isSaving = false;
          this.terminosForm.enable();

          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: resp.message ?? 'No existe configuración de folio'
          });

          return;
        }

        // 🟢 Éxito real
        this.folioGenerado = resp.data?.folio;
        this.puedeCertificar = true;

        this.terminosForm.patchValue({
          folio: this.folioGenerado
        });

        this.mostrarExito = true;
      },

      error: (err) => {

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


  // -------------------------
  modificar() {

    // ============================================
    // Sincronizar cantidades
    // ============================================
    this.anexosSeleccionados.forEach(a => {
      a.cantidad = this.cantidadesAnexos[a.idCatCveAnexos] ?? null;
    });

    const form = this.terminosForm.getRawValue();

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

    const payload = {
      folio: form.folio,
      instancia: 'S',
      materia: 'S',
      expediente: form.expediente,
      toca: form.toca,
      juzgado: form.salaCve,
      sala: form.salaCve,
      tramite: form.tramiteCve,
      fojas: Number(form.fojas),
      traslados: Number(form.traslados),
      observaciones: form.observaciones ?? '',
      anexos,
      partes,
      otrosAnexos
    };

    if (this.isSaving) return;

    this.isSaving = true;
    this.terminosForm.disable();

    this.apiService.modificarEscrito(form.folio, payload).subscribe({

      next: (resp: any) => {

        // 🔴 Validación lógica backend
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

        // 🟢 Éxito real
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
          this.terminosForm.enable();
        }, 3000);
      },

      error: (err) => {

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

  // -------------------------
  cargarEscrito(folio: string) {
    // Llamar al servicio para obtener escrito por folio
    this.apiService.obtenerEscritoPorFolio(folio).subscribe({
      next: (resp: any) => {

        // Validar respuesta
        if (!resp || !resp.success || !resp.data) {
          return;
        }

        // Obtener escrito
        const escrito = resp.data;

        // Cambiar a modo lectura
        this.modo = 'lectura';

        this.esModoEdicion = true;

        // Parchear formulario con datos del escrito. Se usan patchValue para evitar problemas si el backend no envía algún campo, aunque idealmente el backend debería enviar todos los campos necesarios para mostrar la información correctamente
        this.terminosForm.patchValue({
          folio: escrito.folio,
          expediente: escrito.expediente,
          toca: escrito.toca,
          fojas: escrito.fojas,
          traslados: escrito.traslados,
          observaciones: escrito.observaciones ?? ''
        });



        // =========================
        // SALA (clave → id para el select)
        // =========================  
        if (escrito.sala && Array.isArray(this.catalogoSalas)) {
          const sala = this.catalogoSalas.find(
            s => s.cve === escrito.sala
          );

          if (sala) {
            this.terminosForm.patchValue({
              salaId: sala.idCveSalas
            });
          }
        }

        // =========================
        // TRÁMITE
        // =========================
        if (escrito.tramiteId) {
          this.terminosForm.patchValue({
            tramiteId: escrito.tramiteId
          });
        }

        // =========================
        // CLAVES VISIBLES
        // =========================
        this.terminosForm.patchValue({
          salaCve: escrito.sala ?? null,
          tramiteCve: escrito.tramite ?? null
        });

        // =========================
        // PARTES
        // =========================
        this.presentados = Array.isArray(escrito.partes)
          ? escrito.partes.map((p: any) => p.nombre)
          : [];

        // =========================
        // ANEXOS
        // =========================
        this.anexosSeleccionados = [];
        this.cantidadesAnexos = {};

        // Para cada anexo del escrito, se busca su clave en el catálogo para obtener su ID y así poder marcarlo como seleccionado en el formulario. Además, se guarda la cantidad correspondiente para mostrarla en el input asociado a ese anexo
        if (Array.isArray(escrito.anexos)) {
          escrito.anexos.forEach((a: any) => {
            const anexoCatalogo = this.catalogoAnexos.find(
              c => c.cveAnexo === a.cveAnexo
            );

            // Si encuentra el anexo en el catálogo, lo agrega a los seleccionados junto con la cantidad
            if (anexoCatalogo) {
              this.anexosSeleccionados.push({
                idCatCveAnexos: anexoCatalogo.idCatCveAnexos,
                cantidad: a.cantidad ?? null
              });

              // También actualiza el registro de cantidades para facilitar el enlace con los inputs en el template
              this.cantidadesAnexos[anexoCatalogo.idCatCveAnexos] =
                a.cantidad ?? null;
            }
          });
        }

        // =========================
        // OTROS ANEXOS
        // =========================
        this.otrosAnexosLista = Array.isArray(escrito.otrosAnexos)
          ? escrito.otrosAnexos.map((o: any) => o.anexo)
          : [];
      },

      error: err => {
        console.error('Error al cargar escrito:', err);
      }
    });
  }

  // matodo para enfocar campos, se usa en varias partes del código para evitar repetición. Recibe una referencia al campo a enfocar, que puede ser un ElementRef de un input nativo o un componente de PrimeNG que tenga la estructura el.nativeElement.querySelector('input') para encontrar el input interno y enfocarlo. Se ejecuta con un pequeño delay para asegurar que el DOM esté actualizado antes de intentar enfocar
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

    // 🔹 Ejecutar método correcto según campo
    if (controlName === 'salaCve') {
      this.buscarSalaPorCve();
    }

    if (controlName === 'tramiteCve') {
      this.buscarTramitePorCve();
    }

  }

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

    // Validar  Toca
    if (!this.terminosForm.get('toca')?.value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe capturar el TOCA'
      });

      // Marcar el campo como tocado para mostrar validación
      this.terminosForm.get('toca')?.markAsTouched();

      // Llevas el foco ahí
      setTimeout(() => {
        this.tocaInput?.focus();
      }, 0);

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
    if (
      !this.terminosForm.get('traslados')?.value ||
      this.terminosForm.get('traslados')?.value < 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe capturar el número de traslados'
      });
      // Marcar el campo como tocado para mostrar validación
      this.terminosForm.get('traslados')?.markAsTouched();

      // Llevas el foco ahí
      this.focusCampo(this.trasladosInput);

      return false;
    }

    //  Validar Sala
    if (!this.terminosForm.get('salaId')?.value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Debe seleccionar una sala'
      });

      // Marcar el campo como tocado para mostrar validación
      this.terminosForm.get('salaCve')?.markAsTouched();

      // Llevas el foco ahí
      this.focusCampo(this.salaCveInput);

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

  get esActualizar(): boolean {
    return !!this.terminosForm.get('folio')?.value;
  }

  // ================================
  // CERTIFICAR ESCRITO
  // ================================
 certificar() {

  const folio = this.terminosForm.get('folio')?.value;
  if (!folio) return;

  this.apiService.obtenerCertificacion(folio)
    .subscribe((pdfBlob: Blob) => {

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
        this.terminosForm.enable();
      }, 800);

    });
}

}



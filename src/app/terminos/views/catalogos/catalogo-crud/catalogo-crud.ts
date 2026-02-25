import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TerminosService } from '../../../service/terminos.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Breadcrub } from "../../../../shared/components/breadcrub/breadcrub";

// =====================================================
// COMPONENT
// =====================================================
@Component({
  selector: 'app-catalogo-crud',
  standalone: true,
  templateUrl: './catalogo-crud.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    ToastModule,
    ConfirmDialog,
    InputIconModule,
    IconFieldModule,
    Breadcrub
],
  providers: [ConfirmationService, MessageService],

})
export class CatalogoCrud implements OnInit {

  // ================================
  // PROPIEDADES GENERALES
  // ================================
  form!: FormGroup;

  selectedTipo: string = 'Juzgados';
  selectedInstancia: string = 'P';
  catalogos: any[] = [];
  instanciasDisponibles: any[] = [];
  selectedItem: any = null;
  modoEdicion = false;

  // ================================
  // CONFIGURACIÓN DINÁMICA DE CATÁLOGOS
  // ================================
  private catalogoConfig: any = {
    Tramites: {
      idField: 'idElemencat',
      claveField: 'clave',
      usaInstancia: true
    },
    Anexos: {
      idField: 'idCatCveAnexos',
      claveField: 'cveAnexo',
      usaInstancia: false
    },
    Juzgados: {
      idField: 'idCveJuzgado',
      claveField: 'cve',
      usaInstancia: true
    },
    Salas: {
      idField: 'idCveSalas',
      claveField: 'cve',
      usaInstancia: true
    }
  };

  // ================================
  // CATÁLOGOS DISPONIBLES
  // ================================
  tipos = [
    { label: 'Juzgados', value: 'Juzgados' },
    { label: 'Salas', value: 'Salas' },
    { label: 'Trámites', value: 'Tramites' },
    { label: 'Anexos', value: 'Anexos' }
  ];

  instancias = [
    { label: 'Primera Instancia', value: 'P' },
    { label: 'Segunda Instancia', value: 'S' }
  ];

  // ================================
  // CONSTRUCTOR
  // ================================
  constructor(
    private fb: FormBuilder,
    private apiService: TerminosService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  // ================================
  // INICIALIZACIÓN
  // ================================
  ngOnInit() {

    this.form = this.fb.group({
      cve: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      descripcion: ['', Validators.required]
    });

    // Forzar mayúsculas en tiempo real
    this.form.get('cve')?.valueChanges.subscribe(value => {
      if (value) {
        this.form.get('cve')?.setValue(value.toUpperCase(), {
          emitEvent: false
        });
      }
    });

    this.ajustarInstanciaSegunTipo();
    this.cargarDatos();
    this.actualizarValidadorDescripcion();

  }

  // ================================
  // CARGAR DATOS
  // ================================
  cargarDatos() {

    // ANEXOS ignora instancia
    if (this.selectedTipo === 'Anexos') {

      this.apiService.getCatalogoAnexos()
        .subscribe((res: any) => {
          this.catalogos = res?.success ? res.data ?? [] : [];
          this.cd.markForCheck();
        });

      return;
    }

    // Los demás sí usan instancia
    this.apiService
      .getCatalogo(this.selectedTipo, this.selectedInstancia)
      .subscribe((res: any) => {
        this.catalogos = res?.success ? res.data ?? [] : [];
        this.cd.markForCheck();
      });
  }

  // ================================
  // SELECCIONAR REGISTRO
  // ================================
  seleccionar(item: any) {
    this.selectedItem = item;
    this.modoEdicion = true;

    this.form.patchValue({
      cve: item.cve || item.clave || item.cveAnexo,
      descripcion: item.descripcion
    });
  }

  // ================================
  // NUEVO
  // ================================
  nuevo() {

    this.form.reset(); // 🔥 resetea valores y estado

    this.selectedItem = null;
    this.modoEdicion = false;

    // 🔥 Limpiar mensajes toast si hay
    this.messageService.clear();

    // 🔥 Esperar a que Angular renderice y poner focus
    setTimeout(() => {
      const input = document.querySelector(
        'input[formControlName="cve"]'
      ) as HTMLElement;
      input?.focus();
    });
  }

  // ================================
  // GUARDAR 
  // ================================
  guardar() {

    const data = this.construirPayload();

    console.log('Payload enviado:', data);

    this.apiService.crearCatalogo(this.selectedTipo, data)
      .subscribe((res: any) => {

        this.messageService.add({
          severity: res.success ? 'success' : 'warn',
          summary: res.success ? 'Operación exitosa' : 'Error',
          detail: res.success
            ? 'Registro guardado correctamente.'
            : res.message
        });

        if (res.success) {
          this.cargarDatos();
          this.nuevo();
        }
      });
  }

  // ================================
  //  ACTUALIZAR
  // ================================

  actualizar() {

    const config = this.catalogoConfig[this.selectedTipo];
    const id = this.selectedItem[config.idField];

    const data = this.construirPayload();

    this.apiService.actualizarCatalogo(this.selectedTipo, id, data)
      .subscribe((res: any) => {

        this.messageService.add({
          severity: res.success ? 'success' : 'warn',
          summary: res.success ? 'Actualización exitosa' : 'Error al actualizar',
          detail: res.success
            ? 'El registro fue actualizado correctamente.'
            : res.message
        });


        if (res.success) {
          this.cargarDatos();
          this.nuevo();
        }
      });
  }

  // ================================
  // BORRAR
  // ================================
  borrar() {

    const tipo = this.selectedTipo;
    const id = this.getId(this.selectedItem);

    this.apiService.eliminarCatalogo(tipo, id)
      .subscribe((res: any) => {

        this.messageService.add({
          severity: res.success ? 'success' : 'warn',
          summary: res.success ? 'Registro eliminado' : 'No se pudo eliminar',
          detail: res.success
            ? 'El registro fue eliminado correctamente.'
            : res.message
        });


        if (res.success) {
          this.cargarDatos();
          this.nuevo();
        }
      });
  }

  // ================================
  // VALIDAR ANTES DE CONFIRMAR
  // ================================
  private validarAntesDeConfirmar(): boolean {

    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    const cveControl = this.form.get('cve');
    const descripcionControl = this.form.get('descripcion');

    const cve = cveControl?.value;
    const descripcion = descripcionControl?.value;

    // 🔥 Limpiar mensajes previos
    this.messageService.clear();

    // 1️⃣ Validar clave primero
    if (!cve || cve.trim().length !== 4) {

      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'La clave debe contener exactamente 4 caracteres.'
      });

      setTimeout(() => {
        const input = document.querySelector(
          'input[formControlName="cve"]'
        ) as HTMLElement;
        input?.focus();
      });

      return false; // ⛔ detener aquí
    }

    // 2️⃣ Validar descripción después
    if (!descripcion || !descripcion.trim()) {

      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Debe capturar la descripción.'
      });

      setTimeout(() => {
        const input = document.querySelector(
          'input[formControlName="descripcion"]'
        ) as HTMLElement;
        input?.focus();
      });

      return false; // ⛔ detener aquí
    }

    return true; // ✅ todo correcto
  }

  // ================================
  // CONSTRUIR PAYLOAD DINÁMICO
  // ================================
  private construirPayload(): any {

    const config = this.catalogoConfig[this.selectedTipo];

    return {
      [config.idField]: 0,
      [config.claveField]: this.form.value.cve,
      descripcion: this.form.value.descripcion,
      instancia: config.usaInstancia
        ? this.selectedInstancia
        : null,
      activo: true
    };
  }

  // ================================
  // OBTENER ID DINÁMICO
  // ================================
  getId(item: any): number {
    return item.idCveJuzgado
      || item.idCveSalas
      || item.idElemencat
      || item.idCatCveAnexos;
  }

  // ================================
  // CAMBIO FILTROS
  // ================================
  onFiltroChange() {
    this.ajustarInstanciaSegunTipo();
    this.nuevo();
    this.cargarDatos();
  }

  // ================================
  // CAMBIO DE TIPO DE CATÁLOGO
  // ================================
  onTipoChange() {

    if (this.selectedTipo === 'Anexos') {
      this.selectedInstancia = null as any;
    } else {
      this.selectedInstancia = 'P'; // siempre reiniciar a primera
    }

    this.nuevo();
    this.actualizarValidadorDescripcion();
    this.cargarDatos();
  }

  // ================================
  // CAMBIO DE INSTANCIA
  // ================================
  onInstanciaChange() {
    this.nuevo();
    this.cargarDatos();
  }

  // ================================
  // AJUSTAR INSTANCIAS DISPONIBLES
  // ================================
  private ajustarInstanciaSegunTipo() {

    // Para todos mostramos ambas instancias
    this.instanciasDisponibles = [
      { label: 'Primera Instancia', value: 'P' },
      { label: 'Segunda Instancia', value: 'S' }
    ];

    // Valor por defecto
    if (!this.selectedInstancia) {
      this.selectedInstancia = 'P';
    }
  }

  // ================================
  // OBTENER LONGITUD MÁXIMA DESCRIPCIÓN
  // ================================
  getMaxDescripcion(): number {

    switch (this.selectedTipo) {

      case 'Juzgados':
        return 70;

      case 'Tramites':
        return 65;

      case 'Salas':
        return 50;

      case 'Anexos':
        return 200;

      default:
        return 100;
    }
  }

  // ================================
  // ACTUALIZAR VALIDADORES DE DESCRIPCIÓN
  // ================================
  private actualizarValidadorDescripcion() {

    const max = this.getMaxDescripcion();

    this.form.get('descripcion')?.setValidators([
      Validators.required,
      Validators.maxLength(max)
    ]);

    this.form.get('descripcion')?.updateValueAndValidity();
  }

  // ================================
  // CONFIRMAR GUARDADO
  // ================================
  confirmarGuardar() {

    // Primero validar antes de preguntar confirmación
    if (!this.validarAntesDeConfirmar()) {
      return;
    }

    // SOLO SI TODO ESTÁ BIEN
    this.confirmationService.confirm({
      key: 'guardarCatalogo',
      accept: () => this.onGuardarOActualizar()
    });
  }

  // ================================
  // CONFIRMAR ELIMINACIÓN
  // ================================
  confirmarBorrar() {

    if (!this.selectedItem) return;

    this.confirmationService.confirm({
      key: 'eliminarCatalogo',
      accept: () => this.borrar()
    });
  }

  // ================================
  // DECIDIR ENTRE GUARDAR O ACTUALIZAR
  // ================================
  onGuardarOActualizar() {
    this.modoEdicion ? this.actualizar() : this.guardar();
  }

  // ================================
  // VALIDAR CLAVE (BLUR OPCIONAL)
  // ================================
  validarClave() {

    const control = this.form.get('cve');

    // Solo validar si el usuario escribió algo
    if (!control?.value) return;

    if (String(control.value).trim().length < 4) {

      this.messageService.clear();

      this.messageService.add({
        severity: 'warn',
        summary: 'Clave incompleta',
        detail: 'La clave debe contener exactamente 4 caracteres.'
      });
    }
  }

  // ================================
  // MOVER FOCO AL SIGUIENTE CAMPO (ENTER)
  // ================================
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

  // ================================
  // MOSTRAR U OCULTAR INSTANCIA
  // ================================
  get mostrarInstancia(): boolean {
    return this.selectedTipo !== 'Anexos';
  }

}




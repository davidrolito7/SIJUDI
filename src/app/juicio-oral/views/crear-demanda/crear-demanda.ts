import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AnexosDelcaradosRequest, CatMateria, CatMunicipios, CatSexos, CatTipoDocumento, CatTipoPartes, CatTipoVia, CatVia, CrearDemandaResponse, DatosUsuarioResponse, DocumentosRequest, PartesRequest } from '../../interfaces/juicioenlinea.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { JuicioService } from '../../services/juicioenlinea.service';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { PasswordModule } from 'primeng/password';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { driver } from 'driver.js';
import { CheckboxModule } from 'primeng/checkbox';
import { InputMaskModule } from 'primeng/inputmask';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { TreeSelectModule } from 'primeng/treeselect';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-crear-demanda',
  imports: [CommonModule, FormsModule, ToastModule, SelectModule, DialogModule, ButtonModule,
    InputTextModule, ConfirmDialogModule, ReactiveFormsModule, MultiSelectModule, TextareaModule, TreeSelectModule,
    InputNumberModule, ToggleSwitchModule, FileUploadModule, RadioButtonModule, TableModule,
    TagModule, Breadcrub, InputGroupModule, InputGroupAddonModule, Spinner, PasswordModule, ConfirmDialog, CheckboxModule, InputMaskModule, PdfDialog, DatePickerModule, TooltipModule],
  templateUrl: './crear-demanda.html',
  styleUrl: './crear-demanda.css',
  providers: [ConfirmationService, MessageService]
})
export class CrearDemanda implements OnInit {
  @ViewChild('documentoUpload') documentoUpload?: FileUpload;
  @ViewChild('demandaInput') demandaInput?: ElementRef<HTMLInputElement>;

  //* === DATOS DEL USUARIO Y CATÁLOGOS ===
  catMaterias: CatMateria[] = [];
  catAcciones: { id: number; desc: string }[] = [
    { id: 1, desc: 'Acción 1' },
    { id: 2, desc: 'Acción 2' },
    { id: 3, desc: 'Acción 3' },
    { id: 4, desc: 'Otro' }
  ];
  catJuzgado: { id: number; desc: string }[] = [
    { id: 1, desc: 'Juzgado Mixto de Zimatlan' },
    { id: 2, desc: 'Juzgado 1° Civil de Huajuapan' },
    { id: 3, desc: 'Juzgado 2º Civil de Tuxtepec' },
    { id: 4, desc: 'Juzgado Mixto de Ixtlán' },
    { id: 5, desc: 'Oficialia general del centro' },

  ];
  catTipoVias: CatTipoVia[] = [];
  catTipoDocumentos: CatTipoDocumento[] = [];
  catSexos: CatSexos[] = [];
  catTipoPartes: CatTipoPartes[] = [];
  catMunicipios: CatMunicipios[] = [];

  //* === FORMULARIOS ===
  formulario!: FormGroup;
  parteForm!: FormGroup;
  declaracionAnexoForm!: FormGroup;
  demandaForm!: FormGroup;
  firmaForm!: FormGroup;

  //* === LISTAS Y DATOS TEMPORALES ===
  listaPartes: PartesRequest[] = [];
  archivoAnexo: File | undefined;
  archivoDemanda: File | undefined;
  anexosDeclarados: AnexosDelcaradosRequest[] = [];
  demandaResponse: CrearDemandaResponse | null = null;
  //* === ESTADOS DE UI Y MODALES ===
  visible: boolean = false;
  visibleListAnexo: boolean = false;
  visibleDocumento: boolean = false;
  visibleResumenEnvio: boolean = false;
  isLoading: boolean = false;
  documentoUrl: SafeResourceUrl | null = null;
  nombre = '';
  //visibleFirma: boolean = false;

  //* === FLAGS Y VARIABLES DE CONTROL ===
  formEnviado: boolean = false;
  editandoParte: boolean = false;
  indiceParteEditando: number = -1;

  editandoAnexo: boolean = false;
  indiceAnexoEditando: number = -1;

  mostrarCampoValor: boolean = false;
  mostrarInputNombre: boolean = false;

  folio: string | null = null;
  firmaVerificada: boolean = false;
  showPassword = false;

  resumenGenerales: { label: string; value: string }[] = [];
  resumenPartes: { nombre: string; tipoPersona: string; tipoParte: string; grupoVulnerable: string; email: string }[] = [];
  resumenDemanda: { archivo: string; numeroHojas: string } = { archivo: 'N/A', numeroHojas: 'N/A' };
  resumenAnexos: { descripcion: string; cantidad: string }[] = [];

  catGruposVulnerables = [
    { id: 'NINGUNO', desc: 'Ninguno' },
    { id: 'DISCAPACIDAD', desc: 'Discapacidad' },
    { id: 'LENGUAJE', desc: 'Lenguaje Indígena' }
  ];

  catDiscapacidades = [
    { id: 1, desc: 'Física / Motriz' },
    { id: 2, desc: 'Visual' },
    { id: 3, desc: 'Auditiva' },
    { id: 4, desc: 'Intelectual' },
    { id: 5, desc: 'Psicosocial' },
    { id: 6, desc: 'Múltiple' }
  ];

  catLenguas = [
    { id: 1, desc: 'Zapoteco' },
    { id: 2, desc: 'Mixteco' },
    { id: 3, desc: 'Mazateco' },
    { id: 4, desc: 'Mixe' },
    { id: 5, desc: 'Chinanteco' },
    { id: 6, desc: 'Chatino' },
    { id: 7, desc: 'Triqui' },
    { id: 8, desc: 'Huave' },
    { id: 9, desc: 'Cuicateco' },
    { id: 10, desc: 'Zoque' },
    { id: 11, desc: 'Amuzgo' },
    { id: 12, desc: 'Chocholteco' },
    { id: 13, desc: 'Chontal de Oaxaca' },
    { id: 14, desc: 'Ixcateco' },
    { id: 15, desc: 'Tacuate' },
    { id: 16, desc: 'Náhuatl' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly confirmationService: ConfirmationService,
    private readonly sanitizer: DomSanitizer,
    private juicioService: JuicioService,
    private router: Router,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    //this.startTutorial();
  //this.cargarCatalogoMunicipios();
    this.cargarCatalogoMaterias();
    this.cargarCatTipoDocumento();
    this.cargarCatalogoSexos();
    this.cargarCatalogoTipoPartes();

    this.formulario = this.fb.group({
      cveMunicipio: [null, Validators.required],
      idCatMateria: [null, Validators.required],
      accionAEjecutar: [null],
      idCatTipoVia: [{ value: null, disabled: true }, Validators.required],
      descripcionDemanda: ['', [Validators.required, Validators.maxLength(250)]],
    });

    this.parteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      moral: [false],
      apellidoPaterno: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoMaterno: ['', [Validators.required, Validators.maxLength(100)]],
      apoderadoNombre: [{ value: '', disabled: true }],
      apoderadoApellidoPaterno: [{ value: '', disabled: true }],
      apoderadoApellidoMaterno: [{ value: '', disabled: true }],
      apoderadoIdCatSexo: [{ value: null, disabled: true }],
      direccion: ['', [Validators.required, Validators.maxLength(250)]],
      correo: ['', [Validators.email, Validators.maxLength(250)]],
      telefono: [''],
      esMenorEdad: [false],
      idCatSexo: [null, Validators.required],
      idCatTipoParte: [null, Validators.required],
      fechaNacimiento: [''],
      grupoVulnerable: [[], Validators.required],
      idDiscapacidad: [null],
      idLenguaje: [null]
    });

    this.declaracionAnexoForm = this.fb.group({
      idCatTipoDocumento: [null, Validators.required],
      //documento: ['', Validators.required],
      //firmaDigital: [false],
      descripcion: [''],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      fojas: [1, [Validators.required, Validators.min(1)]],
      esValor: [false],
      valor: [null],
      observaciones: ['', Validators.maxLength(250)]
    });

    this.demandaForm = this.fb.group({
      documentoDemanda: [null, Validators.required],
      numeroHojas: [null],
      demandaObservaciones: ['', Validators.maxLength(250)]
    });

    this.firmaForm = this.fb.group({
      password_Efirma: ['', [Validators.required, Validators.maxLength(50)]],
    });

    const alerta = history.state.alerta;
    if (alerta) {
      this.messageService.add(alerta);
    }

    this.formulario.get('idCatMateria')?.valueChanges.subscribe(val => {
      const viaCtrl = this.formulario.get('idCatTipoVia');
      if (!val) {
        viaCtrl?.disable({ emitEvent: false });
        viaCtrl?.setValue(null, { emitEvent: false });
        this.catTipoVias = [];
      } else {
        viaCtrl?.setValue(null, { emitEvent: false });
        viaCtrl?.disable({ emitEvent: false });
        this.catTipoVias = [];
        this.cargarCatalogoVias(val);
      }
    });

    this.declaracionAnexoForm.get('idCatTipoDocumento')?.valueChanges.subscribe((val) => {
      const selectedValue = Number(val);
      const ultimo = this.catTipoDocumentos?.[this.catTipoDocumentos.length - 1];
      const esOtro = !!ultimo && selectedValue === Number(ultimo.idCatTipoDocumento);

      this.mostrarInputNombre = esOtro;
      const descCtrl = this.declaracionAnexoForm.get('descripcion');

      if (esOtro) {
        descCtrl?.setValidators([Validators.required, Validators.maxLength(200)]);
        this.declaracionAnexoForm.patchValue({ descripcion: '' }, { emitEvent: false });
      } else {
        descCtrl?.clearValidators();
        const tipoSel = this.catTipoDocumentos.find(t => Number(t.idCatTipoDocumento) === selectedValue);
        this.declaracionAnexoForm.patchValue({ descripcion: tipoSel ? tipoSel.descripcion : '' }, { emitEvent: false });
      }
      descCtrl?.updateValueAndValidity({ emitEvent: false });
    });

    this.declaracionAnexoForm.get('esValor')?.valueChanges.subscribe((on: boolean) => {
      const valorCtrl = this.declaracionAnexoForm.get('valor');
      if (!valorCtrl) return;

      if (on) {
        valorCtrl.setValidators([Validators.required]);
      } else {
        valorCtrl.clearValidators();
        valorCtrl.reset(null, { emitEvent: false });
        valorCtrl.markAsPristine();
        valorCtrl.markAsUntouched();
      }
      valorCtrl.updateValueAndValidity({ emitEvent: false });
    });

    this.parteForm.get('moral')?.valueChanges.subscribe((isMoral: boolean) => {
      const paternoCtrl = this.parteForm.get('apellidoPaterno');
      const maternoCtrl = this.parteForm.get('apellidoMaterno');
      const generoCtrl = this.parteForm.get('idCatSexo');
      const fechaNacimientoCtrl = this.parteForm.get('fechaNacimiento');
      const esMenorEdadCtrl = this.parteForm.get('esMenorEdad');
      const grupoVulnerableCtrl = this.parteForm.get('grupoVulnerable');
      const discapacidadCtrl = this.parteForm.get('idDiscapacidad');
      const lenguajeCtrl = this.parteForm.get('idLenguaje');
      const apoderadoNombreCtrl = this.parteForm.get('apoderadoNombre');
      const apoderadoPaternoCtrl = this.parteForm.get('apoderadoApellidoPaterno');
      const apoderadoMaternoCtrl = this.parteForm.get('apoderadoApellidoMaterno');
      const apoderadoGeneroCtrl = this.parteForm.get('apoderadoIdCatSexo');

      if (isMoral) {
        paternoCtrl?.clearValidators();
        paternoCtrl?.setValue('', { emitEvent: false });
        paternoCtrl?.disable({ emitEvent: false });

        maternoCtrl?.clearValidators();
        maternoCtrl?.setValue('', { emitEvent: false });
        maternoCtrl?.disable({ emitEvent: false });

        generoCtrl?.clearValidators();
        generoCtrl?.setValue(3);
        generoCtrl?.disable({ emitEvent: false });

        fechaNacimientoCtrl?.setValue(null, { emitEvent: false });
        fechaNacimientoCtrl?.disable({ emitEvent: false });

        esMenorEdadCtrl?.setValue(false, { emitEvent: false });
        esMenorEdadCtrl?.disable({ emitEvent: false });

        grupoVulnerableCtrl?.clearValidators();
        grupoVulnerableCtrl?.setValue([], { emitEvent: false });
        grupoVulnerableCtrl?.disable({ emitEvent: false });

        discapacidadCtrl?.clearValidators();
        discapacidadCtrl?.setValue(null, { emitEvent: false });
        discapacidadCtrl?.disable({ emitEvent: false });

        lenguajeCtrl?.clearValidators();
        lenguajeCtrl?.setValue(null, { emitEvent: false });
        lenguajeCtrl?.disable({ emitEvent: false });

        apoderadoNombreCtrl?.setValidators([Validators.required, Validators.maxLength(100)]);
        apoderadoNombreCtrl?.enable({ emitEvent: false });

        apoderadoPaternoCtrl?.setValidators([Validators.required, Validators.maxLength(100)]);
        apoderadoPaternoCtrl?.enable({ emitEvent: false });

        apoderadoMaternoCtrl?.setValidators([Validators.required, Validators.maxLength(100)]);
        apoderadoMaternoCtrl?.enable({ emitEvent: false });

        apoderadoGeneroCtrl?.setValidators([Validators.required]);
        apoderadoGeneroCtrl?.enable({ emitEvent: false });
      } else {
        paternoCtrl?.setValidators([Validators.required, Validators.maxLength(100)]);
        paternoCtrl?.enable({ emitEvent: false });

        maternoCtrl?.setValidators([Validators.required, Validators.maxLength(100)]);
        maternoCtrl?.enable({ emitEvent: false });

        generoCtrl?.setValidators([Validators.required]);
        generoCtrl?.setValue(null, { emitEvent: false });
        generoCtrl?.enable({ emitEvent: false });

        fechaNacimientoCtrl?.enable({ emitEvent: false });
        esMenorEdadCtrl?.enable({ emitEvent: false });

        grupoVulnerableCtrl?.setValidators([Validators.required]);
        grupoVulnerableCtrl?.enable({ emitEvent: false });
        discapacidadCtrl?.enable({ emitEvent: false });
        lenguajeCtrl?.enable({ emitEvent: false });

        apoderadoNombreCtrl?.clearValidators();
        apoderadoNombreCtrl?.setValue('', { emitEvent: false });
        apoderadoNombreCtrl?.disable({ emitEvent: false });

        apoderadoPaternoCtrl?.clearValidators();
        apoderadoPaternoCtrl?.setValue('', { emitEvent: false });
        apoderadoPaternoCtrl?.disable({ emitEvent: false });

        apoderadoMaternoCtrl?.clearValidators();
        apoderadoMaternoCtrl?.setValue('', { emitEvent: false });
        apoderadoMaternoCtrl?.disable({ emitEvent: false });

        apoderadoGeneroCtrl?.clearValidators();
        apoderadoGeneroCtrl?.setValue(null, { emitEvent: false });
        apoderadoGeneroCtrl?.disable({ emitEvent: false });
      }

      paternoCtrl?.updateValueAndValidity();
      maternoCtrl?.updateValueAndValidity();
      generoCtrl?.updateValueAndValidity();
      fechaNacimientoCtrl?.updateValueAndValidity();
      esMenorEdadCtrl?.updateValueAndValidity();
      grupoVulnerableCtrl?.updateValueAndValidity();
      discapacidadCtrl?.updateValueAndValidity();
      lenguajeCtrl?.updateValueAndValidity();
      apoderadoNombreCtrl?.updateValueAndValidity();
      apoderadoPaternoCtrl?.updateValueAndValidity();
      apoderadoMaternoCtrl?.updateValueAndValidity();
      apoderadoGeneroCtrl?.updateValueAndValidity();
    });

    this.parteForm.get('grupoVulnerable')?.valueChanges.subscribe((vals: string[]) => {
      const discCtrl = this.parteForm.get('idDiscapacidad');
      const lengCtrl = this.parteForm.get('idLenguaje');

      const selected = vals || [];

      // Si selecciona NINGUNO y hay otros seleccionados, podríamos querer resetear a solo NINGUNO.
      // Pero si el array incluye NINGUNO y queremos que se limpie:
      if (selected.includes('NINGUNO')) {
        // Opción de limpiar los otros o simplemente ignorarlos.
        // Aquí asumimos que "NINGUNO" domina y desactiva los otros campos.
      }

      if (selected.includes('DISCAPACIDAD')) {
        discCtrl?.setValidators([Validators.required]);
      } else {
        discCtrl?.clearValidators();
        discCtrl?.setValue(null, { emitEvent: false });
      }

      if (selected.includes('LENGUAJE')) {
        lengCtrl?.setValidators([Validators.required]);
      } else {
        lengCtrl?.clearValidators();
        lengCtrl?.setValue(null, { emitEvent: false });
      }

      discCtrl?.updateValueAndValidity({ emitEvent: false });
      lengCtrl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: Event): void {
    if (this.formulario.dirty) {
      event.preventDefault();
      (event as BeforeUnloadEvent).returnValue = 'Si realizas esta acción, los cambios se perderán.';
    }
  }

  // =============================================
  // PARTES — solo modo manual
  // =============================================

  showDialog() {
    this.editandoParte = false;
    this.indiceParteEditando = -1;
    this.parteForm.reset({
      esMenorEdad: false,
      moral: false
    });
    this.formEnviado = false;
    this.visible = true;
  }

  agregarParte() {
    this.formEnviado = true;

    if (this.parteForm.invalid) {
      this.parteForm.markAllAsTouched();
      return;
    }
    console.log(this.parteForm.value);

    const valores = this.parteForm.getRawValue();

    const nuevaParte: PartesRequest = {
      nombre: (valores.nombre ?? '').toUpperCase(),
      moral: Boolean(valores.moral),
      apellidoPaterno: (valores.apellidoPaterno ?? '').toUpperCase(),
      apellidoMaterno: (valores.apellidoMaterno ?? '').toUpperCase(),
      apoderadoNombre: (valores.apoderadoNombre ?? '').toUpperCase(),
      apoderadoApellidoPaterno: (valores.apoderadoApellidoPaterno ?? '').toUpperCase(),
      apoderadoApellidoMaterno: (valores.apoderadoApellidoMaterno ?? '').toUpperCase(),
      apoderadoIdCatSexo: valores.apoderadoIdCatSexo ?? null,
      direccion: (valores.direccion ?? '').toUpperCase(),
      correo: (valores.correo ?? '').toUpperCase(),
      telefono: valores.telefono ?? '',
      esMenorEdad: Boolean(valores.esMenorEdad),
      idCatSexo: valores.idCatSexo,
      idCatTipoParte: valores.idCatTipoParte,
      fechaNacimiento: valores.fechaNacimiento ?? null,
      grupoVulnerable: valores.grupoVulnerable ?? [],
      idDiscapacidad: valores.idDiscapacidad ?? null,
      idLenguaje: valores.idLenguaje ?? null,
    };

    // Normaliza el nombre completo quitando espacios extra para comparar
    const normalizar = (s: string) => (s ?? '').replace(/\s+/g, ' ').trim().toUpperCase();
    const nombreCompleto = normalizar(
      `${nuevaParte.nombre} ${nuevaParte.apellidoPaterno} ${nuevaParte.apellidoMaterno}`
    );

    const duplicado = this.listaPartes.some((p: PartesRequest, idx: number) => {
      if (idx === this.indiceParteEditando) return false;
      const nombreExistente = normalizar(
        `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`
      );
      return nombreExistente === nombreCompleto;
    });

    if (duplicado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Parte duplicada',
        detail: 'Ya existe una parte con el mismo nombre completo.'
      });
      this.formEnviado = false;
      this.parteForm.markAsUntouched();
      return;
    }

    // Validar duplicado por correo
    if (
      nuevaParte.correo &&
      this.listaPartes.some((p: PartesRequest, idx: number) =>
        p.correo === nuevaParte.correo && idx !== this.indiceParteEditando
      )
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Correo duplicado',
        detail: 'Ya existe una parte con este correo electrónico.'
      });
      this.formEnviado = false;
      this.parteForm.markAsUntouched();
      return;
    }

    const tipoParteSeleccionada = this.catTipoPartes.find(
      (tipo) => tipo.idCatTipoParte === Number(nuevaParte.idCatTipoParte)
    );
    if (tipoParteSeleccionada) {
      nuevaParte.descripcionTipoParte = tipoParteSeleccionada.descripcion;
    }

    if (this.editandoParte) {
      this.listaPartes[this.indiceParteEditando] = { ...nuevaParte };
      this.editandoParte = false;
      this.indiceParteEditando = -1;
    } else {
      this.listaPartes.push({ ...nuevaParte });
    }

    this.visible = false;
    this.parteForm.reset({ esMenorEdad: false, moral: false });
    this.formEnviado = false;
  }

  editarParte(index: number) {
    this.editandoParte = true;
    this.indiceParteEditando = index;

    const parte = this.listaPartes[index];
    this.parteForm.reset({ esMenorEdad: false, moral: false });
    this.parteForm.patchValue(parte);
    this.formEnviado = false;
    this.visible = true;
  }

  eliminarParte(index: number) {
    this.listaPartes.splice(index, 1);
  }

  getGrupoVulnerableDescripcion(grupos?: string[]): string {
    if (!grupos?.length) return 'NINGUNO';

    return grupos
      .map(grupo => this.catGruposVulnerables.find(item => item.id === grupo)?.desc ?? grupo)
      .join(', ');
  }

  getDiscapacidadDescripcion(id?: number | null): string {
    return this.catDiscapacidades.find(item => item.id === Number(id))?.desc ?? '';
  }

  getLenguajeDescripcion(id?: number | null): string {
    return this.catLenguas.find(item => item.id === Number(id))?.desc ?? '';
  }

  getFechaNacimiento(fecha?: Date | string | null): string {
    if (!fecha) return '';

    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return Number.isNaN(date.getTime()) ? String(fecha) : date.toLocaleDateString('es-MX');
  }

  resetParteForm() {
    this.parteForm.reset({ esMenorEdad: false, moral: false });
    this.editandoParte = false;
    this.indiceParteEditando = -1;
    this.formEnviado = false;
    this.visible = false;
  }

  confirm1(event: Event, index: number) {
    this.confirmationService.confirm({
      key: 'parte',
      target: event.target as EventTarget,
      accept: () => this.eliminarParte(index),
      reject: () => { }
    });
  }

  // =============================================
  // ANEXOS / DOCUMENTOS
  // =============================================

  showModalListAnexo() {
    this.editandoAnexo = false;
    this.indiceAnexoEditando = -1;
    this.resetDeclaracionAnexoForm();
    this.visibleListAnexo = true;
  }

  agregarListAnexo() {
    if (this.declaracionAnexoForm.invalid) {
      this.declaracionAnexoForm.markAllAsTouched();
      return;
    }

    if (!this.archivoAnexo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se han cargado anexos.'
      });
      return;
    }
    const raw = this.declaracionAnexoForm.getRawValue();

    const idTipoDocumento = Number(raw.idCatTipoDocumento);
    const cantidadNueva = Number(raw.cantidad ?? 0);
    const valorNuevo = raw.valor != null && raw.valor !== '' ? Number(raw.valor) : undefined;

    const tipoSeleccionado = this.catTipoDocumentos.find(
      tipo => Number(tipo.idCatTipoDocumento) === idTipoDocumento
    );
    const descripcionAnexo = raw.descripcion || tipoSeleccionado?.descripcion || '';

    const nuevoAnexo: AnexosDelcaradosRequest = {
      idCatTipoDocumento: idTipoDocumento,
      descripcion: descripcionAnexo,
      cantidad: cantidadNueva,
      fojas: Number(raw.fojas ?? 0),
      valor: valorNuevo,
      archivo: this.archivoAnexo,
      // firmaDigital: raw.firmaDigital,
      esValor: raw.esValor,
      observaciones: raw.observaciones
    };

    if (this.editandoAnexo) {
      this.anexosDeclarados[this.indiceAnexoEditando] = nuevoAnexo;
      this.editandoAnexo = false;
      this.indiceAnexoEditando = -1;
    } else {
      this.anexosDeclarados.push(nuevoAnexo);
    }
    console.log(this.anexosDeclarados);

    this.resetDeclaracionAnexoForm();
  }

  editarAnexo(index: number) {
    this.editandoAnexo = true;
    this.indiceAnexoEditando = index;
    const anexo = this.anexosDeclarados[index];

    this.declaracionAnexoForm.patchValue({
      idCatTipoDocumento: anexo.idCatTipoDocumento,
      descripcion: anexo.descripcion,
      // firmaDigital: anexo.firmaDigital,
      cantidad: anexo.cantidad,
      fojas: anexo.fojas,
      valor: anexo.valor,
      esValor: anexo.esValor,
      observaciones: anexo.observaciones
    });
    this.archivoAnexo = anexo.archivo;
    this.visibleListAnexo = true;
  }

  resetDeclaracionAnexoForm() {
    this.declaracionAnexoForm.reset({
      idCatTipoDocumento: null,
      // firmaDigital: false,
      descripcion: '',
      cantidad: 1,
      fojas: null,
      esValor: false,
      valor: null
    });
    
    this.archivoAnexo = undefined;
    this.limpiarUploaderAnexo();
    this.visibleListAnexo = false;
  }

  eliminarAnexoDeclarado(index: number) {
    this.anexosDeclarados.splice(index, 1);
  }

  onAnexoSelect(event: any) {
    this.archivoAnexo = event.files?.[0];
  }

  onDemandaSelect(event: any) {
    const selectedFile = event?.files?.[0] ?? event?.target?.files?.[0] ?? null;
    this.archivoDemanda = selectedFile ?? undefined;
    this.demandaForm.patchValue({ documentoDemanda: this.archivoDemanda ?? null });
    this.demandaForm.get('documentoDemanda')?.markAsTouched();
  }

  private limpiarUploaderAnexo() {
    this.documentoUpload?.clear();
  }

  private limpiarUploaderDemanda() {
    if (this.demandaInput?.nativeElement) {
      this.demandaInput.nativeElement.value = '';
    }
  }


  verDocumento(archivo: File): void {
    if (archivo instanceof File) {
      const url = URL.createObjectURL(archivo);
      this.nombre = archivo.name;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.visibleDocumento = true;
    } else {
      console.error('Documento inválido');
    }
  }

  confirm3(event: Event, index: number) {
    this.confirmationService.confirm({
      key: 'declarado',
      target: event.target as EventTarget,
      accept: () => this.eliminarAnexoDeclarado(index),
      reject: () => { }
    });
  }

  // =============================================
  // FIRMA FIEL
  // =============================================

  // // get requiereFirma(): boolean {
  // //   return this.anexosDeclarados.some(a => a.firmaDigital === 1);
  // // }

  autorizarFirel(event: Event) {
    this.confirmationService.confirm({
      key: 'firma',
      target: event.target as EventTarget,
      accept: () => this.onVerificarFirma(),
      reject: () => { }
    });
  }

  onVerificarFirma() {
    if (this.firmaForm.invalid) {
      this.firmaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const values = this.firmaForm.value;

    this.juicioService.verificarFirma({ password_Efirma: values.password_Efirma }).subscribe({
      next: (response) => {
        this.isLoading = false;
        ////this.visibleFirma = false;
        if (response && response.success) {
          this.firmaVerificada = true;
          this.messageService.add({ severity: 'success', summary: 'Firma verificada', detail: 'La firma digital es válida.' });
        } else {
          this.messageService.add({ severity: 'info', summary: 'Lo sentimos', detail: response?.message });
          this.resetFirmaForm();
        }
      },
      error: () => {
        this.isLoading = false;
        // this.visibleFirma = false;
        this.resetFirmaForm();
      }
    });
  }

  resetFirmaForm() {
    this.firmaForm.reset();
    ////this.visibleFirma = false;
    this.firmaVerificada = false;
  }

  // =============================================
  // ENVÍO
  // =============================================

  /**
   * Botón principal:
   *  - Si hay documentos con firma y aún no se verificó → muestra modal de firma
   *  - Si no hay documentos con firma (o ya se verificó) → confirma y envía
   */
  enviarDemanda(_event: Event) {
    if (!this.canEnviar()) return;
    this.construirResumenEnvio();
    this.visibleResumenEnvio = true;
  }

  cancelarResumenEnvio() {
    this.visibleResumenEnvio = false;
  }

  confirmarResumenEnvio() {
    this.visibleResumenEnvio = false;
    this.demandaResponse = {
      idDemanda: 1,
      folio: '0001',
      expediente: {
        NumExpediente: '0023/2026',
        juzgado: {
          Descripcion: 'JUZGADO DEMO DE MUESTRA'
        }
      },
      fechaHoraRecepcion: new Date().toISOString(),
    } as unknown as CrearDemandaResponse;

    this.folio = this.demandaResponse.folio ?? '0001';
    this.confirmationService.confirm({
      key: 'success',
      accept: () => { },
      reject: () => { }
    });
  }

  private construirResumenEnvio() {
    const values = this.formulario.getRawValue();

    const juzgado = this.catJuzgado.find(j => Number(j.id) === Number(values.cveMunicipio))?.desc ?? 'N/A';
    const materia = this.catMaterias.find(m => Number(m.IdCatMateria) === Number(values.idCatMateria))?.Descripcion ?? 'N/A';
    const via = this.catTipoVias.find(v => Number(v.idCatTipoVia) === Number(values.idCatTipoVia))?.descripcion ?? 'N/A';
    const accion = this.catAcciones.find(a => Number(a.id) === Number(values.accionAEjecutar))?.desc ?? 'N/A';

    this.resumenGenerales = [
      { label: 'Juzgado', value: juzgado },
      { label: 'Materia', value: materia },
      { label: 'Vía', value: via },
      { label: 'Acción a ejecutar', value: accion },
      { label: 'Observaciones', value: values.descripcionDemanda || 'N/A' }
    ];

    this.resumenPartes = (this.listaPartes ?? []).map(parte => ({
      nombre: `${parte.nombre ?? ''} ${parte.apellidoPaterno ?? ''} ${parte.apellidoMaterno ?? ''}`.replace(/\s+/g, ' ').trim() || 'N/A',
      tipoPersona: parte.moral ? 'MORAL' : 'FISICA',
      tipoParte: parte.descripcionTipoParte || 'N/A',
      grupoVulnerable: this.getGrupoVulnerableDescripcion(parte.grupoVulnerable),
      email: parte.correo || 'N/A'
    }));

    this.resumenDemanda = {
      archivo: this.archivoDemanda?.name || 'N/A',
      numeroHojas: String(this.demandaForm.get('numeroHojas')?.value ?? 'N/A')
    };

    this.resumenAnexos = (this.anexosDeclarados ?? []).map(a => ({
      descripcion: a.descripcion || 'N/A',
      cantidad: String(a.cantidad ?? 'N/A'),
     // firma: Number(a.firmaDigital) === 1 ? 'SI' : 'NO'
    }));
  }
  enviarFormulario() {
    this.isLoading = true;
    const formValue = this.formulario.getRawValue();
    const formData = new FormData();

    Object.entries(formValue).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });

    // 1. Agregar campos Simples
    if (this.firmaVerificada) {
      formData.append('password_Efirma', this.firmaForm.value.password_Efirma ?? '');
    }

    if (this.archivoDemanda) {
      formData.append('documentoDemanda', this.archivoDemanda, this.archivoDemanda.name);
    }


    // 2. Mapear y agregar Partes (Limpio y fuertemente tipado)
    this.listaPartes.forEach((parte, index) => {
      // Definimos qué campos vacíos vamos a ignorar
      const opcionales = ['apellidoPaterno', 'apellidoMaterno', 'apoderadoNombre', 'apoderadoApellidoPaterno', 'apoderadoApellidoMaterno', 'apoderadoIdCatSexo'];

      Object.entries(parte).forEach(([key, value]) => {
        // Ignorar propiedades exclusivas de UI y valores nulos/vacíos en opcionales
        if (key === 'descripcionTipoParte') return;
        if (opcionales.includes(key) && (!value || value.toString().trim() === '')) return;

        formData.append(`partes[${index}][${key}]`, String(value));
      });
    });

    // 4. Mapear y agregar Anexos Declarados
    this.anexosDeclarados.forEach((anexo, index) => {
      Object.entries(anexo).forEach(([key, value]) => {
        if (key === 'descripcion') return; // Evitamos mandar la descripción
        formData.append(`anexosDeclarados[${index}][${key}]`, String(value ?? ''));
      });
    });

    // 5. Enviar Petición
    this.juicioService.crearDemanda(formData).subscribe({
      next: (respuesta) => {
        this.isLoading = false;
        if (respuesta?.success) {
          this.folio = respuesta.data.folio;
          this.demandaResponse = respuesta.data;
          this.confirmationService.confirm({
            key: 'success',
            accept: () => this.detalle(respuesta.data.idDemanda),
            reject: () => this.limpiarTodo()
          });
        } else {
          this.messageService.add({ severity: 'info', summary: 'Lo sentimos', detail: respuesta?.message || 'No se pudo crear la demanda.' });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: error.error?.message || 'Ocurrió un error con el servidor.' });
      }
    });
  }

  /** Limpia todos los formularios y listas */
  limpiarTodo() {
    this.formulario.reset();
    this.parteForm.reset({ esMenorEdad: false, moral: false });
    this.demandaForm.reset();
    this.firmaForm.reset();
    this.declaracionAnexoForm.reset({ cantidad: 1 });
    this.archivoAnexo = undefined;
    this.archivoDemanda = undefined;
    this.limpiarUploaderAnexo();
    this.limpiarUploaderDemanda();
    this.listaPartes = [];
    this.anexosDeclarados = [];
    this.firmaVerificada = false;
    this.editandoParte = false;
    this.indiceParteEditando = -1;
    this.editandoAnexo = false;
    this.indiceAnexoEditando = -1;
    this.formEnviado = false;
    this.folio = null;
  }

  detalle(idDemanda: number) {
    this.router.navigate(['/juicioenlinea/demandas/detalle'], { state: { idDemanda } });
  }

  // =============================================
  // VALIDACIONES
  // =============================================

  private validarPartesYDocumentosListas(): boolean {
    const partes = this.listaPartes ?? [];
    const anexos = this.anexosDeclarados ?? [];

    if (partes.length < 1 || anexos.length < 1) return false;

    const actores = [1, 2, 3, 4, 5, 21, 22, 24, 25];
    const demandados = [7, 9, 10, 11, 14];

    const tieneActor = partes.some(p => actores.includes(Number(p.idCatTipoParte)));
    const tieneDemandado = partes.some(p => demandados.includes(Number(p.idCatTipoParte)));

    return tieneActor && tieneDemandado;
  }

  /** Habilita el botón de acción principal (enviar o firma) */
  canEnviar(): boolean {
    return this.formulario.valid && this.validarPartesYDocumentosListas() && this.demandaForm.valid;
  }

  getError(controlName: string, form: FormGroup = this.parteForm): string {
    const control = form.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('pattern')) return 'Formato inválido';
    if (control?.hasError('maxlength')) return 'Se excedió el número máximo de caracteres';
    return '';
  }

  shouldShowError(controlName: string, form: FormGroup = this.parteForm): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || this.formEnviado) : false;
  }

  // =============================================
  // CATÁLOGOS
  // =============================================

  cargarCatalogoMaterias() {
    this.juicioService.getCatalogoMaterias().subscribe({
      next: (materias) => { this.catMaterias = materias; },
      error: (error) => { console.error('Error al cargar materias:', error); }
    });
  }

  cargarCatalogoVias(idCatMateria: number | null) {
    const viaCtrl = this.formulario.get('idCatTipoVia');
    this.catTipoVias = [];
    viaCtrl?.setValue(null, { emitEvent: false });
    viaCtrl?.disable({ emitEvent: false });

    if (idCatMateria == null) return;

    this.juicioService.getCatalogoVias(idCatMateria).subscribe({
      next: (vias) => {
        this.catTipoVias = vias ?? [];
        viaCtrl?.enable({ emitEvent: false });
      },
      error: (error) => { console.error('Error al cargar vías:', error); }
    });
  }

  cargarCatalogoSexos() {
    this.juicioService.getCatalogoSexos().subscribe({
      next: (response) => { this.catSexos = response.data; },
      error: (error) => { console.error('Error al cargar sexos:', error); }
    });
  }

  cargarCatalogoTipoPartes() {
    this.juicioService.getCatalogoTipoPartes().subscribe({
      next: (response) => { this.catTipoPartes = response; },
      error: (error) => { console.error('Error al cargar tipo partes:', error); }
    });
  }

  cargarCatalogoMunicipios() {
    this.juicioService.getCatalogoMunicipios().subscribe({
      next: (response) => { this.catMunicipios = response; },
      error: (error) => { console.error('Error al cargar municipios:', error); }
    });
  }

  cargarCatTipoDocumento() {
    this.juicioService.getCatTipoDocumento().subscribe({
      next: (tipoDocumento) => { this.catTipoDocumentos = tipoDocumento; },
      error: (error) => { console.error('Error al cargar tipo documentos:', error); }
    });
  }


  startTutorial() {
    const driverObj = driver({
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Finalizar',
      showProgress: true,
      showButtons: ['next', 'previous'],
      steps: [
        { element: '#cveMunicipio', popover: { title: 'Selecciona un municipio', description: 'Haz clic aquí y elige el municipio donde quieras llevar a cabo tu proceso.', side: "left", align: 'start' } },
        { element: '#idCatMateria', popover: { title: 'Selecciona la materia del caso', description: 'Haz clic aquí y elige la materia a la que pertenece tu demanda.', side: "left", align: 'start' } },
        { element: '#idCatTipoVia', popover: { title: 'Elige la vía correspondiente', description: 'Después de seleccionar la materia, selecciona la vía que aplique a tu demanda.', side: "bottom", align: 'start' } },
        { element: '#descripcionDemanda', popover: { title: 'Describe brevemente tu demanda', description: 'Escribe un resumen corto que explique el motivo o el contexto de la demanda.', side: "bottom", align: 'start' } },
        { element: '#agregarParte', popover: { title: 'Agrega una parte al expediente', description: 'Presiona este botón para añadir una persona u organización relacionada con la demanda .', side: "left", align: 'start' } },
        //{ element: '#listadoPartes', popover: { title: 'Listado de partes agregadas', description: 'Aquí verás todas las partes que hayas agregado. Puedes editarlas o eliminarlas si es necesario', side: "left", align: 'start' } },
        { element: '#declaraAnexos', popover: { title: 'Agrega tus anexos', description: 'Presiona este botón para añadir la lista de anexos a declarar .', side: "left", align: 'start' } },
        { element: '#agregarArchivos', popover: { title: 'Agrega tus archivos', description: 'Presiona este botón para añadir la lista de archivos previamente declarados.', side: "left", align: 'start' } },

      ]
    });

    driverObj.drive();
  }
}

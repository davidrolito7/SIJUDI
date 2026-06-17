import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AnexosDelcaradosRequest, CatMateria, CatMunicipios, CatSexos, CatTipoDocumento, CatTipoPartes, CatTipoVia, CrearDemandaResponse, PartesRequest } from '../../interfaces/juicioenlinea.model';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
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
import { Header } from "../../../shared/components/header/header";
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
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";

@Component({
  selector: 'app-crear-demanda',
  imports: [CommonModule, FormsModule, ToastModule, SelectModule, DialogModule, ButtonModule,
    InputTextModule, ConfirmDialogModule, ReactiveFormsModule, MultiSelectModule, TextareaModule, TreeSelectModule,
    InputNumberModule, ToggleSwitchModule, FileUploadModule, RadioButtonModule, TableModule,
    TagModule, Header, Breadcrub, InputGroupModule, InputGroupAddonModule, Spinner, PasswordModule, ConfirmDialog, CheckboxModule, InputMaskModule, PdfDialog, DatePickerModule, TooltipModule],
  templateUrl: './crear-demanda.html',
  styleUrl: './crear-demanda.css',
  providers: [ConfirmationService, MessageService]
})
export class CrearDemanda implements OnInit {
  @ViewChild('documentoUpload') documentoUpload?: FileUpload;
  @ViewChild('demandaInput') demandaInput?: ElementRef<HTMLInputElement>;

  //* === DATOS DEL USUARIO Y CATÁLOGOS ===
  catMaterias: CatMateria[] = [];
  catAcciones: { idAccion: number; desc: string }[] = [
    { idAccion: 1, desc: 'Acción 1' },
    { idAccion: 2, desc: 'Acción 2' },
    { idAccion: 3, desc: 'Acción 3' },
    { idAccion: 4, desc: 'Otro' }
  ];
  catJuzgado: { idArea: number; desc: string }[] = [
    { idArea: 80, desc: 'JUZGADO PRIMERO CIVIL DEL DISTRITO JUDICIAL DEL CENTRO' },
    { idArea: 66, desc: 'JUZGADO FAMILIAR Y CIVIL DE SANTA CRUZ HUATULCO, ESPECIALIZADO EN ORALIDAD MERCANTIL Y LABORAL DEL CIRCUITO JUDICIAL DE LA COSTA' },
    { idArea: 3, desc: 'Juzgado 2º Civil de Tuxtepec' },
    { idArea: 4, desc: 'Juzgado Mixto de Ixtlán' },
    { idArea: 5, desc: 'Oficialia general del centro' },

  ];
  catTipoVias: CatTipoVia[] = [];
  catTipoDocumentos: CatTipoDocumento[] = [];
  catSexos: CatSexos[] = [];
  catTipoPartes: CatTipoPartes[] = [];
  catMunicipios: CatMunicipios[] = [];

  private readonly tiposParteActor = [1, 2, 3, 4, 5, 21, 22, 24, 25];
  private readonly tiposParteDemandado = [7, 9, 10, 11, 14];
  private readonly sexoMoral = 3;
  private readonly grupoVulnerableDiscapacidad = 2;
  private readonly grupoVulnerableLenguaje = 3;

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

  mostrarInputNombre: boolean = false;

  folio: string | null = null;
  firmaVerificada: boolean = false;
  showPassword = false;

  demandaPreviewUrl: SafeResourceUrl | null = null;
  private demandaPreviewObjectUrl: string | null = null;
  isDemandaDragOver = false;
  resumenGenerales: { label: string; value: string }[] = [];
  resumenPartes: { nombre: string; tipoPersona: string; tipoParte: string; grupoVulnerable: string; email: string }[] = [];
  resumenDemanda: { archivo: string; numeroHojas: string } = { archivo: 'N/A', numeroHojas: 'N/A' };
  resumenAnexos: { descripcion: string; cantidad: string }[] = [];

  catGruposVulnerables = [
    { id: 1, desc: 'Ninguno' },
    { id: 2, desc: 'Discapacidad' },
    { id: 3, desc: 'Lenguaje Indígena' }
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
    this.inicializarFormularios();
    this.cargarCatalogosIniciales();
    this.configurarSuscripcionesFormularios();
    this.aplicarAlertaInicial();
  }

  private inicializarFormularios(): void {
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
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      esMenorEdad: [false],
      idCatSexo: [null, Validators.required],
      idCatTipoParte: [null, Validators.required],
      fechaNacimiento: [''],
      grupoVulnerable: [[], Validators.required],
      idDiscapacidad: [[]],
      idLenguaje: [[]]
    });

    this.declaracionAnexoForm = this.fb.group({
      idCatTipoDocumento: [null, Validators.required],
      descripcion: [''],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      fojas: [1, [Validators.required, Validators.min(1)]],
      esValor: [false],
      valor: [null],
      observaciones: ['', Validators.maxLength(250)]
    });

    this.demandaForm = this.fb.group({
      documentoDemanda: [null, Validators.required],
      numeroHojas: [null, [Validators.required, Validators.min(1)]],
      demandaObservaciones: ['', Validators.maxLength(250)]
    });

    this.firmaForm = this.fb.group({
      password_Efirma: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  private aplicarAlertaInicial(): void {
    const alerta = history.state.alerta;
    if (alerta) {
      this.messageService.add(alerta);
    }
  }

  private cargarCatalogosIniciales(): void {
    this.cargarCatalogoMaterias();
    this.cargarCatTipoDocumento();
    this.cargarCatalogoSexos();
    this.cargarCatalogoTipoPartes();
  }

  private configurarSuscripcionesFormularios(): void {
    this.configurarSuscripcionMateria();
    this.configurarSuscripcionTipoDocumento();
    this.configurarSuscripcionValorAnexo();
    this.configurarSuscripcionParteMoral();
    this.configurarSuscripcionGrupoVulnerable();
  }

  private configurarSuscripcionMateria(): void {
    this.formulario.get('idCatMateria')?.valueChanges.subscribe(val => {
      const viaCtrl = this.formulario.get('idCatTipoVia');
      if (!val) {
        viaCtrl?.disable({ emitEvent: false });
        viaCtrl?.setValue(null, { emitEvent: false });
        this.catTipoVias = [];
        return;
      }

      viaCtrl?.setValue(null, { emitEvent: false });
      viaCtrl?.disable({ emitEvent: false });
      this.catTipoVias = [];
      this.cargarCatalogoVias(val);
    });
  }

  private configurarSuscripcionTipoDocumento(): void {
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
  }

  private configurarSuscripcionValorAnexo(): void {
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
  }

  private configurarSuscripcionParteMoral(): void {
    this.parteForm.get('moral')?.valueChanges.subscribe((isMoral: boolean) => {
      if (isMoral) {
        this.aplicarConfiguracionParteMoral();
      } else {
        this.aplicarConfiguracionParteFisica();
      }
    });
  }

  private configurarSuscripcionGrupoVulnerable(): void {
    this.parteForm.get('grupoVulnerable')?.valueChanges.subscribe((vals: number[]) => {
      const discCtrl = this.parteForm.get('idDiscapacidad');
      const lengCtrl = this.parteForm.get('idLenguaje');
      const selected = vals || [];

      if (selected.includes(1) && selected.length > 1) {
        const valoresNormalizados = selected.filter(item => item !== 1);
        this.parteForm.get('grupoVulnerable')?.setValue(valoresNormalizados, { emitEvent: false });
        vals = valoresNormalizados;
      }

      const selectedValues = vals || [];

      if (selectedValues.includes(this.grupoVulnerableDiscapacidad)) {
        discCtrl?.setValidators([Validators.required, Validators.minLength(1)]);
      } else {
        discCtrl?.clearValidators();
        discCtrl?.setValue([], { emitEvent: false });
      }

      if (selectedValues.includes(this.grupoVulnerableLenguaje)) {
        lengCtrl?.setValidators([Validators.required, Validators.minLength(1)]);
      } else {
        lengCtrl?.clearValidators();
        lengCtrl?.setValue([], { emitEvent: false });
      }

      discCtrl?.updateValueAndValidity({ emitEvent: false });
      lengCtrl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private aplicarConfiguracionParteMoral(): void {
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

    paternoCtrl?.clearValidators();
    paternoCtrl?.setValue('', { emitEvent: false });
    paternoCtrl?.disable({ emitEvent: false });

    maternoCtrl?.clearValidators();
    maternoCtrl?.setValue('', { emitEvent: false });
    maternoCtrl?.disable({ emitEvent: false });

    generoCtrl?.clearValidators();
    generoCtrl?.setValue(this.sexoMoral);
    generoCtrl?.disable({ emitEvent: false });

    fechaNacimientoCtrl?.setValue(null, { emitEvent: false });
    fechaNacimientoCtrl?.disable({ emitEvent: false });

    esMenorEdadCtrl?.setValue(false, { emitEvent: false });
    esMenorEdadCtrl?.disable({ emitEvent: false });

    grupoVulnerableCtrl?.clearValidators();
    grupoVulnerableCtrl?.setValue([], { emitEvent: false });
    grupoVulnerableCtrl?.disable({ emitEvent: false });

    discapacidadCtrl?.clearValidators();
    discapacidadCtrl?.setValue([], { emitEvent: false });
    discapacidadCtrl?.disable({ emitEvent: false });

    lenguajeCtrl?.clearValidators();
    lenguajeCtrl?.setValue([], { emitEvent: false });
    lenguajeCtrl?.disable({ emitEvent: false });

    apoderadoNombreCtrl?.setValidators([Validators.required, Validators.maxLength(100)]);
    apoderadoNombreCtrl?.enable({ emitEvent: false });

    apoderadoPaternoCtrl?.setValidators([Validators.required, Validators.maxLength(100)]);
    apoderadoPaternoCtrl?.enable({ emitEvent: false });

    apoderadoMaternoCtrl?.setValidators([Validators.required, Validators.maxLength(100)]);
    apoderadoMaternoCtrl?.enable({ emitEvent: false });

    apoderadoGeneroCtrl?.setValidators([Validators.required]);
    apoderadoGeneroCtrl?.enable({ emitEvent: false });

    this.actualizarValidezParteMoral(
      paternoCtrl,
      maternoCtrl,
      generoCtrl,
      fechaNacimientoCtrl,
      esMenorEdadCtrl,
      grupoVulnerableCtrl,
      discapacidadCtrl,
      lenguajeCtrl,
      apoderadoNombreCtrl,
      apoderadoPaternoCtrl,
      apoderadoMaternoCtrl,
      apoderadoGeneroCtrl
    );
  }

  private aplicarConfiguracionParteFisica(): void {
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

    this.actualizarValidezParteMoral(
      paternoCtrl,
      maternoCtrl,
      generoCtrl,
      fechaNacimientoCtrl,
      esMenorEdadCtrl,
      grupoVulnerableCtrl,
      discapacidadCtrl,
      lenguajeCtrl,
      apoderadoNombreCtrl,
      apoderadoPaternoCtrl,
      apoderadoMaternoCtrl,
      apoderadoGeneroCtrl
    );
  }

  private actualizarValidezParteMoral(...controles: Array<AbstractControl | null>): void {
    controles.forEach(control => control?.updateValueAndValidity());
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
      telefono: (valores.telefono ?? '').trim() || undefined,
      esMenorEdad: Boolean(valores.esMenorEdad),
      idCatSexo: valores.idCatSexo != null ? Number(valores.idCatSexo) : null,
      idCatTipoParte: valores.idCatTipoParte != null ? Number(valores.idCatTipoParte) : null,
      fechaNacimiento: this.formatFechaNacimiento(valores.fechaNacimiento),
      grupoVulnerable: valores.grupoVulnerable ?? [],
      idDiscapacidad: this.normalizeNumberArray(valores.idDiscapacidad),
      idLenguaje: this.normalizeNumberArray(valores.idLenguaje),
    };

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

  getGrupoVulnerableDescripcion(grupos?: Array<string | number>): string {
    if (!grupos?.length) return 'NINGUNO';

    return grupos
      .map(grupo => this.getGrupoVulnerableLabel(grupo))
      .join(', ');
  }

  getDiscapacidadDescripcion(id?: number[] | number | null): string {
    const ids = this.normalizeNumberArray(Array.isArray(id) ? id : id != null ? [id] : []);
    return ids.map(valor => this.catDiscapacidades.find(item => item.id === valor)?.desc ?? '').filter(Boolean).join(', ');
  }

  getLenguajeDescripcion(id?: number[] | number | null): string {
    const ids = this.normalizeNumberArray(Array.isArray(id) ? id : id != null ? [id] : []);
    return ids.map(valor => this.catLenguas.find(item => item.id === valor)?.desc ?? '').filter(Boolean).join(', ');
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
    const archivo = event.files?.[0];
    if (!archivo) return;

    if (!this.isPdfValido(archivo, 'anexo')) {
      this.archivoAnexo = undefined;
      this.limpiarUploaderAnexo();
      return;
    }

    this.archivoAnexo = archivo;
  }

  onDemandaSelect(event: any) {
    const selectedFile = event?.files?.[0] ?? event?.target?.files?.[0] ?? null;
    if (selectedFile && !this.isPdfValido(selectedFile, 'demanda')) {
      this.quitarDemanda();
      return;
    }

    this.archivoDemanda = selectedFile ?? undefined;

    this.demandaForm.patchValue({
      documentoDemanda: this.archivoDemanda ?? null
    });

    this.demandaForm.get('documentoDemanda')?.markAsTouched();

    this.limpiarPreviewDemanda();

    if (this.archivoDemanda) {
      this.demandaPreviewObjectUrl = URL.createObjectURL(this.archivoDemanda);

      this.demandaPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.demandaPreviewObjectUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0`
      );
    }
  }

  private limpiarPreviewDemanda(): void {
    if (this.demandaPreviewObjectUrl) {
      URL.revokeObjectURL(this.demandaPreviewObjectUrl);
      this.demandaPreviewObjectUrl = null;
    }

    this.demandaPreviewUrl = null;
  }

  private limpiarUploaderAnexo() {
    this.documentoUpload?.clear();
  }

  private limpiarUploaderDemanda() {
    if (this.demandaInput?.nativeElement) {
      this.demandaInput.nativeElement.value = '';
    }
  }
  onDemandaDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDemandaDragOver = true;
  }

  onDemandaDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDemandaDragOver = false;
  }

  onDemandaDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDemandaDragOver = false;

    const file = event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    this.onDemandaSelect({
      target: {
        files: [file]
      }
    });
  }

  quitarDemanda(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.archivoDemanda = undefined;
    this.demandaPreviewUrl = null;

    this.demandaForm.patchValue({
      documentoDemanda: null
    });

    this.demandaForm.get('documentoDemanda')?.markAsTouched();
    this.demandaForm.get('documentoDemanda')?.updateValueAndValidity();

    this.limpiarUploaderDemanda();
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
    this.enviarFormulario();

    // this.confirmationService.confirm({
    //   key: 'success',
    //   accept: () => {
    //     this.visibleResumenEnvio = false;
    //   },
    //   reject: () => {
    //     this.visibleResumenEnvio = false;
    //   }
    // });
  }

  private construirResumenEnvio() {
    const values = this.formulario.getRawValue();

    const juzgado = this.catJuzgado.find(j => Number(j.idArea) === Number(values.cveMunicipio))?.desc ?? 'N/A';
    const materia = this.catMaterias.find(m => Number(m.IdCatMateria) === Number(values.idCatMateria))?.Descripcion ?? 'N/A';
    const via = this.catTipoVias.find(v => Number(v.idCatTipoVia) === Number(values.idCatTipoVia))?.descripcion ?? 'N/A';
    const accion = this.catAcciones.find(a => Number(a.idAccion) === Number(values.accionAEjecutar))?.desc ?? 'N/A';

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

    formData.append('idArea', String(formValue.cveMunicipio ?? ''));
    formData.append('idCatMateria', String(formValue.idCatMateria ?? ''));
    formData.append('idCatTipoVia', String(formValue.idCatTipoVia ?? ''));
    formData.append('descripcionDemanda', String(formValue.descripcionDemanda ?? ''));

    if (formValue.accionAEjecutar != null && formValue.accionAEjecutar !== '') {
      formData.append('idAccion', String(formValue.accionAEjecutar));
    }

    if (this.firmaVerificada) {
      formData.append('password_Efirma', this.firmaForm.value.password_Efirma ?? '');
    }

    if (this.archivoDemanda) {
      formData.append('documentoDemanda', this.archivoDemanda, this.archivoDemanda.name);
    }


    this.listaPartes.forEach((parte, index) => {
      this.appendNullableScalar(formData, `partes[${index}][nombre]`, parte.nombre);
      this.appendNullableScalar(formData, `partes[${index}][apellidoPaterno]`, parte.apellidoPaterno);
      this.appendNullableScalar(formData, `partes[${index}][apellidoMaterno]`, parte.apellidoMaterno);
      this.appendNullableScalar(formData, `partes[${index}][direccion]`, parte.direccion);
      this.appendNullableScalar(formData, `partes[${index}][correo]`, parte.correo);
      this.appendNullableScalar(formData, `partes[${index}][telefono]`, parte.telefono);
      this.appendBoolean(formData, `partes[${index}][esMenorEdad]`, parte.esMenorEdad);
      this.appendNullableScalar(formData, `partes[${index}][idCatSexo]`, parte.idCatSexo);
      this.appendNullableScalar(formData, `partes[${index}][idCatTipoParte]`, parte.idCatTipoParte);
      this.appendNullableScalar(formData, `partes[${index}][fechaNacimiento]`, parte.fechaNacimiento);
      this.appendBoolean(formData, `partes[${index}][moral]`, parte.moral ?? false);
      this.appendNullableScalar(formData, `partes[${index}][apoderadoNombre]`, parte.apoderadoNombre);
      this.appendNullableScalar(formData, `partes[${index}][apoderadoApellidoPaterno]`, parte.apoderadoApellidoPaterno);
      this.appendNullableScalar(formData, `partes[${index}][apoderadoApellidoMaterno]`, parte.apoderadoApellidoMaterno);
      this.appendNullableScalar(formData, `partes[${index}][apoderadoIdCatSexo]`, parte.apoderadoIdCatSexo);
      this.appendIntegerArray(formData, `partes[${index}][grupoVulnerable]`, this.mapGrupoVulnerableToApi(parte.grupoVulnerable));
      this.appendIntegerArray(formData, `partes[${index}][idDiscapacidad]`, parte.idDiscapacidad);
      this.appendIntegerArray(formData, `partes[${index}][idLenguaje]`, parte.idLenguaje);
    });

    this.anexosDeclarados.forEach((anexo, index) => {
      formData.append(`anexosDeclarados[${index}][idCatTipoDocumento]`, String(anexo.idCatTipoDocumento));
      formData.append(`anexosDeclarados[${index}][cantidad]`, String(anexo.cantidad));
      formData.append(`anexosDeclarados[${index}][fojas]`, String(anexo.fojas));
      this.appendBoolean(formData, `anexosDeclarados[${index}][esValor]`, anexo.esValor);
      this.appendNullableScalar(formData, `anexosDeclarados[${index}][valor]`, anexo.valor);
      this.appendNullableScalar(formData, `anexosDeclarados[${index}][observaciones]`, anexo.observaciones);
      formData.append(`anexosDeclarados[${index}][archivo]`, anexo.archivo, anexo.archivo.name);
    });

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

  validarPartesYDocumentosListas(): boolean {
    const partes = this.listaPartes ?? [];
    const anexos = this.anexosDeclarados ?? [];

    if (partes.length < 2 || anexos.length < 1) return false;

    const tieneActor = partes.some(p => this.tiposParteActor.includes(Number(p.idCatTipoParte)));
    const tieneDemandado = partes.some(p => this.tiposParteDemandado.includes(Number(p.idCatTipoParte)));

    return tieneActor && tieneDemandado;
  }

  tienePartesCompletas(): boolean {
    const partes = this.listaPartes ?? [];

    if (partes.length < 1) return false;

    const tieneActor = partes.some(p => this.tiposParteActor.includes(Number(p.idCatTipoParte)));
    const tieneDemandado = partes.some(p => this.tiposParteDemandado.includes(Number(p.idCatTipoParte)));

    return tieneActor && tieneDemandado;
  }

  isParteFormularioCompleto(): boolean {
    return this.parteForm?.valid ?? false;
  }

  isDatosGeneralesParteCompletos(): boolean {
    const moral = !!this.parteForm.get('moral')?.value;

    const controles = moral
      ? ['nombre', 'idCatTipoParte']
      : ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'idCatSexo', 'idCatTipoParte'];

    return controles.every(controlName => this.parteForm.get(controlName)?.valid ?? false);
  }

  isApoderadoCompleto(): boolean {
    if (!this.parteForm.get('moral')?.value) return false;

    return ['apoderadoNombre', 'apoderadoApellidoPaterno', 'apoderadoApellidoMaterno', 'apoderadoIdCatSexo']
      .every(controlName => this.parteForm.get(controlName)?.valid ?? false);
  }

  isCondicionesParticularesCompletas(): boolean {
    if (this.parteForm.get('moral')?.value) return false;

    const grupoVulnerable = this.parteForm.get('grupoVulnerable')?.valid ?? true;
    const fechaNacimiento = this.parteForm.get('fechaNacimiento')?.valid ?? false;
    const esMenorEdad = this.parteForm.get('esMenorEdad')?.valid ?? false;
    const requiereDiscapacidad = this.parteForm.get('grupoVulnerable')?.value?.includes(this.grupoVulnerableDiscapacidad);
    const requiereLenguaje = this.parteForm.get('grupoVulnerable')?.value?.includes(this.grupoVulnerableLenguaje);
    const discapacidad = !requiereDiscapacidad || (this.parteForm.get('idDiscapacidad')?.valid ?? false);
    const lenguaje = !requiereLenguaje || (this.parteForm.get('idLenguaje')?.valid ?? false);

    return grupoVulnerable && fechaNacimiento && esMenorEdad && discapacidad && lenguaje;
  }

  isContactoCompleto(): boolean {
    return (this.parteForm.get('correo')?.valid ?? false) && (this.parteForm.get('telefono')?.valid ?? false);
  }

  isDomicilioCompleto(): boolean {
    return this.parteForm.get('direccion')?.valid ?? false;
  }

  isDeclaracionAnexoCompleta(): boolean {
    return (this.declaracionAnexoForm?.valid ?? false) && !!this.archivoAnexo;
  }

  tieneAnexosDeclarados(): boolean {
    return (this.anexosDeclarados?.length ?? 0) > 0;
  }

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

  private normalizeNumberArray(value: unknown): number[] {
    if (!Array.isArray(value)) return [];

    return value
      .map(item => Number(item))
      .filter(item => !Number.isNaN(item));
  }

  private formatFechaNacimiento(value: unknown): string | null {
    if (!value) return null;

    const fecha = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(fecha.getTime())) return String(value);

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getGrupoVulnerableLabel(grupo: string | number): string {
    if (grupo === 'NINGUNO' || Number(grupo) === 1) return 'Ninguno';
    if (grupo === 'DISCAPACIDAD' || Number(grupo) === 2) return 'Discapacidad';
    if (grupo === 'LENGUAJE' || Number(grupo) === 3) return 'Lenguaje Indigena';
    return String(grupo);
  }

  private mapGrupoVulnerableToApi(grupos?: Array<string | number>): number[] {
    if (!grupos?.length) return [];

    return grupos
      .map(grupo => {
        if (grupo === 'NINGUNO') return 1;
        if (grupo === 'DISCAPACIDAD') return 2;
        if (grupo === 'LENGUAJE') return 3;
        return Number(grupo);
      })
      .filter(grupo => !Number.isNaN(grupo));
  }

  private appendNullableScalar(formData: FormData, key: string, value: unknown): void {
    if (value == null) return;

    const normalized = typeof value === 'string' ? value.trim() : value;
    if (normalized === '') return;

    formData.append(key, String(normalized));
  }

  private appendBoolean(formData: FormData, key: string, value: boolean): void {
    formData.append(key, value ? '1' : '0');
  }

  private appendIntegerArray(formData: FormData, key: string, values?: number[] | null): void {
    values?.forEach((value, index) => {
      formData.append(`${key}[${index}]`, String(value));
    });
  }

  private isPdfValido(file: File, tipoDocumento: 'demanda' | 'anexo'): boolean {
    const esPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const maxSizeBytes = 20 * 1024 * 1024;

    if (!esPdf) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Archivo invÃ¡lido',
        detail: `El archivo de ${tipoDocumento} debe estar en formato PDF.`
      });
      return false;
    }

    if (file.size > maxSizeBytes) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Archivo demasiado grande',
        detail: `El archivo de ${tipoDocumento} no debe exceder 20 MB.`
      });
      return false;
    }

    return true;
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
        { element: '#generales', popover: { title: 'Seleccione un valor por cada campo', description: 'Haz clic en cada campo para seleccionar un valor y escribir una observación si es necesario.', side: "left", align: 'start' } },
        { element: '#demanda', popover: { title: 'Cargue o suelte su demanda', description: 'Haz clic en el área delimitada de carga para seleccionar tu archivo de demanda.', side: "left", align: 'start' } },
        { element: '#partes', popover: { title: 'Listado de partes', description: 'Aquí verás todas las partes que hayas agregado. Puedes editarlas o eliminarlas si es necesario.', side: "top", align: 'start' } },
        { element: '#botonAgregarParte', popover: { title: 'Agrega una parte', description: 'Presiona este botón para añadir una persona física o moral relacionada con la demanda.', side: "left", align: 'start' } },
        { element: '#anexos', popover: { title: 'Agrega tus anexos', description: 'Presiona este botón para añadir la lista de anexos a declarar .', side: "top", align: 'start' } },
        { element: '#botonAgregarAnexos', popover: { title: 'Agrega tus archivos', description: 'Presiona este botón para añadir la lista de archivos previamente declarados.', side: "left", align: 'start' } },

      ]
    });

    driverObj.drive();
  }
}


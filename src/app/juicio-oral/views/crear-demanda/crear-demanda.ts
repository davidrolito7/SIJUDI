import { Component, HostListener, OnInit } from '@angular/core';
import { AnexosDelcaradosRequest, CatMateria, CatMunicipios, CatSexos, CatTipoDocumento, CatTipoPartes, CatTipoVia, CatVia, DatosUsuarioResponse, DocumentosRequest, PartesRequest } from '../../interfaces/juicioenlinea.model';
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
import { FileUploadModule } from 'primeng/fileupload';
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
@Component({
  selector: 'app-crear-demanda',
  imports: [CommonModule, FormsModule, ToastModule, SelectModule, DialogModule, ButtonModule,
    InputTextModule, ConfirmDialogModule, ReactiveFormsModule, MultiSelectModule, TextareaModule,
    InputNumberModule, ToggleSwitchModule, FileUploadModule, RadioButtonModule, TableModule,
    TagModule, Breadcrub, InputGroupModule, InputGroupAddonModule, Spinner, PasswordModule, ConfirmDialog],
  templateUrl: './crear-demanda.html',
  styleUrl: './crear-demanda.css',
  providers: [ConfirmationService, MessageService]
})
export class CrearDemanda implements OnInit {

  //* === DATOS DEL USUARIO Y CATÁLOGOS ===
  catMaterias: CatMateria[] = [];
  catTipoVias: CatTipoVia[] = [];
  catTipoDocumentos: CatTipoDocumento[] = [];
  catSexos: CatSexos[] = [];
  catTipoPartes: CatTipoPartes[] = [];
  catMunicipios: CatMunicipios[] = [];

  //* === FORMULARIOS ===
  formulario!: FormGroup;
  parteForm!: FormGroup;
  declaracionAnexoForm!: FormGroup;
  anexoForm!: FormGroup;
  firmaForm!: FormGroup;

  //* === LISTAS Y DATOS TEMPORALES ===
  listaPartes: PartesRequest[] = [];
  listaAnexos: DocumentosRequest[] = [];
  anexosDeclarados: AnexosDelcaradosRequest[] = [];

  //* === ESTADOS DE UI Y MODALES ===
  visible: boolean = false;
  visibleListAnexo: boolean = false;
  visibleAnexo: boolean = false;
  visibleDocumento: boolean = false;
  isLoading: boolean = false;
  documentoUrl: SafeResourceUrl | null = null;
  nombre = '';
  //visibleFirma: boolean = false;

  //* === FLAGS Y VARIABLES DE CONTROL ===
  formEnviado: boolean = false;
  editandoParte: boolean = false;
  indiceParteEditando: number = -1;

  mostrarCampoValor: boolean = false;
  mostrarInputNombre: boolean = false;

  folio: string | null = null;
  firmaVerificada: boolean = false;
  showPassword = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly confirmationService: ConfirmationService,
    private readonly sanitizer: DomSanitizer,
    private juicioService: JuicioService,
    private router: Router,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.startTutorial();
    this.cargarCatalogoMunicipios();
    this.cargarCatalogoMaterias();
    this.cargarCatTipoDocumento();
    this.cargarCatalogoSexos();
    this.cargarCatalogoTipoPartes();

    this.formulario = this.fb.group({
      cveMunicipio: [null, Validators.required],
      idCatMateria: [null, Validators.required],
      idCatTipoVia: [{ value: null, disabled: true }, Validators.required],
      descripcionDemanda: ['', [Validators.required, Validators.maxLength(250)]],
    });

    this.parteForm = this.fb.group({
     //// idUsr: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoPaterno: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoMaterno: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(250)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      correoAlterno: ['', [Validators.email, Validators.maxLength(250)]],
      esMenorEdad: [false],
      idCatSexo: [null, Validators.required],
      idCatTipoParte: [null, Validators.required],
      curp: ['', [Validators.required, Validators.maxLength(18), Validators.pattern(/^[A-Z0-9]{18}$/)]],
    }, { validators: this.correosDiferentesValidator.bind(this) });

    this.declaracionAnexoForm = this.fb.group({
      idCatTipoDocumento: [null, Validators.required],
      //descripcion: [''],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      esValor: [false],
      valor: [null]
    });

    this.anexoForm = this.fb.group({
      nombre: [''],
      documento: ['', Validators.required],
      firmaDigital: [0]
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
      esMenorEdad: false
     //// idUsr: ''
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
      ...valores,
     //// idUsr: valores.idUsr?.toString().trim() || null,
      nombre: (valores.nombre ?? '').toUpperCase(),
      apellidoPaterno: (valores.apellidoPaterno ?? '').toUpperCase(),
      apellidoMaterno: (valores.apellidoMaterno ?? '').toUpperCase(),
      direccion: (valores.direccion ?? '').toUpperCase(),
      correo: (valores.correo ?? '').toUpperCase(),
      correoAlterno: (valores.correoAlterno ?? '').toUpperCase(),
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
    this.parteForm.reset({ esMenorEdad: false });
    this.formEnviado = false;
  }

  editarParte(index: number) {
    this.editandoParte = true;
    this.indiceParteEditando = index;

    const parte = this.listaPartes[index];
    this.parteForm.reset({ esMenorEdad: false });
    this.parteForm.patchValue(parte);
    this.formEnviado = false;
    this.visible = true;
  }

  eliminarParte(index: number) {
    this.listaPartes.splice(index, 1);
  }

  resetParteForm() {
    this.parteForm.reset({ esMenorEdad: false });
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

  showModalAnexo() {
    this.visibleAnexo = true;
  }

  showModalListAnexo() {
    this.visibleListAnexo = true;
  }

  agregarListAnexo() {
    if (this.declaracionAnexoForm.invalid) {
      this.declaracionAnexoForm.markAllAsTouched();
      return;
    }

    const raw = this.declaracionAnexoForm.getRawValue();
    const id = Number(raw.idCatTipoDocumento);
    const cantidadNueva = Number(raw.cantidad ?? 0);
    const valorNuevo = raw.valor != null && raw.valor !== '' ? Number(raw.valor) : undefined;
    const descripcionNueva = (raw.descripcion ?? '').toString().trim();

    if (valorNuevo === undefined) {
      const idxExistente = this.anexosDeclarados.findIndex(a =>
        Number(a.idCatTipoDocumento) === id && (a.valor == null)
      );
      if (idxExistente !== -1) {
        this.anexosDeclarados[idxExistente] = {
          ...this.anexosDeclarados[idxExistente],
          cantidad: Number(this.anexosDeclarados[idxExistente].cantidad ?? 0) + cantidadNueva,
          descripcion: (this.anexosDeclarados[idxExistente].descripcion ?? '').toString().trim() || descripcionNueva
        };
        this.resetDeclaracionAnexoForm();
        return;
      }
    }

    this.anexosDeclarados.push({
      idCatTipoDocumento: id,
      descripcion: descripcionNueva,
      cantidad: cantidadNueva,
      valor: valorNuevo
    });

    this.resetDeclaracionAnexoForm();
  }

  onAnexosSelect(event: any): void {
    const files: File[] = event?.files ?? event?.currentFiles ?? [];
    if (!files.length) return;

    for (const file of files) {
      if (!(file instanceof File)) continue;
      const nuevoAnexo: DocumentosRequest = {
        nombre: file.name,
        documento: file,
        firmaDigital: 0,
        peso: file.size
      };
      this.listaAnexos.push(nuevoAnexo);
    }
    this.visibleAnexo = false;
  }

  onFirmaDigitalChange(index: number, checked: boolean): void {
    if (index < 0 || index >= this.listaAnexos.length) return;
    this.listaAnexos[index].firmaDigital = checked ? 1 : 0;
  }

  verDocumento(anexo: DocumentosRequest): void {
    if (anexo?.documento instanceof File) {
      const url = URL.createObjectURL(anexo.documento);
      this.nombre = anexo.nombre;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.visibleDocumento = true;
    } else {
      console.error('Documento inválido');
    }
  }

  resetAnexoForm() {
    this.anexoForm.reset();
    this.mostrarInputNombre = false;
    this.mostrarCampoValor = false;

    const valorCtrl = this.anexoForm.get('valor');
    valorCtrl?.clearValidators();
    valorCtrl?.updateValueAndValidity();

    this.visibleAnexo = false;

    const fileInput = document.getElementById('documento') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  resetDeclaracionAnexoForm() {
    this.declaracionAnexoForm.reset({ cantidad: 1 });
    this.visibleListAnexo = false;
  }

  eliminarAnexoDeclarado(index: number) {
    this.anexosDeclarados.splice(index, 1);
  }

  eliminarAnexo(index: number) {
    this.listaAnexos.splice(index, 1);
  }

  onToggleFirmaDigital(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.anexoForm.patchValue({ firmaDigital: checked ? 1 : 0 });
  }

  confirm2(event: Event, index: number) {
    this.confirmationService.confirm({
      key: 'anexo',
      target: event.target as EventTarget,
      message: '¿Está seguro de eliminar este documento?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.eliminarAnexo(index),
      reject: () => { }
    });
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

  /** Devuelve true si al menos un documento requiere firma digital */
  get requiereFirma(): boolean {
    return this.listaAnexos.some(a => a.firmaDigital === 1);
  }

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
  enviarDemanda(event: Event) {
    this.confirmationService.confirm({
      key: 'demanda',
      target: event.target as EventTarget,
      accept: () => this.enviarFormulario(),
      reject: () => this.limpiarTodo()
    });
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


    // 2. Mapear y agregar Partes (Limpio y fuertemente tipado)
    this.listaPartes.forEach((parte, index) => {
      // Definimos qué campos vacíos vamos a ignorar
      const opcionales = ['apellidoPaterno', 'apellidoMaterno'];

      Object.entries(parte).forEach(([key, value]) => {
        // Ignorar propiedades exclusivas de UI y valores nulos/vacíos en opcionales
        if (key === 'descripcionTipoParte') return;
        if (opcionales.includes(key) && (!value || value.toString().trim() === '')) return;

        formData.append(`partes[${index}][${key}]`, String(value));
      });
    });

    // 3. Mapear y agregar Documentos / Anexos
    this.listaAnexos.forEach((documento, index) => {
      Object.entries(documento).forEach(([key, value]) => {
        formData.append(`documentos[${index}][${key}]`, value as string | Blob);
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
    this.juicioService.crearInicio(formData).subscribe({
      next: (respuesta) => {
        this.isLoading = false;
        if (respuesta?.success) {
          this.folio = respuesta.data.folio;
          this.confirmationService.confirm({
            key: 'success',
            accept: () => this.detalle(respuesta.data.idDemanda),
            reject: () => this.limpiarTodo()
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Ocurrió un error con el servidor.' });
      }
    });
  }

  /** Limpia todos los formularios y listas */
  limpiarTodo() {
    this.formulario.reset();
    this.parteForm.reset({ esMenorEdad: false });
    this.firmaForm.reset();
    this.declaracionAnexoForm.reset({ cantidad: 1 });
    this.anexoForm.reset();
    this.listaPartes = [];
    this.listaAnexos = [];
    this.anexosDeclarados = [];
    this.firmaVerificada = false;
    this.editandoParte = false;
    this.indiceParteEditando = -1;
    this.formEnviado = false;
    this.folio = null;
  }

  detalle(idInicio: number) {
    this.router.navigate(['/juicioenlinea/demandas/detalle'], { state: { idInicio } });
  }

  // =============================================
  // VALIDACIONES
  // =============================================

  private validarPartesYDocumentosListas(): boolean {
    const partes = this.listaPartes ?? [];
    const documentos = this.listaAnexos ?? [];

    if (partes.length < 1 || documentos.length < 1) return false;

    const actores = [1, 2, 3, 4, 5, 21, 22, 24, 25];
    const demandados = [7, 9, 10, 11, 14];

    const tieneActor = partes.some(p => actores.includes(Number(p.idCatTipoParte)));
    const tieneDemandado = partes.some(p => demandados.includes(Number(p.idCatTipoParte)));

    return tieneActor && tieneDemandado;
  }

  /** Habilita el botón de acción principal (enviar o firma) */
  canEnviar(): boolean {
    return this.formulario.valid && this.validarPartesYDocumentosListas();
  }

  /**
   * Texto e ícono del botón principal según estado:
   *  - requiere firma y no verificada → "Autorizar Firma"
   *  - no requiere firma o ya verificada → "Enviar Demanda"
   */
  correosDiferentesValidator(form: FormGroup) {
    const correo = form.get('correo')?.value?.toLowerCase().trim();
    const correoAlterno = form.get('correoAlterno')?.value?.toLowerCase().trim();
    if (correo && correoAlterno && correo === correoAlterno) {
      return { correosIguales: true };
    }
    return null;
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
    return control ? control.invalid && (control.dirty || control.touched || this.formEnviado) : false;
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
        { element: '#idCatMunicipio', popover: { title: 'Selecciona un municipio', description: 'Haz clic aquí y elige el municipio donde quieras llevar a cabo tu proceso.', side: "left", align: 'start' } },
        { element: '#idCatMateria', popover: { title: 'Selecciona la materia del caso', description: 'Haz clic aquí y elige la materia a la que pertenece tu demanda.', side: "left", align: 'start' } },
        { element: '#idCatTipoVia', popover: { title: 'Elige la vía correspondiente', description: 'Después de seleccionar la materia, selecciona la vía que aplique a tu demanda.', side: "bottom", align: 'start' } },
        { element: '#descripcionDemanda', popover: { title: 'Describe brevemente tu demanda', description: 'Escribe un resumen corto que explique el motivo o el contexto de la demanda.', side: "bottom", align: 'start' } },
        { element: '#agregarParte', popover: { title: 'Agrega una parte al expediente', description: 'Presiona este botón para añadir una persona u organización relacionada con la demanda .', side: "left", align: 'start' } },
        { element: '#listadoPartes', popover: { title: 'Listado de partes agregadas', description: 'Aquí verás todas las partes que hayas agregado. Puedes editarlas o eliminarlas si es necesario', side: "left", align: 'start' } },
      ]
    });

    driverObj.drive();
  }
}
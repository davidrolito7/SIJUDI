import { Component, ElementRef, ViewChild, signal, computed, effect, CreateEffectOptions, inject, Signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { JsonPipe, NgClass, CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext'
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Dialog, DialogModule } from "primeng/dialog";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { ToastModule } from 'primeng/toast';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileUploadEvent, FileProgressEvent, FileRemoveEvent, FileUploadModule, FileUpload, FileSelectEvent } from 'primeng/fileupload';
import { CatalogoMateria, CatalogoEstadoDestino, CatalogoMunicipioDestino, CatalogoMateriasEstadoDestino, tipoVia, catTipoDiligencia, partesExhortoEnviado, ProvomenteExhortoEnviado, partesExhortoEnviadoRequest, generalesExhortoEnviado, ExhortoEnviadoGuardarGeneralesRequest, EnviadoConfirmacionDatosRecibidosResponse, EnviadoArchivoRecibidoConAcuseResponse, CatalogoGenero, CONATRIB_catTipoDocumento, ListadoCatalogoTipoDocumento, archivoExhortoEnviado, Firmantes, CatalogoTipoParte, archivoRespuesta, detalleExhortosEnviados, VerMovimientosEnviadosResponse } from '../../interfaces/exhortos.model';
import ValidateForm from '../../../helpers/validateform';
import { ExhortosService } from '../../services/exhorto.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog'
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { QrService } from '../../../shared/services/qr.service';
import { ModalComponent } from '../../../shared/components/modal-component/modal-component';
import { ModalService } from '../../../shared/services/modal.service';
import { QrGeneratorComponent } from '../../../shared/components/qr-generator-component/qr-generator-component';
import { AuthService } from '../../../core/auth/service/auth.service';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { Base64ToBlob, convertDate, downloadFile, validaPdf, convertFileToBase64, downloadBase64, base64ToFile } from '../../../shared/functions/utils';
import { TokenService } from '../../../core/auth/service/token.service';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { PdfDialog } from '../../../shared/components/pdf-dialog/pdf-dialog';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { validarFirmasUsuarioExEnviado } from '../../functions/firmas';
import { construirDatosEdicionExhorto } from '../../functions/edicion-exhorto-enviado';
import { Signature } from '@primeicons/angular/signature';
import { Paperclip } from '@primeicons/angular/paperclip';

interface FileUploadSelectEvent {
  files: File[];
}

@Component({
  selector: 'app-crear',
  imports: [FloatLabelModule, Signature, Paperclip, TableModule, CheckboxModule, SelectModule, ConfirmDialog, ModalComponent, CommonModule, FormsModule, ReactiveFormsModule, InputNumberModule, QrGeneratorComponent, InputTextModule, TextareaModule, ButtonModule, ToolbarModule, DialogModule, ConfirmDialogModule, InputMaskModule, ToastModule, MessageModule, FileUploadModule, PdfDialog, InputIconModule, IconFieldModule, Spinner],
  templateUrl: './crear-exhorto.html',
  styleUrl: './crear-exhorto.css',
  providers: [MessageService, ConfirmationService]
})
export class CrearExhortoComponent {
  constructor(
    private messageService: MessageService,
    private ExhortosService: ExhortosService,
    private readonly confirmationService: ConfirmationService,
    private tokenService: TokenService,
    //private exhortosService: ExhortosService,
    public modalService: ModalService,
    private qrService: QrService,
    private router: Router,
    public authService: AuthService,
    private sanitizer: DomSanitizer,
  ) {

    this.GetSeccionesUsuario();
  }
  exhortosForm = new FormGroup({
    materiaOrigen: new FormControl(null as CatalogoMateria | null, Validators.required),
    estadoDestino: new FormControl(null as CatalogoEstadoDestino | null, Validators.required),
    municipioDestino: new FormControl(null as CatalogoMunicipioDestino | null, Validators.required),
    materiaEstadoDestino: new FormControl(null as CatalogoMateriasEstadoDestino | null, Validators.required),
    noExpediente: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    OficioOrigen: new FormControl('', [Validators.maxLength(50)]),
    //Tipojuicio: new FormControl('',Validators.required),
    tipojuicio: new FormControl(null as tipoVia | null, Validators.required),
    nombreJuez: new FormControl('',[Validators.maxLength(100)]),
    //numeroFojas: new FormControl(null, Validators.required),
    numeroFojas: new FormControl<number | null>(null, [Validators.required,Validators.min(1),Validators.pattern(/^\d+$/)]),
//    DiasResponder: new FormControl(null, Validators.required),
    DiasResponder: new FormControl<number | null>(null, [Validators.required,Validators.min(1),Validators.pattern(/^\d+$/)]),
    TipoDiligencia: new FormControl(null as catTipoDiligencia | null, Validators.required),
    //observaciones: new FormControl('')
    observaciones: new FormControl<string>('', [Validators.maxLength(1000)])
  });

  partesForm = new FormGroup({
   // nombre: new FormControl('', Validators.required),
    nombre: new FormControl('', [Validators.required,Validators.maxLength(500)]),
    //paterno: new FormControl(''),
     paterno: new FormControl<string>('', [Validators.maxLength(50)]),
//    materno: new FormControl(''),
    materno: new FormControl<string>('', [Validators.maxLength(50)]),
    genero: new FormControl(''),
    moral: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
    //moral: new FormControl(false,[Validators.required]),
    //tipoParte: new FormControl('', Validators.required),
    tipoParte: new FormControl<number | null>(null, Validators.required),
    //correoElectronico: new FormControl(''),
    correoElectronico: new FormControl('', [Validators.email, Validators.maxLength(50)]),
    //telefono: new FormControl('')
    telefono: new FormControl('', [Validators.pattern(/^\d{10}$/)])
  });
  promoventesForm = new FormGroup({
    //nombrePromo: new FormControl('', Validators.required),
    nombrePromo: new FormControl('', [Validators.required,Validators.maxLength(500)]),
    //paternoPromo: new FormControl(''),
    paternoPromo: new FormControl<string>('', [Validators.maxLength(50)]),
    //maternoPromo: new FormControl(''),
    maternoPromo: new FormControl<string>('', [Validators.maxLength(50)]),
    generoPromo: new FormControl(''),
    moralPromo: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
    //moralPromo: new FormControl(false,[Validators.required]),
    //tipoPartePromo: new FormControl('', Validators.required),
    tipoPartePromo: new FormControl<number | null>(null, Validators.required),
    //correoElectronicoPromo: new FormControl(''),
    correoElectronicoPromo: new FormControl('', [Validators.email, Validators.maxLength(50)]),
    //telefonoPromo: new FormControl('')
    telefonoPromo: new FormControl('', [Validators.pattern(/^\d{10}$/)])

  });
  doctosForm = new FormGroup({
    tipoDocumento: new FormControl(null as ListadoCatalogoTipoDocumento | null, Validators.required),
  });
  //);
  formularioFirma = new FormGroup({
    password: new FormControl('', Validators.required),
    file_pfx: new FormControl(''),

  });

  formDocumentos = new FormGroup({
    firmado_checkbox: new FormControl(''),
  });

  idRespuesta: any; // Nueva variable para guardar el idRespuesta
  NoExpediente!: string;
  fojas!: number;
  errorMessage: string = '';
  file_pfx: any | null = null;
  //archivo_pfx_valido : boolean = false;
  diasResponder!: number;
  observaciones!: string;
  formSubmitted: boolean = false;
  formSubmittedPartes: boolean = false;
  formSubmittedPromovente: boolean = false;
  //materiaSelect!: any;
  //listaMateria: CatalogoMateria[] = [];
  listaMateria = signal<CatalogoMateria[]>([]);

  band: boolean = false;
  contador_firmas: any = "";
  isLoading = signal(false);
  archivos_firmados: any = "";
  //@ViewChild('modal') modal!: ModalComponent;
  mostrarBotonGuardar: boolean = true;
  //fase del exhorto: ya existe en BD y aun no se envian los datos generales
  generalesPendientesEnvio: boolean = false;
  //idTipoDocumento 2 = oficio del exhorto, es el documento obligatorio que debe estar cargado y firmado
  //antes de poder enviar los datos generales
  readonly ID_TIPO_DOCUMENTO_OFICIO = 2;
  //firmas que debe tener un documento (juez y abogado) antes de poder aplicarlas al pdf
  readonly FIRMAS_REQUERIDAS_APLICAR = 2;
  //el boton "Aplicar firmas" solo aparece cuando el documento ya tiene cargadas las firmas del juez y del
  //abogado. El API no indica el cargo de cada firmante, por eso se valida que existan al menos
  //FIRMAS_REQUERIDAS_APLICAR firmantes distintos (por idUsuario)
  //perfil actualmente seleccionado
  esSecretario = computed(() => this.tokenService.getPerfilNombre() === 'Secretario');
  esJuez = computed(() => this.tokenService.getPerfilNombre() === 'Juez');

  //---- TURNADO DEL EXHORTO ANTES DE ENVIAR GENERALES ----
  //idMovimiento 16: Secretario -> Juez (revisa y firma el exhorto)
  //idMovimiento 17: Juez -> Secretario (envia el exhorto al juzgado exhortado)
  readonly ID_MOV_SECRETARIO_JUEZ = 16;
  readonly ID_MOV_JUEZ_SECRETARIO = 17;
  movimientos = signal<VerMovimientosEnviadosResponse[]>([]);
  tienePermisoTurnar = signal<boolean>(false);
  tienePermisoRecibir = signal<boolean>(false);
  tienePermisoRevocar = signal<boolean>(false);
  //fase del turnado segun el ultimo movimiento:
  //- sinTurnar: el secretario captura, carga documentos y firma; aun no turna al juez
  //- turnadoAJuez / juezRecibio: movimiento 16 pendiente de recibir / ya recibido por el juez
  //- turnadoASecretario / secretarioRecibio: movimiento 17 pendiente de recibir / ya recibido por el secretario
  //Revocar elimina el ultimo movimiento, por eso la fase se calcula siempre con el ultimo de la lista
  faseTurnado = computed<'sinTurnar' | 'turnadoAJuez' | 'juezRecibio' | 'turnadoASecretario' | 'secretarioRecibio'>(() => {
    const lista = this.movimientos();
    if (!lista || lista.length === 0) {
      return 'sinTurnar';
    }
    const ultimo = lista[lista.length - 1];
    const recibido = ultimo.fechaRecepcion != null;
    if (ultimo.idMovimiento === this.ID_MOV_SECRETARIO_JUEZ) {
      return recibido ? 'juezRecibio' : 'turnadoAJuez';
    }
    if (ultimo.idMovimiento === this.ID_MOV_JUEZ_SECRETARIO) {
      return recibido ? 'secretarioRecibio' : 'turnadoASecretario';
    }
    //movimientos posteriores al 17 (ya se enviaron generales) cuentan como si el secretario ya recibio
    return lista.some(m => m.idMovimiento >= this.ID_MOV_JUEZ_SECRETARIO) ? 'secretarioRecibio' : 'sinTurnar';
  });
  //mientras el exhorto esta con el juez (o en transito) nadie edita los generales, partes ni promoventes; una
  //vez que el secretario lo recibe de vuelta solo el secretario puede editarlos
  //el juez no edita nada hasta que recibe el exhorto (movimiento 16 recibido); a partir de ahi edita los
  //generales, partes y promoventes igual que el secretario
  formularioBloqueadoPorTurno = computed(() => {
    const fase = this.faseTurnado();
    if (fase === 'sinTurnar') {
      return this.esJuez() || this.bloqueadoListoParaTurnar();
    }
    if (fase === 'juezRecibio') {
      return !this.esJuez() || this.bloqueadoListoParaTurnar();
    }
    if (fase === 'secretarioRecibio') {
      return !this.esSecretario();
    }
    return true;
  });
  //solo el secretario agrega/elimina documentos, y unicamente antes de turnar al juez (y fuera del modo
  //solo lectura de "listo para turnar"); el juez unicamente firma
  documentosBloqueadosPorTurno = computed(() =>
    this.faseTurnado() !== 'sinTurnar' || this.esJuez() || this.bloqueadoListoParaTurnar()
  );
  //el juez normalmente no tiene la seccion "Guardar" en esta pantalla, pero una vez que recibio el exhorto
  //puede editarlo y guardarlo
  puedeGuardar = computed(() =>
    this.tienePermisoGuardar() || (this.esJuez() && this.faseTurnado() === 'juezRecibio')
  );
  //cargo destino del ultimo movimiento (16 -> Juez, 17 -> Secretario)
  private cargoDestinoUltimoMovimiento(): string | null {
    const lista = this.movimientos();
    const ultimo = lista && lista.length > 0 ? lista[lista.length - 1] : null;
    if (ultimo?.idMovimiento === this.ID_MOV_SECRETARIO_JUEZ) return 'Juez';
    if (ultimo?.idMovimiento === this.ID_MOV_JUEZ_SECRETARIO) return 'Secretario';
    return null;
  }
  //el destinatario del ultimo movimiento (16 o 17) puede recibirlo o revocarlo mientras aun no lo recibe
  puedeRecibir = computed(() => {
    const fase = this.faseTurnado();
    if (fase !== 'turnadoAJuez' && fase !== 'turnadoASecretario') {
      return false;
    }
    return this.cargoDestinoUltimoMovimiento() === this.tokenService.getPerfilNombre()?.trim();
  });
  puedeRevocar = computed(() => this.puedeRecibir());
  //true si el usuario actual ya cargo su firma en el oficio (idTipoDocumento 2). El tipo puede venir en
  //idTipoDocumento o solo dentro de tipoDocumento, segun el endpoint que haya llenado la lista
  usuarioFirmoOficio = computed(() => {
    const userData = this.tokenService.getUserFromToken();
    const idUsuario = userData !== null ? Number(userData.idGeneral) : 0;
    return this.listaDocumentos().some(doc =>
      Number(doc.idTipoDocumento ?? doc.tipoDocumento?.idTipoDocumento) === this.ID_TIPO_DOCUMENTO_OFICIO &&
      doc.activo !== false &&
      (doc.firmantes ?? []).some(f => f && Number(f.idUsuario) === idUsuario));
  });
  //true cuando el secretario presiono Guardar teniendo ya su firma en el oficio (o el exhorto llega desde el
  //detalle cumpliendo ya esa condicion); a partir de ahi aparece "Turnar a juez"
  guardadoConFirmaParaTurnar = signal<boolean>(false);
  //- Secretario (sinTurnar): turna al juez una vez que firmo el oficio y guardo el exhorto
  //- Juez (juezRecibio): turna de vuelta al secretario una vez que ya firmo el oficio
  puedeTurnar = computed(() => {
    const fase = this.faseTurnado();
    if (fase === 'sinTurnar' && this.esSecretario()) {
      return this.usuarioFirmoOficio() && this.guardadoConFirmaParaTurnar();
    }
    if (fase === 'juezRecibio' && this.esJuez()) {
      return this.usuarioFirmoOficio() && this.guardadoConFirmaParaTurnar();
    }
    return false;
  });
  //quien tiene el turno (secretario antes de turnar, juez una vez que recibio) ya firmo el oficio y guardo:
  //el formulario queda en solo lectura con los botones Turnar + Editar; al presionar "Editar" se vuelven a
  //habilitar el formulario, agregar (lo que le corresponda) y eliminar su firma, hasta que guarde de nuevo
  bloqueadoListoParaTurnar = computed(() => this.puedeTurnar() && !this.modoEdicion());
  //el secretario selecciona documentos para firmar antes de turnar y despues de recibir de vuelta; el juez
  //solo mientras tiene el exhorto recibido
  puedeSeleccionarParaFirma = computed(() => {
    const fase = this.faseTurnado();
    if (fase === 'juezRecibio') return this.esJuez();
    if (fase === 'sinTurnar' || fase === 'secretarioRecibio') return !this.esJuez();
    return false;
  });
  //solo el secretario, una vez que recibio de vuelta del juez, aplica las firmas
  puedeAplicarFirmas(documento: archivoExhortoEnviado): boolean {
    return !documento.firmado && this.esSecretario() && this.faseTurnado() === 'secretarioRecibio' &&
      this.tieneFirmasCompletas(documento);
  }
  //texto informativo del estado del turnado para el encabezado
  mensajeTurnado = computed(() => {
    switch (this.faseTurnado()) {
      case 'turnadoAJuez': return 'Turnado al juez, pendiente de recibir';
      case 'juezRecibio': return 'En revisión y firma del juez';
      case 'turnadoASecretario': return 'Devuelto al secretario, pendiente de recibir';
      default: return '';
    }
  });

  //solo el Secretario y el Juez pueden eliminar una firma, y cada uno unicamente la suya: el secretario antes
  //de turnar al juez, y el juez mientras tiene el exhorto recibido
  puedeEliminarFirma(firmante: Firmantes): boolean {
    const fase = this.faseTurnado();
    const puedeEnFase = !this.bloqueadoListoParaTurnar() &&
      ((this.esSecretario() && fase === 'sinTurnar') || (this.esJuez() && fase === 'juezRecibio'));
    if (!puedeEnFase) {
      return false;
    }
    const userData = this.tokenService.getUserFromToken();
    const idUsuario = userData !== null ? userData.idGeneral : 0;
    return firmante.idUsuario === idUsuario;
  }
  tieneFirmasCompletas(documento: archivoExhortoEnviado): boolean {
    const firmantesDistintos = new Set((documento.firmantes ?? []).filter(f => f).map(f => f.idUsuario));
    return firmantesDistintos.size >= this.FIRMAS_REQUERIDAS_APLICAR;
  }
  //true cuando el usuario presiono Guardar teniendo ya el oficio firmado, o cuando el exhorto llega
  //desde el detalle cumpliendo ya esa condicion (ahi no hay un Guardar previo que la marque)
  guardadoConOficioFirmado = signal<boolean>(false);
  //se consume en la primera carga de documentos cuando se entra redirigido desde el detalle del exhorto
  private cargaInicialDesdeDetalle: boolean = false;
  //existe el oficio (idTipoDocumento 2) cargado y firmado
  tieneOficioFirmado = computed<boolean>(() =>
    this.listaDocumentos().some(doc =>
      Number(doc.idTipoDocumento) === this.ID_TIPO_DOCUMENTO_OFICIO && doc.firmado && doc.activo !== false)
  );
  //"Enviar generales" y "Editar" solo aparecen cuando ya se cargo y firmo el oficio y despues se guardo;
  //mientras eso no ocurra se mantiene visible "Guardar" y el formulario de generales sigue habilitado.
  //Con el turnado, aparecen en cuanto el secretario ya recibio de vuelta del juez y aplico las firmas del oficio
  //(sin necesidad de Guardar); la condicion con guardadoConOficioFirmado se conserva para exhortos previos al turnado
  get mostrarBotonEnviarGenerales(): boolean {
    if (!this.generalesPendientesEnvio || !this.tieneOficioFirmado()) {
      return false;
    }
    const fase = this.faseTurnado();
    if (fase === 'secretarioRecibio') {
      return this.esSecretario();
    }
    return fase === 'sinTurnar' && this.guardadoConOficioFirmado();
  }
  mostrarBotonEnviarArchivos: boolean = false;
  //cuando ya esta listo para enviar generales, se ocultan los botones de agregar/eliminar parte, promovente y
  //documento para no confundir al usuario; se reactivan solo si el usuario pulsa "Editar" y se vuelven a ocultar
  //hasta que guarde de nuevo
  modoEdicion = signal<boolean>(false);
  partesDialog: boolean = false;
  promoDialog: boolean = false;
  firmaDialog: boolean = false;
  //documentosAnexados: File[] = [];
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
  // @ViewChild('modalconfirmacion') modalconfirmacion!: ModalComponent;
  @ViewChild('modal2') modal2!: ModalComponent;
  @ViewChild('modal1') modal1!: ModalComponent;
  urlInfo: string = "";
  @ViewChild(QrGeneratorComponent) qrGenerator!: QrGeneratorComponent;
  @ViewChild('contentToPrint') contentToPrint!: ElementRef;
 
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @ViewChild('seccionDocumentos') seccionDocumentos?: ElementRef<HTMLElement>;
  resaltarDocumentos = signal(false);


  listaEstadoDestino = signal<CatalogoEstadoDestino[]>([]);

  listaMunicipioDestino = signal<CatalogoMunicipioDestino[]>([]);

  juzgadoOrigenNombre= signal<string>('');
  municipioOrigenNombre= signal<string>('');
  listaMateriaEstadoDestino = signal<CatalogoMateriasEstadoDestino[]>([]);
  listagenero = signal<CatalogoGenero[]>([]);
  generoPromoSelect!: CatalogoGenero;
  idExhortoEditando: number = 0
  exhortoYaGuardado: boolean = false;
  listaTipoParte = signal<CatalogoTipoParte[]>([]);
  listaPartes: partesExhortoEnviado[] = [];
  listaPromovetes: ProvomenteExhortoEnviado[] = [];
  listaTipoDocumento: CONATRIB_catTipoDocumento[] = [];
  listaTipoDiligencia = signal<catTipoDiligencia[]>([]);

  url: string = '';
  doc!: archivoRespuesta;
  uploadedFiles: any[] = [];
  nombreDocumento: string = '';

  progressValue: number = 0;
  dialogData: any = {}; // Para almacenar la información del archivo del diálogo

  ExhortoEnviadoGenerales!: generalesExhortoEnviado;
  detallesExhortos: detalleExhortosEnviados | any;

  //listaDocumentos: archivoExhortoEnviado[] = [];
  listaDocumentos = signal<archivoExhortoEnviado[]>([]);
  //documento!:archivoExhortoEnviado;

  banderaDocumento: boolean = false;
  idExhorto!: number;
  documentos: archivoRespuesta[] = [];

  exhortoGuardado = false;

  //selectedTipoDocumento!: ListadoCatalogoTipoDocumento;
  listadoTipoDocumento: ListadoCatalogoTipoDocumento[] = [];

  //idExhortoEnviado:number | undefined;
  idTipoDiligenciadoGuardado!: number;
  //objeto que se recibe cuando se envia los archivos al estado exhortado
  archivoRecibidoConAcuse: EnviadoArchivoRecibidoConAcuseResponse | null = null;
  numeroExhorto!: string;

  listaTipoVias!: tipoVia[];
  //tipoViaSelect!:tipoVia;

  //Asignar el id de la pantalla, para poder obtener las secciones(permisos) de esta pantalla
  idPantalla = 14;

  secciones: secciones[] = [];
  responseSecciones!: GenericResponse<secciones[]>;

  private perfilSeleccionadoService = inject(AuthService);
  perfilSeleccionado!: Signal<string>;
  idArchivo: number | null = null; //variable para controlar un archivo seleccionado para eliminar o para aplicar la firma

  //Se declaran las variables para la visualizacion de las secciones
  tienePermisoGuardar = signal<boolean>(false);
  tienePermisoEnviarGenerales = signal<boolean>(false);
  tienePermisoEnviarArchvios = signal<boolean>(false);
  tienePermisoSeleccionarArchivo = signal<boolean>(false);
  tienePermisoCargarArchivo = signal<boolean>(false);
  tienePermisoFirmarArchivo = signal<boolean>(false);
  tienePermisoEliminarArchivo = signal<boolean>(false);

  //loading = false;

  showPassword: boolean = false;
  seleccionadosParaFirma = signal(false);

  idEstatus: number = 0;

  // Método ngOnInit que se ejecuta al inicializar el componente
  ngOnInit() {
    this.partesForm.get('moral')?.valueChanges.subscribe((esMoral: boolean | null) => {
      const controls = ['paterno', 'materno', 'genero'];

      controls.forEach(campo => {
        const control = this.partesForm.get(campo);
        if (esMoral) {
          control?.reset('');
          control?.disable();
        } else {
          control?.enable();
        }
      });
    });

    // Deshabilitar campos de promoventes si ya estaba activado al iniciar
    const esMoralPromoInicial = this.promoventesForm.get('moralPromo')?.value;
    if (esMoralPromoInicial === true) {
      this.promoventesForm.get('paternoPromo')?.disable();
      this.promoventesForm.get('maternoPromo')?.disable();
      this.promoventesForm.get('generoPromo')?.disable();
    }

    // Suscripción para cuando se cambie el checkbox de "¿Es persona moral?"
    this.promoventesForm.get('moralPromo')?.valueChanges.subscribe((esMoral: boolean | null) => {
      const campos = ['paternoPromo', 'maternoPromo', 'generoPromo'];
      campos.forEach(campo => {
        const control = this.promoventesForm.get(campo);
        if (esMoral === true) {
          control?.reset('');
          control?.disable();
        } else {
          control?.enable();
        }
      });
    });

    // 1. Lógica general inicial
    //se guardan las promesas de los catalogos que se usan para preseleccionar los select (estado destino,
    //materia origen y tipo de diligencia); la carga del exhorto (edicion o refresco) espera a que terminen
    //en lugar de usar un setTimeout fijo, que en conexiones lentas dejaba los select sin valor
    const catalogosListos = Promise.all([
      this.cargarCatalogoEstadoDestino().catch(() => undefined),
      this.cargarDatosOrigenFijos(),
      this.cargarCatalogoTipoDiligencia(),
    ]);
   //// this.cargarCatalogoMunicipioOrigen();
   //// this.cargarCatalogoJuzgadoOrigen();
    this.catalogoGenero();
    this.catalogoTipoParte();
    this.catalogoTipoDocumento();
    this.getListadoTipoDocumento();

    this.exhortosForm.get('municipioDestino')?.disable();
    this.exhortosForm.get('materiaEstadoDestino')?.disable();
    this.exhortosForm.get('tipojuicio')?.disable();

    this.exhortosForm.get('materiaOrigen')?.valueChanges.subscribe((materiaO) => {
      const juicioControl = this.exhortosForm.get('tipojuicio');
      materiaO ? juicioControl?.enable() : juicioControl?.disable();
      this.exhortosForm.get('tipojuicio')?.setValue(null);
    });

    this.exhortosForm.get('estadoDestino')?.valueChanges.subscribe((estado) => {
      const municipioControl = this.exhortosForm.get('municipioDestino');
      estado ? municipioControl?.enable() : municipioControl?.disable();
    });

    this.exhortosForm.get('municipioDestino')?.valueChanges.subscribe((municipio) => {
      const materiaControl = this.exhortosForm.get('materiaEstadoDestino');
      municipio ? materiaControl?.enable() : materiaControl?.disable();
    });


    // Reglas para partes y promoventes (omitidas aquí por brevedad, asumes que ya están bien implementadas)

    const state = window.history.state as { datosExhorto?: any, modoEdicion?: boolean, idExhortoEnviado?: number };
    //console.log('State recibido en crear-exhorto:', state);
    this.ExhortoEnviadoGenerales = state.datosExhorto;
    if (state?.modoEdicion && state?.datosExhorto) {
      //viene del boton Editar del detalle
      catalogosListos.then(() => this.cargarExhortoEnEdicion(state.datosExhorto));
    } else if (state?.idExhortoEnviado) {
      //se refresco la pagina despues de guardar: se vuelve a consultar el exhorto para no perder la informacion
      catalogosListos.then(() => this.recargarExhortoGuardado(state.idExhortoEnviado as number));
    } else {
      //exhorto nuevo: estado destino preseleccionado. Solo aqui, para que en edicion no se sobrescriba el
      //estado/municipios del exhorto con los del estado por defecto
      catalogosListos.then(() => this.preseleccionarEstadoDestino(20));
    }

    this.GetSeccionesUsuario();
    this.perfilSeleccionado = signal(this.perfilSeleccionadoService.perfil_Seleccionado());

    
    

  }

  //carga en el formulario un exhorto ya guardado (modo edicion); se llama una vez que los catalogos estan listos
  cargarExhortoEnEdicion(datos: any) {
    // Estado
    const estadoDescripcion = datos.estadoDestinoId; // es el nombre del estado
    const estadoObj = this.listaEstadoDestino().find(e => e.descripcion === estadoDescripcion);

    if (estadoObj) {
      //this.estadoDestinoSelect = estadoObj;
      this.exhortosForm.patchValue({ estadoDestino: estadoObj });

      this.cargarCatalogoMunicipioDestino(estadoObj).then(() => {
        const municipioNombre = datos.municipioDestinoId; // ← es nombre
        const municipioObj = this.listaMunicipioDestino().find(m => m.descripcion === municipioNombre);

        if (municipioObj) {
          //this.municipioDestinoSelect = municipioObj;
          this.exhortosForm.get('municipioDestino')?.enable();
          this.exhortosForm.patchValue({ municipioDestino: municipioObj });

          this.cargaMateriasDestino(estadoObj).then(() => {
            const materiaNombre = datos.materiaNombre;
            const materiaObj = this.listaMateriaEstadoDestino().find(m => m.nombre === materiaNombre);
            //console.log('¿Existe materia nombre?:', materiaNombre);
            if (materiaObj) {
              //console.log('materiaObj de modo edición:', materiaObj);
              //this.materiaEstadoDestinoSelect = materiaObj;
              this.exhortosForm.get('materiaEstadoDestino')?.enable();
              this.exhortosForm.patchValue({ materiaEstadoDestino: materiaObj });
            }
            //re-aplicamos el bloqueo al terminar esta cadena asíncrona, ya que pudo resolver después
            //de que actualizarListadoDocumentos calculara mostrarBotonEnviarGenerales
            this.actualizarEstadoFormExhorto();
          });
        }
      });
    }

    // Resto de campos generales
    this.exhortosForm.patchValue({
      materiaOrigen: datos.idCatMateria,
      //municipioDestino: datos.municipioDestinoId,
      //materiaEstadoDestino: datos.materiaNombre,
      noExpediente: datos.numeroExpedienteOrigen,
      OficioOrigen: datos.numeroOficioOrigen,
      tipojuicio: datos.tipoJuicioAsuntoDelitos,
      nombreJuez: datos.juezExhortante,
      numeroFojas: datos.fojas,
      DiasResponder: datos.diasResponder,
      //TipoDiligencia: datos.tipoDiligenciacionNombre,
      observaciones: datos.observaciones
    });

    const materiaOrigenObj = this.listaMateria().find(m => m.idCatMateria === datos.materiaOrigenId);
    //se busca primero por id y, si no viene, por descripcion normalizada (mayusculas/espacios), para que el
    //select no quede vacio por diferencias de formato en el texto
    const normalizar = (v: unknown) => String(v ?? '').trim().toUpperCase();
    const tipoDiligenciaObj =
      this.listaTipoDiligencia().find(t => datos.tipoDiligenciaId != null && String(t.id) === String(datos.tipoDiligenciaId)) ??
      this.listaTipoDiligencia().find(t => normalizar(t.descripcion) === normalizar(datos.tipoDiligenciacionNombre));
    const materiaEstadoDestinoObj = this.listaMateriaEstadoDestino().find(m => m.nombre === datos.materiaNombre);

    //console.log('materiaOrigenObj:', materiaOrigenObj);
    //console.log('listaMateria:', this.listaMateria);

    if (materiaEstadoDestinoObj) {
      //this.materiaEstadoDestinoSelect = materiaEstadoDestinoObj;
      this.exhortosForm.get('materiaEstadoDestino')?.enable();
      this.exhortosForm.patchValue({ materiaEstadoDestino: materiaEstadoDestinoObj });
    }

    if (tipoDiligenciaObj) {
      //this.tipoDiligenciaSelect = tipoDiligenciaObj;
      this.exhortosForm.get('TipoDiligencia')?.enable();
      this.exhortosForm.patchValue({ TipoDiligencia: tipoDiligenciaObj });
    }

    if (materiaOrigenObj) {
      //this.materiaSelect = materiaOrigenObj;
      this.exhortosForm.get('materiaOrigen')?.enable();
      this.exhortosForm.patchValue({ materiaOrigen: materiaOrigenObj });
      this.getVias(materiaOrigenObj).then(() => {
        const idVia = datos.idCatTipoVia;
        const itemVia = this.listaTipoVias.find(m => m.idCatTipoVia === idVia);
        if (itemVia) {
          //this.tipoViaSelect = itemVia;
          this.exhortosForm.get('tipojuicio')?.enable();
          this.exhortosForm.patchValue({ tipojuicio: itemVia });
        }
        //re-aplicamos el bloqueo al terminar esta cadena asíncrona
        this.actualizarEstadoFormExhorto();
      });

    }

    this.idExhortoEditando = datos.idExhortoEnviado;
    this.numeroExhorto = datos.numeroExhorto;

    //cuando trae fechaHora significa que ya se enviaron los datos generales
    //cuando trae fechaHoraRecepcion significa que se envio todo completo incluyendo los archivos.
    //const estatus = datos.fechaHora || datos.fechaHoraRecepcion;
    this.idEstatus = datos.idEstatus;

    if (this.idEstatus == 1) { //estatus 1 es pendientes de enviar
      this.mostrarBotonGuardar = true;
     // this.generalesPendientesEnvio = true;
      this.mostrarBotonEnviarArchivos = false;
    }
    else {
      this.mostrarBotonGuardar = false;
      this.generalesPendientesEnvio = false; // idEstatus 10 (y cualquier otro != 1) no debe mostrar este botón
      this.mostrarBotonEnviarArchivos = true;
    }
    this.actualizarEstadoFormExhorto();

    this.listaPartes = datos.partes || [];
    this.listaPromovetes = datos.promoventes || [];

    this.idExhorto = datos.idExhortoEnviado;

    this.exhortoGuardado = true;
    this.exhortoYaGuardado = true;

    //viene redirigido desde el detalle: si el oficio ya esta cargado y firmado, la condicion para
    //mostrar "Enviar generales"/"Editar" ya se cumple sin necesidad de un Guardar previo
    this.cargaInicialDesdeDetalle = true;
    this.actualizarListadoDocumentos(this.idExhorto);
    this.obtenerMovimientos(this.idExhorto);

  }

  //al refrescar despues de guardar ya no existe datosExhorto en el state (o estaria desactualizado), solo el
  //idExhortoEnviado: se consulta el detalle al API y se arma el mismo objeto que manda el boton Editar del detalle
  recargarExhortoGuardado(idExhortoEnviado: number) {
    this.isLoading.set(true);
    this.ExhortosService.getExhortosEnviadosDetalle(idExhortoEnviado).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const datos = construirDatosEdicionExhorto(response.data);
          this.ExhortoEnviadoGenerales = datos as any;
          this.cargarExhortoEnEdicion(datos);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo recuperar el exhorto guardado', sticky: true });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo recuperar el exhorto guardado', sticky: true });
      }
    });
  }

  //guarda en el historial del navegador solo el id del exhorto guardado para que, si el usuario refresca,
  //se vuelva a consultar desde el API (se quita datosExhorto porque despues de guardar ya no esta vigente)
  recordarExhortoGuardado(idExhortoEnviado: number) {
    const { datosExhorto, ...resto } = (window.history.state ?? {}) as { datosExhorto?: any };
    window.history.replaceState({ ...resto, modoEdicion: true, idExhortoEnviado }, '');
  }

    // Busca el estado con el idEstado indicado dentro del catálogo ya cargado
  // y lo asigna como valor preseleccionado del p-select
  preseleccionarEstadoDestino(idEstado: number): void {
    const estado = this.listaEstadoDestino().find((e: any) => e.idEstado === idEstado);
    if (estado) {
      this.exhortosForm.get('estadoDestino')?.setValue(estado);
      this.cargarCatalogos(estado); // dispara la misma lógica que el (onChange), si la necesitas
    } else {
      console.warn(`No se encontró el estado con idEstado = ${idEstado} en el catálogo`);
    }
  }

  //searchQuery: string = '';
  //filteredStates: CatalogoMunicipioDestino[] = [...this.listaMunicipioDestino]; // Municipios filtrados
  //searchModalOpen: boolean = false; // Estado para controlar la visibilidad del modal

  // Abrir el modal cuando el select recibe foco
  /*openSearchModal() {
   this.searchModalOpen = true;

 }*/

  // Prevenir el cierre del modal al hacer clic en él
  preventModalClose(event: MouseEvent) {
    event.stopPropagation(); // Evita que el evento cierre el modal
  }

  getListadoTipoDocumento(): void {
    this.isLoading.set(true);
    this.ExhortosService.getCatalogoTipoDocumento().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe(
      (responseTipoDocumento: GenericResponse<ListadoCatalogoTipoDocumento[]>) => {
        //console.log(responseTipoDocumento);
        this.listadoTipoDocumento = responseTipoDocumento.data;
      },
      (error) => {
        //console.log("Error al cargar los tipos de documentos", error);
      }
    );
  }

  /*onTipoDocumentoChange(event: any) {
    const tipoDocId = event.target.value;
    const tipoSeleccionado = this.listadoTipoDocumento.find(doc => doc.idTipoDocumento === +tipoDocId);

    if (tipoSeleccionado) {
      this.selectedTipoDocumento = tipoSeleccionado;
      //console.log('Tipo de documento seleccionado:', this.selectedTipoDocumento);
    } else {
      this.selectedTipoDocumento = undefined!;
      //console.warn('No se encontró tipo de documento');
    }
  }*/

  /*onTipoDocumentoChange(event: any) {
    const tipoDocId = event.target.value;
    const tipoSeleccionado = this.listadoTipoDocumento.find(doc => doc.idTipoDocumento === +tipoDocId);

    if (tipoSeleccionado) {
      this.selectedTipoDocumento = tipoSeleccionado;
      //console.log('Tipo de documento seleccionado:', this.selectedTipoDocumento);
    } else {
      this.selectedTipoDocumento = undefined!;
      //console.warn('No se encontró tipo de documento');
    }
  }*/

  // CatalogoMateria() {
  //   this.ExhortosService.getCatalogoMateria().subscribe({
  //     next: (response: any) => {
  //       if (response.success) {
  //         //console.log('Datos recibidos del catálogo:', response);
  //         this.listaMateria.set(response.data);
  //       }
  //       else {
  //         this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true });
  //       }
  //     },
  //     error: (e) => {
  //       //console.error('Error al cargar el catálogo de Materia', e);
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias', sticky: true });
  //     },
  //   });
  // }

  //regresa una promesa que se resuelve al terminar (con o sin error); la carga en modo edicion la espera
  //porque de aqui sale el catalogo de materias de origen (listaMateria)
  cargarDatosOrigenFijos(): Promise<void> {
    this.isLoading.set(true);
    return new Promise(resolve => this.ExhortosService.getdetalleArea().pipe(
      finalize(() => { this.isLoading.set(false); resolve(); })
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.juzgadoOrigenNombre.set(response.data?.nombre ?? '');
          this.municipioOrigenNombre.set(response.data?.municipio?.descripcion ?? '');
          this.listaMateria.set(response.data.materias ?? []);
        } else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el juzgado y municipio de origen', sticky: true });
      },
    }));
  }

  onSelect(event: FileUploadSelectEvent) {
    if (event.files.length > 0) {
      this.nombreDocumento = event.files[0].name;  // Establece el nombre del documento
    }
    //llamamos la funcion que valida si es un pdf
    if (!validaPdf(event.files[0])) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo se permiten archivos PDF.',
        life: 3000
      });
      this.fileUpload.clear();
      return;
    }
  }

  onSelectChange() {
    //console.log('ID seleccionado:', JSON.stringify(this.selectedTipoDocumento, null, 2));

  }

  // Manejar el cambio de selección del select
  /*onSelectChange(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.municipioDestinoSelect = this.listaMunicipioDestino.find(
      municipio => municipio.idMunicipio === +selectedId
    ) || null;
    this.searchQuery = this.municipioDestinoSelect ? this.municipioDestinoSelect.descripcion : ''; // Sincronizar búsqueda
    //this.closeSearchModal(); // Cerrar el modal al seleccionar
  }*/

  // Cerrar el modal
  /*closeSearchModal() {
    this.searchModalOpen = false;
  }*/

  // Filtrar municipios según el texto ingresado
  /*filterStates() {
    if (this.searchQuery.trim()) {
      this.filteredStates = this.listaMunicipioDestino.filter(municipio =>
        municipio.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredStates = [...this.listaMunicipioDestino]; // Mostrar todos los municipios cuando no hay búsqueda
    }
  }*/

  guardarExhorto() {
    this.formSubmitted = true;

    var request: ExhortoEnviadoGuardarGeneralesRequest = {
      municipioDestinoId: this.exhortosForm.value.municipioDestino?.idMunicipio ?? 0,
      materiaClave: this.exhortosForm.value.materiaEstadoDestino?.clave ?? '',// this.materiaEstadoDestinoSelect.clave,
      idCatMateria: this.exhortosForm.value.materiaOrigen?.idCatMateria ?? 0, // materia origen
      estadoOrigenId: 20, //Oaxaca
      numeroExpedienteOrigen: this.exhortosForm.value.noExpediente as string,
      numeroOficioOrigen: this.exhortosForm.value.OficioOrigen as string,
      //tipoJuicioAsuntoDelitos: this.exhortosForm.value.Tipojuicio as string,
      idCatTipoVia: this.exhortosForm.value.tipojuicio?.idCatTipoVia ?? 0, //this.tipoViaSelect.idCatTipoVia,
      tipoJuicioAsuntoDelitos: this.exhortosForm.value.tipojuicio?.descripcion ?? '',//this.tipoViaSelect.descripcion,
      juezExhortante: this.exhortosForm.value.nombreJuez as string,
      fojas: this.exhortosForm.value.numeroFojas ?? 1,
      diasResponder: this.exhortosForm.value.DiasResponder ?? 1,
      tipoDiligenciaId: this.exhortosForm.value.TipoDiligencia?.id ?? '', //this.tipoDiligenciaSelect.id,
      tipoDiligenciacionNombre: this.exhortosForm.value.TipoDiligencia?.descripcion ?? '', //this.tipoDiligenciaSelect.descripcion, //this.exhortosForm.value.TipoDiligencia as string,
      observaciones: this.exhortosForm.value.observaciones as string,
      partes: this.listaPartes.length > 0 ? (this.listaPartes as unknown as partesExhortoEnviadoRequest[]) : null,
      promoventes: this.listaPromovetes.length > 0 ? (this.listaPromovetes as ProvomenteExhortoEnviado[]) : null,
      idUsuario: 0,
      materiaNombre: this.exhortosForm.value.materiaEstadoDestino?.nombre ?? '',//this.materiaEstadoDestinoSelect.nombre as string,
      estadoDestinoId: this.exhortosForm.value.estadoDestino?.idEstado ?? 0 //this.estadoDestinoSelect.idEstado
    };
    //console.log('Request a guardar:', request);
    this.isLoading.set(true);
    this.ExhortosService.setGuardarExhortoEnviado(request).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response.success) { //console.log('Datos recibidos del catálogo:', response);
          this.modoEdicion.set(false);
          //al guardar se evalua si ya existe el oficio firmado; ese es el momento en el que se habilitan
          //"Enviar generales"/"Editar"
          this.guardadoConOficioFirmado.set(this.tieneOficioFirmado());
          this.guardadoConFirmaParaTurnar.set(this.usuarioFirmoOficio());
          this.actualizarEstadoFormExhorto();
          this.exhortoGuardado = true;
          this.exhortoYaGuardado = true;
          this.ExhortoEnviadoGenerales = response.data.generales as generalesExhortoEnviado;
          this.idExhorto = this.ExhortoEnviadoGenerales.idExhortoEnviado;
          this.idExhortoEditando = this.idExhorto;
          this.recordarExhortoGuardado(this.idExhorto);
          this.numeroExhorto = this.ExhortoEnviadoGenerales.numeroExhorto;
          this.listaPartes = response.data.partes ?? [];
          this.listaPromovetes = response.data.promoventes ?? [];
          //console.log('Respuesta de guardar exhorto:', response);
          this.messageService.add({ severity: 'success', summary: 'ok', detail: "Los datos fueron guardados correctamente" });
          this.irASeccionDocumentos();
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true })
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error, sticky: true });
      }
    });
    //this.confirmacionGuardarExhorto = false
  }

  //lleva al usuario a la seccion de documentos que aparece despues de guardar y la resalta brevemente
  irASeccionDocumentos() {
    //se espera al siguiente ciclo para que el @if(exhortoGuardado) ya haya renderizado la seccion
    setTimeout(() => {
      this.seccionDocumentos?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.resaltarDocumentos.set(true);
      //debe coincidir con la duracion total de la animacion resaltar-documentos (3 pulsos x 1.4s)
      setTimeout(() => this.resaltarDocumentos.set(false), 4200);
    }, 100);
  }

  cargarCatalogos(estado: CatalogoEstadoDestino) {
    //console.log('Estado recibido en cargarCatalogos:', estado);
    if (estado != null) {
      //console.log('Estado seleccionado:', estado);
      this.cargarCatalogoMunicipioDestino(estado);
      this.cargaMateriasDestino(estado);
      //this.cargarCatalogoMunicipioOrigen();
    }
  }

  //Metodo para obtener los municipios origen
  // // cargarCatalogoMunicipioOrigen() {
  // //   return new Promise((resolve, reject) => {
  // //     this.isLoading = true;
  // //     this.cd.detectChanges();
  // //     this.ExhortosService.getCatalogoMunicipioOrigen().subscribe(
  // //       (response: any) => {
  // //         //console.log('Datos recibidos del catálogo municipio origen:', response);
  // //         this.listaMunicipioOrigen.set(response.data);
  // //         this.isLoading = false;
  // //         this.cd.detectChanges();
  // //       },
  // //       error => {
  // //         //console.error('Error al cargar el catálogo de materias', error);
  // //         //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
  // //         this.isLoading = false;
  // //         this.cd.detectChanges();
  // //         reject(error);
  // //       }
  // //     );
  // //   });
  // // }


  cargarCatalogoMunicipioDestino(estado: CatalogoEstadoDestino): Promise<void> {
    return new Promise((resolve, reject) => {
      //console.log('Estado recibido en cargarCatalogoMunicipioDestino:', estado);

      if (!estado || !estado.idEstado) {
        //console.log('Estado no válido:', estado);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No seleccionó un estado válido' });
        reject('Estado no válido');
        return;
      }

      this.isLoading.set(true);
      this.ExhortosService.getCatalogoMunicipioDestino(estado).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe(
        (response: any) => {
          //console.log('📥 Catálogo de municipios recibidos:', response.data);
          this.listaMunicipioDestino.set(response.data);
          resolve();
        },
        (error) => {
          //console.error('❌ Error al cargar municipios:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar municipios', sticky: true });
          reject(error);
        }
      );
    });
  }

  // Método para cargar el catálogo de órganos de destino
  cargarCatalogoEstadoDestino(): Promise<void> {
    this.isLoading.set(true);
    return new Promise((resolve, reject) => {
      this.ExhortosService.getCatalogoEstadoDestino().pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe(
        (response: any) => {
          //console.log('Datos recibidos del catálogo de estado destino:', response);
          this.listaEstadoDestino.set(response.data);
          resolve();
        },
        error => {
          //console.error('Error al cargar el catálogo de órganos', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de órganos', sticky: true });
          reject(error);
        }
      );
    });
  }
  //Metodo para cargar las materias que tiene el estado seleccionado

  cargaMateriasDestino(estado: CatalogoEstadoDestino): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isLoading.set(true);
      this.ExhortosService.getCatalogoMateriasEstadoDestino(estado).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe(
        (response: any) => {
          //console.log('Datos recibidos del catálogo materias destino:', response);
          this.listaMateriaEstadoDestino.set(response.data);
          resolve(); // ✅ ¡NO debe faltar esto!
        },
        error => {
          //console.error('Error al cargar el catálogo de materias', error);
          reject(error);
        }
      );
    });
  }

  //Guardar Documento seleccionado
  guardarDocumento(file: File) {
    const tipoDocId = Number(this.doctosForm.value.tipoDocumento?.idTipoDocumento);

    if (!tipoDocId || tipoDocId === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Seleccione un tipo de documento' });
      return;
    }

    const tipoSeleccionado = this.listadoTipoDocumento.find(doc => doc.idTipoDocumento === tipoDocId);
    if (!tipoSeleccionado) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tipo de documento inválido' });
      return;
    }

    //this.selectedTipoDocumento = tipoSeleccionado;
    if (!this.idExhorto) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se ha recibido idExhorto' });
      return;
    }

    const formData = new FormData();
    formData.append('archivo', file, file.name);
    formData.append('idExhortoEnviado', this.idExhorto.toString());
    formData.append('tipoDocumento', tipoSeleccionado.idTipoDocumento.toString());
    const Usuario = this.tokenService.getUserFromToken();
    formData.append('idUsuario', Usuario.idGeneral);

    //console.log('Datos enviados al backend:', formData);
    this.isLoading.set(true);
    this.ExhortosService.guardarDocumento(formData).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Archivo guardado:', response.data);
          this.actualizarListadoDocumentos(this.idExhorto); // <-- Agrega esta línea
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento guardado exitosamente' });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
          this.resetForm();
        }

      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el documento', sticky: true });
      }
    });
  }

  resetForm() {
    this.nombreDocumento = '';
    //this.catalogoSelect = null;
  }

  /*abrirConfirmacionGuardarOActualizarExhorto(){
    this.confirmacionGuardarExhorto = true
  }*/

  habilitarEdicion() {
    this.modoEdicion.set(true);
    this.actualizarEstadoFormExhorto();
  }
  //deshabilita el form de origen/destino cuando ya esta listo para enviar generales, y lo reactiva
  //solo mientras se esta en modo edicion (o antes del primer guardado)
  actualizarEstadoFormExhorto() {
    //una vez que se entra a la fase de archivos (mostrarBotonEnviarArchivos) los datos generales ya
    //quedan bloqueados definitivamente, sin importar el estado de mostrarBotonEnviarGenerales/modoEdicion
    //mientras el exhorto este turnado al juez (o el perfil actual no sea quien lo tiene) tampoco se puede editar
    const puedeEditar = !this.mostrarBotonEnviarArchivos && !this.formularioBloqueadoPorTurno() &&
      (!this.mostrarBotonEnviarGenerales || this.modoEdicion());
    //emitEvent:false evita que enable()/disable() disparen los valueChanges de materiaOrigen/estadoDestino/
    //municipioDestino, que re-habilitarían sus campos dependientes (tipojuicio, municipioDestino, materiaEstadoDestino)
    //y borrarían su valor con el setValue(null) de esas suscripciones
    if (puedeEditar) {
      this.exhortosForm.enable({ emitEvent: false });
      //reaplicamos las reglas de cascada que se pierden al habilitar todo el formGroup de una vez
      if (!this.exhortosForm.value.materiaOrigen) this.exhortosForm.get('tipojuicio')?.disable({ emitEvent: false });
      if (!this.exhortosForm.value.estadoDestino) this.exhortosForm.get('municipioDestino')?.disable({ emitEvent: false });
      if (!this.exhortosForm.value.municipioDestino) this.exhortosForm.get('materiaEstadoDestino')?.disable({ emitEvent: false });
    } else {
      this.exhortosForm.disable({ emitEvent: false });
    }
  }
  guardarOActualizarExhorto() {
    this.confirmationService.confirm({
      key: 'guardarExhorto',
      accept: () => this.onGuardarOActualizarExhorto(),
      reject: () => { }
    });
  }
  onGuardarOActualizarExhorto() {
    if (this.exhortosForm.valid && this.idExhortoEditando) {
      this.actualizarExhorto();
    } else if (this.exhortosForm.valid) {
      this.guardarExhorto();
    } else if (!this.exhortosForm.valid) {
      // datos generales
      this.exhortosForm.markAllAsTouched();
      this.exhortosForm.updateValueAndValidity();
      ValidateForm.validateAllFormFields(this.exhortosForm);

      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos', life:10000 });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Formulario inválido', detail: 'Revisa los campos requeridos', life:10000 });
      //datos generales
      this.exhortosForm.markAllAsTouched();
      ValidateForm.validateAllFormFields(this.exhortosForm);

    }
  }
  actualizarExhorto() {

    this.formSubmitted = true;

    const request = {
      idExhortoEnviado: this.idExhortoEditando,
      municipioDestinoId: this.exhortosForm.value.municipioDestino?.idMunicipio, //this.municipioDestinoSelect!.idMunicipio,
      materiaClave: this.exhortosForm.value.materiaEstadoDestino?.clave ?? '',//this.materiaEstadoDestinoSelect.clave,
      estadoOrigenId: 20, // Oaxaca
      numeroExpedienteOrigen: this.exhortosForm.value.noExpediente,
      numeroOficioOrigen: this.exhortosForm.value.OficioOrigen,
      idCatTipoVia: this.exhortosForm.value.tipojuicio?.idCatTipoVia,//this.tipoViaSelect.idCatTipoVia,
      tipoJuicioAsuntoDelitos: this.exhortosForm.value.tipojuicio?.descripcion,//this.tipoViaSelect.descripcion,
      juezExhortante: this.exhortosForm.value.nombreJuez,
      fojas: this.exhortosForm.value.numeroFojas ?? 1,
      diasResponder: this.exhortosForm.value.DiasResponder ?? 1,
      tipoDiligenciaId: this.exhortosForm.value.TipoDiligencia?.id,//this.tipoDiligenciaSelect.id,
      tipoDiligenciacionNombre: this.exhortosForm.value.TipoDiligencia?.descripcion,//this.tipoDiligenciaSelect.descripcion,
      observaciones: this.exhortosForm.value.observaciones,
      idUsuario: 0, // actualízalo si es necesario

      materiaNombre: this.exhortosForm.value.materiaEstadoDestino?.nombre, //this.materiaEstadoDestinoSelect.nombre,
      estadoDestinoId: this.exhortosForm.value.estadoDestino?.idEstado, //this.estadoDestinoSelect.idEstado,
      idCatMateria: this.exhortosForm.value.materiaOrigen?.idCatMateria,//this.materiaSelect.idCatMateria,

      partes: this.listaPartes.map(p => ({
        idParteExhortoEnviado: p.idParteExhortoEnviado || 0,
        nombre: p.nombre,
        apellidoPaterno: p.apellidoPaterno,
        apellidoMaterno: p.apellidoMaterno,
        genero: p.genero,
        esPersonaMoral: p.esPersonaMoral,
        idTipoParte: p.idTipoParte,
        tipoParteNombre: p.tipoParteNombre,
        correoElectronico: p.correoElectronico,
        telefono: p.telefono,
        activo: p.activo,
      })),

      promoventes: this.listaPromovetes.map(p => ({
        idParteExhortoEnviado: p.idPromoventeExhortoEnviado || 0,
        nombre: p.nombre,
        idExhortoEnviado: this.idExhortoEditando,
        apellidoPaterno: p.apellidoPaterno,
        apellidoMaterno: p.apellidoMaterno,
        genero: p.genero,
        esPersonaMoral: p.esPersonaMoral,
        idTipoParte: p.idTipoParte,
        tipoParteNombre: p.tipoParteNombre,
        correoElectronico: p.correoElectronico,
        telefono: p.telefono,
        activo: p.activo
      }))
    };

    //console.log('Datos enviados para actualizar el exhorto:', request);
    //console.log('ID del exhorto editando:', this.idExhortoEditando);
    this.isLoading.set(true);
    this.ExhortosService.actualizarExhortoEnviado(request).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.modoEdicion.set(false);
          //igual que al guardar por primera vez: el Guardar posterior a la firma del oficio es el que
          //habilita "Enviar generales"/"Editar"
          this.guardadoConOficioFirmado.set(this.tieneOficioFirmado());
          this.guardadoConFirmaParaTurnar.set(this.usuarioFirmoOficio());
          this.actualizarEstadoFormExhorto();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Exhorto actualizado correctamente' });
        } else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors,  sticky: true });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error, sticky: true });
      }
    });
    //this.confirmacionGuardarExhorto = false

  }


  // Método de confirmación para actualizar los datos generales de la promocion
  confirm(event: Event) {

  }

  /*abrirConfirmacionEliminarPromovente(){
    this.confirmacionEliminarPromovente = true
  }*/

  eliminarPromovente(promo: ProvomenteExhortoEnviado) {
    this.confirmationService.confirm({
      key: 'eliminarPromovente',
      accept: () => this.onEliminarPromovente(promo),
      reject: () => { }
    });

  }
  onEliminarPromovente(promo: ProvomenteExhortoEnviado) {
    //console.log('Eliminar promovente:', promo);
    if (promo.idPromoventeExhortoEnviado === undefined || promo.idPromoventeExhortoEnviado === null || promo.idPromoventeExhortoEnviado === 0) {
      // Si aún no ha sido guardado en la BD, lo eliminamos de la lista
      this.listaPromovetes = this.listaPromovetes.filter(p => p !== promo);
      this.messageService.add({ severity: 'info', summary: 'Promovente eliminado', detail: 'El promovente fue eliminado de forma local' });
    } else {
      // Si ya existe en BD, lo marcamos como inactivo
      promo.activo = false;
      this.messageService.add({ severity: 'info', summary: 'Promovente deshabilitado', detail: 'El promovente fue marcado como inactivo' });
    }
    //this.confirmacionEliminarPromovente = false
  }

  eliminarParte(partes: partesExhortoEnviado) {
    this.confirmationService.confirm({
      key: 'eliminarParte',
      accept: () => this.onEliminarParte(partes),
      reject: () => { }
    });
  }

  onEliminarParte(partes: partesExhortoEnviado) {
    //console.log('Eliminar parte:', partes);
    if (partes.idExhortoEnviado === undefined || partes.idExhortoEnviado === null || partes.idExhortoEnviado === 0) {
      // Si aún no ha sido guardado en la BD, lo eliminamos de la lista
      this.listaPartes = this.listaPartes.filter(p => p !== partes);
      this.messageService.add({ severity: 'info', summary: 'Parte eliminada', detail: 'La parte fue eliminada de forma local' });
    } else {
      // Si ya existe en BD, lo marcamos como inactivo
      partes.activo = false;
      this.messageService.add({ severity: 'info', summary: 'Partes deshabilitada', detail: 'La parte fue marcada como inactiva' });
    }
  }

  actualizarListadoDocumentos(idExhortoEnviado: number) {
    this.isLoading.set(true);
    this.ExhortosService.getExhortosEnviadosDetalle(idExhortoEnviado).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        if (response.success) {
          //idEstatus se refresca siempre desde el servidor (fuente de verdad); el idEstatus que llega por
          //navegación queda obsoleto en cuanto se envían generales/archivos, y no se actualiza solo, por lo
          //que si no se refresca aquí, al recargar la página (F5) se recalculan los botones con datos viejos.
          //idEstatus NO cambia al enviar generales/archivos (se mantiene en 1 durante todo ese proceso), asi
          //que la fase real se determina con fechaHora/fechaHoraRecepcion, igual que en respuesta-exhorto-recibido
          if (response.data.generales) {
            this.idEstatus = response.data.generales.idEstatus;
            const generalesEnviado = response.data.generales.fechaHora != null;
            const archivosEnviado = response.data.generales.fechaHoraRecepcion != null;
            if (!generalesEnviado) {
              this.mostrarBotonGuardar = true;
              this.generalesPendientesEnvio = true;
              this.mostrarBotonEnviarArchivos = false;
            } else {
              this.mostrarBotonGuardar = false;
              this.generalesPendientesEnvio = false;
              this.mostrarBotonEnviarArchivos = !archivosEnviado;
            }
          }
          this.actualizarEstadoFormExhorto();

          if (response.data.archivos.length > 0) {
            //obtenemos el idUsuario del token
            const userData = this.tokenService.getUserFromToken();
            var idUsuario=0;
            if(userData !== null){
              idUsuario = userData.idGeneral;
            }
            const documentosValidados = validarFirmasUsuarioExEnviado(response.data.archivos,idUsuario);
            this.listaDocumentos.set(documentosValidados.map((archivo:any)=>({
              ...archivo,
              tam:archivo.tamaño
            })));
            /*this.listaDocumentos.set(response.data.archivos.map((archivo: any) => ({
              ...archivo,
              tam: archivo.tamaño
            })));*/
          } else {
            this.listaDocumentos.set([]);
            this.messageService.add({
              severity: 'warn',
              summary: 'Advertencia',
              detail: 'No se encontraron documentos asociados al exhorto.',life:10000
            });
          }

          //solo en la primera carga tras llegar del detalle: si ya trae el oficio firmado se da por
          //cumplida la condicion del Guardar; despues de eso firmar un documento nuevo vuelve a exigirlo
          if (this.cargaInicialDesdeDetalle) {
            this.cargaInicialDesdeDetalle = false;
            this.guardadoConOficioFirmado.set(this.tieneOficioFirmado());
            this.guardadoConFirmaParaTurnar.set(this.usuarioFirmoOficio());
          }
          //el bloqueo del formulario depende de mostrarBotonEnviarGenerales, que ya considera los documentos
          this.actualizarEstadoFormExhorto();
        }
      },
      error: (error) => {
        console.error('Error al cargar los documentos del exhorto', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los documentos del exhorto.',
          sticky: true
        });
      }
    });
  }

  //Metodo para obtener los juzgados origen
  // // cargarCatalogoJuzgadoOrigen() {
  // //   this.ExhortosService.getCatalogojuzgadoOrigen().subscribe({
  // //     next: (response: any) => {
  // //       if (response.success) { //console.log('Datos recibidos del catálogo juzgados:', response);
  // //         this.listaJuzgadoOrigen.set(response.data);
  // //       }
  // //       else {
  // //         this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true })
  // //       }
  // //     },
  // //     error: (e) => {
  // //       //console.error('Error al cargar el catálogo de materias', e);
  // //       //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
  // //     },
  // //     complete: () => {
  // //       //console.log('FIN:');
  // //     }

  // //     /*},
  // //       error => {
  // //         console.error('Error al cargar el catálogo de materias', error);
  // //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
  // //       }
  // //     );*/
  // //   });
  // // }

  // Método para manejar la selección de archivos
  /*onSelect(event: FileUploadSelectEvent) {
    if (event.files.length > 0) {
      this.nombreDocumento = event.files[0].name;  // Establece el nombre del documento
    }
  }*/

  //onUpload(event: FileUploadEvent) {
  onUpload(file: File) {
    if (this.doctosForm.valid) {

      // for (let file of event.files) {
      this.uploadedFiles.push(file);
      this.nombreDocumento = file.name;  // Establece el nombre del documento
      this.guardarDocumento(file);  // Llama a guardarDocumento para cada archivo subido
      this.progressValue = 0; // Restablece el progreso al final de la carga
      // this.messageService.add({ severity: 'info', summary: 'Archivo cargado', detail: '' });
    }
    //}
    else {
      ValidateForm.validateAllFormFields(this.doctosForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tipo documento requerido', life:10000 })
    }

  }
  // Método para manejar el progreso de la carga
  onProgress(event: FileProgressEvent) {
    // const progress = event.file[0]?.progress || 0;
    // this.progressValue = Math.round(progress);
  }

  /*onUpload1(event: any) {
    // Obtener el archivo desde el evento
    const archivo = event.files[0]; // Asumiendo que se carga un solo archivo
    // Crear un objeto FormData y agregar el archivo
    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);
    formData.append('idExhortoRecibido', (this.idExhorto ?? 0).toString()); // ejemplo con idExhortoRecibido=5
    //formData.append('idExhortoRecibido', idExhortoR); // ejemplo con idExhortoRecibido=5


    formData.append('tipoDocumento', this.selectedTipoDocumento.idTipoDocumento.toString());
    const Usuario = this.tokenService.getUserFromToken();
    formData.append('idUsuario', Usuario.idGeneral);

    // Llamar al método para guardar el archivo en la API
    this.guardarArchivoRespuesta(formData);
  }*/

  guardarArchivoRespuesta(formData: FormData) {
    this.isLoading.set(true);
    this.ExhortosService.setDocumento(formData).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe(
      response => {
        if (response.success) {
          // Actualizar la tabla con el nuevo archivo
          this.doc = response.data as archivoRespuesta
          this.doc.tam = response.data.tamaño;
          this.documentos.push(this.doc);
        } else {
          // Manejar errores
          console.error('Error al guardar el archivo:', response.message);
        }
      },
      error => {
        console.error('Error en la petición guardar:', error);
      }
    );
  }

  onRemove(event: FileRemoveEvent) {
    this.nombreDocumento = '';
  }

  /*resetForm() {
    this.nombreDocumento = '';
    this.tipoDocumentoSelect =  null;
  }*/
  catalogoGenero() {
    this.isLoading.set(true);
    this.ExhortosService.getCatalogoGenero().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listagenero.set(response.data);
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true })
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de género', e);
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de género' });
      },
      complete: () => {
        //console.log('FIN:');
      }

    });
  }
  catalogoTipoParte() {
    this.isLoading.set(true);
    this.ExhortosService.getCatalogoTipoParte().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaTipoParte.set(response.data);
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true })
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de género', e);
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de género' });
      },
      complete: () => {
        //console.log('FIN:');
      }

    });
  }
  catalogoTipoDocumento() {
    this.isLoading.set(true);
    this.ExhortosService.getCatalogoTipoDocumento().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaTipoDocumento = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true })
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de género', e);
        // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de tipo de documento' });
      },
      complete: () => {
        //console.log('FIN:');
      }

    });
  }

  /*abrirConfirmacionAgregarPersona(){
    if(this.partesForm.valid)
    {
      this.confirmacionAgregarPersona = true
    }else{
      ValidateForm.validateAllFormFields(this.partesForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' })
      this.formSubmittedPartes = true;
    }
  }*/
  agregarParte() {
    if (!this.partesForm.valid) {
      ValidateForm.validateAllFormFields(this.partesForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' })
      return;
    }
    this.formSubmittedPartes = true;
    var genero = {} as CatalogoGenero;
    genero = this.partesForm.value.genero as any;

    var tipoParte = {} as CatalogoTipoParte;
    tipoParte = this.partesForm.value.tipoParte as any;

    var parte: partesExhortoEnviado = {
      nombre: this.partesForm.value.nombre as string,
      apellidoPaterno: this.partesForm.value.paterno as string,
      apellidoMaterno: this.partesForm.value.materno as string,
      genero: (genero == undefined ? '' : genero.clave as string),
      esPersonaMoral: this.partesForm.value.moral as boolean,
      tipoParteNombre: tipoParte.descripcion,
      idTipoParte: tipoParte.idTipoParte,
      idExhortoEnviado: 0,
      idParteExhortoEnviado: 0,
      correoElectronico: this.partesForm.value.correoElectronico as string,
      telefono: this.partesForm.value.telefono as string,
      activo: true
    };

    this.listaPartes.push(parte);
    this.partesForm.reset();
    //this.partesForm.value.moral=false;
    this.messageService.add({ severity: 'success', summary: 'OK', detail: "Parte agregada" });
    //this.formSubmitted3 = false;
    //this.confirmacionAgregarPersona = false

    this.partesDialog = false; //cerramos el modal

    return;

  }

  /*abrirConfirmacionAgregarPromovente(){
    if(this.promoventesForm.valid)
      {
      this.confirmacionAgregarPromovente = true
      }else{
        ValidateForm.validateAllFormFields(this.promoventesForm);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' })
        this.formSubmitted3 = true;
      }
  }*/
  agregarPromovente() {
    if (!this.promoventesForm.valid) {
      ValidateForm.validateAllFormFields(this.promoventesForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' })
      return;
    }
    this.formSubmittedPromovente = true;

    var genero = {} as CatalogoGenero;
    genero = this.promoventesForm.value.generoPromo as any;

    var tipoParte = {} as CatalogoTipoParte;
    tipoParte = this.promoventesForm.value.tipoPartePromo as any;

    var promovente: ProvomenteExhortoEnviado = {
      nombre: this.promoventesForm.value.nombrePromo as string,
      apellidoPaterno: this.promoventesForm.value.paternoPromo as string,
      apellidoMaterno: this.promoventesForm.value.maternoPromo as string,
      genero: (genero == undefined ? '' : genero.clave as string),
      esPersonaMoral: this.promoventesForm.value.moralPromo as boolean,
      tipoParteNombre: tipoParte.descripcion,
      idTipoParte: tipoParte.idTipoParte,
      idPromoventeExhortoEnviado: 0,
      correoElectronico: this.promoventesForm.value.correoElectronicoPromo as string,
      telefono: this.promoventesForm.value.telefonoPromo as string,
      //idExhortoEnviado:0,
      //idParteExhortoEnviado:0,
      idPromocionEnviado: 0,
      activo: true
    };
    //console.log(promovente)

    this.listaPromovetes.push(promovente);
    //console.log(this.listaPromovetes)
    this.promoventesForm.reset();
    //this.partesForm.value.moral=false;
    this.messageService.add({ severity: 'success', summary: 'OK', detail: "Parte agregada" });
    //this.confirmacionAgregarPromovente = false

    this.promoDialog = false; //cerramos el modal
    return;

  }
  cargarDetallesExhortoEnviado(idExhortoEnviado: number) {
    //console.log(idExhortoEnviado)
    this.isLoading.set(true);
    this.ExhortosService.getExhortosEnviadosDetalle(idExhortoEnviado).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe(
      (response) => {
        //console.log('Datos recibidos:', response);
        this.detallesExhortos = response.data as detalleExhortosEnviados; // Almacena los datos recibidos en la variable
        this.exhortosForm.value.estadoDestino = this.detallesExhortos.idEstado;

      },
      (error) => {
        console.error('Error al cargar detalle de notificación', error);
      }
    )
  }

  //regresa una promesa que se resuelve al terminar (con o sin error) para que la carga en modo edicion
  //pueda esperar a que el catalogo este listo antes de preseleccionar el tipo de diligencia
  cargarCatalogoTipoDiligencia(): Promise<void> {
    this.isLoading.set(true);
    return new Promise(resolve => this.ExhortosService.getCatalogoTipoDiligencia().pipe(
      finalize(() => { this.isLoading.set(false); resolve(); })
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.listaTipoDiligencia.set(response.data);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: response.message,
            detail: response.errors
          });
        }
      },
      error: (e) => {
        /* this.messageService.add({
           severity: 'error',
           summary: 'Error',
           detail: 'Error al cargar el catálogo de tipo de diligencia'
         });*/
      }
    }));
  }
  openModal() {
    //console.log('Modal abierto');
    //this.modal.openModal();
  }

  onModalClosed() {
    //console.log('Modal cerrado');
  }

  /* onFileSelected(event: any){
   const pfx_validar = event.target.files[0];
   const pfx = event.target as HTMLInputElement;

   if (pfx_validar) {
  // console.log("Nombre:", pfx_validar.name);
   //console.log("Tipo MIME detectado:", pfx_validar.type);
 }

   // Validar tipo MIME manualmente (algunos navegadores pueden no detectar bien el tipo)
   if (pfx_validar.type !== 'application/x-pkcs12' && pfx_validar.name.split('.').pop()?.toLowerCase() !== 'pfx') {
   this.errorMessage = 'Solo se permiten archivos .pfx';
   //console.log(this.errorMessage);
   this.archivo_pfx_valido=false;
   return;
   }
   else{
     if (pfx.files && pfx.files.length > 0) {
       this.file_pfx = pfx.files[0];
       this.file_pfx=pfx.files;
       this.archivo_pfx_valido=true;
     }
   }

   this.errorMessage = '';
   //console.log('Archivo válido:', pfx.name);

 }*/

  archivo_seleccionado(item: any) {
    //el [(ngModel)] del p-checkbox ya actualiza item.selecParaFirma; aqui solo recalculamos la señal

    //ponemos un señal para saber cuando se haya seleccionado al menos una fila para firmar
    //Verifica si al menos un archivo está seleccionado
    const algunoSeleccionado = this.listaDocumentos().some(a => a.selecParaFirma);
    this.seleccionadosParaFirma.set(algunoSeleccionado);
  }
  getFile(documento: archivoExhortoEnviado, tipoDocumento: number): void {
    const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
    if (documento.idArchivo == 0) // son archivos que no se han guardado
    {
      if (documento.tamanio <= FIVE_MB && documento.nombreArchivo.split('.')[1] === 'pdf')
        this.onVerDocumentoFile(documento.file); // se visualiza en modal
      else {
        downloadFile(documento.file); // se descarga
      }


    }
    else { // aqui ya son archivos guardados
      this.isLoading.set(true);
      this.ExhortosService.getFile(documento.idArchivo, tipoDocumento).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: (response: any) => {

          if (response.success) {
            const fileData = response.data.documento;
            //console.log(fileData);
            if (documento.tamanio <= FIVE_MB && response.data.fileName.split('.')[1] === 'pdf')
              this.onVerDocumentoBase64(fileData, documento.nombreArchivo, 'application/pdf'); // se visualiza en modal
            else {
              const nombre = response.data.fileName;
              this.dialogData.fileName = nombre;
              const ext = nombre.split('.')[1];
              downloadBase64(fileData, nombre, ext);
            }
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error, sticky: true });
          }
        },
        error: (e) => {
          //console.error('Error al recibir el archivo', e);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
        }
      });
    }
  }

  /*abrirConfirmacionEliminarDocumento(idArchivo: number){
     this.idArchivo = idArchivo;
    this.confirmacionEliminarDocumento = true
  }*/

  onEliminarIndex(index: number): void {
    this.listaDocumentos().splice(index, 1);
  }
  eliminarDocumento(documento: archivoExhortoEnviado, tipoDocumento: number, index: number) {
    //tipoDocumento=2 que son archivos de exhortos enviados
    this.confirmationService.confirm({
      key: 'eliminarArchivo',
      accept: () => this.onEliminarDocumento(documento, tipoDocumento, index),
      reject: () => { }
    });
  }

  onEliminarDocumento(documento: archivoExhortoEnviado, tipoDocumento: number, index: number) {
    //validamos si idArchivo no trae nada, quiere decir que son archivos nuevos que no se han guardado y se
    //eliminan solo en el array, sin llamar la api
    if (documento.idArchivo == 0) {
      this.onEliminarIndex(index);
    }
    else {
      // Llamada al servicio para eliminar el documento
      this.isLoading.set(true);
      this.ExhortosService.eliminarArchivo(documento.idArchivo, tipoDocumento).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: (response: any) => {
          //console.log('¿Se eliminó archivo?:', response);
          //console.log('ID archivo:', idArchivo);
          //console.log('Tipo documento:', tipoDocumento);
          if (response.success) {
            // Encuentra el índice del documento que quieres eliminar
            const index = this.listaDocumentos().findIndex(doc => doc.idArchivo === documento.idArchivo);
            if (index !== -1) {
              // Elimina el elemento del arreglo
              this.listaDocumentos().splice(index, 1);
            }
            //console.log("Documento eliminado");
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: 'Documento eliminado' });
          } else {
            //console.error('Error al eliminar el archivo:', response.message);
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors, sticky: true });
          }
        },
        error: (error) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
        },
        complete: () => {
          this.idArchivo = null;
        }
      });
    }
    //this.confirmacionEliminarDocumento = false
  }


  /*abrirConfirmacionEnviarGenerales(){
    if(this.idExhorto !== undefined){
      this.confirmacionEnviarGenerales = true
    }else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "No se ha guardado el Exhorto" });
    }
  }*/
  //valida los generales aunque el formulario este deshabilitado (en ese estado exhortosForm.valid siempre es false),
  //ejecutando directamente los validadores de cada control
  get generalesValidos(): boolean {
    return Object.values(this.exhortosForm.controls).every(c => !c.validator || c.validator(c) === null);
  }
  get puedeEnviarGenerales(): boolean {
    return this.generalesValidos && this.listaPartes.length > 0 && this.listaPromovetes.length > 0;
  }
  //texto que se muestra al pasar el cursor sobre "Enviar generales" cuando esta deshabilitado
  get motivoEnviarGeneralesDeshabilitado(): string {
    const faltantes: string[] = [];
    if (!this.generalesValidos) faltantes.push('completar los datos generales');
    if (this.listaPartes.length === 0) faltantes.push('agregar al menos una parte');
    if (this.listaPromovetes.length === 0) faltantes.push('agregar al menos un promovente');
    return faltantes.length ? `Para enviar debe: ${faltantes.join(', ')}` : '';
  }
  //movimientos del exhorto enviado; determinan la fase del turnado (Secretario <-> Juez)
  obtenerMovimientos(idExhortoEnviado: number) {
    if (!idExhortoEnviado) {
      return;
    }
    this.ExhortosService.getMovimientosExhortoEnviado(idExhortoEnviado).subscribe({
      next: (response) => {
        this.movimientos.set(response.data ?? []);
        //la fase del turnado cambia que perfil puede editar el formulario
        this.actualizarEstadoFormExhorto();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
      }
    });
  }
  //al terminar turnar/recibir/revocar se recargan movimientos y documentos, y se limpia la seleccion para firma
  private refrescarDespuesDeTurno() {
    this.modoEdicion.set(false);
    this.seleccionadosParaFirma.set(false);
    this.obtenerMovimientos(this.idExhorto);
    this.actualizarListadoDocumentos(this.idExhorto);
  }
  //maneja la respuesta comun de TurnarEnviados / RecibirEnviados / RevocarEnviados
  private procesarRespuestaTurno(peticion: Observable<any>) {
    this.isLoading.set(true);
    peticion.pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        if (response.success && response.data?.resultado) {
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.data.msg, icon: 'pi pi-check-circle' });
          this.refrescarDespuesDeTurno();
        } else if (response.success) {
          this.messageService.add({ severity: 'warn', summary: 'Atención', detail: response.data?.msg });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message, sticky: true });
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, sticky: true });
      }
    });
  }
  //Secretario -> Juez (idMovimiento 16) o Juez -> Secretario (idMovimiento 17)
  turnar() {
    this.confirmationService.confirm({
      key: 'turnarExhorto',
      accept: () => this.procesarRespuestaTurno(
        this.ExhortosService.turnarEnviado(this.idExhorto, this.authService.getRoleNameUsuario())),
      reject: () => { }
    });
  }
  recibir() {
    this.confirmationService.confirm({
      key: 'recibirExhorto',
      accept: () => this.procesarRespuestaTurno(
        this.ExhortosService.recibirEnviado(this.idExhorto, this.authService.getRoleNameUsuario())),
      reject: () => { }
    });
  }
  revocar() {
    this.confirmationService.confirm({
      key: 'revocarTurno',
      accept: () => this.procesarRespuestaTurno(this.ExhortosService.revocarEnviado(this.idExhorto)),
      reject: () => { }
    });
  }
  enviarGenerales() {
    if (!this.puedeEnviarGenerales) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: this.motivoEnviarGeneralesDeshabilitado });
      return;
    }
    this.confirmationService.confirm({
      key: 'enviarGenerales',
      accept: () => this.onEnviarGenerales(),
      reject: () => { }
    });
  }
  onEnviarGenerales() {
    if (this.idExhorto !== undefined) {
      this.isLoading.set(true);
      this.ExhortosService.enviarGeneralesExhortoEnviado(this.idExhorto).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: (response: GenericResponse<EnviadoConfirmacionDatosRecibidosResponse>) => {
          if (response.success) {
            this.mostrarBotonGuardar = false;
            this.generalesPendientesEnvio = false;
            this.mostrarBotonEnviarArchivos = true;
            this.actualizarEstadoFormExhorto();
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: "Los datos generales se enviaron correctamente" });

          } else {
            //console.error('Error al eliminar el archivo:', response.message);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message, sticky: true });
          }
        },
        error: (e) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
        }
      });
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: "No existe exhorto para enviar" });
    }
    //this.confirmacionEnviarGenerales = false
  }

  /*abrirConfirmacionEnvioArchivos(){
    if(this.idExhorto !== undefined)
    {
      this.confirmacionEnviarArchivos = true
    }else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se a guardado el exhorto' });
    }
  }*/
  // ...existing code...

  // ...existing code...
  enviarArchivos() {
    this.confirmationService.confirm({
      key: 'enviarArchivos',
      accept: () => this.onEnviarArchivos(),
      reject: () => { }
    });
  }
  onEnviarArchivos() {
    if (this.idExhorto !== undefined) {
      this.isLoading.set(true);
      this.ExhortosService.enviarArchivosExhortosEnviados(this.idExhorto).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: (response: GenericResponse<EnviadoArchivoRecibidoConAcuseResponse>) => {
          if (response.success) {
            this.mostrarBotonEnviarArchivos = false;
            this.archivoRecibidoConAcuse = response.data;
            this.urlInfo = 'https://www.tribunaloaxaca.gob.mx/ExhortosElectronicos/Consulta?folioSeguimiento=EX162025TAMA1205';
            this.sendQRData();
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: "Los archivos se enviaron correctamente" });

            if (this.archivoRecibidoConAcuse.acuse.urlInfo === null || this.archivoRecibidoConAcuse.acuse.urlInfo === undefined) {
              this.archivoRecibidoConAcuse.acuse.urlInfo = 'https://www.tribunaloaxaca.gob.mx';
            }

            this.modalService.open('modal2');
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message, sticky: true });
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
        }
      });
    }
  }

  validarContraseñaPFX(password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      //validamos que la contraseña sea correcta
      //validaFirma(formData: FormData)
      var userData = this.tokenService.getUserFromToken();
      const validaFirmaRequest = {
        idUsuario: userData.idGeneral,
        password: password
      };

      //Validar contraseña PFX
      this.ExhortosService.validaFirmaPFX(validaFirmaRequest).subscribe({
        next: (response: any) => {
          if (response.success) {
            //this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento firmado exitosamente' });
            resolve(true); //resolve cuando se requiere que el flujo continue

          } else {
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
            this.modalService.close('modal1');
            resolve(false); //resolve(false) para que el flujo continúe y apague el isLoading
          }
        },
        error: (e) => {
          //console.error('Error al guardar el documento Firmado en el NAS', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
          resolve(false);
        },
        complete: () => {

        }
      });
    });
  }

  async iniciarFirmaDocumentos() {
    this.isLoading.set(true);
    this.archivos_firmados = 0;
    if (this.formularioFirma.valid) {
      const esvalido = await this.validarContraseñaPFX(this.formularioFirma.value.password as string);
      if (esvalido) {
        //if(this.archivo_pfx_valido){
        var userData = this.tokenService.getUserFromToken();
        const FormValues = this.formDocumentos.value;
        const seleccionado = this.listaDocumentos().filter(item => item.selecParaFirma);
        if (seleccionado.length > 0) {
          this.contador_firmas = seleccionado.length;
          for (let i = 0; i < seleccionado.length; i++) {
            seleccionado[i].idArchivo;
            //this.FirmarDocumentos(seleccionado[i].idArchivo);
            await this.FirmarDocumentos(userData.idGeneral, seleccionado[i].idArchivo, 3, this.formularioFirma.value.password as string);
          }
          this.seleccionadosParaFirma.set(false); //apagamos la señal para ocultar el boton firmar
          this.actualizarListadoDocumentos(this.idExhorto)
          //this.modalService.close('modal1');
          this.firmaDialog = false;
        }
        else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Selecciona el o los archivos que deseas firmar.' });
        }

      }else{
        //this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Archivo PFX invalido.' });
        this.isLoading.set(false);
      }
    }
    else {
      ValidateForm.validateAllFormFields(this.formularioFirma);
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Ingrese la contraseña.' });
    }
    this.isLoading.set(false);
  }
  //Nueva funcion para firmar documentos, solo se debe de guardar el id de documento que se va a firmar,
  // y el idGeneral del usuario que firma
  FirmarDocumentos(idUsuario: number, idArchivo: number, idClasificacionArchivo: number, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const guardaFirmaTmpRequest = {
        idUsuario: idUsuario,
        idArchivo: idArchivo,
        idClasificacionArchivo: idClasificacionArchivo,
        passwordFirma: password
      };
      //console.log(guardaFirmaTmpRequest);
      this.ExhortosService.guardaFirmaTemporal(guardaFirmaTmpRequest).subscribe({
        next: (response: any) => {
          if (response.success) {

            this.messageService.add({ severity: 'success', summary: 'éxito', detail: 'Firma temporal aplicada' });
            resolve(true);
          }
          else {
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
            resolve(false);
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message, sticky: true });
          resolve(false);
        },
        complete: () => {

        }
      })

    })
  }
  /*async FirmarDocumentos(idArchivo :any){
    //Descarga archivo de NAS
    this.exhortosService.getFile(idArchivo,2).subscribe({
    next:(response1:any) => {
      this.archivos_firmados++;
      var archivo_descargado_nas : any = response1.data;

      const base64WithoutPrefix = archivo_descargado_nas.documento.split(',')[1] || archivo_descargado_nas.documento;
      //llamamos una funcion general que se encuentra en shared/utils
      const blob = Base64ToBlob(base64WithoutPrefix,response1.data.contentType) //Se comenta para hacer pruebas en lo que se agrega el endpoint
      //const blob = Base64ToBlob(base64WithoutPrefix,"application/pdf")
      // Creación del objeto FormData para la solicitud
      const formData = new FormData();
      formData.append('archivoFirmar', blob, archivo_descargado_nas.fileName);
      //formData.append('archivoFirmar', blob, "Prueba.pdf");
      formData.append('archivoPfx_Efirma', this.file_pfx[0], this.file_pfx[0].name);
      formData.append('password_Efirma', this.formularioFirma.value.password as string);

      //Firma archivo descargado del NAS
      this.exhortosService.firmarDocumento(formData).subscribe({
        next:(response2:any) => {
          //console.log('Respuesta de firma:', response);
          if (response2.success) {
            //console.log('Documento guardado exitosamente', response);
            //console.log(response.data)
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento firmado exitosamente' });

            //Inicio de se guarda en el NAS
            //console.log(response.data.evidenciaCertificate.certificates[0].dateSignInfo)
            const fechaFirmado = convertDate(response2.data.evidenciaCertificate.certificates[0].dateSignInfo.split(' / ')[1]);
            //pkcs7
            const blobPkcs7 = Base64ToBlob(response2.data.pkcs7FileContent,response2.data.pkcs7ContentType);
            //evidencia
            const blobEvidencia =  Base64ToBlob(response2.data.evidenciaFileContent, response2.data.evidenciaContentType);

            const usuario = this.tokenService.getUserFromToken();
            // Creación del objeto FormData para la solicitud
            const formData = new FormData();

            formData.append('idArchivo',  idArchivo);
            formData.append('pkcs7Archivo', blobPkcs7,response2.data.pkcs7FileName);
            formData.append('evidenciaArchivo', blobEvidencia,response2.data.evidenciaFileName);
            formData.append('fechaFirmado',  fechaFirmado);
              //Guardar documento firmado en el NAS.
              this.exhortosService.guardarDocumentoFirmadoExhortoEnviado(formData).subscribe({
                next:(response3:any) => {

                  if (response3.success) {
                    //console.log('Documento guardado exitosamente', response);
                    //console.log(response.data)
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento firmado y gurardado exitosamente' });
                        //this.cargarPromocion();

                        this.actualizarListadoDocumentos(this.idExhorto)
                        //this.cerrarVentanaModal();
                        this.modalService.close('modal1');

                  } else {
                    //console.error('Error al guardar el documento Firmado en el NAS', response.message);
                    this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Surgió un error al guardar el documento firmado' });
                    this.resetForm();
                    //this.cerrarVentanaModal();
                    this.modalService.close('modal1');
                  }
                },
                error:(error) => {
                  //console.error('Error al guardar el documento Firmado en el NAS', error);
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                  //this.cerrarVentanaModal();
                  this.modalService.close('modal1');
                }
            });
            // Fin de guardar en el NAS

          } else {
            //console.error('Surgió un error al firmar el documento', response.errors);
            this.messageService.add({ severity: 'warn', summary: response2.message, detail: response2.errors });
            this.resetForm();
            //this.cerrarVentanaModal();
            this.modalService.close('modal1');
          }
        },
        error:(error) => {
          //console.error('Error al firmar el documento', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
          //this.cerrarVentanaModal();
          this.modalService.close('modal1');
        }
      });

      },
      error:(error) => {
        this.archivos_firmados++;
        //this.cerrarVentanaModal();
        this.modalService.close('modal1');
        //console.error('Error al recibir el archivo', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al recibir el archivo' });
      }

    });
  }*/

  /*cerrarVentanaModal(){
      if(this.archivos_firmados == this.contador_firmas){
       // this.modal.closeModal();
      }
  }*/
  /*openModalConfirmacion(){
    //this.modalconfirmacion.openModal();
  }*/
  /*
    openModal2() {
      this.modalService.open('modal2');
    }
      */
  sendQRData() {
    this.qrService.updateQRData(this.urlInfo); // Envía datos al servicio
  }

  printDivContent(): void {
    window.print();
  }
  //abre en otra pestaña la pagina de consulta del exhorto que regresa el acuse (urlInfo)
  abrirConsultaAcuse(): void {
    const url = this.archivoRecibidoConAcuse?.acuse?.urlInfo;
    if (url) {
      window.open(url, '_blank', 'noopener');
    }
  }

  getVias(materia: CatalogoMateria | null): Promise<void> {
    return new Promise((resolve, reject) => {
      if (materia == undefined) {
        this.messageService.add({ severity: 'error', summary: 'materia no disponible', detail: 'Debe seleccionar una materia' });
        reject('Debe seleccionar una materia origen');
        return;
      }

      this.isLoading.set(true);
      this.ExhortosService.getViasPorMaterias(materia.idCatMateria).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: (response: GenericResponse<tipoVia[]>) => {
          if (response.success) {
            //console.log('✅ Juzgados filtrados:', response.data);
            this.listaTipoVias = response.data;
            resolve();
          } else {
            //console.error('❌ Error en respuesta del backend:', response.message);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message + '\n' + response.errors, sticky: true });
            reject(response.errors);
          }
        },
        error: (error) => {
          //console.error('❌ Error HTTP al obtener juzgados:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
          reject(error);
        }
      });
    });
  }
  modalClosed(id: number) {
    //cuando se cierra la modal de confirmacion de envio de archivos, redireccionamos a la busqueda principal
    //console.log(id)
    this.router.navigate(['/exhortos/lista-exhortos-enviados'], { state: { id } });
  }

  GetSeccionesUsuario(): Promise<void> {
    return new Promise((resolve, reject) => {
      function getStorageValue(key: string): string | null {
        const sessionValue = sessionStorage.getItem(key);
        if (sessionValue !== null && sessionValue !== undefined) {
          return sessionValue;
        }
        return localStorage.getItem(key);
      }

      const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
      const perfilSeleccionado = this.authService.getPerfilSeleccionado();

      //const idAreaSistemaUsuario = getStorageValue('idAreaSistemaUsuario');
      //const perfilSeleccionado = getStorageValue('perfilSeleccionado');
      this.authService.GetSeccionesUsuario(idAreaSistemaUsuario, this.idPantalla.toString(), perfilSeleccionado)
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.secciones = res.data;
              if (this.secciones === null || this.secciones === undefined) {
                this.tienePermisoGuardar.set(false);
                this.tienePermisoEnviarGenerales.set(false);
                this.tienePermisoEnviarArchvios.set(false);
                this.tienePermisoSeleccionarArchivo.set(false);
                this.tienePermisoCargarArchivo.set(false);
                this.tienePermisoFirmarArchivo.set(false);
                this.tienePermisoEliminarArchivo.set(false);
                this.tienePermisoTurnar.set(false);
                this.tienePermisoRecibir.set(false);
                this.tienePermisoRevocar.set(false);

              }
              else if (this.secciones.length > 0) {
                this.tienePermisoGuardar.set(this.secciones.some(s => s.descripcion === 'Guardar'));
                this.tienePermisoEnviarGenerales.set(this.secciones.some(s => s.descripcion === 'EnviarGenerales'));
                this.tienePermisoEnviarArchvios.set(this.secciones.some(s => s.descripcion === 'EnviarArchivos'));
                this.tienePermisoSeleccionarArchivo.set(this.secciones.some(s => s.descripcion === 'SeleccionarArchivo'));
                this.tienePermisoCargarArchivo.set(this.secciones.some(s => s.descripcion === 'CargarArchivo'));
                this.tienePermisoFirmarArchivo.set(this.secciones.some(s => s.descripcion === 'FirmarArchivo'));
                this.tienePermisoEliminarArchivo.set(this.secciones.some(s => s.descripcion === 'EliminarArchivo'));
                this.tienePermisoTurnar.set(this.secciones.some(s => s.nombre === 'Turnar' || s.descripcion === 'Turnar'));
                this.tienePermisoRecibir.set(this.secciones.some(s => s.nombre === 'Recibir' || s.descripcion === 'Recibir'));
                this.tienePermisoRevocar.set(this.secciones.some(s => s.nombre === 'Revocar' || s.descripcion === 'Revocar'));

              }
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error en la respuesta del servidor." });
            }

          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message , sticky: true});

          }
        });
    });
  }
  //pide confirmacion antes de eliminar la firma (misma mecanica que eliminar documento)
  eliminarFirma(idFirmaTmp: number, idArchivo: number) {
    this.confirmationService.confirm({
      key: 'eliminarFirma',
      accept: () => this.onEliminarFirma(idFirmaTmp, idArchivo),
    ////  reject: () => { }
    });
  }
  onEliminarFirma(idFirmaTmp: number, idArchivo: number) {
    this.isLoading.set(true);
    this.ExhortosService.eliminarUnaFirma(idFirmaTmp).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Encuentra el índice del documento que quieres eliminar
          const index = this.listaDocumentos().findIndex(doc => doc.idArchivo === idArchivo);
          if (index !== -1) {
            const indexFirmas = this.listaDocumentos()[index].firmantes.findIndex(f => f.idFirmaTmp == idFirmaTmp);
            if (indexFirmas !== -1) {
              // Elimina el elemento del arreglo
              this.listaDocumentos()[index].firmantes.splice(indexFirmas, 1);
              //obtenemos el idUsuario del token
              const userData = this.tokenService.getUserFromToken();
              var idUsuario=0;
              if(userData !== null){
                idUsuario = userData.idGeneral;
              }
              const documentosValidados = validarFirmasUsuarioExEnviado(this.listaDocumentos(),idUsuario);
              this.listaDocumentos.set(documentosValidados.map((archivo:any)=>({
                ...archivo,
                tam:archivo.tamaño
              })));

            }
          }
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
        }
        else {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message, sticky: true });
      },
      complete: () => {

      }
    });
  }
  /*abrirConfirmarAplicarFirmas(idArchivo:number){
   this.idArchivo=idArchivo;
   this.confirmacionAplicarFirmas=true;
 }*/
  aplicarFirmas(idArchivo: number) {
    this.confirmationService.confirm({
      key: 'aplicarFirmas',
      accept: () => this.onAplicarFirmas(idArchivo),
      reject: () => { }
    });
  }
  onAplicarFirmas(idArchivo: number) {
    this.isLoading.set(true);
    this.ExhortosService.aplicarFirmasExhorto(idArchivo).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
          this.actualizarListadoDocumentos(this.idExhorto)
        } else {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}`, sticky: true });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message, sticky: true });
      }
    });
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  openNewParte() {
    this.formSubmittedPartes = false;
    this.partesDialog = true;
  }
  hideDialogParte() {
    this.partesDialog = false;
    this.formSubmittedPartes = false;
  }

  openNewPromovente() {
    this.formSubmittedPromovente = false;
    this.promoDialog = true;
  }
  hideDialogPromovente() {
    this.promoDialog = false;
    this.formSubmittedPromovente = false;
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

  onAnexosSelect(event: FileSelectEvent) {
    // Agregar archivos seleccionados a la lista local de documentos con valores por defecto
    if (!event || !event.files || event.files.length === 0) return;

    for (const file of event.files) {
      if (!validaPdf(file)) {
        this.messageService.add({ severity: 'warn', summary: 'error', detail: "El archivo no es un pdf" });
        return;
      }

      const nuevo: archivoExhortoEnviado = {
        idArchivo: 0,
        idExhortoEnviado: this.idExhorto ?? 0,
        nombreArchivo: file.name,
        hashSha1: '',
        hashSha256: '',
        idTipoDocumento: 0,
        tipoDocumento: { idTipoDocumento: 0, nombre: '', activo: false },
        tamanio: file.size ?? 0,
        paginas: 0,
        recibido: false,
        idClasificacionArchivo: 0,
        ruta: '',
        firmado: false,
        fechaFirmado: null as any,
        activo: true,
        selecParaFirma: false,
        firmantes: [],
        file: file,
        usrYaFirmo:false
      };

      // Añadir campo auxiliar `tam` que se usa en otras partes del componente
      // @ts-ignore
      nuevo.tam = file.size ?? 0;

      this.listaDocumentos().push(nuevo);
    }
  }
  hideDialogFirma() {
    this.firmaDialog = false;

  }
  openNewFirma() {
    this.firmaDialog = true;
  }
}



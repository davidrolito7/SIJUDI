import { Component, ElementRef, ViewChild, signal, effect, CreateEffectOptions, inject, Signal } from '@angular/core';
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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {FileUploadEvent, FileProgressEvent, FileRemoveEvent, FileUploadModule,FileUpload, FileSelectEvent } from 'primeng/fileupload';
import { CatalogoMateria, CatalogoEstadoDestino,CatalogoMunicipioDestino,CatalogoMateriasEstadoDestino, CatalogoMunicipioOrigen,CatalogoJuzgadoOrigen,tipoVia,catTipoDiligencia,partesExhortoEnviado,ProvomenteExhortoEnviado,partesExhortoEnviadoRequest,generalesExhortoEnviado,ExhortoEnviadoGuardarGeneralesRequest,EnviadoConfirmacionDatosRecibidosResponse,EnviadoArchivoRecibidoConAcuseResponse,CatalogoGenero,CONATRIB_catTipoDocumento,ListadoCatalogoTipoDocumento,archivoExhortoEnviado,CatalogoTipoParte,archivoRespuesta,detalleExhortosEnviados } from '../../interfaces/exhortos.model';
import ValidateForm from '../../../helpers/validateform';
import { ExhortosService } from '../../services/exhorto.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog'
import { GenericResponse } from '../../../shared/interface/shared.interface';
import {  QrService } from '../../../shared/services/qr.service';
import {ModalComponent} from '../../../shared/components/modal-component/modal-component';
import {ModalService} from '../../../shared/services/modal.service';
import {QrGeneratorComponent} from '../../../shared/components/qr-generator-component/qr-generator-component';
import {AuthService} from '../../../core/auth/service/auth.service';
import {secciones} from '../../../core/auth/interface/login.interfaces';
import {Base64ToBlob,convertDate, downloadFile ,validaPdf,convertFileToBase64, downloadBase64} from '../../../shared/functions/utils';
import {TokenService} from '../../../core/auth/service/token.service';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { PdfDialog } from '../../../shared/components/pdf-dialog/pdf-dialog';
interface FileUploadSelectEvent {
  files: File[];
}

@Component({
  selector: 'app-crear',
  imports: [FloatLabelModule,TableModule,CheckboxModule,SelectModule, ConfirmDialog, ModalComponent, CommonModule, FormsModule, ReactiveFormsModule, InputNumberModule, QrGeneratorComponent, InputTextModule, TextareaModule, ButtonModule, ToolbarModule, DialogModule,ConfirmDialogModule,InputMaskModule,ToastModule, MessageModule,FileUploadModule,PdfDialog,InputIconModule],
  templateUrl: './crear-exhorto.html',
  styleUrl: './crear-exhorto.css',
  providers: [MessageService, ConfirmationService]
})
export class CrearExhortoComponent {
constructor(
  private messageService: MessageService,
  private ExhortosService: ExhortosService,
  private readonly confirmationService: ConfirmationService,
  private tokenService : TokenService,
  //private exhortosService: ExhortosService,
  public modalService : ModalService,
  private qrService : QrService,
  private router:Router,
  public authService : AuthService,
  private sanitizer: DomSanitizer,
) { 
  //Detecta si el perfil seleccionado ha cambiado y actualiza las secciones
    this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());
    effect(() => {
      this.perfilSeleccionado = signal(this.perfilSeleccionadoService.perfil_Seleccionado());
      this.GetSeccionesUsuario();
    }, { allowSignalWrites: true } as CreateEffectOptions);
  }
  //exhortosForm = signal<FormGroup>(
  exhortosForm = new FormGroup({
    materiaOrigen: new FormControl(null as CatalogoMateria | null, Validators.required),
    estadoDestino: new FormControl(null as CatalogoEstadoDestino | null, Validators.required),
    municipioDestino: new FormControl(null as CatalogoMunicipioDestino | null, Validators.required),
    materiaEstadoDestino: new FormControl(null as CatalogoMateriasEstadoDestino | null, Validators.required),
    municipioOrigen: new FormControl(null as CatalogoMunicipioOrigen | null, Validators.required),
    juzgadoOrigen: new FormControl(null as CatalogoJuzgadoOrigen | null, Validators.required),
    noExpediente: new FormControl('', Validators.required),
    OficioOrigen: new FormControl(''),
    //Tipojuicio: new FormControl('',Validators.required),
    tipojuicio: new FormControl(null as tipoVia | null, Validators.required),
    nombreJuez: new FormControl(''),
    numeroFojas: new FormControl(null, Validators.required),
    DiasResponder: new FormControl(null, Validators.required),
    TipoDiligencia: new FormControl(null as catTipoDiligencia | null, Validators.required),
    observaciones: new FormControl('')
  });

  partesForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    paterno: new FormControl(''),
    materno: new FormControl(''),
    genero: new FormControl(''),
    moral: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
    //moral: new FormControl(false,[Validators.required]),
    tipoParte: new FormControl('', Validators.required),
    correoElectronico: new FormControl(''),
    telefono: new FormControl('')
  });
   promoventesForm = new FormGroup({
      nombrePromo: new FormControl('', Validators.required),
      paternoPromo: new FormControl(''),
      maternoPromo: new FormControl(''),
      generoPromo: new FormControl(''),
      moralPromo: new FormControl(false,{nonNullable:true, validators: [Validators.required]}),
      //moralPromo: new FormControl(false,[Validators.required]),
      tipoPartePromo: new FormControl('',Validators.required),
      correoElectronicoPromo : new FormControl(''),
      telefonoPromo: new FormControl('')
  });
    doctosForm= new FormGroup({
      tipoDocumento: new FormControl(null as ListadoCatalogoTipoDocumento | null,Validators.required),
    });
  //);
  formularioFirma = new FormGroup({
    password : new FormControl('',Validators.required),
    file_pfx : new FormControl(''),

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
  diasResponder!:number;
  observaciones!:string;
  formSubmitted: boolean = false;
  formSubmittedPartes: boolean = false;
  formSubmittedPromovente: boolean = false;
  //materiaSelect!: any;
  listaMateria: CatalogoMateria[] = [];
  band: boolean = false;
  contador_firmas: any = "";
  isLoading: boolean = false;
  archivos_firmados: any = "";
  //@ViewChild('modal') modal!: ModalComponent;
  mostrarBotonGuardar: boolean = true;
  mostrarBotonEnviarGenerales: boolean = false;
  mostrarBotonEnviarArchivos: boolean = false;
  partesDialog: boolean = false;
  promoDialog: boolean=false;
  firmaDialog: boolean=false;
  //documentosAnexados: File[] = [];
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = false;
 // @ViewChild('modalconfirmacion') modalconfirmacion!: ModalComponent;
  @ViewChild('modal2') modal2!: ModalComponent;
  @ViewChild('modal1') modal1!: ModalComponent;
  urlInfo: string = "";
  @ViewChild(QrGeneratorComponent) qrGenerator!: QrGeneratorComponent;
  @ViewChild('contentToPrint') contentToPrint!: ElementRef;
  /* ListaTipoDocumento: CatalogoClasificaciónArchivo[] = [];
   TipoDocumentoSelect: CatalogoClasificaciónArchivo | undefined;
 */
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  //boleans modal confirmacion
  //confirmacionGuardarExhorto: boolean = false
  //confirmacionEnviarGenerales: boolean = false
  //confirmacionEnviarArchivos: boolean = false
  //confirmacionAgregarPersona: boolean = false
  //confirmacionAgregarPromovente: boolean = false
  //confirmacionEliminarPromovente: boolean = false
  //confirmacionEliminarDocumento: boolean = false
  //confirmacionAplicarFirmas:boolean=false;


  listaEstadoDestino: CatalogoEstadoDestino[] = [];
  //estadoDestinoSelect!: any;

  listaMunicipioDestino: CatalogoMunicipioDestino[] = [];
  //municipioDestinoSelect!: CatalogoMunicipioDestino;

  listaMunicipioOrigen: CatalogoMunicipioOrigen[] = [];
  //municipioOrigenSelect!: CatalogoMunicipioOrigen;

  listaMateriaEstadoDestino : CatalogoMateriasEstadoDestino []=[];
  //materiaEstadoDestinoSelect! : CatalogoMateriasEstadoDestino ;

  listaJuzgadoOrigen: CatalogoJuzgadoOrigen[] = [];
  //JuzgadoOrigenSelect!: CatalogoJuzgadoOrigen;

  listagenero: CatalogoGenero[] = [];
  generoSelect!: CatalogoGenero;
  generoPromoSelect!: CatalogoGenero;

  idExhortoEditando: number = 0
  //listaPromoventes: any[] = [];

  exhortoYaGuardado: boolean = false;

  listaTipoParte: CatalogoTipoParte[] = [];
  tipoParteSelect!: CatalogoTipoParte;
  tipoPartePromoSelect!: CatalogoTipoParte;

  listaPartes: partesExhortoEnviado[] = [];
  listaPromovetes: ProvomenteExhortoEnviado[] = [];

  listaTipoDocumento: CONATRIB_catTipoDocumento[] = [];
  tipoDocumentoSelect!: CONATRIB_catTipoDocumento;

  listaTipoDiligencia: catTipoDiligencia[]=[];
  //tipoDiligenciaSelect!: catTipoDiligencia;

  url: string = '';
  doc!: archivoRespuesta;
  uploadedFiles: any[] = [];
  nombreDocumento: string = '';

  progressValue: number = 0;
  dialogData: any = {}; // Para almacenar la información del archivo del diálogo

  ExhortoEnviadoGenerales!: generalesExhortoEnviado;
  detallesExhortos: detalleExhortosEnviados | any;

  listaDocumentos: archivoExhortoEnviado[] = [];
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
  archivoRecibidoConAcuse!: EnviadoArchivoRecibidoConAcuseResponse;
  numeroExhorto!: string;

  listaTipoVias!: tipoVia[];
  //tipoViaSelect!:tipoVia;

  //Asignar el id de la pantalla, para poder obtener las secciones(permisos) de esta pantalla
  idPantalla = 14198;

  secciones: secciones[] = [];
  responseSecciones!: GenericResponse<secciones[]>;

  private perfilSeleccionadoService = inject(AuthService);
  perfilSeleccionado!: Signal<string>;
  idArchivo: number | null = null; //variable para controlar un archivo seleccionado para eliminar o para aplicar la firma

  //Se declaran las variables para la visualizacion de las secciones
  tienePermisoGuardar = false;
  tienePermisoEnviarGenerales = false;
  tienePermisoEnviarArchvios = false;
  tienePermisoSeleccionarArchivo = false;
  tienePermisoCargarArchivo = false;
  tienePermisoFirmarArchivo = false;
  tienePermisoEliminarArchivo = false;

  loading = false;

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
          control?.disable();
        } else {
          control?.enable();
        }
      });
    });

    // 1. Lógica general inicial
    this.cargarCatalogoEstadoDestino();
    this.cargarCatalogoMunicipioOrigen();
    this.cargarCatalogoJuzgadoOrigen();
    this.catalogoGenero();
    this.CatalogoMateria();
    this.catalogoTipoParte();
    this.catalogoTipoDocumento();
    this.cargarCatalogoTipoDiligencia();
    this.getListadoTipoDocumento();

    this.exhortosForm.get('municipioDestino')?.disable();
    this.exhortosForm.get('materiaEstadoDestino')?.disable();
    this.exhortosForm.get('juzgadoOrigen')?.disable();
    this.exhortosForm.get('tipojuicio')?.disable();

    this.exhortosForm.get('materiaOrigen')?.valueChanges.subscribe((materiaO) => {
      const juicioControl = this.exhortosForm.get('tipojuicio');
      this.verificarYFiltrarJuzgados()
      materiaO ? juicioControl?.enable() : juicioControl?.disable();
      this.exhortosForm.get('juzgadoOrigen')?.setValue(null);
      this.exhortosForm.get('tipojuicio')?.setValue(null);
    });

    this.exhortosForm.get('municipioOrigen')?.valueChanges.subscribe(() => {
      this.verificarYFiltrarJuzgados()
      this.exhortosForm.get('juzgadoOrigen')?.setValue(null);
    });

    this.exhortosForm.get('estadoDestino')?.valueChanges.subscribe((estado) => {
      const municipioControl = this.exhortosForm.get('municipioDestino');
      estado ? municipioControl?.enable() : municipioControl?.disable();
    });

    this.exhortosForm.get('municipioDestino')?.valueChanges.subscribe((municipio) => {
      const materiaControl = this.exhortosForm.get('materiaEstadoDestino');
      municipio ? materiaControl?.enable() : materiaControl?.disable();
    });

    /*this.exhortosForm.get('materiaOrigen')?.valueChanges.subscribe((materiaO) =>{
      const juicioControl = this.exhortosForm.get('tipojuicio');
      materiaO ? juicioControl?.enable() : juicioControl?.disable();
      this.exhortosForm.get('juzgadoOrigen')?.setValue(null);
      this.exhortosForm.get('tipojuicio')?.setValue(null);
      
    });*/

    // Reglas para partes y promoventes (omitidas aquí por brevedad, asumes que ya están bien implementadas)

    const state = window.history.state as { datosExhorto?: any, modoEdicion?: boolean };
    //console.log('State recibido en crear-exhorto:', state);
    this.ExhortoEnviadoGenerales = state.datosExhorto;
    if (state?.modoEdicion && state?.datosExhorto) {
      setTimeout(() => {
        // Estado
        const estadoDescripcion = state.datosExhorto.estadoDestinoId; // es el nombre del estado
        const estadoObj = this.listaEstadoDestino.find(e => e.descripcion === estadoDescripcion);

        if (estadoObj) {
          //this.estadoDestinoSelect = estadoObj;
          this.exhortosForm.patchValue({ estadoDestino: estadoObj });

          this.cargarCatalogoMunicipioDestino(estadoObj).then(() => {
            const municipioNombre = state.datosExhorto.municipioDestinoId; // ← es nombre
            const municipioObj = this.listaMunicipioDestino.find(m => m.descripcion === municipioNombre);

            if (municipioObj) {
              //this.municipioDestinoSelect = municipioObj;
              this.exhortosForm.get('municipioDestino')?.enable();
              this.exhortosForm.patchValue({ municipioDestino: municipioObj });

              this.cargaMateriasDestino(estadoObj).then(() => {
                const materiaNombre = state.datosExhorto.materiaNombre;
                const materiaObj = this.listaMateriaEstadoDestino.find(m => m.nombre === materiaNombre);
                //console.log('¿Existe materia nombre?:', materiaNombre);
                if (materiaObj) {
                  //console.log('materiaObj de modo edición:', materiaObj);
                  //this.materiaEstadoDestinoSelect = materiaObj;
                  this.exhortosForm.get('materiaEstadoDestino')?.enable();
                  this.exhortosForm.patchValue({ materiaEstadoDestino: materiaObj });
                }
              });
            }
          });
        }

        // Resto de campos generales
        this.exhortosForm.patchValue({
          materiaOrigen: state.datosExhorto.idCatMateria,
          //municipioDestino: state.datosExhorto.municipioDestinoId,
          //municipioOrigen: state.datosExhorto.municipioOrigenId,
          //materiaEstadoDestino: state.datosExhorto.materiaNombre,
          //juzgadoOrigen: state.datosExhorto.juzgadoOrigenNombre,
          noExpediente: state.datosExhorto.numeroExpedienteOrigen,
          OficioOrigen: state.datosExhorto.numeroOficioOrigen,
          tipojuicio: state.datosExhorto.tipoJuicioAsuntoDelitos,
          nombreJuez: state.datosExhorto.juezExhortante,
          numeroFojas: state.datosExhorto.fojas,
          DiasResponder: state.datosExhorto.diasResponder,
          //TipoDiligencia: state.datosExhorto.tipoDiligenciacionNombre,
          observaciones: state.datosExhorto.observaciones
        });

        this.verificarYFiltrarJuzgados();

        // Juzgado Origen
        const municipioOrigenObj = this.listaMunicipioOrigen.find(m => m.idMunicipio === state.datosExhorto.municipioOrigenTrue);
        const materiaOrigenObj = this.listaMateria.find(m => m.idCatMateria === state.datosExhorto.materiaOrigenId);
        const tipoDiligenciaObj = this.listaTipoDiligencia.find(t => t.descripcion === state.datosExhorto.tipoDiligenciacionNombre);
        const materiaEstadoDestinoObj = this.listaMateriaEstadoDestino.find(m => m.nombre === state.datosExhorto.materiaNombre);

        //console.log('municipioOrigenObj:', municipioOrigenObj);
        //console.log('materiaOrigenObj:', materiaOrigenObj);
        //console.log('listaMateria:', this.listaMateria);

        if (municipioOrigenObj) {
        //this.municipioOrigenSelect = municipioOrigenObj;
        this.exhortosForm.get('municipioOrigen')?.enable();
        this.exhortosForm.patchValue({ municipioOrigen: municipioOrigenObj });
        }

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
        this.getVias(materiaOrigenObj).then(()=>{
          const idVia = state.datosExhorto.idCatTipoVia;
          const itemVia= this.listaTipoVias.find(m => m.idCatTipoVia === idVia);
          if(itemVia){
            //this.tipoViaSelect = itemVia;
            this.exhortosForm.get('tipojuicio')?.enable();
            this.exhortosForm.patchValue({ tipojuicio: itemVia });
          }
        });

        }

        if (municipioOrigenObj && materiaOrigenObj) {
          this.getConfigMunicipioMateriaJuzgado(municipioOrigenObj, materiaOrigenObj).then(() => {
            const juzgadoObj = this.listaJuzgadoOrigen.find(
              j => j.juzgado === state.datosExhorto.juzgadoOrigenNombre
            );

          if (juzgadoObj) {
            //this.JuzgadoOrigenSelect = juzgadoObj;
            this.exhortosForm.get('juzgadoOrigen')?.enable();
            this.exhortosForm.patchValue({ juzgadoOrigen: juzgadoObj });
            //console.log('✅ Juzgado origen precargado:', juzgadoObj);
          } else {
            console.warn('⚠️ No se encontró juzgado con nombre:', state.datosExhorto.juzgadoOrigenNombre);
          }
        });
      }

        this.idExhortoEditando = state.datosExhorto.idExhortoEnviado;
        this.numeroExhorto = state.datosExhorto.numeroExhorto;

        //cuando trae fechaHora significa que ya se enviaron los datos generales
        //cuando trae fechaHoraRecepcion significa que se envio todo completo incluyendo los archivos.
        //const estatus = state.datosExhorto.fechaHora || state.datosExhorto.fechaHoraRecepcion;
        this.idEstatus = state.datosExhorto.idEstatus;

        if (this.idEstatus == 1) { //estatus 1 es pendientes de enviar
          this.mostrarBotonGuardar = true;
          this.mostrarBotonEnviarGenerales = true;
          this.mostrarBotonEnviarArchivos = false;
        }
        else {
          this.mostrarBotonGuardar = false;
          this.mostrarBotonEnviarGenerales = false;
          this.mostrarBotonEnviarArchivos = true;
        }

        this.listaPartes = state.datosExhorto.partes || [];
        this.listaPromovetes = state.datosExhorto.promoventes || [];

        this.idExhorto = state.datosExhorto.idExhortoEnviado;

        this.exhortoGuardado = true;
        this.exhortoYaGuardado = true;

        this.actualizarListadoDocumentos(this.idExhorto);

      }, 800); // Delay pequeño para asegurar que catálogos ya estén inicializados
    }

    this.GetSeccionesUsuario();
    this.perfilSeleccionado = signal(this.perfilSeleccionadoService.perfil_Seleccionado());
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
    this.ExhortosService.getCatalogoTipoDocumento().subscribe(
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

  verificarYFiltrarJuzgados() {
  const materiaRaw = this.exhortosForm.get('materiaOrigen')?.value as unknown;
  const municipioRaw = this.exhortosForm.get('municipioOrigen')?.value as unknown;

  const materiaObj = materiaRaw as CatalogoMateria | number;
  const municipioObj = municipioRaw as CatalogoMunicipioOrigen | number;

  const juzgadoControl = this.exhortosForm.get('juzgadoOrigen');

  const idMateria = typeof materiaObj === 'object' ? (materiaObj as CatalogoMateria)?.clave : materiaObj;
  const idMunicipio = typeof municipioObj === 'object' ? (municipioObj as CatalogoMunicipioOrigen)?.idMunicipio : municipioObj;

  if (idMateria && idMunicipio) {
    juzgadoControl?.enable();

    this.ExhortosService.getConfigMunicipioMateriaJuzgado(idMunicipio, idMateria).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Juzgados filtrados:', response.data);
          this.listaJuzgadoOrigen = response.data;
        } else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
        }
      },
      error: () => {
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el catálogo de juzgados.' });
      }
    });
  } else {
    juzgadoControl?.disable();
    this.listaJuzgadoOrigen = [];
  }
}

  CatalogoMateria() {
    this.ExhortosService.getCatalogoMateria().subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaMateria = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de Materia', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
      },
    });
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

      var request: ExhortoEnviadoGuardarGeneralesRequest={
        municipioDestinoId: this.exhortosForm.value.municipioDestino?.idMunicipio ?? 0,
        materiaClave: this.exhortosForm.value.materiaEstadoDestino?.clave ?? '',// this.materiaEstadoDestinoSelect.clave,
        idCatMateria:  this.exhortosForm.value.materiaOrigen?.idCatMateria ?? 0, // materia origen
        estadoOrigenId: 20, //Oaxaca
        municipioOrigenId:  this.exhortosForm.value.municipioOrigen?.idMunicipio ?? 0,//this.municipioOrigenSelect.idMunicipio,
        juzgadoOrigenId: this.exhortosForm.value.juzgadoOrigen?.idJuzgado.toString() ?? '', //this.JuzgadoOrigenSelect.idJuzgado.toString(),
        juzgadoOrigenNombre: this.exhortosForm.value.juzgadoOrigen?.juzgado ?? '', //this.JuzgadoOrigenSelect.juzgado,
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
        partes: this.listaPartes.length>0 ?( this.listaPartes as unknown as partesExhortoEnviadoRequest[]) : null,
        promoventes: this.listaPromovetes.length>0 ? (this.listaPromovetes as ProvomenteExhortoEnviado[]) : null,
        idUsuario: 0,
        materiaNombre: this.exhortosForm.value.materiaEstadoDestino?.nombre ?? '',//this.materiaEstadoDestinoSelect.nombre as string,
        estadoDestinoId: this.exhortosForm.value.estadoDestino?.idEstado ?? 0 //this.estadoDestinoSelect.idEstado
      };
      //console.log('Request a guardar:', request);
      this.ExhortosService.setGuardarExhortoEnviado(request).subscribe({
        next: (response:any) => {
          if(response.success)
          { //console.log('Datos recibidos del catálogo:', response);
            this.exhortoGuardado = true;
            this.exhortoYaGuardado = true;
            this.ExhortoEnviadoGenerales = response.data.generales as generalesExhortoEnviado;
            this.idExhorto = this.ExhortoEnviadoGenerales.idExhortoEnviado;
            this.idExhortoEditando = this.idExhorto;
            this.numeroExhorto = this.ExhortoEnviadoGenerales.numeroExhorto;
            this.listaPartes = response.data.partes ?? [];
            this.listaPromovetes = response.data.promoventes?? [];
            //console.log('Respuesta de guardar exhorto:', response);
            this.messageService.add({ severity: 'success', summary: 'ok', detail: "Los datos fueron guardados correctamente" });
          }
          else
          {
            this.messageService.add({severity: 'error', summary: response.message, detail:response.errors})
          }
        },
        error:(e)=>
        {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error});
        },
        complete:()=>{
            //console.log('FIN:');
            //this.router.navigate(['/inicio/exhortos/exhortos']);
          }
      });
      //this.confirmacionGuardarExhorto = false
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
  cargarCatalogoMunicipioOrigen() {
    return new Promise((resolve, reject) => {
      this.ExhortosService.getCatalogoMunicipioOrigen().subscribe(
        (response: any) => {
          //console.log('Datos recibidos del catálogo municipio origen:', response);
          this.listaMunicipioOrigen = response.data;
        },
        error => {
          //console.error('Error al cargar el catálogo de materias', error);
          //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
          reject(error);
        }
      );
    });
  }


  cargarCatalogoMunicipioDestino(estado: CatalogoEstadoDestino): Promise<void> {
    return new Promise((resolve, reject) => {
      //console.log('Estado recibido en cargarCatalogoMunicipioDestino:', estado);

      if (!estado || !estado.idEstado) {
        //console.log('Estado no válido:', estado);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No seleccionó un estado válido' });
        reject('Estado no válido');
        return;
      }

      this.ExhortosService.getCatalogoMunicipioDestino(estado).subscribe(
        (response: any) => {
          //console.log('📥 Catálogo de municipios recibidos:', response.data);
          this.listaMunicipioDestino = response.data;
          resolve();
        },
        (error) => {
          //console.error('❌ Error al cargar municipios:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar municipios' });
          reject(error);
        }
      );
    });
  }

  // Método para cargar el catálogo de órganos de destino
  cargarCatalogoEstadoDestino(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ExhortosService.getCatalogoEstadoDestino().subscribe(
        (response: any) => {
          //console.log('Datos recibidos del catálogo de estado destino:', response);
          this.listaEstadoDestino = response.data;
          resolve();
        },
        error => {
          //console.error('Error al cargar el catálogo de órganos', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de órganos' });
          reject(error);
        }
      );
    });
  }
  //Metodo para cargar las materias que tiene el estado seleccionado

  cargaMateriasDestino(estado: CatalogoEstadoDestino): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ExhortosService.getCatalogoMateriasEstadoDestino(estado).subscribe(
        (response: any) => {
          //console.log('Datos recibidos del catálogo materias destino:', response);
          this.listaMateriaEstadoDestino = response.data;
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

    this.ExhortosService.guardarDocumento(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Archivo guardado:', response.data);
          this.actualizarListadoDocumentos(this.idExhorto); // <-- Agrega esta línea
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento guardado exitosamente' });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
          this.resetForm();
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el documento' });
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

  guardarOActualizarExhorto() {
    this.confirmationService.confirm({
      key: 'guardarExhorto',
      accept: () => this.onGuardarOActualizarExhorto(),
      reject: () => { }
    });
  }
  onGuardarOActualizarExhorto() {
    if (this.exhortosForm.valid  && this.idExhortoEditando) {
      this.actualizarExhorto();
    } else if (this.exhortosForm.valid) {
      this.guardarExhorto();
    } else if (!this.exhortosForm.valid) {
      // datos generales
      this.exhortosForm.markAllAsTouched();
      this.exhortosForm.updateValueAndValidity();
      ValidateForm.validateAllFormFields(this.exhortosForm);
      
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' })
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Formulario inválido', detail: 'Revisa los campos requeridos' });
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
      municipioOrigenId: this.exhortosForm.value.municipioOrigen?.idMunicipio,// this.municipioOrigenSelect.idMunicipio,
      juzgadoOrigenId: this.exhortosForm.value.juzgadoOrigen?.idJuzgado, //this.JuzgadoOrigenSelect.idJuzgado.toString(),
      juzgadoOrigenNombre: this.exhortosForm.value.juzgadoOrigen?.juzgado,//this.JuzgadoOrigenSelect.juzgado,
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

    this.ExhortosService.actualizarExhortoEnviado(request).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Exhorto actualizado correctamente' });
        } else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error });
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
    this.ExhortosService.getExhortosEnviadosDetalle(idExhortoEnviado).subscribe({
      next: (response) => {
        if (response.success && response.data.archivos.length > 0) {
          this.listaDocumentos = response.data.archivos.map((archivo: any) => ({
            ...archivo,
            tam: archivo.tamaño
          }));
        } else {
          this.listaDocumentos = [];
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No se encontraron documentos asociados al exhorto.'
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar los documentos del exhorto', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los documentos del exhorto.'
        });
      }
    });
  }

  //Metodo para obtener los juzgados origen
  cargarCatalogoJuzgadoOrigen() {
    this.ExhortosService.getCatalogojuzgadoOrigen().subscribe({
      next: (response: any) => {
        if (response.success) { //console.log('Datos recibidos del catálogo juzgados:', response);
          this.listaJuzgadoOrigen = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
        }
      },
      error: (e) => {
        //console.error('Error al cargar el catálogo de materias', e);
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
      },
      complete: () => {
        //console.log('FIN:');
      }

      /*},
        error => {
          console.error('Error al cargar el catálogo de materias', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de materias' });
        }
      );*/
    });
  }

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
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tipo documento requerido' })
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
    this.ExhortosService.setDocumento(formData).subscribe(
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
    this.ExhortosService.getCatalogoGenero().subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listagenero = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
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
    this.ExhortosService.getCatalogoTipoParte().subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaTipoParte = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
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
    this.ExhortosService.getCatalogoTipoDocumento().subscribe({
      next: (response: any) => {
        if (response.success) {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaTipoDocumento = response.data;
        }
        else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors })
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
    this.confirmationService.confirm({
      key: 'agregarParte',
      accept: () => this.onAgregarParte(),
      reject: () => { }
    });
  }
  onAgregarParte() {
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
    this.confirmationService.confirm({
      key: 'agregarPromovente',
      accept: () => this.onAgregarPromovente(),
      reject: () => { }
    });
  }
  onAgregarPromovente() {
    if (!this.promoventesForm.valid) {
      ValidateForm.validateAllFormFields(this.promoventesForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' })
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
    this.ExhortosService.getExhortosEnviadosDetalle(idExhortoEnviado).subscribe(
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

  cargarCatalogoTipoDiligencia() {
    this.ExhortosService.getCatalogoTipoDiligencia().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.listaTipoDiligencia = response.data;
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
    });
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
    item.selecParaFirma = !item.selecParaFirma;

    //ponemos un señal para saber cuando se haya seleccionado al menos una fila para firmar
    //Verifica si al menos un archivo está seleccionado
    const algunoSeleccionado = this.listaDocumentos.some(a => a.selecParaFirma);
    this.seleccionadosParaFirma.set(algunoSeleccionado);
  }
  getFile(documento: archivoExhortoEnviado, tipoDocumento: number): void {
    const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
    if(documento.idArchivo ==0) // son archivos que no se han guardado
    {
      if(documento.tamanio<= FIVE_MB && documento.nombreArchivo.split('.')[1]==='pdf')
        this.onVerDocumento(documento.file); // se visualiza en modal
      else
      { 
        downloadFile(documento.file); // se descarga
      }
         
      
    }
    else{ // aqui ya son archivos guardados
    this.ExhortosService.getFile(documento.idArchivo,tipoDocumento).subscribe({
        next: (response:any) => {

        if (response.success) {
          const fileData = response.data.documento;
          //console.log(fileData);
            if(documento.tamanio<= FIVE_MB && response.data.fileName.split('.')[1]==='pdf' )
              this.onVerDocumento(fileData); // se visualiza en modal
            else{
              const nombre= response.data.fileName;
              this.dialogData.fileName=nombre;
              const ext= nombre.split('.')[1];
              downloadBase64(fileData, nombre,ext );
            }
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
          }
        },
        error:(e)=>{
          //console.error('Error al recibir el archivo', e);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
        },
        complete:()=>{
          //console.log('FIN:');
        }
      
    });
  }
}

  /*abrirConfirmacionEliminarDocumento(idArchivo: number){
     this.idArchivo = idArchivo;
    this.confirmacionEliminarDocumento = true
  }*/
 
  onEliminarIndex(index: number): void {
    this.listaDocumentos.splice(index, 1);
  } 
 eliminarDocumento(documento: archivoExhortoEnviado,tipoDocumento: number, index:number) {
  //tipoDocumento=2 que son archivos de exhortos enviados
    this.confirmationService.confirm({
      key: 'eliminarArchivo',
      accept: () => this.onEliminarDocumento(documento,tipoDocumento,index),
      reject: () => { }
    });
  }

  onEliminarDocumento(documento: archivoExhortoEnviado, tipoDocumento: number,index:number) {
    //validamos si idArchivo no trae nada, quiere decir que son archivos nuevos que no se han guardado y se 
    //eliminan solo en el array, sin llamar la api
    if(documento.idArchivo == 0)
    {
      this.onEliminarIndex(index);
    }
    else{
      // Llamada al servicio para eliminar el documento
      this.ExhortosService.eliminarArchivo(documento.idArchivo, tipoDocumento).subscribe({
        next: (response:any )=> {
          //console.log('¿Se eliminó archivo?:', response);
          //console.log('ID archivo:', idArchivo);
          //console.log('Tipo documento:', tipoDocumento);
          if (response.success) {
            // Encuentra el índice del documento que quieres eliminar
            const index = this.listaDocumentos.findIndex(doc => doc.idArchivo === documento.idArchivo);
            if (index !== -1) {
              // Elimina el elemento del arreglo
              this.listaDocumentos.splice(index, 1);
            }
            //console.log("Documento eliminado");
            this.messageService.add({ severity: 'success', summary: 'Error', detail: 'Documento eliminado' });
          } else {
            //console.error('Error al eliminar el archivo:', response.message);
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
          }
        },
        error:(error) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        },
        complete:()=>{
          this.idArchivo=null;
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
  enviarGenerales() {
    this.confirmationService.confirm({
      key: 'enviarGenerales',
      accept: () => this.onEnviarGenerales(),
      reject: () => { }
    });
  }
  onEnviarGenerales() {
    if (this.idExhorto !== undefined) {
      this.ExhortosService.enviarGeneralesExhortoEnviado(this.idExhorto).subscribe({
        next: (response: GenericResponse<EnviadoConfirmacionDatosRecibidosResponse>) => {
          if (response.success) {
            this.mostrarBotonGuardar = false;
            this.mostrarBotonEnviarGenerales = false;
            this.mostrarBotonEnviarArchivos = true;
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: "Los datos generales se enviaron correctamente" });

          } else {
            //console.error('Error al eliminar el archivo:', response.message);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
          }
        },
        error: (e) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
        },
        complete: () => {
          //console.log('FIN:');
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

  enviarArchivos() {
    this.confirmationService.confirm({
      key: 'enviarArchivos',
      accept: () => this.onEnviarArchivos(),
      reject: () => { }
    });
  }
  onEnviarArchivos() {
    //this.modalService.open('modal2');
    if (this.idExhorto !== undefined) {
      this.ExhortosService.enviarArchivosExhortosEnviados(this.idExhorto).subscribe({
        next: (response: GenericResponse<EnviadoArchivoRecibidoConAcuseResponse>) => {
          if (response.success) {
            this.mostrarBotonEnviarArchivos = false;
            this.archivoRecibidoConAcuse = response.data;
            this.urlInfo = 'https://www.tribunaloaxaca.gob.mx/ExhortosElectronicos/Consulta?folioSeguimiento=EX162025TAMA1205';
            this.sendQRData();
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: "Los archivos se enviaron correctamente" });
            //this.modalconfirmacion.openModal();
            //this.openModalConfirmacion();
            //this.openModal2();
            //this.modalService.open('modal2');
            //Para pruebas
            if (this.archivoRecibidoConAcuse.acuse.urlInfo === null || this.archivoRecibidoConAcuse.acuse.urlInfo === undefined) {
              this.archivoRecibidoConAcuse.acuse.urlInfo = 'https://www.tribunaloaxaca.gob.mx';
            }

            this.modalService.open('modal2');

          } else {
            //console.error('Error al eliminar el archivo:', response.message);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
          }
        },
        error: (e) => {
          //console.error('Error en la petición eliminar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
        },
        complete: () => {
          //cuando finaliza el proceso, redireccionamos a la busqueda principal
          // this.router.navigate(['/inicio/exhortos/exhortos-enviados']);
          //console.log('FIN:');
        }
      });
    }
    //this.confirmacionEnviarArchivos = false
  }

  setupReactiveListeners() {
    this.exhortosForm.get('municipioDestino')?.disable();
    this.exhortosForm.get('materiaEstadoDestino')?.disable();
    this.exhortosForm.get('juzgadoOrigen')?.disable();

    this.exhortosForm.get('materiaOrigen')?.valueChanges.subscribe(() => this.verificarYFiltrarJuzgados());
    this.exhortosForm.get('municipioOrigen')?.valueChanges.subscribe(() => this.verificarYFiltrarJuzgados());

    this.exhortosForm.get('estadoDestino')?.valueChanges.subscribe((estado) => {
      const municipioControl = this.exhortosForm.get('municipioDestino');
      if (estado) municipioControl?.enable();
      else municipioControl?.disable();
    });

    this.exhortosForm.get('municipioDestino')?.valueChanges.subscribe((municipio) => {
      const materiaControl = this.exhortosForm.get('materiaEstadoDestino');
      if (municipio) materiaControl?.enable();
      else materiaControl?.disable();
    });
  }

  getConfigMunicipioMateriaJuzgado(municipio: CatalogoMunicipioOrigen, materia: CatalogoMateria): Promise<void> {
    return new Promise((resolve, reject) => {
      const idMunicipio = municipio?.idMunicipio;
      const claveMateria = materia?.clave;

      if (!idMunicipio || !claveMateria) {
        console.warn('❌ Parámetros inválidos para getConfigMunicipioMateriaJuzgado:', { idMunicipio, claveMateria });
        reject('Parámetros inválidos');
        return;
      }

      this.ExhortosService.getConfigMunicipioMateriaJuzgado(idMunicipio, claveMateria).subscribe({
        next: (response: any) => {
          if (response.success) {
            //console.log('✅ Juzgados filtrados:', response.data);
            this.listaJuzgadoOrigen = response.data;
            resolve();
          } else {
            //console.error('❌ Error en respuesta del backend:', response.message);
            this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
            reject(response.errors);
          }
        },
        error: (error) => {
          //console.error('❌ Error HTTP al obtener juzgados:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar juzgados.' });
          reject(error);
        }
      });
    });
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
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
            reject(false); //reject es cuando se desea sali del flujo, ya no requere que se continue.
            this.modalService.close('modal1');
          }
        },
        error: (e) => {
          //console.error('Error al guardar el documento Firmado en el NAS', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
          reject(false);
        },
        complete: () => {

        }
      });
    });
  }

  async iniciarFirmaDocumentos() {
    this.isLoading = true;
    this.archivos_firmados = 0;
    if (this.formularioFirma.valid) {
      const esvalido = await this.validarContraseñaPFX(this.formularioFirma.value.password as string);
      if (esvalido) {
        //if(this.archivo_pfx_valido){
        var userData = this.tokenService.getUserFromToken();
        const FormValues = this.formDocumentos.value;
        const seleccionado = this.listaDocumentos.filter(item => item.selecParaFirma);
        if (seleccionado.length > 0) {
          this.contador_firmas = seleccionado.length;
            for(let i = 0; i<seleccionado.length; i++){
              seleccionado[i].idArchivo;
               //this.FirmarDocumentos(seleccionado[i].idArchivo);
               await this.FirmarDocumentos(userData.idGeneral,seleccionado[i].idArchivo,3,this.formularioFirma.value.password as string);
            }
            this.seleccionadosParaFirma.set(false); //apagamos la señal para ocultar el boton firmar
            this.actualizarListadoDocumentos(this.idExhorto)
            //this.modalService.close('modal1');
            this.firmaDialog=false;
        }
        else {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Selecciona el o los archivos que deseas firmar.' });
        }

      }/*else{
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Archivo PFX invalido.' });
      }*/
    }
    else {
      ValidateForm.validateAllFormFields(this.formularioFirma);
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Ingrese la información solicitada.' });
    }
    this.isLoading = false;
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
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
            resolve(false);
          }
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
          reject(false);
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

  printDivContent() {
    const originalContents = document.body.innerHTML;
    const printContents = this.contentToPrint.nativeElement.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;

    // Vuelve a cargar la aplicación Angular
  }
  getVias(materia: CatalogoMateria | null):Promise<void> {
    return new Promise((resolve, reject) => {
      if(materia == undefined)
      {
        this.messageService.add({ severity: 'error', summary: 'materia no disponible', detail: 'Debe seleccionar una materia' });
        reject('Debe seleccionar una materia origen');
        return;
      }

      this.ExhortosService.getViasPorMaterias(materia.idCatMateria).subscribe({
        next: (response: GenericResponse<tipoVia[]>) => {
          if (response.success) {
            //console.log('✅ Juzgados filtrados:', response.data);
            this.listaTipoVias = response.data;
            resolve();
          } else {
            //console.error('❌ Error en respuesta del backend:', response.message);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message + '\n' + response.errors });
            reject(response.errors);
          }
        },
        error: (error) => {
          //console.error('❌ Error HTTP al obtener juzgados:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
          reject(error);
        }
      });
    });
  }
  modalClosed(id: number) {
    //cuando se cierra la modal de confirmacion de envio de archivos, redireccionamos a la busqueda principal
    //console.log(id)
    this.router.navigate(['/inicio/exhortos/exhortos-enviados'], { state: { id } });
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

      const idAreaSistemaUsuario = getStorageValue('idAreaSistemaUsuario');
      const perfilSeleccionado = getStorageValue('perfilSeleccionado'); this.authService.GetSeccionesUsuario(idAreaSistemaUsuario, this.idPantalla.toString(), perfilSeleccionado)
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.secciones = res.data;
              if (this.secciones === null || this.secciones === undefined) {
                this.tienePermisoGuardar = false;
                this.tienePermisoEnviarGenerales = false;
                this.tienePermisoEnviarArchvios = false;
                this.tienePermisoSeleccionarArchivo = false;
                this.tienePermisoCargarArchivo = false;
                this.tienePermisoFirmarArchivo = false;
                this.tienePermisoEliminarArchivo = false;

              }
              else if (this.secciones.length > 0) {
                this.tienePermisoGuardar = this.secciones.some(s => s.descripcion === 'Guardar');
                this.tienePermisoEnviarGenerales = this.secciones.some(s => s.descripcion === 'EnviarGenerales');
                this.tienePermisoEnviarArchvios = this.secciones.some(s => s.descripcion === 'EnviarArchivos');
                this.tienePermisoSeleccionarArchivo = this.secciones.some(s => s.descripcion === 'SeleccionarArchivo');
                this.tienePermisoCargarArchivo = this.secciones.some(s => s.descripcion === 'CargarArchivo');
                this.tienePermisoFirmarArchivo = this.secciones.some(s => s.descripcion === 'FirmarArchivo');
                this.tienePermisoEliminarArchivo = this.secciones.some(s => s.descripcion === 'EliminarArchivo');

              }
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error en la respuesta del servidor." });
            }
            this.loading = false;
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
            this.loading = false;
          }
        });
    });
  }
  eliminarFirma(idFirmaTmp: number, idArchivo: number) {
    this.ExhortosService.eliminarUnaFirma(idFirmaTmp).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Encuentra el índice del documento que quieres eliminar
          const index = this.listaDocumentos.findIndex(doc => doc.idArchivo === idArchivo);
          if (index !== -1) {
            const indexFirmas = this.listaDocumentos[index].firmantes.findIndex(f => f.idFirmaTmp == idFirmaTmp);
            if (indexFirmas !== -1) {
              // Elimina el elemento del arreglo
              this.listaDocumentos[index].firmantes.splice(indexFirmas, 1);

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
      },
      complete: () => {

      }
    });
  }
   /*abrirConfirmarAplicarFirmas(idArchivo:number){
    this.idArchivo=idArchivo;
    this.confirmacionAplicarFirmas=true;
  }*/
 aplicarFirmas(idArchivo:number) {
    this.confirmationService.confirm({
      key: 'aplicarFirmas',
      accept: () => this.onAplicarFirmas(idArchivo),
      reject: () => { }
    });
  }
  onAplicarFirmas(idArchivo:number){
    this.ExhortosService.aplicarFirmasExhorto(idArchivo).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
          this.actualizarListadoDocumentos(this.idExhorto)
        } else {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${response.errors == undefined ? "" : response.errors.join(", ")}` });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message });
      },
      complete:()=>{
        //this.confirmacionAplicarFirmas=false;
      }
    });
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  validarTelefono() {
    if (!this.partesForm.value.telefono || this.partesForm.value.telefono.length !== 10) { // 
      this.partesForm.get('telefono')?.setErrors({ 'invalidPhone': true, 'message': 'El teléfono debe tener 10 dígitos.' });
    }

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
  hideDialogPromovente(){
    this.promoDialog=false;
    this.formSubmittedPromovente= false;
  }
  onVerDocumento(file: File): void {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.nombre = file.name;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento = true;
    } else {
      console.error('Documento inválido');
    }
  } 
  
  onAnexosSelect(event: FileSelectEvent) {
    // Agregar archivos seleccionados a la lista local de documentos con valores por defecto
    if (!event || !event.files || event.files.length === 0) return;

    for (const file of event.files) {
      if(!validaPdf(file))
      {
          this.messageService.add({ severity: 'warn', summary: 'error', detail: "El archivo no es un pdf"});
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
        file:file
      };

      // Añadir campo auxiliar `tam` que se usa en otras partes del componente
      // @ts-ignore
      nuevo.tam = file.size ?? 0;

      this.listaDocumentos.push(nuevo);
    }
  }
  hideDialogFirma(){
    this.firmaDialog=false;

  }
  openNewFirma(){
    this.firmaDialog = true;
  }
}

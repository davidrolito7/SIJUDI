import { Component, inject, ViewChild, signal, Signal, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FileRemoveEvent, FileSelectEvent, FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { FormControl, FormGroup, NgForm, Validators,FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";
import { SelectModule} from 'primeng/select';
import {ButtonModule} from 'primeng/button';
import { TokenService } from '../../../core/auth/service/token.service';
import {ExhortosService} from '../../services/exhorto.service';
import { AuthService } from '../../../core/auth/service/auth.service';
import { archivoPromocionExhortoEnviado, ArchivoRecibidoPromocionConAcuse, CatalogoGenero, CatalogoTipoParte, detalleExhortosEnviados, ListadoCatalogoTipoDocumento, PromocionExhortoEnviado, ProvomenteExhortoEnviado } from '../../interfaces/exhortos.model';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { base64ToFile, downloadBase64, downloadFile, validaPdf } from '../../../shared/functions/utils';
import ValidateForm from '../../../helpers/validateform';

import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { InputTextModule } from 'primeng/inputtext'
import { InputNumberModule } from 'primeng/inputnumber';
import {CommonModule} from '@angular/common';
import { ProgressBar } from "primeng/progressbar";
import { Message } from "primeng/message";
import { TextareaModule} from 'primeng/textarea';
import { TableModule } from "primeng/table";
import { Dialog } from "primeng/dialog";
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { SafeResourceUrl,DomSanitizer } from '@angular/platform-browser';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { InputIconModule } from "primeng/inputicon";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { validarFirmasUsuarioPromEnviado } from '../../functions/firmas';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { HttpErrorResponse } from '@angular/common/http';




@Component({
  selector: 'app-PromocionExhortoEnviadoComponent',
  imports: [Toast, ConfirmDialog, ButtonModule, CheckboxModule, InputTextModule, InputNumberModule, CommonModule, FormsModule, ReactiveFormsModule, SelectModule, FileUpload, TextareaModule, TableModule, Dialog, InputMaskModule, InputIconModule, ConfirmDialogModule, Spinner],
  templateUrl: './promocion-exhorto-enviado.html',
  styleUrl: './promocion-exhorto-enviado.css',
  providers:[MessageService,ConfirmationService]
})
export class PromocionExhortoEnviadoComponent {
  constructor(
    private messageService: MessageService,
    private ExhortosService: ExhortosService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private tokenService : TokenService,        
    //public modalService: ModalService,
    public authService: AuthService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) { 
/*
    this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    window.scrollTo(0, 0); // Vuelve al tope
  });

  //Detecta si el perfil seleccionado ha cambiado y actualiza las secciones
    this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());
    effect(() => {
      this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());
      this.GetSeccionesUsuario();
      }, { allowSignalWrites: true } as CreateEffectOptions);  */
      this.GetSeccionesUsuario();
  }

@ViewChild('fileUpload') fileUpload!: FileUpload;
  idExhortoEnviado: number = 0;
  idPromocionEnviado: number = 0;
  numExhorto: string = '';
  folioOrigenPromocion: string = '';
  provomenteExhortoEnviado : ProvomenteExhortoEnviado[] =[];
  archivoPromocionExhortoEnviado : archivoPromocionExhortoEnviado[]=[];
  formSubmittedPromocion: boolean = false;
  formSubmittedPromoventes: boolean = false;
  formSubmitted3: boolean = false;
  promocionGuardada: boolean = false;
  promoDialog: boolean=false;
  firmaDialog: boolean=false;
  dialogData: any = {}; // Para almacenar la información del archivo del diálogo
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
   idEstatus: number = 0;
  
  //idPromocionEnviada: number = 0;
  errorMessage: string = ''; //Eloy
    file_pfx : any | null = null; //Eloy
    file_firmar : any | null = null; //Eloy
    archivosChecked: any[] = []; // Eloy
    archivo_nas : any = ""; //Eloy
    contenidoArchivo: string = ''; //Eloy
    archivo_pfx_valido : boolean = false;//Eloy

    isLoading: boolean = false; //Eloy para bloquear la pantalla
    //@ViewChild('modal') modal!: ModalComponent; // Referencia al modal //Eloy
    contador_firmas : any = ""; //Eloy
    archivos_firmados : any = ""; //Eloy
    uploadedFiles: any[] = [];

 
    fechaHora: string | undefined 
    fechaRecepcion: string | undefined
    
    archivoRecibidoPromocionConAcuse! :ArchivoRecibidoPromocionConAcuse;
  archivosPromocionEnviado : boolean = false;

  formularioFirma = new FormGroup({
    password : new FormControl(''),
    file_pfx : new FormControl(''),

  });
  formPromo= new FormGroup({
    fojas: new FormControl(0),
    observaciones: new FormControl('')
  });

  formDocumentos = new FormGroup({
    firmado_checkbox  : new FormControl(''),
    });

     emailControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  promoventesForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    paterno: new FormControl('', Validators.required),
    materno: new FormControl(''),
    genero: new FormControl(''),
    moral: new FormControl(false),
    tipoParte: new FormControl('',Validators.required),
    telefono: new FormControl('',[Validators.pattern(/^\d{10}$/)]),
    correo: new FormControl('')
  });

  doctosForm= new FormGroup({
    tipoDocumento: new FormControl(null as ListadoCatalogoTipoDocumento | null,Validators.required),
  })

  //Asignar el id de la pantalla, para poder obtener las secciones(permisos) de esta pantalla
  //idPantalla=14196;
  idPantalla=1007;
  
  secciones : secciones[] = [] ;
  responseSecciones!: GenericResponse<secciones[]>;
  
  private perfilSeleccionadoService = inject(AuthService);
  perfilSeleccionado! : Signal<string>;
  idArchivo:number | null = null;

  //Se declaran las variables para la visualizacion de las secciones
  tienePermisoGuardar = signal<boolean>(false);
  tienePermisoEnviarGenerales = signal<boolean>(false);
  tienePermisoEnviarArchvios = signal<boolean>(false);
  tienePermisoSeleccionarArchivo = signal<boolean>(false);
  tienePermisoCargarArchivo = signal<boolean>(false);
  tienePermisoFirmarArchivo = signal<boolean>(false);
  tienePermisoEliminarArchivo = signal<boolean>(false);

  listaDocumentos=signal<archivoPromocionExhortoEnviado[]>([]);
  
  loading = false;
  seleccionadosParaFirma= signal(false);
  showPassword: boolean = false;
  detallesExhortos = signal<detalleExhortosEnviados | null>(null);
/*formatEmail() {
    let value = this.emailControl.value || '';

    // Auto-completar dominio común si no tiene @
    if (value && !value.includes('@')) {
      value += '@';
      this.emailControl.setValue(value);
    }

    // Convertir a minúsculas
    if (value !== value.toLowerCase()) {
      this.emailControl.setValue(value.toLowerCase());
    }
  }*/

  get paterno() {
    return this.promoventesForm.get('paterno');
  }

  get materno() {
    return this.promoventesForm.get('materno');
  }

  get genero() {
    return this.promoventesForm.get('genero');
  }

  //listaDocumentos : archivoPromocionExhortoEnviado[]=[];
  //documento!:archivoPromocionExhortoEnviado;

  ngOnInit() {
    const state = window.history.state as { idExhortoEnviado: number , idPromocionEnviado: number, numExhorto:string };
    //console.log (state)
    if (state && state.idExhortoEnviado) {
      this.idExhortoEnviado = state.idExhortoEnviado;
      this.numExhorto = state.numExhorto;
      if(state.idPromocionEnviado!=undefined){
        this.idPromocionEnviado = state.idPromocionEnviado;
      }


      this.catalogoGenero();
      this.catalogoTipoParte();
      this.getListadoTipoDocumento();

      if(this.idPromocionEnviado!=0){
        this.getDetallePromocionExhortoEnviado(this.idExhortoEnviado,this.idPromocionEnviado);
      }

      this.loadDetalles(this.idExhortoEnviado);


    } else {
      // Si no hay state, redirigir a la lista de amparos
      this.router.navigate(['/exhortos/detalles-exhorto-enviado']);
    }

    // Obtén el control 'moral' y verifica que no sea null
    const moralControl = this.promoventesForm.get('moral');
    if (moralControl) {
      moralControl.valueChanges.subscribe((isMoral) => {
        if (isMoral) {
          // Deshabilita campos cuando es moral
          this.paterno?.disable();
          this.materno?.disable();
          this.genero?.disable();
          this.promoventesForm.get('paterno')?.clearValidators();
          this.promoventesForm.get('genero')?.clearValidators();
        } else {
          // Habilita campos cuando no es moral
          this.paterno?.enable();
          this.materno?.enable();
          this.genero?.enable();

          this.promoventesForm.get('paterno')?.setValidators(Validators.required);
          this.promoventesForm.get('genero')?.setValidators(Validators.required);
        }

        // Actualiza el estado de validación de los campos afectados
        this.promoventesForm.get('paterno')?.updateValueAndValidity();
        this.promoventesForm.get('genero')?.updateValueAndValidity();
      });
    }
    
this.GetSeccionesUsuario();
this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());

  }


  progressValue: number = 0;

  observaciones: string = '';
  fechaOrigen: Date | null = null;
  nombreDocumento: string = '';
  fojas: number | null = null;

  listaGenero= signal<CatalogoGenero[]>([]);
  generoSelect!: CatalogoGenero;
  listaTipoParte= signal<CatalogoTipoParte[]>([]);
  tipoParteSelect!:CatalogoTipoParte;

  selectedTipoDocumento!: ListadoCatalogoTipoDocumento;
  listadoTipoDocumento: ListadoCatalogoTipoDocumento[] = [];

  promocionExhortoEnviadoGeneral: PromocionExhortoEnviado | undefined;

  hayCambiosSinGuardar: boolean = false;
  promoventeSinGuardar: boolean = false;

  marcarCambios() {
    this.hayCambiosSinGuardar = true;
  }

  /*marcarCambiosPromovente(){
    this.promoventeSinGuardar = true;
  }*/

    async loadDetalles(idExhortoEnviado: number){
        await this.cargarDetallesExhortoEnviado(idExhortoEnviado);
      }

cargarDetallesExhortoEnviado(idExhortoEnviado: number): Promise<void> {
    return new Promise((resolve, reject)=>{
      //console.log(idExhortoEnviado)
      this.isLoading=true;
      this.cd.detectChanges();
      this.ExhortosService.getExhortosEnviadosDetalle(idExhortoEnviado).subscribe({
        next:(response) => {
          //console.log('Datos recibidos:', response);
          setTimeout(() => {
            this.detallesExhortos.set(response.data); // Almacena los datos recibidos en la variable
            //this.detallesExhortosPromocion.set(response.data.promociones);
          });
        },
        error:(error) => {
          //console.error('Error al cargar detalle de notificación', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
          this.isLoading=false;
          this.cd.detectChanges();
        },
        complete:()=>{
          this.isLoading=false;
          this.cd.detectChanges();
        }
      });
    });
  }


  guardarPromocion(form: NgForm) {
    if(this.promoventeSinGuardar){
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha guardado el promovente',
        life: 3000
      });
      return
    }
    if (form.invalid) {
      //console.log('Formulario incorrecto');
      this.formSubmittedPromocion = true;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor rellene todos los campos.',
        life: 3000
      });
      return
    } else {
      this.formSubmittedPromocion = false;
    }

    // Verifica si la lista de promoventes está vacía
    if (this.provomenteExhortoEnviado.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe agregar al menos un promovente.',
        life: 3000
      });
      return;
    }
    this.confirmationService.confirm({
      key: 'guardarPromocion',
      accept: () => this.onGuardarPromocion(form),
      reject: () => { }
    });
  }

  onGuardarPromocion(form: NgForm){
    // Crea el objeto PromocionExhortoEnviado
    this.promocionExhortoEnviadoGeneral = {
      idExhortoEnviado: this.idExhortoEnviado,
      fojas: form.value.fojas,
      observaciones: form.value.observaciones,
      promoventes: this.provomenteExhortoEnviado,
      archivos : this.archivoPromocionExhortoEnviado,
      fechaHora : "",
      fechaRecepcion : "",
      idPromocionEnviado:this.idPromocionEnviado,
      folioOrigenPromocion:"",
      folioPromocionRecibida:"",
      fechaOrigen:""
    };


    this.guardarPromocionExhortoEnviado();

    
    //this.listaPromoventes = [];

    //this.confirmacionGuardarPromocionExhorto = false
    this.hayCambiosSinGuardar = false 

  }


  enviarPromocionArchivos(idPromocionEnviado : number, idExhortoEnviado:number){
  if(this.promoventeSinGuardar){
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha guardado el promovente',
        life: 3000
      });
      return
    }
    if (this.hayCambiosSinGuardar) {
    this.messageService.add({ severity: 'warn', summary: 'Guardar primero', detail: 'Debes guardar los cambios antes de enviar.' });
    return;
  }
  this.confirmationService.confirm({
      key: 'enviarArchivosPromocion',
      accept: () => this.onEnviarPromocionArchivos(idPromocionEnviado,idExhortoEnviado),
      reject: () => { }
    });
 }
 onEnviarPromocionArchivos(idPromocionEnviado : number, idExhortoEnviado:number){
  this.isLoading = true;
  this.cd.detectChanges();
  this.ExhortosService.enviarPromocionArchivos(idPromocionEnviado,).subscribe({
      next: (response:any) => {
        if(response.success){

          this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Promoción enviado' });
          this.archivosPromocionEnviado=true;
          this.archivoRecibidoPromocionConAcuse=response.data;
          //this.modalService.open('modal2');
          // Aquí podrías actualizar la lista de documentos si es necesario
        }
        else{
          this.messageService.add({severity:'error',summary: response.message, detail: response.errors,sticky:true});
        }

      },
      error:(e)=>{
        //console.error('Error al recibir el archivo', e);
        this.messageService.add({severity:'error',summary: 'Error', detail:e.message,sticky:true});
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete:() =>{
        this.isLoading = false;
        this.cd.detectChanges();
        this.router.navigate(['/inicio/exhortos/exhortos-enviados/detalle'], { state: { idExhortoEnviado } });
       // this.modalService.open('modal2');
      },
    });
 }

 
  enviarPromocionGenerales(idExhortoEnviado:number){
    if(this.promoventeSinGuardar){
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha guardado el promovente',
        life: 3000
      });
      return
    }
    if (this.hayCambiosSinGuardar) {
      this.messageService.add({ severity: 'warn', summary: 'Guardar primero', detail: 'Debes guardar los cambios antes de enviar.' });
      return;
    }
    this.confirmationService.confirm({
      key: 'enviarGeneralesPromocion',
      accept: () => this.onEnviarPromocionGenerales(idExhortoEnviado),
      reject: () => { }
    });
  }

  onEnviarPromocionGenerales(idExhortoEnviado:number) {
  if (!this.idPromocionEnviado) return;
    this.isLoading = true;
    this.cd.detectChanges();
    this.ExhortosService.enviarPromocionGenerales(this.idPromocionEnviado).subscribe({
    next: (response: any) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Datos generales enviados' });
          // Actualiza la tabla si es necesario
        } else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors,sticky:true });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message ,sticky:true});
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
        if(this.idPromocionEnviado!=0){
          this.getDetallePromocionExhortoEnviado(this.idExhortoEnviado,this.idPromocionEnviado);
        }
      }
    });
}

  /*abrirConfirmarAgregarPromovente(){
    this.confirmacionAgregarPromovente = true
  }*/
  AgregarPromovente(){
    this.confirmationService.confirm({
      key: 'agregarPromovente',
      accept: () => this.onAgregarPromovente(),
      reject: () => { }
    });
  }
  onAgregarPromovente(){
    if (!this.promoventesForm.valid) {
          ValidateForm.validateAllFormFields(this.promoventesForm);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algunos campos no son válidos' })
          return;
        }
    const telefono =(this.promoventesForm.value.telefono as string).replace(/[\(\)#\$-]/g, '');
    if (this.promoventesForm.invalid) {
      this.formSubmittedPromoventes = true;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Rellena el formulario del promovente' });
      //console.log('Promotor incorrecto', this.formSubmitted2);
      return;
    } else {
      this.formSubmittedPromoventes = false;
    }
    var genero={} as CatalogoGenero;
    genero=this.promoventesForm.value.genero as any;

    var tipoParte={} as CatalogoTipoParte;
    tipoParte=this.promoventesForm.value.tipoParte as any;

    const promovente: ProvomenteExhortoEnviado = {
      nombre:this.promoventesForm.value.nombre as string,
      apellidoPaterno:this.promoventesForm.value.paterno as string,
      apellidoMaterno:this.promoventesForm.value.materno as string,
      genero: (genero == undefined ? '' : genero.clave as string),
      esPersonaMoral: !!this.promoventesForm.value.moral,
      tipoParteNombre:tipoParte.descripcion,
      idTipoParte:tipoParte.idTipoParte,
      idPromoventeExhortoEnviado:0,
      idPromocionEnviado:0,
      correoElectronico:this.promoventesForm.value.correo as string,
     // telefono:this.promotoresForm.value.telefono as string,
     telefono : telefono,
      activo:true
    };

    this.provomenteExhortoEnviado.push(promovente);
    this.promoventesForm.reset();
    this.promoventeSinGuardar = false
    this.promoDialog=false;

  }

 
  catalogoGenero(){
    this.ExhortosService.getCatalogoGenero().subscribe({
      next: (response:any) => {
        if(response.success)
        {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaGenero.set(response.data);
        }
        else
        {
          this.messageService.add({severity: 'error', summary: response.message, detail:response.errors})
        }
      },
      complete:() =>{
        this.promoventeSinGuardar = false;
      },
      error:(e)=>
      {
        //console.error('Error al cargar el catálogo de género', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
      },
    });
  }

  catalogoTipoParte(){
    this.ExhortosService.getCatalogoTipoParte().subscribe({
      next: (response:any) => {
        if(response.success)
        {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaTipoParte.set(response.data);
        }
        else
        {
          this.messageService.add({severity: 'error', summary: response.message, detail:response.errors})
        }
      },
      complete:() =>{
        this.promoventeSinGuardar = false;
      },
      error:(e)=>
      {
        //console.error('Error al cargar el catálogo de género', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de tipo parte' });
      },

    });
  }

  /*onSelect(event: FileUploadEvent) {
    const file = event.files[0];

    if (event.files.length > 0) {
      this.nombreDocumento = file.name; // Establece el nombre del documento
    }

    //llamamos la funcion que valida si es un pdf
    if(!validaPdf(event.files[0])){
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo se permiten archivos PDF.',
        life: 3000
      });
      this.fileUpload.clear();
      return;
    }
    
  }*/

  onUpload(file: File) {
    if(this.doctosForm.valid){

        this.uploadedFiles.push(file);
        this.nombreDocumento = file.name;  // Establece el nombre del documento
        this.guardarDocumento(file);  // Llama a guardarDocumento para cada archivo subido
        //this.progressValue = 0; // Restablece el progreso al final de la carga
      // this.messageService.add({ severity: 'info', summary: 'Archivo cargado', detail: '' });
      
    }
    else
    {
      ValidateForm.validateAllFormFields(this.doctosForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tipo documento requerido' });
    }
    
  }

  guardarDocumento(file: File){
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
    if (!this.idPromocionEnviado) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se existe promoción' });
      return;
    }

    const formData = new FormData();
    formData.append('nombreArchivo',this.nombreDocumento);
    formData.append('tipoDocumento',tipoSeleccionado.idTipoDocumento.toString());
    formData.append('idExhortoEnviado', this.idExhortoEnviado.toString());
    formData.append('idPromocionEnviada', this.idPromocionEnviado.toString());
    formData.append('archivo', file, file.name);

    this.isLoading= true; // Inicia la carga
    this.cd.detectChanges(); // Asegura que el cambio de estado se refleje en la vista
    this.ExhortosService.postGuardarArchivosPromocionExhortoEnviado(formData).subscribe({
      next: (response) => {
          if (response.success) {

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Documento guardado correctamente.',
              life: 4000
            });
            this.getDetallePromocionExhortoEnviado(this.idExhortoEnviado, this.idPromocionEnviado);
          } else {
              this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message,sticky:true });
          }
      },
      error: (error) => {
          //console.error('Error en la petición guardar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message,sticky:true });
          this.isLoading= false; // cierra la carga
          this.cd.detectChanges(); // Asegura que el cambio de estado se refleje en la vista
      },
      complete: () => {
          this.isLoading= false; // cierra la carga
          this.cd.detectChanges(); // Asegura que el cambio de estado se refleje en la vista
      }
    });

  }

  /*onRemove(event: FileRemoveEvent) {
    this.nombreDocumento = '';
  }*/



  getListadoTipoDocumento(): void{
    this.ExhortosService.getCatalogoTipoDocumento().subscribe({
      next: (responseTipoDocumento: GenericResponse<ListadoCatalogoTipoDocumento[]>) =>{
        //console.log(responseTipoDocumento);
        this.listadoTipoDocumento = responseTipoDocumento.data;
      },
      error: (error) => {
        //console.log("Error al cargar los tipos de documentos", error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      }
    });
  }


  getDetallePromocionExhortoEnviado(idExhortoEnviado : number, idPromocionEnviado: number){
    this.ExhortosService.getDetallePromocionExhortoEnviado(idExhortoEnviado,idPromocionEnviado).subscribe({
      next: (responsePromocion: GenericResponse<PromocionExhortoEnviado>) =>{
        this.observaciones=responsePromocion.data.observaciones;
        this.fojas = responsePromocion.data.fojas;
        this.provomenteExhortoEnviado=responsePromocion.data.promoventes;

        //obtenemos el idUsuario del token
        const userData = this.tokenService.getUserFromToken();
        var idUsuario=0;
        if(userData !== null){
          idUsuario = userData.idGeneral;
        }
        const documentosValidados = validarFirmasUsuarioPromEnviado(responsePromocion.data.archivos,idUsuario);
        this.listaDocumentos.set(documentosValidados);

        //this.listaDocumentos.set(responsePromocion.data.archivos);
        this.fechaHora = responsePromocion.data.fechaHora
        this.fechaRecepcion = responsePromocion.data.fechaRecepcion
        //console.log('Respuesta de promocion'+responsePromocion)
        //this.listadoTipoDocumento = responsePromocion.data;
      },
      error:(error) => {
        //console.log("Error al cargar los tipos de documentos", error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message,sticky:true });
      }
    });
  }

  guardarPromocionExhortoEnviado(){
    if(this.idPromocionEnviado == 0){
      //Crea nuevo registro si no existe id de Promocion
      this.isLoading = true;
      this.cd.detectChanges();
      this.ExhortosService.postGuardarPromocionExhortoEnviado(this.promocionExhortoEnviadoGeneral!).subscribe({
        next: (response:any) => {
          if(response.success)
            {
              this.promocionGuardada = true;
              this.folioOrigenPromocion = response.data.folioOrigenPromocion;
              //this.idPromocionEnviada = response.data.idPromocionEnviada;
              this.idPromocionEnviado=  response.data.idPromocionEnviado;
              const newState = {
                idExhortoEnviado: this.idExhortoEnviado,    // nuevo valor para idExhortoEnviado
                idPromocionEnviado: this.idPromocionEnviado,    // nuevo valor para idPromocionEnviado
                numExhorto: this.numExhorto
              };
              
              // Reemplazar el estado actual con el nuevo estado
              window.history.replaceState(newState, '');

              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Promoción guardada exitosamente con folio: ' + this.folioOrigenPromocion,
                life: 4000
              });
              this.getDetallePromocionExhortoEnviado(this.idExhortoEnviado,this.idPromocionEnviado);
            }
            else
            {
              this.messageService.add({severity: 'error', summary: response.message, detail:response.errors,sticky:true});
            }
          },
          error:(e) => {
            //console.error('Error al guardar la promoción', e);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message,sticky:true });
            this.isLoading = false;
            this.cd.detectChanges();
          },
          complete:() =>{
            this.isLoading = false;
            this.cd.detectChanges();
        }
      });
    }else{
        //Guarda o actualiza si existe id de promocion 
        this.isLoading = true;
        this.cd.detectChanges();
        this.ExhortosService.postActualizarPromocion(this.promocionExhortoEnviadoGeneral!).subscribe({
        next: (response:any) => {
          if(response.success)
            {
              this.promocionGuardada = true;
              const newState = {
                idExhortoEnviado: this.idExhortoEnviado,    // nuevo valor para idExhortoEnviado
                idPromocionEnviado: this.idPromocionEnviado    // nuevo valor para idPromocionEnviado
              };
              
              // Reemplazar el estado actual con el nuevo estado
              window.history.replaceState(newState, '');

              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Promoción guardada exitosamente con folio: ' + this.folioOrigenPromocion,
                life: 4000
              });
              this.getDetallePromocionExhortoEnviado(this.idExhortoEnviado,this.idPromocionEnviado);
            }
            else
            {
              this.messageService.add({severity: 'error', summary: response.message, detail:response.errors,sticky:true});
            }
          },
          error:(e) => {
            //console.error('Error al guardar la promoción', e);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message ,sticky:true});
            this.isLoading = false;
            this.cd.detectChanges();
          },
          complete:() =>{
            this.isLoading = false;
            this.cd.detectChanges();
        }
      });
      }
  }

  archivo_seleccionado(item:any){
    item.selecParaFirma=!item.selecParaFirma;

    //ponemos un señal para saber cuando se haya seleccionado al menos una fila para firmar
    //Verifica si al menos un archivo está seleccionado
    const algunoSeleccionado = this.listaDocumentos().some(a => a.selecParaFirma);
    this.seleccionadosParaFirma.set(algunoSeleccionado);
  }

  //Firmado -...

  openModal() {
    //this.modal.openModal();
  }

  /*cerrarVentanaModal(){
    if(this.archivos_firmados == this.contador_firmas){
      this.modal.closeModal();
    }
  }*/

  onFileSelected(event: any){
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

}
validarContraseñaPFX(password : string): Promise<boolean> {
  return new Promise((resolve, reject) => {
        //validamos que la contraseña sea correcta
        //validaFirma(formData: FormData)
        var userData = this.tokenService.getUserFromToken();
        const validaFirmaRequest={
          idUsuario: userData.idGeneral,
          password: password
        };
        this.isLoading=true;
        //Validar contraseña PFX
        this.ExhortosService.validaFirmaPFX(validaFirmaRequest).subscribe({
          next:(response:any) =>{
            if (response.success) {
              //this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento firmado exitosamente' });
              resolve(true); //resolve cuando se requiere que el flujo continue

            } else {
              this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${ response.errors == undefined ? "" :  response.errors.join(", ")}`});
              //this.cerrarVentanaModal();
              reject(false); //reject es cuando se desea sali del flujo, ya no requere que se continue.
              
            }
          },
          error:(e) => {
            //console.error('Error al guardar el documento Firmado en el NAS', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
            this.isLoading=false
            reject(false);
          },
          complete:()=>{
            this.isLoading=false
          }
        });
      });
  }
async iniciarFirmaDocumentos(){

  this.archivos_firmados = 0;
  if(this.formularioFirma.valid)
    {
      const esvalido = await this.validarContraseñaPFX(this.formularioFirma.value.password as string); 
      //if(this.archivo_pfx_valido){
      if(esvalido){
        var userData = this.tokenService.getUserFromToken();
        //const FormValues = this.formDocumentos.value;
        const seleccionado = this.listaDocumentos().filter(item => item.selecParaFirma); //Obtenemos los checkbox seleccinados para firmar
        if(seleccionado.length >0 ){
          this.contador_firmas = seleccionado.length;
            for(let i = 0; i<seleccionado.length; i++){
              seleccionado[i].idArchivo;
               
               //this.FirmarDocumentos(seleccionado[i].idArchivo);
                await this.FirmarDocumentos(userData.idGeneral,seleccionado[i].idArchivo,5,this.formularioFirma.value.password as string);
                this.archivos_firmados++;
            }
            this.seleccionadosParaFirma.set(false); //apagamos la señal para ocultar el boton firmar
            this.getDetallePromocionExhortoEnviado(this.idExhortoEnviado, this.idPromocionEnviado);
            //this.cerrarVentanaModal();
            this.firmaDialog=false;

        }
        else{
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Selecciona el o los archivos que deseas firmar.' });
        }

      }else{
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Archivo PFX invalido.' });
      }
    }
    else{
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Ingrese la información solicitada.' });
    }



}
 //Nueva funcion para firmar documentos, solo se debe de guardar el id de documento que se va a firmar,
// y el idGeneral del usuario que firma
FirmarDocumentos(idUsuario:number,idArchivo:number, idClasificacionArchivo:number, password:string): Promise<boolean>{
return new Promise((resolve, reject) => {
  const guardaFirmaTmpRequest= {
      idUsuario: idUsuario,
      idArchivo: idArchivo,
      idClasificacionArchivo: idClasificacionArchivo,
      passwordFirma: password
  };
  this.isLoading=true;
  //console.log(guardaFirmaTmpRequest);
  this.ExhortosService.guardaFirmaTemporal(guardaFirmaTmpRequest).subscribe({
    next:(response:any)=>{
      if(response.success)
      {
        
        this.messageService.add({ severity: 'success', summary: 'éxito', detail: 'Firma temporal aplicada' });
        resolve(true);
      }
      else
      {
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: `${response.message}\n${ response.errors == undefined ? "" : response.errors.join(", ")}`});
        resolve(false);
      }
    },
    error:(e)=>{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
      this.isLoading=false;
      reject(false);
    },
    complete:()=>{
      this.isLoading=false;
    }
  })

  });
}

resetForm() {
  this.nombreDocumento = '';
  //this.catalogoSelect = null;
}
/*
showDialog(idArchivo: number): void {
    this.ExhortosService.getFile(idArchivo,4).subscribe({
      next: (response:any) => {

        if(response.success){
          const fileData = response.data.documento;
          const nombre= response.data.fileName;
          const ext= nombre.split('.')[1];
          downloadBase64(fileData, nombre,ext );

        }
        else{
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
        }
      },
      error:(e)=>{
        //console.error('Error al recibir el archivo', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
      },
      complete:()=>{
        console.log('FIN:');
      }
    });
  }
*/
  /*abrirConfirmacionEliminar(idArchivo: number){
    this.idArchivo = idArchivo;

  }*/
 onEliminarIndex(index: number): void {
    this.listaDocumentos().splice(index, 1);
  } 
  eliminarDocumento(documento: archivoPromocionExhortoEnviado, index:number){
    if(documento === null)
      return;

    this.confirmationService.confirm({
      key: 'eliminarArchivo',
      accept: () => this.onEliminarDocumento(documento,index),
      reject: () => { }
    });
  }

  onEliminarDocumento(documento: archivoPromocionExhortoEnviado,index:number) {
    //validamos si idArchivo no trae nada, quiere decir que son archivos nuevos que no se han guardado y se 
    //eliminan solo en el array, sin llamar la api
    if(documento.idArchivo == 0)
    {
      this.onEliminarIndex(index);
    }
    else{
        this.isLoading=true;
        this.cd.detectChanges();
        const tipo = 4; // Puedes cambiar este valor según sea necesario
        this.ExhortosService.eliminarArchivo(documento.idArchivo, tipo).subscribe({
          next: (response) => {
            if(response.success){
              /*this.uploadedFiles = this.uploadedFiles.filter(archivo => {
                (archivo.idArchivo !== documento.idArchivo);
              });*/
              // Encuentra el índice del documento que quieres eliminar
              const index = this.listaDocumentos().findIndex(doc => doc.idArchivo === documento.idArchivo);
              if (index !== -1) {
                // Elimina el elemento del arreglo
                this.listaDocumentos().splice(index, 1);
              }
              this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Documento eliminado exitosamente' });
              // Aquí podrías actualizar la lista de documentos si es necesario
            }
            else{
              this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
            }
          },
          error: (error) => {
            //console.error('Error al eliminar el documento', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            this.isLoading=false;
            this.cd.detectChanges();
          },
          complete:()=>{
            this.idArchivo=null;
            this.isLoading=false;
            this.cd.detectChanges();
          }
        }); 
    }
      
  }

  eliminarParte(partes: ProvomenteExhortoEnviado) {
    //console.log('Eliminar parte:', partes);
    // console.log('Promoventes: ', this.provomenteExhortoEnviado)
    if (partes.idPromocionEnviado === 0 || partes.idPromoventeExhortoEnviado === 0) {
      // Si aún no ha sido guardado en la BD, lo eliminamos de la lista
      this.provomenteExhortoEnviado = this.provomenteExhortoEnviado.filter(p => p !== partes);
      this.messageService.add({ severity: 'info', summary: 'Parte eliminada', detail: 'La parte fue eliminada de forma local' });
    } else {
      // Si ya existe en BD, lo marcamos como inactivo
      partes.activo = false;
      this.messageService.add({ severity: 'info', summary: 'Partes deshabilitada', detail: 'La parte fue marcada como inactiva' });
    }
  }

  GetSeccionesUsuario(): Promise<void>{
    return new Promise((resolve, reject) => {
    const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
    const perfilSeleccionado = this.authService.getPerfilSeleccionado();
      //const idAreaSistemaUsuario = localStorage.getItem('idAreaSistemaUsuario');
    //const perfilSeleccionado = localStorage.getItem('perfilSeleccionado');
    this.authService.GetSeccionesUsuario(idAreaSistemaUsuario,this.idPantalla.toString(),perfilSeleccionado)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.secciones = res.data;
                if(this.secciones === null || this.secciones === undefined){
                    this.tienePermisoGuardar.set(false);
                    this.tienePermisoEnviarGenerales.set(false);
                    this.tienePermisoEnviarArchvios.set(false);
                    this.tienePermisoSeleccionarArchivo.set(false);
                    this.tienePermisoCargarArchivo.set(false);
                    this.tienePermisoFirmarArchivo.set(false);
                    this.tienePermisoEliminarArchivo.set(false);
                }
                else if(this.secciones.length > 0 ){
                  this.tienePermisoGuardar.set(this.secciones.some(s => s.descripcion === 'Guardar'));
                  this.tienePermisoEnviarGenerales.set(this.secciones.some(s => s.descripcion === 'EnviarGenerales'));
                  this.tienePermisoEnviarArchvios.set(this.secciones.some(s => s.descripcion === 'EnviarArchivos'));
                  this.tienePermisoSeleccionarArchivo.set(this.secciones.some(s => s.descripcion === 'SeleccionarArchivo'));
                  this.tienePermisoCargarArchivo.set(this.secciones.some(s => s.descripcion === 'CargarArchivo'));
                  this.tienePermisoFirmarArchivo.set(this.secciones.some(s => s.descripcion === 'FirmarArchivo'));
                  this.tienePermisoEliminarArchivo.set(this.secciones.some(s => s.descripcion === 'EliminarArchivo'));  
                }
          } else {
            this.messageService.add({ severity: 'error', summary: res.message, detail: res.errors });
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
   eliminarFirma(idFirmaTmp:number, idArchivo:number){
    this.isLoading=true;
    this.cd.detectChanges();
    this.ExhortosService.eliminarUnaFirma(idFirmaTmp).subscribe({
      next:(response:any)=>{
          if(response.success)
          {
            // Encuentra el índice del documento que quieres eliminar
            const index = this.listaDocumentos().findIndex(doc => doc.idArchivo === idArchivo);
            if (index !== -1) {
              const indexFirmas = this.listaDocumentos()[index].firmantes.findIndex(f=>f.idFirmaTmp==idFirmaTmp);
              if(indexFirmas !== -1)
              {
                // Elimina el elemento del arreglo
                this.listaDocumentos()[index].firmantes.splice(indexFirmas, 1);
                //obtenemos el idUsuario del token
                const userData = this.tokenService.getUserFromToken();
                var idUsuario=0;
                if(userData !== null){
                  idUsuario = userData.idGeneral;
                }
                const documentosValidados = validarFirmasUsuarioPromEnviado(this.listaDocumentos(),idUsuario);
                this.listaDocumentos.set(documentosValidados);

              }
            }
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
          }
          else{
            this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${ response.errors==undefined ? "" : response.errors.join(", ")}`});
          }
      },
      error:(e)=>{
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  /* abrirConfirmarAplicarFirmas(idArchivo:number){
    this.idArchivo=idArchivo;

  }*/
 /*aplicarFirmas(idArchivo:number) {
    this.confirmationService.confirm({
      key: 'aplicarFirmas',
      accept: () => this.onAplicarFirmas(idArchivo),
      reject: () => { }
    });
  }*/
  aplicarFirmas(idArchivo:number){
    if(idArchivo ===null)
      return;

    this.confirmationService.confirm({
      key: 'aplicarFirmas',
      accept: () => this.onAplicarFirmas(idArchivo),
      reject: () => { }
    });
  }
  onAplicarFirmas(idArchivo:number){
    this.isLoading=true;
    this.cd.detectChanges();
    this.ExhortosService.aplicarFirmasPromocion(idArchivo).subscribe({
      next:(response:any)=>{
          if(response.success){
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
            this.getDetallePromocionExhortoEnviado(this.idExhortoEnviado, this.idPromocionEnviado);
          }else{
            this.messageService.add({ severity: 'warn', summary: 'error', detail: `${response.message}\n${ response.errors==undefined ? "" : response.errors.join(", ")}`});
          }
      },
      error:(e)=>{
        this.messageService.add({ severity: 'error', summary: 'error', detail: e.message });
        this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  togglePasswordVisibility(){
    this.showPassword = !this.showPassword;
  }
  openNewPromovente() {
    this.formSubmittedPromoventes = false;
    this.promoDialog = true;
  }
  hideDialogPromovente(){
    this.promoDialog=false;
    this.formSubmittedPromoventes= false;
  }
  hideDialogFirma(){
    this.firmaDialog=false;

  }
  openNewFirma(){
    this.firmaDialog = true;
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
  
        const nuevo: archivoPromocionExhortoEnviado = {
          idArchivo: 0,
          idPromocionEnviada: this.idPromocionEnviado ?? 0,
          nombreArchivo: file.name,
          hashSha1: '',
          hashSha256: '',
          idTipoDocumento: 0,
          tipoDocumento: { idTipoDocumento: 0, nombre: '', activo: false },
          tamanio: file.size ?? 0,
          paginas: 0,
          enviado: false,
          idClasificacionArchivo: 0,
          ruta: '',
          firmado: false,
          fechaFirmado: null as any,
          activo: true,
          selecParaFirma: false,
          firmantes: [],
          file:file,
          usrYaFirmo:false
        };
  
        // Añadir campo auxiliar `tam` que se usa en otras partes del componente
        // @ts-ignore
        nuevo.tam = file.size ?? 0;
  
        this.listaDocumentos().push(nuevo);
      }
    }
    getFile(documento: archivoPromocionExhortoEnviado, tipoDocumento: number): void {
        const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
        if(documento.idArchivo ==0) // son archivos que no se han guardado
        {
          if(documento.tamanio<= FIVE_MB && documento.nombreArchivo.split('.')[1]==='pdf')
            this.onVerDocumentoFile(documento.file); // se visualiza en modal
          else
          { 
            downloadFile(documento.file); // se descarga
          }
             
          
        }
        else{ // aqui ya son archivos guardados
          this.isLoading=true;
          this.cd.detectChanges();
          this.ExhortosService.getFile(documento.idArchivo,tipoDocumento).subscribe({
            next: (response:any) => {
    
            if (response.success) {
              const fileData = response.data.documento;
              //console.log(fileData);
                if(documento.tamanio<= FIVE_MB && response.data.fileName.split('.')[1]==='pdf' )
                  this.onVerDocumentoBase64(fileData,documento.nombreArchivo, 'application/pdf'); // se visualiza en modal
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
              this.isLoading=false;
              this.cd.detectChanges();
            },
            complete:()=>{
              //console.log('FIN:');
              this.isLoading=false;
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
      onVerDocumentoBase64(fileBase64: string, nombre:string, mime:string): void {
          const file = base64ToFile(fileBase64,nombre, mime);
          if (file instanceof File) {
            const url = URL.createObjectURL(file);
            //this.nombre = file.name;
            this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.mostrarDocumento.set(true);
          } else {
            console.error('Documento inválido');
          } 
        }
  validarTelefonoPromo() {
    if (!this.promoventesForm.value.telefono || this.promoventesForm.value.telefono.length !== 10) { //
      this.promoventesForm.get('telefono')?.setErrors({ 'invalidPhone': true, 'message': 'El teléfono debe tener 10 dígitos.' });
    }

  }
}



import { Component, inject, ViewChild, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { FileRemoveEvent, FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { FormControl, FormGroup, NgForm, Validators,FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";
import { SelectModule} from 'primeng/select';
import {ButtonModule} from 'primeng/button';
import { TokenService } from '../../../core/auth/service/token.service';
import {ExhortosService} from '../../services/exhorto.service';
import { AuthService } from '../../../core/auth/service/auth.service';
import { archivoPromocionExhortoEnviado, ArchivoRecibidoPromocionConAcuse, CatalogoGenero, CatalogoTipoParte, ListadoCatalogoTipoDocumento, PromocionExhortoEnviado, ProvomenteExhortoEnviado } from '../../interfaces/exhortos.model';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { downloadBase64, validaPdf } from '../../../shared/functions/utils';
import ValidateForm from '../../../helpers/validateform';

import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { InputNumber } from "primeng/inputnumber";
import {CommonModule} from '@angular/common';
import { ProgressBar } from "primeng/progressbar";
import { Message } from "primeng/message";




@Component({
  selector: 'app-PromocionExhortoEnviadoComponent',
  imports: [Toast, ConfirmDialog, ButtonModule, InputNumber, CommonModule, FormsModule, ReactiveFormsModule, SelectModule, FileUpload, ProgressBar, Message],
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
  folioOrigenPromocion: string = '';
  provomenteExhortoEnviado : ProvomenteExhortoEnviado[] =[];
  archivoPromocionExhortoEnviado : archivoPromocionExhortoEnviado[]=[];
  formSubmittedPromocion: boolean = false;
  formSubmitted2: boolean = false;
  formSubmitted3: boolean = false;
  promocionGuardada: boolean = false;
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

    //boolean modal de confirmacion
    /*confirmacionGuardarPromocionExhorto:boolean = false
    confirmacionAgregarPromovente: boolean = false
    confirmacionEliminar: boolean = false
    confirmacionEnvioPromociones: boolean = false
    mostrarConfirmacionEnvioGenerales: boolean = false
    confirmacionAplicarFirmas:boolean=false;
    */

    fechaHora: string | undefined 
    fechaRecepcion: string | undefined
    
    archivoRecibidoPromocionConAcuse! :ArchivoRecibidoPromocionConAcuse;
  archivosPromocionEnviado : boolean = false;

  formularioFirma = new FormGroup({
    password : new FormControl(''),
    file_pfx : new FormControl(''),

  });

  formDocumentos = new FormGroup({
    firmado_checkbox  : new FormControl(''),
    });

     emailControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  promotoresForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    paterno: new FormControl('', Validators.required),
    materno: new FormControl(''),
    genero: new FormControl(''),
    moral: new FormControl(false),
    tipoParte: new FormControl('',Validators.required),
    telefono: new FormControl(''),
    correo: new FormControl('')
  });

  doctosForm= new FormGroup({
    tipoDocumento: new FormControl(0,Validators.required),
  })

  //Asignar el id de la pantalla, para poder obtener las secciones(permisos) de esta pantalla
  idPantalla=14196;
  
  secciones : secciones[] = [] ;
  responseSecciones!: GenericResponse<secciones[]>;
  
  private perfilSeleccionadoService = inject(AuthService);
  perfilSeleccionado! : Signal<string>;
  idArchivo:number | null = null;

  //Se declaran las variables para la visualizacion de las secciones
  tienePermisoGuardar = false;
  tienePermisoEnviarGenerales = false;
  tienePermisoEnviarArchvios = false;
  tienePermisoSeleccionarArchivo = false;
  tienePermisoCargarArchivo = false;
  tienePermisoFirmarArchivo = false;
  tienePermisoEliminarArchivo = false;
  
  loading = false;
  seleccionadosParaFirma= signal(false);
  showPassword: boolean = false;
formatEmail() {
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
  }

  get paterno() {
    return this.promotoresForm.get('paterno');
  }

  get materno() {
    return this.promotoresForm.get('materno');
  }

  get genero() {
    return this.promotoresForm.get('genero');
  }

  listaDocumentos : archivoPromocionExhortoEnviado[]=[];
  documento!:archivoPromocionExhortoEnviado;

  ngOnInit() {
    const state = window.history.state as { idExhortoEnviado: number , idPromocionEnviado: number};
    //console.log (state)
    if (state && state.idExhortoEnviado) {
      this.idExhortoEnviado = state.idExhortoEnviado;
      if(state.idPromocionEnviado!=undefined){
        this.idPromocionEnviado = state.idPromocionEnviado;
      }


      this.catalogoGenero();
      this.catalogoTipoParte();
      this.getListadoTipoDocumento();

      if(this.idPromocionEnviado!=0){
        this.getDetallePromocionExhortoEnviado(this.idExhortoEnviado,this.idPromocionEnviado);
      }

    } else {
      // Si no hay state, redirigir a la lista de amparos
      this.router.navigate(['/inicio/exhortos-enviados']);
    }

    // Obtén el control 'moral' y verifica que no sea null
    const moralControl = this.promotoresForm.get('moral');
    if (moralControl) {
      moralControl.valueChanges.subscribe((isMoral) => {
        if (isMoral) {
          // Deshabilita campos cuando es moral
          this.paterno?.disable();
          this.materno?.disable();
          this.genero?.disable();
          this.promotoresForm.get('paterno')?.clearValidators();
          this.promotoresForm.get('genero')?.clearValidators();
        } else {
          // Habilita campos cuando no es moral
          this.paterno?.enable();
          this.materno?.enable();
          this.genero?.enable();

          this.promotoresForm.get('paterno')?.setValidators(Validators.required);
          this.promotoresForm.get('genero')?.setValidators(Validators.required);
        }

        // Actualiza el estado de validación de los campos afectados
        this.promotoresForm.get('paterno')?.updateValueAndValidity();
        this.promotoresForm.get('genero')?.updateValueAndValidity();
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

  listaGenero: CatalogoGenero[]=[];
  generoSelect!: CatalogoGenero;
  listaTipoParte:CatalogoTipoParte[]=[];
  tipoParteSelect!:CatalogoTipoParte;

  selectedTipoDocumento!: ListadoCatalogoTipoDocumento;
  listadoTipoDocumento: ListadoCatalogoTipoDocumento[] = [];

  promocionExhortoEnviadoGeneral: PromocionExhortoEnviado | undefined;

  hayCambiosSinGuardar: boolean = false;
  promoventeSinGuardar: boolean = false;

  marcarCambios() {
    this.hayCambiosSinGuardar = true;
  }

  marcarCambiosPromovente(){
    this.promoventeSinGuardar = true;
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
          this.messageService.add({severity:'error',summary: response.message, detail: response.errors});
        }

      },
      error:(e)=>{
        //console.error('Error al recibir el archivo', e);
        this.messageService.add({severity:'error',summary: 'Error', detail:e.message});
      },
      complete:() =>{
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

  this.ExhortosService.enviarPromocionGenerales(this.idPromocionEnviado).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Datos generales enviados' });
        // Actualiza la tabla si es necesario
      } else {
        this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
      }
    },
    error: (e) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
    },
    complete: () => {
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
    const telefono =(this.promotoresForm.value.telefono as string).replace(/[\(\)#\$-]/g, '');
    if (this.promotoresForm.invalid) {
      this.formSubmitted2 = true;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Rellena el formulario del promovente' });
      //console.log('Promotor incorrecto', this.formSubmitted2);
      return;
    } else {
      this.formSubmitted2 = false;
    }
    var genero={} as CatalogoGenero;
    genero=this.promotoresForm.value.genero as any;

    var tipoParte={} as CatalogoTipoParte;
    tipoParte=this.promotoresForm.value.tipoParte as any;

    const promovente: ProvomenteExhortoEnviado = {
      nombre:this.promotoresForm.value.nombre as string,
      apellidoPaterno:this.promotoresForm.value.paterno as string,
      apellidoMaterno:this.promotoresForm.value.materno as string,
      genero: (genero == undefined ? '' : genero.clave as string),
      esPersonaMoral: !!this.promotoresForm.value.moral,
      tipoParteNombre:tipoParte.descripcion,
      idTipoParte:tipoParte.idTipoParte,
      idPromoventeExhortoEnviado:0,
      idPromocionEnviado:0,
      correoElectronico:this.promotoresForm.value.correo as string,
     // telefono:this.promotoresForm.value.telefono as string,
     telefono : telefono,
      activo:true
    };

    this.provomenteExhortoEnviado.push(promovente);
    this.promotoresForm.reset();
    this.promoventeSinGuardar = false

  }

  limpiarPromovente(){
    this.promoventeSinGuardar = false

    this.promotoresForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    paterno: new FormControl('', Validators.required),
    materno: new FormControl(''),
    genero: new FormControl(''),
    moral: new FormControl(false),
    tipoParte: new FormControl('',Validators.required),
    telefono: new FormControl(''),
    correo: new FormControl('')
  });

  }


  catalogoGenero(){
    this.ExhortosService.getCatalogoGenero().subscribe({
      next: (response:any) => {
        if(response.success)
        {
          //console.log('Datos recibidos del catálogo:', response);
          this.listaGenero = response.data;
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
          this.listaTipoParte = response.data;
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

  onSelect(event: FileUploadEvent) {
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
    
  }

  onUpload(event: FileUploadEvent) {
    if(this.doctosForm.valid){

        for (let file of event.files) {
        this.uploadedFiles.push(file);
        this.nombreDocumento = file.name;  // Establece el nombre del documento
        this.guardarDocumento(file);  // Llama a guardarDocumento para cada archivo subido
        this.progressValue = 0; // Restablece el progreso al final de la carga
      // this.messageService.add({ severity: 'info', summary: 'Archivo cargado', detail: '' });
      }
    }
    else
    {
      ValidateForm.validateAllFormFields(this.doctosForm);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tipo documento requerido' });
      return;
    }
    this.doctosForm.reset(); // Restablece el formulario después de la carga
    this.nombreDocumento = ''; // Limpia el nombre del documento
    this.fileUpload.clear(); // Limpia el archivo seleccionado

  }

  guardarDocumento(file: File){


    const formData = new FormData();
    formData.append('nombreArchivo',this.nombreDocumento);
    formData.append('tipoDocumento',this.selectedTipoDocumento.idTipoDocumento.toString());
    formData.append('idExhortoEnviado', this.idExhortoEnviado.toString());
    formData.append('idPromocionEnviada', this.idPromocionEnviado.toString());
    formData.append('archivo', file, file.name);

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
              this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
          }
      },
      error: (error) => {
          //console.error('Error en la petición guardar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      }
    });

  }

  onRemove(event: FileRemoveEvent) {
    this.nombreDocumento = '';
  }



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
        this.listaDocumentos = responsePromocion.data.archivos;
        this.fechaHora = responsePromocion.data.fechaHora
        this.fechaRecepcion = responsePromocion.data.fechaRecepcion
        //console.log('Respuesta de promocion'+responsePromocion)
        //this.listadoTipoDocumento = responsePromocion.data;
      },
      error:(error) => {
        //console.log("Error al cargar los tipos de documentos", error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      }
    });
  }

  guardarPromocionExhortoEnviado(){
    if(this.idPromocionEnviado == 0){
      //Crea nuevo registro si no existe id de Promocion
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
              this.messageService.add({severity: 'error', summary: response.message, detail:response.errors});
            }
          }
        })
      }else{
        //Guarda o actualiza si existe id de promocion 
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
              this.messageService.add({severity: 'error', summary: response.message, detail:response.errors});
            }
          }
        })
      }
  }

  archivo_seleccionado(item:any){
    item.selecParaFirma=!item.selecParaFirma;

    //ponemos un señal para saber cuando se haya seleccionado al menos una fila para firmar
    //Verifica si al menos un archivo está seleccionado
    const algunoSeleccionado = this.listaDocumentos.some(a => a.selecParaFirma);
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
            reject(false);
          },
          complete:()=>{

          }
        });
      });
  }
async iniciarFirmaDocumentos(){
  this.isLoading = true;
  this.archivos_firmados = 0;
  if(this.formularioFirma.valid)
    {
      const esvalido = await this.validarContraseñaPFX(this.formularioFirma.value.password as string); 
      //if(this.archivo_pfx_valido){
      if(esvalido){
        var userData = this.tokenService.getUserFromToken();
        const FormValues = this.formDocumentos.value;
        const seleccionado = this.listaDocumentos.filter(item => item.selecParaFirma); //Obtenemos los checkbox seleccinados para firmar
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
    this.isLoading = false;


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
      reject(false);
    },
    complete:()=>{

    }
  })

  });
}

resetForm() {
  this.nombreDocumento = '';
  //this.catalogoSelect = null;
}

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

  /*abrirConfirmacionEliminar(idArchivo: number){
    this.idArchivo = idArchivo;

  }*/
  EliminarArchivo(idArchivo: number){
    if(idArchivo === null)
      return;

    this.confirmationService.confirm({
      key: 'eliminarArchivo',
      accept: () => this.onEliminarArchivo(idArchivo),
      reject: () => { }
    });
  }

  onEliminarArchivo( idArchivo: number) {
    
        const tipo = 4; // Puedes cambiar este valor según sea necesario
        this.ExhortosService.eliminarArchivo(idArchivo, tipo).subscribe({
          next: (response) => {
            if(response.success){
              this.uploadedFiles = this.uploadedFiles.filter(archivo => {
                (archivo.idArchivo !== idArchivo);
              });
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
          },
          complete:()=>{
            this.idArchivo=null;
          }
        }); 

      
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
    const idAreaSistemaUsuario = localStorage.getItem('idAreaSistemaUsuario');
    const perfilSeleccionado = localStorage.getItem('perfilSeleccionado');
    this.authService.GetSeccionesUsuario(idAreaSistemaUsuario,this.idPantalla.toString(),perfilSeleccionado)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.secciones = res.data;
                if(this.secciones === null || this.secciones === undefined){
                    this.tienePermisoGuardar = false;
                    this.tienePermisoEnviarGenerales = false;
                    this.tienePermisoEnviarArchvios = false;
                    this.tienePermisoSeleccionarArchivo = false;
                    this.tienePermisoCargarArchivo = false;
                    this.tienePermisoFirmarArchivo = false;
                    this.tienePermisoEliminarArchivo = false;
                }
                else if(this.secciones.length > 0 ){
                  this.tienePermisoGuardar = this.secciones.some(s => s.descripcion === 'Guardar');
                  this.tienePermisoEnviarGenerales = this.secciones.some(s => s.descripcion === 'EnviarGenerales');
                  this.tienePermisoEnviarArchvios = this.secciones.some(s => s.descripcion === 'EnviarArchivos');
                  this.tienePermisoSeleccionarArchivo = this.secciones.some(s => s.descripcion === 'SeleccionarArchivo');
                  this.tienePermisoCargarArchivo = this.secciones.some(s => s.descripcion === 'CargarArchivo');
                  this.tienePermisoFirmarArchivo = this.secciones.some(s => s.descripcion === 'FirmarArchivo');
                  this.tienePermisoEliminarArchivo = this.secciones.some(s => s.descripcion === 'EliminarArchivo');  
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
    this.ExhortosService.eliminarUnaFirma(idFirmaTmp).subscribe({
      next:(response:any)=>{
          if(response.success)
          {
            // Encuentra el índice del documento que quieres eliminar
            const index = this.listaDocumentos.findIndex(doc => doc.idArchivo === idArchivo);
            if (index !== -1) {
              const indexFirmas = this.listaDocumentos[index].firmantes.findIndex(f=>f.idFirmaTmp==idFirmaTmp);
              if(indexFirmas !== -1)
              {
                // Elimina el elemento del arreglo
                this.listaDocumentos[index].firmantes.splice(indexFirmas, 1);

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
      },
      complete:()=>{

      }
    });
  }
  /* abrirConfirmarAplicarFirmas(idArchivo:number){
    this.idArchivo=idArchivo;

  }*/
  AplicarFirmas(idArchivo:number){
    if(idArchivo ===null)
      return;

    this.confirmationService.confirm({
      key: 'aplicarFirmas',
      accept: () => this.onAplicarFirmas(idArchivo),
      reject: () => { }
    });
  }
  onAplicarFirmas(idArchivo:number){
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
      },
      complete:()=>{

      }
    });
  }
  togglePasswordVisibility(){
    this.showPassword = !this.showPassword;
  }
}

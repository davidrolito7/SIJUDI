import { ChangeDetectorRef, Component, computed, inject, Signal, signal } from '@angular/core';
import { CONATRIB_ExhortosRecibidosArchivos, DetalleExhortoRecibidoResponseI, promocionExhortos, respuestaExhorto, VerMovimientosResponse } from '../../interfaces/exhortos.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IncompetenciaDialog } from "../incompetencia/incompetencia-dialog";
import { ButtonModule } from "primeng/button";
import {TableModule, TableRowCollapseEvent, TableRowExpandEvent} from 'primeng/table';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { AuthService } from '../../../core/auth/service/auth.service';
import { ExhortosService } from '../../services/exhorto.service';
import { MessageService,ConfirmationService } from 'primeng/api';
import generateExRecibidosPDF from '../../reportes/rptExhortosRecibidos';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { base64ToFile, downloadBase64 } from '../../../shared/functions/utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { secciones } from '../../../core/auth/interface/login.interfaces';
import { Toast } from "primeng/toast";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { TokenService } from '../../../core/auth/service/token.service';
import { TagModule } from "primeng/tag";

@Component({
  selector: 'app-detallesExhortosRecibidos',
  imports: [TagModule, IncompetenciaDialog, ButtonModule, ConfirmDialog, CommonModule, TableModule, PdfDialog, Toast, Spinner],
  templateUrl: './detalles-exhorto-recibido.html',
  styleUrl: './detalles-exhorto-recibido.css',
  providers:[MessageService,ConfirmationService]
})
export class DetallesExhortoRecibido {

  //Se declaran las variables para la visualizacion de las secciones
  tienePermisoReasignarExhorto = signal<boolean>(true);
  tienePermisoRecibir = signal<boolean>(false);
  tienePermisoTurnar = signal<boolean>(false);
  tienePermisoRevocar = signal<boolean>(false);
  tienePermisoGenerarAcuerdo = signal<boolean>(false);
  tienePermisoVerAcuerdo = signal<boolean>(false);
  tienePermisoDeclararIncompetencia = signal<boolean>(false);

  //señales para controlar botones de turnos
  puedeRecibir = signal<boolean>(false);
  puedeTurnar = signal<boolean>(false);
  puedeRevocar = signal<boolean>(false);
  habilitarparaacordar = signal<boolean>(false);
  existeacuerdo = signal<boolean>(false);
  
  detallesExhortos = signal<DetalleExhortoRecibidoResponseI | null>(null);
  movimientos = signal<VerMovimientosResponse[]>([]);
  //Solo se puede declarar incompetencia si el primer movimiento aún no ha sido recibido
  puedeDeclararIncompetencia = computed(() => {
    const movs = this.movimientos();
    return movs.length > 0 && movs[0].fechaRecepcion === null;
  });
  //El boton "Declarar incompetencia" se muestra hasta que el juez firma el acuerdo y lo turna de vuelta
  //al secretario (el juez solo puede turnar una vez que ya firmo). Mientras no exista ese movimiento
  //Juez -> Secretario, el boton sigue visible
  juezYaTurnoAlSecretario = computed(() =>
    this.movimientos().some(m =>
      m.cargoOrigen?.trim() === 'Juez' && m.cargoDestino?.trim() === 'Secretario'
    )
  );
  //true una vez que el ultimo movimiento ya forma parte del flujo del acuerdo (Secretario->Juez,
  //Juez->Secretario, Secretario->Notificador, Notificador->Secretario). A partir de aqui, Recibir y Turnar
  //se hacen desde generar-acuerdo.html (no en esta pantalla), para no duplicar el flujo en dos lugares.
  //El primer "Recibir" del secretario en idMovimiento 8 (el que habilita "Generar acuerdo") sigue siendo
  //parte del exhorto en si y se mantiene aqui
  esMovimientoAcuerdo = computed(() => {
    const lista = this.movimientos();
    if (!lista || lista.length === 0) {
      return false;
    }
    const ultimoMovimiento = lista[lista.length - 1];
    const estaRecibido = ultimoMovimiento.fechaRecepcion !== null;
    return ultimoMovimiento.idMovimiento > 8 || (ultimoMovimiento.idMovimiento === 8 && estaRecibido);
  });
  promociones: promocionExhortos[] = [];
  respuesta: respuestaExhorto[]=[];

  idExhortoRecibido: number | undefined;
  isLoading:boolean=false;
  expandedRows = {};
  filaExpandidaId: number | null = null;

  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
  dialogData: any = {}; // Para almacenar la información del archivo del diálogo

   //Asignamos el id pantalla
  idPantalla=9;
  //Obtenemos las secciones de la pantalla actual
  secciones : secciones[] = [] ;
  perfilSeleccionado! : Signal<string>;
  perfilSeleccionadoService = inject(AuthService);
  ultimoMovimiento = signal<number | null>(null);
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private exhortosService: ExhortosService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private confirmationService:ConfirmationService,
    private tokenService : TokenService,
  ){
    
  }

  ngOnInit() {

        // this.route.paramMap.subscribe(params => {
        //     const idExhorto = Number(params.get('idExhortoRecibido'));
        //     this.cargarDetallesExhorto(idExhorto); // Cargar los detalles de la notifiacion con el idNotificacion
        //     this.getListado(idExhorto); //Cargar la lista de amparos recibidos con el idNotificacion
        //     this.getRespuestaExistente(idExhorto); //verificar si ya existe una respuesta
        //     this.getPromocionExhorto(idExhorto); //verificar si el exhorto tiene promociones
        // });
        //idExhortoRecibido viene de los listados; id viene de las notificaciones del header (idTramite)
        const state = window.history.state as { idExhortoRecibido?: number; id?: number };
        const idExhortoRecibido = state?.idExhortoRecibido ?? state?.id;

        //console.log('State recibido:', state);

        if (idExhortoRecibido) {
            this.idExhortoRecibido = idExhortoRecibido;
            this.cargarDetallesExhorto(this.idExhortoRecibido); // Cargar los detalles de la notifiacion con el idNotificacion
             this.getRespuestaExistente(this.idExhortoRecibido); //verificar si ya existe una respuesta
             this.getPromocionExhorto(this.idExhortoRecibido); //verificar si el exhorto tiene promociones
             this.obtenerMovimientos(this.idExhortoRecibido);
            
        } else {
            // Si no hay state, redirigir a la lista de amparos
            //this.router.navigate(['/inicio/exhortos']);
        }
        this.GetSeccionesUsuario();
        this.perfilSeleccionado =  signal(this.perfilSeleccionadoService.perfil_Seleccionado());
  }

  /*
    CUANDO SE DECLARA INCOMPETENCIA, SGA TURNARÁ MANUALMENTE
  */
  reasignarExhorto(){
        const materiaNombre = this.detallesExhortos()?.generales?.materiaNombre || '';
        const numeroExhorto = this.detallesExhortos()?.generales?.numeroExhorto || '';
        const municipioDestino = this.detallesExhortos()?.generales?.municipioDestino || '';
        const juzgadoDestino = this.detallesExhortos()?.generales?.juzgadoDestino || '';

        this.router.navigate(['/inicio/exhortos/asignarJuzgado'], { state: { idExhortoRecibido: this.idExhortoRecibido,
            materiaNombre: materiaNombre, numeroExhorto: numeroExhorto, municipioDestino: municipioDestino, juzgadoDestino:juzgadoDestino } })
  }
  generarRespuesta(){
        //console.log("Navengando hacia generar respuesta", this.idExhortoRecibido);
        this.router.navigate(['/exhortos/generar-acuerdo'], { state: { idExhortoRecibido: this.idExhortoRecibido } });

  }
  verAcuerdos() {
    //console.log('Naavegando a detalle-promocion con idPromocion:', idExhortoRecibido);
    const idExhortoRecibido= this.idExhortoRecibido;
    this.router.navigate(['/exhortos/generar-acuerdo'], { state: { idExhortoRecibido } });

  }

  //personalizar el mensaje cuando Oficialia recibe.
  mensajeRecibirExhorto(): string
  {
    const perfil = this.authService.getRoleNameUsuario(); // Obtener perfil del servicio
    if(perfil ==='Oficialia') {
      return "NOTA: ¡IMPORTANTE! Antes de recibir, verifique que sea competente para este asunto. Pulse [ACEPTAR] si quiere recibir. pulse [CANCELAR] si quiere verificar";
    }else{
      return "¿Está seguro de que desea recibir el exhorto?"
    }
  }
  recibir() {
    this.confirmationService.confirm({
      key: 'recibirExhorto',
      accept: () => this.onRecibir(),
      reject: () => { }
    });
  }
  /*
    RECIBIR EL EXHORTO
  */
  onRecibir()
  {
      if(this.idExhortoRecibido !== undefined)
      {
        this.isLoading=true;
        this.cd.detectChanges();
        const perfil = this.authService.getRoleNameUsuario(); 
        var idE = this.idExhortoRecibido;
          this.exhortosService.recibir(this.idExhortoRecibido, perfil).subscribe({
              next:(response =>{
                      if(response.success){
                          if(response.data.resultado){
                              this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.data.msg + (response.data.folio === "" ? "" : ", folio de exhorto asignado: " + response.data.folio), icon:'pi pi-check-circle' });
                              //this.puedeTurnar.set(true); // una vez que recibe ya puede turnar, revocar o crear promocion
                             this.obtenerMovimientos(idE);
                             if(response.data.idActualizacion != 0)
                             {
                              this.enviarActualizacion(response.data.idActualizacion);                       
                             }
                          }
                          else{
                              this.messageService.add({ severity: 'warn', summary: 'Ok', detail: response.data.msg });
                          }
                      }
              }),
              error:(err => {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message , sticky: true});
                  this.isLoading=false;
                  this.cd.detectChanges();
              }),
              complete:()=>{
                  //console.log('fin');
                  this.isLoading=false;
                  this.cd.detectChanges();
              }

          });
      }
  }

  obtenerMovimientos(idExhortoRecibido: number) {
    this.exhortosService.getMovimientos(idExhortoRecibido).subscribe({
        next:(response => {
            //console.log('Datos recibidos:', response);
            this.movimientos.set(response.data); // Almacena los datos recibidos en la variable
            this.setBanderasUltimoMovimiento();
            
          }),
        error:(error) => {
            //console.error('Error al cargar los movimientos del exhorto', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
        }
    });
  }
  /*
  setBanderasUltimoMovimiento(){
    const perfil = this.authService.getRoleNameUsuario(); 
    
    if(this.movimientos().length > 0)
    {
      this.puedeRecibir.set((this.movimientos()[this.movimientos().length-1].cargoDestino == perfil) && (this.movimientos()[this.movimientos().length-1].fechaRecepcion == null ));
      this.puedeTurnar.set((this.movimientos()[this.movimientos().length-1].cargoDestino == perfil) && (this.movimientos()[this.movimientos().length-1].fechaRecepcion != null )) ;
      if (this.movimientos()[this.movimientos().length-1].idMovimiento == 8 && (perfil == 'Secretario'))
      {
        //si ya fue recibido por el secretario puede acordarlo
        this.habilitarparaacordar.set((this.movimientos()[this.movimientos().length-1].fechaRecepcion != null )&& (!this.existeacuerdo()))
        this.puedeTurnar.set(this.existeacuerdo() );
      }
      else if (this.movimientos()[this.movimientos().length-1].idMovimiento == 9 && (perfil == 'Juez'))
      {
        //obtenemos el idUsuario del token
        const userData = this.tokenService.getUserFromToken();
        var idUsuario=0;
        if(userData !== null){
          idUsuario = userData.idGeneral;
        }
        // Validar si ya firmó en un archivo tipo 2
        const yaFirmoEnTipo2 = this.respuesta.some(r =>
          r.archivos.some(a =>
            a.idTipoDocumento === 2 &&
            a.firmantes.some(f => f.idUsuario === idUsuario)
          )
        );
        //en el perfil del juez nos aseguramos que ua haya firmado en el acuerdo para poder turnar al secretario
        this.puedeTurnar.set(yaFirmoEnTipo2);

      }
      else
      {
        this.habilitarparaacordar.set((this.movimientos()[this.movimientos().length-1].idMovimiento > 8) && (!this.existeacuerdo()))
      } 
    }
    // Nadie puede revocar el primer movimiento, por eso se valida que si ya tiene mas de 1 movimiento entonces se
    //habilita el boton de revocar. El primer movimiento es cuando el juzgado exhortante turna a oficialia y aqui no podemos revocar
    if(this.movimientos().length>1)
    {
        this.puedeRevocar.set(this.puedeRecibir());
    }  
  }
  */

  setBanderasUltimoMovimiento() {
  const perfil = this.authService.getRoleNameUsuario(); 
  const movimientos = this.movimientos();

  if (movimientos.length > 0) {
    // 1. Guardamos el último movimiento en una constante para limpiar el código
    const ultimoMovimiento = movimientos[movimientos.length - 1];
    
    // 2. Evaluamos las condiciones base
    const esDestinatario = ultimoMovimiento.cargoDestino?.trim() === perfil?.trim();
    const estaRecibido = ultimoMovimiento.fechaRecepcion !== null;
    this.ultimoMovimiento.set(ultimoMovimiento.idMovimiento);
    // Asignación inicial estándar
    this.puedeRecibir.set(esDestinatario && !estaRecibido);
    this.puedeTurnar.set(esDestinatario && estaRecibido);

    // 3. Casos especiales por Perfil / idMovimiento
    if (ultimoMovimiento.idMovimiento === 8 && perfil === 'Secretario') {
      this.habilitarparaacordar.set(estaRecibido && !this.existeacuerdo());

      const userData = this.tokenService.getUserFromToken();
      let idUsuario = 0;

      if (userData !== null) {
        idUsuario = userData.idGeneral;
      }

      // Validar si el secretario ya firmó el archivo tipo 2 (acuerdo)
      const yaFirmoEnTipo2 = this.respuesta.some(r =>
        r.archivos.some(a =>
          a.idTipoDocumento === 2 &&
          a.firmantes.some(f => f.idUsuario === idUsuario)
        )
      );

      // Solo puede turnar al notificador una vez que exista el acuerdo con el archivo tipo 2 ya firmado
      this.puedeTurnar.set(this.existeacuerdo() && yaFirmoEnTipo2);
    }
    else if (ultimoMovimiento.idMovimiento === 9 && perfil === 'Juez') {
      const userData = this.tokenService.getUserFromToken();
      let idUsuario = 0;

      if (userData !== null) {
        idUsuario = userData.idGeneral;
      }

      // Validar si ya firmó en un archivo tipo 2
      const yaFirmoEnTipo2 = this.respuesta.some(r =>
        r.archivos.some(a =>
          a.idTipoDocumento === 2 &&
          a.firmantes.some(f => f.idUsuario === idUsuario)
        )
      );

      // CORRECCIÓN: Para poder turnar, debe ser el destinatario, estar recibido Y haber firmado
      this.puedeTurnar.set(esDestinatario && estaRecibido && yaFirmoEnTipo2);
      this.cd.detectChanges();
    }
    else if (perfil === 'Notificador') {
      // El notificador solo puede turnar una vez que ya agrego un documento tipo 1 (oficio);
      // firmarlo es opcional para el notificador.
      const existeDocumentoTipo1 = this.respuesta.some(r =>
        r.archivos.some(a => a.idTipoDocumento === 1)
      );
      this.puedeTurnar.set(esDestinatario && estaRecibido && existeDocumentoTipo1);
    }
    else if (perfil === 'Secretario' && ultimoMovimiento.cargoOrigen?.trim() === 'Notificador') {
      // El secretario ya recibió de vuelta lo que le envió el notificador (archivo tipo 1); solo puede
      // turnar una vez que ese archivo tipo 1 ya tenga las firmas aplicadas.
      // No se usa un idMovimiento fijo (a diferencia de los casos de arriba) porque el numero de movimiento
      // varia segun cuantos pasos previos tuvo cada exhorto (p.ej. si paso o no por el juez); lo estable es
      // el origen/destino del ultimo movimiento.
      const archivoTipo1Firmado = this.respuesta.some(r =>
        r.archivos.some(a => a.idTipoDocumento === 1 && a.firmado === true)
      );
      this.puedeTurnar.set(esDestinatario && estaRecibido && archivoTipo1Firmado);
    }
    else if (perfil === 'Secretario' && ultimoMovimiento.cargoOrigen?.trim() === 'Juez') {
      // El secretario ya recibió de vuelta el acuerdo del juez; solo puede turnar (al notificador) una vez
      // que el archivo tipo 2 (acuerdo) ya tenga las firmas aplicadas (no solo seleccionadas como firmante,
      // sino ya "aplicadas" al PDF final)
      const archivoTipo2Firmado = this.respuesta.some(r =>
        r.archivos.some(a => a.idTipoDocumento === 2 && a.firmado === true)
      );
      this.puedeTurnar.set(esDestinatario && estaRecibido && archivoTipo2Firmado);
    }
    else {
      this.habilitarparaacordar.set((ultimoMovimiento.idMovimiento > 8) && (!this.existeacuerdo()));
    }
  }

  // Validación para revocar
  if (movimientos.length > 1) {
    this.puedeRevocar.set(this.puedeRecibir());
  }
}

  // Métodos auxiliares solo para depuración desde el template
  debugPerfilActual(): string {
    return this.authService.getRoleNameUsuario();
  }
  debugExisteDocumentoTipo1(): boolean {
    return this.respuesta.some(r => r.archivos.some(a => a.idTipoDocumento === 1));
  }

  enviarActualizacion(idActualizacion: number) {
    this.confirmationService.confirm({
      key: 'enviarActualizacion',
      accept: () => this.onEnviarActualizacion(idActualizacion),
      reject: () => { }
    });
  }
  onEnviarActualizacion(idActualizacion: number){
    if(idActualizacion!== undefined){
      this.isLoading=true;
      this.cd.detectChanges();
      this.exhortosService.enviarActualizacion(idActualizacion).subscribe({
       next:(response =>{
                      if(response.success){
                          if(response.data != null){
                              this.messageService.add({ severity: 'success', summary: 'Ok', detail: "Actualización enviada al juzgado exhortante", icon:'pi pi-check-circle' });
                              
                            }
                          else{
                              this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
                          }
                          this.cargarDetallesExhorto((this.idExhortoRecibido == undefined ? 0 : this.idExhortoRecibido));
                      }
                      else
                       this.messageService.add({ severity: 'warn', summary: 'Error', detail: (response.message==null ? "No fue posible enviar la actualización" : response.message), sticky: true });
              }),
              error:(err => {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message , sticky: true});
                  this.isLoading=false;
                  this.cd.detectChanges();
              }),
              complete:()=>{
                  //console.log('fin');
                  this.isLoading=false;
                  this.cd.detectChanges();
                  
              }

          });
    }
  }

  cargarDetallesExhorto(idExhortoRecibido: number): void { //Llamada el servicio para obtener los detalles de la notifiacion
        this.isLoading=true;
        this.cd.detectChanges();
        this.exhortosService.getExhortosRecibidosDetalle(idExhortoRecibido).subscribe({
            next:(response) => {
                //console.log('Datos recibidos:', response);
                this.detallesExhortos.set(response.data); // Almacena los datos recibidos en la variable
                //console.log(this.detallesExhortos);
            },
            error:(error) => {
                //console.error('Error al cargar detalle de notificación', error);
                 this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
                 this.isLoading=false;
                this.cd.detectChanges();
            },
            complete:()=>{
              this.isLoading=false;
              this.cd.detectChanges();
            }
        });
  }
  turnar() {
    this.confirmationService.confirm({
      key: 'turnarExhorto',
      accept: () => this.onTurnar(),
      reject: () => { }
    });
  }
  onTurnar(){
      if(this.idExhortoRecibido !== undefined)
      {
        var idE = this.idExhortoRecibido;
        const perfil = this.authService.getRoleNameUsuario(); 

        //si el turno es el paso Oficialia - secretario, debe tener el acuerdo
        if ((this.movimientos()[this.movimientos().length-1].idMovimiento == 8) && (!this.existeacuerdo()))
        {
          this.messageService.add({ severity: 'warn', summary: 'Ok', detail: 'No se puede turnar, falta generar el acuerdo, verificar...' , life:10000});
         
        }
        else{
          this.isLoading=true;
          this.cd.detectChanges();
          this.exhortosService.Turnar(this.idExhortoRecibido,perfil).subscribe({
              next:(response =>{
                  if(response.success){
                      if(response.data.resultado){
                          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.data.msg, icon:'pi pi-check-circle' });
                          //this.puedeRecibir.set(false);// si turna, ya no puede recibir
                          //this.puedeTurnar.set(false);// tampoco puede turnar, revocar, crear
                          this.obtenerMovimientos(idE);
                      }
                      else{
                          this.messageService.add({ severity: 'warn', summary: 'Ok', detail: response.data.msg });
                      }
                  }
              }),
              error:(err=>{
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message , sticky: true});
                  this.isLoading=false;
                  this.cd.detectChanges();
              }),
              complete:()=>{
                  this.isLoading=false;
                  this.cd.detectChanges();
              }

          });
      }
    }
  }
  revocar() {
    this.confirmationService.confirm({
      key: 'revocarTurno',
      accept: () => this.onRevocar(),
      reject: () => { }
    });
  }
  onRevocar(){
      if(this.idExhortoRecibido !== undefined)
      {
        this.isLoading=true;
        this.cd.detectChanges();
        var idE = this.idExhortoRecibido;
          this.exhortosService.revocar(this.idExhortoRecibido).subscribe({
              next:(response=>{
                  if(response.success){
                      if(response.data.resultado){
                          this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.data.msg, icon:'pi pi-check-circle' });
                         this.obtenerMovimientos(idE);
                      }
                      else{
                          this.messageService.add({ severity: 'warn', summary: 'Ok', detail: response.data.msg });
                      }
                  }
              }),
              error:(err=>{
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, sticky: true });
                  this.isLoading=false;
                  this.cd.detectChanges();
              }),
              complete:()=>{
                  this.isLoading=false;
                  this.cd.detectChanges();
              }

          });
      }
  }
  getTagConfig(estatus: string): { icon: string; severity: 'success' | 'warn' | 'info' | 'secondary' | 'danger' | 'contrast' } {
    switch (estatus) {
      case 'Respondido':
        return { icon: 'pi pi-reply', severity: 'info' };          // Azul - respondido
      case 'Acordado':
        return { icon: 'pi pi-check-circle', severity: 'success' };// Verde - completado
      case 'Recibido':
        return { icon: 'pi pi-inbox', severity: 'contrast' };      // Oscuro - recibido (marcado/registrado)
      case 'Pendiente de recibir':
        return { icon: 'pi pi-clock', severity: 'warn' };          // Naranja - pendiente
      case 'En proceso de diligencia':
        return { icon: 'pi pi-spinner', severity: 'secondary' };   // Gris - en curso
      default:
        return { icon: 'pi pi-question-circle', severity: 'secondary' };
    }
  }
  pdf(){
    const newObject: DetalleExhortoRecibidoResponseI | null = this.detallesExhortos();
    generateExRecibidosPDF(newObject as DetalleExhortoRecibidoResponseI, this.promociones, this.respuesta);
  }
  //Llamada al servicio para obtener los Archivos base64 pdf
  mostrarArchivo(documento: CONATRIB_ExhortosRecibidosArchivos, tipoDocumento: number): void {
    const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.getFile(documento.idArchivo, tipoDocumento).subscribe({
      next: (response) => {
        //console.log("recibe respuesta");
        if(response.success){
          const base64String = response.data.documento;
          if((documento.tamanio ?? 0) <= FIVE_MB && response.data.fileName.split('.')[1]==='pdf' )
              
              this.onVerDocumento(base64String,documento.nombreArchivo ?? 'sinnombre', 'application/pdf'); // se visualiza en modal
          else{
            const nombre= response.data.fileName;
            this.dialogData.fileName=nombre;
            const ext= nombre.split('.')[1];
            downloadBase64(base64String, nombre,ext );
          }
        }
        else
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message, sticky: true });
        //const nombre= response.data.fileName;
        //const ext= nombre.split('.')[1];

        //downloadBase64(base64String, nombre,ext );
        //this.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${base64String}`);
        //this.visible = true;
      },
      error: (error) => {
        //console.error('Error al recibir el archivo', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
          this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  onVerDocumento(fileBase64: string, nombre:string, mime:string): void {
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
  onRowExpand(event: TableRowExpandEvent) {
        this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
    }

    onRowCollapse(event: TableRowCollapseEvent) {
        this.messageService.add({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
    }
    

  toggleFilaExpandida(id: number) {
    this.filaExpandidaId = this.filaExpandidaId === id ? null : id;
  }
  GetSeccionesUsuario(): Promise<void>{
    return new Promise((resolve, reject) => {
      const idAreaSistemaUsuario = this.authService.getAreaSistemaUsuario(); // Obtener perfil del servicio
      const perfilSeleccionado = this.authService.getPerfilSeleccionado();
      //const perfilSeleccionado = localStorage.getItem('perfilSeleccionado');
      //const idAreaSistemaUsuario = localStorage.getItem('idAreaSistemaUsuario');
    this.isLoading=true;
    this.cd.detectChanges();
    this.authService.GetSeccionesUsuario(idAreaSistemaUsuario,this.idPantalla.toString(),perfilSeleccionado)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.secciones = res.data;

            this.tienePermisoReasignarExhorto.set(this.secciones.some(s => s.descripcion === 'ReasignarExhorto'));
            this.tienePermisoRecibir.set(this.secciones.some(s => s.descripcion === 'Recibir'));

            this.tienePermisoTurnar.set(this.secciones.some(s => s.descripcion === 'Turnar'));
            this.tienePermisoRevocar.set(this.secciones.some(s => s.descripcion === 'Revocar'));
            this.tienePermisoGenerarAcuerdo.set(this.secciones.some(s => s.descripcion === 'GenerarAcuerdo'));
            this.tienePermisoVerAcuerdo.set(this.secciones.some(s => s.descripcion === 'VerAcuerdo'));
            this.tienePermisoDeclararIncompetencia.set(this.secciones.some(s => s.descripcion === 'DeclararIncompetencia'));
            

                  

          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error en la respuesta del servidor." , sticky: true});
          }
        },
        error: (err) => {
          
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message , sticky: true});
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
  //Para comprobar si ya existe una respuesta
  getRespuestaExistente(idExhorto: number){
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.getRespuestaExhortoRecibido(idExhorto).subscribe({
         next: (response => {
            if(response.success)
            {
                //console.log('Datos recibidos:', response);
                if(response.data.generales != null || response.data.generales != undefined){
                    this.respuesta.push(response.data);
                }
                else{
                    this.respuesta.pop();
                }
                if(response.data.generales == undefined){
                    this.existeacuerdo.set(false);

                } else{
                    this.existeacuerdo.set(true);
                }
            }
            else{
                this.existeacuerdo.set(false);
                this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message , sticky: true});
            }
            }),
         error: (error) => {
             //console.error('Error al cargar detalle de promoción', error);
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: error.message, sticky: true });
            this.isLoading=false;
            this.cd.detectChanges();
         },
         complete:()=>{
            this.setBanderasUltimoMovimiento();
            this.isLoading=false;
            this.cd.detectChanges();
         }
        
    });

  }  
  getPromocionExhorto(idExhorto:number){
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.getPromocionExhorto(idExhorto).subscribe({
        next: (responsePromociones => {
          if(responsePromociones.success){

            //this.detallesAcuerdo = response.data;
            if(responsePromociones.data.length>0){
                this.promociones = responsePromociones.data;
                //this.bandPromo = true;
            }
          }
          else{
            //console.log(responsePromociones.errors);
            //this.bandPromo = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: responsePromociones.message +'\n'+ responsePromociones.errors, sticky: true });
          }
        }),
        error: (error) => {
          //console.error('Error al cargar detalle de promoción', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, sticky: true });
          this.isLoading=false;
          this.cd.detectChanges();
        },
        complete:()=>{
          this.isLoading=false;
          this.cd.detectChanges();
        }
      });
  }
}



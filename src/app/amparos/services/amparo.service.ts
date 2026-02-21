import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,HttpResponse  } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { map } from 'rxjs';
import {checkToken} from '../../core/auth/interceptor/token.interceptor';
import { ListadoAmparosRecibidosI,
          UI_ParamlistadoAmparosRecibidosRequest,
          catalogoEstatus,
          detallesAmparoRecibida,
          //PromocionGeneralesRequest,
          //getFileResponse,
          /*CatalogoOrganoDestino,
          CatalogoClasificacionArchivo,
          UI_PromocionResponse,
          PromocionGeneralesUpdate,*/
          verMovimientosResponse,
          /*CatalogoTipoCuaderno,
          CatalogoAmbito,
          CatalogoClasificacionResponse,
          CatalogoCircuitoResponse,
          CatalogoEstadoResponse,
          CatalogoTipoOrganoResponse,
          CatalogoMateriasResponse,
          CatalogoOrganoResponse,
          CatalogoTipoAsuntoResponse,
          NotifiViaConsultaAsuntoResponse,
          ConsultarAsuntoRequest,
          enviarPromocionRequest, */
          turnosResponse,
          UI_PromocionResponse,
          PromocionGeneralesRequest,
          CatalogoClasificacionArchivo,
          CatalogoTipoCuaderno,
          CatalogoOrganoDestino,
          PromocionGeneralesUpdate,
          guardaFirmaTmpRequest,
          CatalogoAmbito,
          CatalogoClasificacionResponse,
          CatalogoCircuitoResponse,
          CatalogoEstadoResponse,
          CatalogoTipoOrganoResponse,
          CatalogoMateriasResponse,
          CatalogoOrganoResponse,
          CatalogoTipoAsuntoResponse,
          NotifiViaConsultaAsuntoResponse,
          ConsultarAsuntoRequest} from '../interfaces/amparos.models';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { GenericResponse } from '../../shared/interface/shared.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmparosService {
   private ApiNotificacion:string= environment.urlApiAmparosPJF+"/Notificacion/";
   private apiUrlPromocion:string= environment.urlApiAmparosPJF+"/Promocion/";
   private apiUI:string= environment.urlApiAmparosPJF+"/UI/";
   private efirma:string= environment.urlApiAmparosPJF+"/EFirma/";
   private turnos:string= environment.urlApiAmparosPJF+"/Turnos/";
   private catalogoUrl:string= environment.urlApiAmparosPJF+"/Catalogo/";
   private catalogoCFJurl:string = environment.urlApiAmparosPJF+"/CatalogoCJF/"

  

  //Url Base de la API
  //private baseUrl:string="https://localhost:7113/api/Exhortos/";
  //private Notificacion: string = "https://interconexion.tribunaloaxaca.gob.mx/Api/Notificacion/";
  // private baseUrl: string = "https://localhost:7066/Api/Notificacion/";

  //request para el endpoint
  //private apiUrlPromocion = 'https://interconexion.tribunaloaxaca.gob.mx/api/Promocion';
  //private apiUrlPromocion = 'https://localhost:7066/api/Promocion';


  //private apiUI = 'https://interconexion.tribunaloaxaca.gob.mx/Api/UI'; // Asegúrate de que esta es la URL correcta
  //private apiUI = 'https://localhost:7066/Api/UI';

  //private apiFirma = 'https://interconexion.tribunaloaxaca.gob.mx/api/FirmaElectronica';
  //private efirma = 'https://interconexion.tribunaloaxaca.gob.mx/api/EFirma';

  //private catalogoCFJurl = 'https://interconexion.tribunaloaxaca.gob.mx/api/CatalogoCJF';
  //private catalogoCFJurl = 'https://localhost:7066/api/CatalogoCJF'

  //private turnos ='https://interconexion.tribunaloaxaca.gob.mx/api/Turnos';
  //private catalogoUrl = 'https://interconexion.tribunaloaxaca.gob.mx/api/Catalogo';


  constructor(private http: HttpClient) { }

  //Obtiene el listado de amparos recibidos
  getAmparosRecibidosListado(param: UI_ParamlistadoAmparosRecibidosRequest): Observable<GenericResponse<ListadoAmparosRecibidosI[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    //const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
        //const headers = new HttpHeaders({
        //  'Authorization': `Bearer ${authToken}`,
        //  'accept': '*/*'
        //});
    return this.http.post<GenericResponse<ListadoAmparosRecibidosI[]>>(this.ApiNotificacion + "ListadoNotificaciones", param,{context:checkToken()});
  }

  // Método para obtener los detalles de notificación
  getDetallesNotificacion(idNotificacion: number): Observable<GenericResponse<detallesAmparoRecibida>> {
    //const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const url = `${this.ApiNotificacion}DetalleNotificacion?idNotificacion=${idNotificacion}`;
    return this.http.get<GenericResponse<detallesAmparoRecibida>>(url,{context:checkToken()});
  }
  // Método para obtener los movimientos de una notificación
  getMovimientos(idNotificacion: number): Observable<GenericResponse<verMovimientosResponse[]>> {
    const url = `${this.turnos}/verMovimientos?idNotificacion=${idNotificacion}`;
    return this.http.get<GenericResponse<verMovimientosResponse[]>>(url,{context:checkToken()});
  }
  // Método para obtener los detalles de promoción
  getPromocionDetalles(idNotificacion: number, idRespuesta?: number): Observable<GenericResponse<UI_PromocionResponse[]>> {
    let url = `${this.apiUI}VerPromocion?idNotificacion=${idNotificacion}`;
    if (idRespuesta !== undefined) {
      url += `&idRespuesta=${idRespuesta}`;
    }
    return this.http.get<GenericResponse<UI_PromocionResponse[]>>(url,{context:checkToken()});
  }

  //Método para guardar los datos generales de la promocion
  guardarPromocion(promocion: PromocionGeneralesRequest): Observable<any> {
    return this.http.post(`${this.apiUrlPromocion}GuardarRespuestaNotificacion`, promocion,{context:checkToken()});
  }
  //Método para guardar documento de la promocion
  guardarDocumento(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrlPromocion}GuardarRespuestaNotificacionArchivos`, formData,{context:checkToken()});
  }
  // Método para eliminar un archivo
  eliminarArchivo(idArchivo: number, tipoDocumento: number): Observable<any> {
    const url = `${this.apiUI}EliminarArchivo?idArchivo=${idArchivo}&tipo=${tipoDocumento}`;
    return this.http.get<any>(url,{context:checkToken()});
  }
  //Método para actualizar los datos generales de la promocion
  actualizarPromocion(promocion: PromocionGeneralesUpdate): Observable<any> {
    return this.http.post(`${this.apiUI}ActualizaPromocion`, promocion,{context:checkToken()});
  }
   // Método para obtener el catálogo de tipo de cuadernos
   getCatalogoOrganoDestino(): Observable<CatalogoOrganoDestino[]> {
    //const catalogoUrl = 'https://interconexion.tribunaloaxaca.gob.mx/api/Catalogo/OrganoDestino';
    return this.http.get<CatalogoOrganoDestino[]>(`${this.catalogoUrl}OrganoDestino`,{context:checkToken()});
  }
  // Método para obtener el catálogo de órganos destino
  getCatalogoTipoCuaderno(): Observable<CatalogoTipoCuaderno[]> {
    //const catalogoUrl = 'https://interconexion.tribunaloaxaca.gob.mx/api/Catalogo/TipoCuaderno';
    return this.http.get<CatalogoTipoCuaderno[]>(`${this.catalogoUrl}TipoCuaderno`,{context:checkToken()});
  }
  // Método para obtener el catálogo de órganos destino
  getCatalogoClasificacionArchivo(): Observable<CatalogoClasificacionArchivo[]> {
    //const catalogoUrl = 'https://interconexion.tribunaloaxaca.gob.mx/api/Catalogo/ClasificacionArchivo';
    return this.http.get<CatalogoClasificacionArchivo[]>(`${this.catalogoUrl}ClasificacionArchivo`,{context:checkToken()});
  }
  //Método para obtener los archvios de una promocion
  getFilePromocion(idArchivo: number):Observable<GenericResponse<any>> {
    // if (idArchivo === undefined || tipoDocumento === undefined) {
    //   throw new Error('Parámetros idArchivo o tipoDocumento son undefined');
    // }
    // Construye la URL con los parámetros
    const url = `${this.apiUI}getFilePromocion/?idArchivo=${idArchivo}`;
    // Realiza la solicitud GET
    return this.http.get<GenericResponse<any>>(url,{context:checkToken()});
  }

   //Método para obtener los archvios de una notificacion
   getFileNotificacion(idArchivo: number): Observable<any> {
    // Construye la URL con los parámetros
    const url = `${this.apiUI}getFileNotificacion/?idArchivo=${idArchivo}`;
    // Realiza la solicitud GET
    return this.http.get<any>(url,{context:checkToken()});
  }
 
//<<<<<<<<<<<<<<<<<Catalogos de expediente fisico para CFJ>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  getCatalogoAmbito(): Observable<GenericResponse<CatalogoAmbito[]>> {
    return this.http.post<GenericResponse<CatalogoAmbito[]>>(`${this.catalogoCFJurl}/ambito`,{},{context:checkToken()});
  }
  getCatalogoClasificacion(idAmbito: number): Observable<CatalogoClasificacionResponse[]> {
    // CatalogoClasificacionRequest para enviar el idAmbito a la API
    return this.http.post<CatalogoClasificacionResponse[]>(`${this.catalogoCFJurl}/clasificacion`, { idAmbito },{context:checkToken()});
  }
  getCatalogoCircuito( idAmbito: number, idClasificacion: number): Observable<CatalogoCircuitoResponse[]> {
    return this.http.post<CatalogoCircuitoResponse[]>(`${this.catalogoCFJurl}/circuirto`, { idAmbito, idClasificacion },{context:checkToken()});
  }
  getCatalogoEstado( idAmbito: number, idClasificacion: number, idCircuito: number): Observable<CatalogoEstadoResponse[]> {
    return this.http.post<CatalogoEstadoResponse[]>(`${this.catalogoCFJurl}/estado`, { idAmbito, idClasificacion, idCircuito },{context:checkToken()});
  }
  getCatalogoTipoOrgano( idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number): Observable<CatalogoTipoOrganoResponse[]> {
    return this.http.post<CatalogoTipoOrganoResponse[]>(`${this.catalogoCFJurl}/TipoOrgano`, { idAmbito, idClasificacion, idCircuito, idTipoFiltro },{context:checkToken()});
  }
  getCatalogoMaterias( idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo:number): Observable<CatalogoMateriasResponse[]> {
    return this.http.post<CatalogoMateriasResponse[]>(`${this.catalogoCFJurl}/Materias`, { idAmbito, idClasificacion, idCircuito, idTipoFiltro,idEstado, idTipoOrganismo },{context:checkToken()});
  }
  getCatalogoOrgano( idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo:number, idMateria: number  ): Observable<CatalogoOrganoResponse[]> {
    return this.http.post<CatalogoOrganoResponse[]>(`${this.catalogoCFJurl}/Organo`, { idAmbito, idClasificacion, idCircuito, idTipoFiltro,idEstado, idTipoOrganismo, idMateria },{context:checkToken()});
  }
  getCatalogoTipoAsunto( idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo:number, idMateria: number, idOrgano: number  ): Observable<CatalogoTipoAsuntoResponse[]> {
    return this.http.post<CatalogoTipoAsuntoResponse[]>(`${this.catalogoCFJurl}/TipoAsunto`, { idAmbito, idClasificacion, idCircuito, idTipoFiltro,idEstado, idTipoOrganismo, idMateria, idOrgano },{context:checkToken()});
  }



  // Método para obtener el catálogo de órganos destino
  getNotificacionesViaConsultaAsunto(): Observable<NotifiViaConsultaAsuntoResponse[]> {
    return this.http.get<NotifiViaConsultaAsuntoResponse[]>(`${this.ApiNotificacion}NotificacionesViaConsultaAsunto`,{context:checkToken()});
  }


      //Método para guardar documento de la promocion
  consultarAsunto( params: ConsultarAsuntoRequest ): Observable<any> {
    return this.http.post(`${this.apiUrlPromocion}/ConsultarAsunto`, params,{context:checkToken()});
  }
  guardarAsunto( params: ConsultarAsuntoRequest ): Observable<any> {
    return this.http.post(`${this.apiUrlPromocion}/GuardarAsunto`, params,{context:checkToken()});
  }
/*
  //Método para Firmar documento
  firmarDocumento(formData: FormData): Observable<any> {
    console.log("Firmando.")
      return this.http.post(`${this.apiFirma}/Firmar`, formData);
  }*/
  //Método para Firmar documento
  guardarDocumentoFirmado(formData: FormData): Observable<any> {
      return this.http.post(`${this.apiUrlPromocion}GuardarArchivoFirmado`, formData,{context:checkToken()});
    }/*
  enviarPromocion(params: enviarPromocionRequest){
    return this.http.post(`${this.apiUrlPromocion}/EnviaPromocionInterconexion`, params,{context:checkToken()});
  }*/
  recibir(idNot: number):Observable<any>{
    const url = `${this.turnos}Recibir?idNotificacion=${idNot}`;
    return this.http.post(url,null, {context:checkToken()}); 
  }
  Turnar(idNot: number): Observable<GenericResponse<turnosResponse>>{
    const url = `${this.turnos}Turnar?idNotificacion=${idNot}`;
    return this.http.post<GenericResponse<turnosResponse>>(url, null,{context:checkToken()}); 
  }
  revocar(idNot: number):Observable<any>{
    const url = `${this.turnos}Revocar?idNotificacion=${idNot}`;
    return this.http.post(url, null, {context:checkToken()}); 
  }
 // Método para obtener el catálogo de tipo de cuadernos
   getCatalogoEstatus(): Observable<GenericResponse<catalogoEstatus[]>> {
    return this.http.get<GenericResponse<catalogoEstatus[]>>(this.catalogoUrl + "Estatus" ,{context:checkToken()});
  }
  guardaFirmaTemporal(param: guardaFirmaTmpRequest): Observable<any> {
      //return this.http.post(`${this.apiUI}/GuardarArchivoFirmado`, formData,{context:checkToken()});
      return this.http.post(`${this.efirma}GuardaFirmaTemporal`, param, { context: checkToken() });
      //const url = `${this.apiUI}/getFile?idArchivo=${idArchivo}&tipo=${tipoDocumento}`;
  }
  eliminarUnaFirma(idFirma: number): Observable<any> {
    return this.http.post(`${this.efirma}eliminarUnaFirma?idFirmaTmp=` + idFirma, null, { context: checkToken() });
  }
  aplicarFirmasAcuerdo(idArchivo: number): Observable<any> {
    return this.http.post(`${this.efirma}AplicarFirmasAcuerdos?idArchivo=` + idArchivo, null, { context: checkToken() });
  }
 
}


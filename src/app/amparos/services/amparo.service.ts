import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';
import {
  ListadoAmparosRecibidosI,
  UI_ParamlistadoAmparosRecibidosRequest,
  catalogoEstatus,
  detallesAmparoRecibida,
  verMovimientosResponse,
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
  ConsultarAsuntoRequest,
  EnviarPromocionResponse,
  CatalogoTipoProcedimientoRespose
} from '../interfaces/amparos.models';
import { GenericResponse } from '../../shared/interface/shared.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmparosService {

  private ApiNotificacion: string = environment.urlApiAmparosPJF + "/Notificacion/";
  private apiUrlPromocion: string = environment.urlApiAmparosPJF + "/Promocion/";
  private apiUI: string = environment.urlApiAmparosPJF + "/UI/";
  private efirma: string = environment.urlApiAmparosPJF + "/EFirma/";
  private turnos: string = environment.urlApiAmparosPJF + "/Turnos/";
  private catalogoUrl: string = environment.urlApiAmparosPJF + "/Catalogo/";
  private catalogoCFJurl: string = environment.urlApiAmparosPJF + "/CatalogoCJF/";

  constructor(private http: HttpClient) { }

  // ─── Notificaciones ────────────────────────────────────────────────────────

  getAmparosRecibidosListado(param: UI_ParamlistadoAmparosRecibidosRequest): Observable<GenericResponse<ListadoAmparosRecibidosI[]>> {
    return this.http.post<GenericResponse<ListadoAmparosRecibidosI[]>>(this.ApiNotificacion + "ListadoNotificaciones", param, { context: checkToken() });
  }

  getDetallesNotificacion(idNotificacion: number): Observable<GenericResponse<detallesAmparoRecibida>> {
    const url = `${this.ApiNotificacion}DetalleNotificacion?idNotificacion=${idNotificacion}`;
    return this.http.get<GenericResponse<detallesAmparoRecibida>>(url, { context: checkToken() });
  }

  getMovimientos(idNotificacion: number): Observable<GenericResponse<verMovimientosResponse[]>> {
    const url = `${this.turnos}verMovimientos?idNotificacion=${idNotificacion}`;
    return this.http.get<GenericResponse<verMovimientosResponse[]>>(url, { context: checkToken() });
  }

  // ─── Promoción ─────────────────────────────────────────────────────────────

  getPromocionDetalles(idNotificacion: number, idRespuesta?: number): Observable<GenericResponse<UI_PromocionResponse[]>> {
    let url = `${this.apiUI}VerPromocion?idNotificacion=${idNotificacion}`;
    if (idRespuesta !== undefined) {
      url += `&idRespuesta=${idRespuesta}`;
    }
    return this.http.get<GenericResponse<UI_PromocionResponse[]>>(url, { context: checkToken() });
  }

  guardarPromocion(promocion: PromocionGeneralesRequest): Observable<any> {
    return this.http.post(`${this.apiUrlPromocion}GuardarRespuestaNotificacion`, promocion, { context: checkToken() });
  }

  actualizarPromocion(promocion: PromocionGeneralesUpdate): Observable<any> {
    return this.http.post(`${this.apiUI}ActualizaPromocion`, promocion, { context: checkToken() });
  }

  // Envía la promoción al PJF
  // POST /Promocion/EnviaPromocionInterconexion
  enviarPromocion(idRespuesta: number): Observable<GenericResponse<EnviarPromocionResponse>> {
    return this.http.post<GenericResponse<EnviarPromocionResponse>>(`${this.apiUrlPromocion}EnviaPromocionInterconexion`, { idRespuesta }, { context: checkToken() });
  }

  // ─── Documentos ────────────────────────────────────────────────────────────

  guardarDocumento(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrlPromocion}GuardarRespuestaNotificacionArchivos`, formData, { context: checkToken() });
  }

  eliminarArchivo(idArchivo: number, tipoDocumento: number): Observable<any> {
    const url = `${this.apiUI}EliminarArchivo?idArchivo=${idArchivo}&tipo=${tipoDocumento}`;
    return this.http.get<any>(url, { context: checkToken() });
  }

  getFilePromocion(idArchivo: number): Observable<GenericResponse<any>> {
    const url = `${this.apiUI}getFilePromocion/?idArchivo=${idArchivo}`;
    return this.http.get<GenericResponse<any>>(url, { context: checkToken() });
  }

  getFileNotificacion(idArchivo: number): Observable<any> {
    const url = `${this.apiUI}getFileNotificacion/?idArchivo=${idArchivo}`;
    return this.http.get<any>(url, { context: checkToken() });
  }

  // ─── Firma electrónica ─────────────────────────────────────────────────────

  // Registra la firma temporal del usuario sobre un archivo (no firma el documento).
  // POST /EFirma/GuardaFirmaTemporal
  // Body: { idUsuario, idArchivo, idClasificacionArchivo, passwordFirma }
  guardaFirmaTemporal(param: guardaFirmaTmpRequest): Observable<any> {
    return this.http.post(`${this.efirma}GuardaFirmaTemporal`, param, { context: checkToken() });
  }

  // Aplica las firmas registradas y genera el documento firmado.
  // POST /EFirma/AplicarFirmasAcuerdos?idArchivo={idArchivo}
  aplicarFirmasAcuerdo(idArchivo: number): Observable<any> {
    return this.http.post(`${this.efirma}AplicarFirmasAcuerdos?idArchivo=${idArchivo}`, null, { context: checkToken() });
  }

  // Elimina una firma temporal específica.
  // POST /EFirma/eliminarUnaFirma?idFirmaTmp={idFirma}
  eliminarUnaFirma(idFirma: number): Observable<any> {
    return this.http.post(`${this.efirma}eliminarUnaFirma?idFirmaTmp=${idFirma}`, null, { context: checkToken() });
  }

  // ─── Catálogos ─────────────────────────────────────────────────────────────

  getCatalogoOrganoDestino(): Observable<CatalogoOrganoDestino[]> {
    return this.http.get<CatalogoOrganoDestino[]>(`${this.catalogoUrl}OrganoDestino`, { context: checkToken() });
  }

  getCatalogoTipoCuaderno(): Observable<CatalogoTipoCuaderno[]> {
    return this.http.get<CatalogoTipoCuaderno[]>(`${this.catalogoUrl}TipoCuaderno`, { context: checkToken() });
  }

  getCatalogoClasificacionArchivo(): Observable<CatalogoClasificacionArchivo[]> {
    return this.http.get<CatalogoClasificacionArchivo[]>(`${this.catalogoUrl}ClasificacionArchivo`, { context: checkToken() });
  }

  getCatalogoEstatus(): Observable<GenericResponse<catalogoEstatus[]>> {
    return this.http.get<GenericResponse<catalogoEstatus[]>>(this.catalogoUrl + "Estatus", { context: checkToken() });
  }

  // ─── Catálogos CFJ ─────────────────────────────────────────────────────────

  getCatalogoAmbito(): Observable<GenericResponse<CatalogoAmbito[]>> {
    return this.http.post<GenericResponse<CatalogoAmbito[]>>(`${this.catalogoCFJurl}ambito`, {}, { context: checkToken() });
  }

  getCatalogoClasificacion(idAmbito: number): Observable<CatalogoClasificacionResponse[]> {
    return this.http.post<CatalogoClasificacionResponse[]>(`${this.catalogoCFJurl}clasificacion`, { idAmbito }, { context: checkToken() });
  }

  getCatalogoCircuito(idAmbito: number, idClasificacion: number): Observable<CatalogoCircuitoResponse[]> {
    return this.http.post<CatalogoCircuitoResponse[]>(`${this.catalogoCFJurl}circuirto`, { idAmbito, idClasificacion }, { context: checkToken() });
  }

  getCatalogoEstado(idAmbito: number, idClasificacion: number, idCircuito: number): Observable<CatalogoEstadoResponse[]> {
    return this.http.post<CatalogoEstadoResponse[]>(`${this.catalogoCFJurl}estado`, { idAmbito, idClasificacion, idCircuito }, { context: checkToken() });
  }

  getCatalogoTipoOrgano(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number): Observable<CatalogoTipoOrganoResponse[]> {
    return this.http.post<CatalogoTipoOrganoResponse[]>(`${this.catalogoCFJurl}TipoOrgano`, { idAmbito, idClasificacion, idCircuito, idTipoFiltro }, { context: checkToken() });
  }

  getCatalogoMaterias(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo: number): Observable<CatalogoMateriasResponse[]> {
    return this.http.post<CatalogoMateriasResponse[]>(`${this.catalogoCFJurl}Materias`, { idAmbito, idClasificacion, idCircuito, idTipoFiltro, idEstado, idTipoOrganismo }, { context: checkToken() });
  }

  getCatalogoOrgano(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo: number, idMateria: number): Observable<CatalogoOrganoResponse[]> {
    return this.http.post<CatalogoOrganoResponse[]>(`${this.catalogoCFJurl}Organo`, { idAmbito, idClasificacion, idCircuito, idTipoFiltro, idEstado, idTipoOrganismo, idMateria }, { context: checkToken() });
  }

  getCatalogoTipoAsunto(idAmbito: number, idClasificacion: number, idCircuito: number, idTipoFiltro: number, idEstado: number, idTipoOrganismo: number, idMateria: number, idOrgano: number): Observable<CatalogoTipoAsuntoResponse[]> {
    return this.http.post<CatalogoTipoAsuntoResponse[]>(`${this.catalogoCFJurl}TipoAsunto`, { idAmbito, idClasificacion, idCircuito, idTipoFiltro, idEstado, idTipoOrganismo, idMateria, idOrgano }, { context: checkToken() });
  }

  getNotificacionesViaConsultaAsunto(): Observable<NotifiViaConsultaAsuntoResponse[]> {
    return this.http.get<NotifiViaConsultaAsuntoResponse[]>(`${this.ApiNotificacion}NotificacionesViaConsultaAsunto`, { context: checkToken() });
  }

  consultarAsunto(params: ConsultarAsuntoRequest): Observable<any> {
    return this.http.post(`${this.apiUrlPromocion}ConsultarAsunto`, params, { context: checkToken() });
  }

  guardarAsunto(params: ConsultarAsuntoRequest): Observable<any> {
    return this.http.post(`${this.apiUrlPromocion}GuardarAsunto`, params, { context: checkToken() });
  }
  getCatalogoTipoProcedimiento(idTipoAsunto: number): Observable<CatalogoTipoProcedimientoRespose[]> {
    return this.http.post<CatalogoTipoProcedimientoRespose[]>(`${this.catalogoCFJurl}TipoProcedimiento?idTipoAsunto=`+idTipoAsunto, null, { context: checkToken() });
  }
  // ─── Turnos ────────────────────────────────────────────────────────────────

  recibir(idNot: number): Observable<any> {
    return this.http.post(`${this.turnos}Recibir?idNotificacion=${idNot}`, null, { context: checkToken() });
  }

  Turnar(idNot: number): Observable<GenericResponse<turnosResponse>> {
    return this.http.post<GenericResponse<turnosResponse>>(`${this.turnos}Turnar?idNotificacion=${idNot}`, null, { context: checkToken() });
  }

  revocar(idNot: number): Observable<any> {
    return this.http.post(`${this.turnos}Revocar?idNotificacion=${idNot}`, null, { context: checkToken() });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';
import { environment } from '../../../environments/environment';
import { GenericResponse } from '../../shared/interface/shared.interface';
import { ExhortoEnviadoGuardarGeneralesRequest, generalesExhortoEnviado, EnviadoConfirmacionDatosRecibidosResponse, 
         EnviadoArchivoRecibidoConAcuseResponse, EstadoSeleccionado, CatalogoMunicipioDestino, CatalogoMateriasEstadoDestino, 
         tipoVia, CatalogoMunicipioOrigen, CatalogoEstadoDestino, CatalogoJuzgadoOrigen, CatalogoGenero, CatalogoMateria, 
         ListadoCatalogoTipoDocumento, ConfigMateriaJuzgado, detalleExhortosEnviados, CatalogoTipoParte, validaFirmaRequest, 
         guardaFirmaTmpRequest, AgregarJuzgadoMat, CatalogoRegion, CatJuzgado,UI_ParamlistadoExhortosRecibidosRequest,
         ListadoExhortosEnviados,ListadoEstatus,ListadoExhortosRecibidosI,respuestExhortoEnviado,ConfirmacionDatosPromocionRecibida,
         ArchivoRecibidoPromocionConAcuse,actualizacionesExhortoEnviado,VerMovimientosEnviadosResponse,IdArchivoPromcionesEnviada,
        PromocionExhortoEnviado,folioPromocionExhortoEnviado} from '../interfaces/exhortos.model';

@Injectable({
  providedIn: 'root'
})
export class ExhortosService {
  private baseUrl:string= environment.urlApiExhortosElectronicos+"/Exhortos/";
  private exhortoEnviar: string = environment.urlApiExhortosElectronicos + "/ExhortosEnviar/";
  private cat: string = environment.urlApiExhortosElectronicos + "/Catalogos/";
  private Juz = environment.urlApiExhortosElectronicos + "/Juzgado";
  private configMatJuz = environment.urlApiExhortosElectronicos + "/Configuraciones/getConfigMunicipioMateriaJuzgado";
  private apiAcuerdo: string = environment.urlApiExhortosElectronicos + "/ExhortoRecibidoAcuerdo/";
  private apiUI: string = environment.urlApiExhortosElectronicos + "/UI";
  private eFirma = environment.urlApiEfirma;
  private ExhortosEfirma = environment.urlApiExhortosElectronicos + "/eFirma/";
  private deleteConfigMatJuz = environment.urlApiExhortosElectronicos + "/Configuraciones/quitarAsignacionJuzgado";//'https://api.tribunaloaxaca.gob.mx/exhortoselectronicos/api/Configuraciones/quitarAsignacionJuzgado'
  private configJuz = environment.urlApiExhortosElectronicos + "/Configuraciones";//'https://api.tribunaloaxaca.gob.mx/exhortoselectronicos/api/Configuraciones';
  private turnos = environment.urlApiExhortosElectronicos+"/Turnos";
  
  constructor(private http: HttpClient) { }

  actualizarExhortoEnviado(request: any): Observable<GenericResponse<any>> {
    return this.http.post<GenericResponse<any>>(
      this.exhortoEnviar + 'actualizarExhortoEnviado',
      request,
      { context: checkToken() }
    );
  }
  // Método para guardar los datos generales de un exhort enviado
  setGuardarExhortoEnviado(param: ExhortoEnviadoGuardarGeneralesRequest): Observable<GenericResponse<generalesExhortoEnviado[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    //return this.http.post<GenericResponse<ListadoAmparosRecibidosI[]>>(this.baseUrl + "ListadoNotificaciones", param);
    return this.http.post<GenericResponse<generalesExhortoEnviado[]>>(this.exhortoEnviar + "GuardarGenerales", param, { context: checkToken() });
  }
  //enviar un exhorto AL JUZGADO EXHORTADO
  enviarGeneralesExhortoEnviado(idExhortoEnviado: number) {
    const url = `${this.exhortoEnviar}EntregarGenerales?idExhortoEnviado=${idExhortoEnviado}`;
    return this.http.post<GenericResponse<EnviadoConfirmacionDatosRecibidosResponse>>(url, null, { context: checkToken() });
  }
  //enviar los archivos de un exhorto al juzgado exhortado
  enviarArchivosExhortosEnviados(idExhortoEnviado: number) {
    const url = `${this.exhortoEnviar}EntregarArchivos?idExhortoEnviado=${idExhortoEnviado}`;
    return this.http.post<GenericResponse<EnviadoArchivoRecibidoConAcuseResponse>>(url, null, { context: checkToken() });
  }
  //Metodo para obtener los municipios del estado seleccionado
  getCatalogoMunicipioDestino(param: EstadoSeleccionado): Observable<GenericResponse<CatalogoMunicipioDestino[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    //return this.http.post<GenericResponse<ListadoAmparosRecibidosI[]>>(this.baseUrl + "ListadoNotificaciones", param);
    return this.http.get<GenericResponse<CatalogoMunicipioDestino[]>>(this.cat + "Municipio?idEstado=" + param.idEstado, { context: checkToken() });
  }
  // Método para obtener el catálogo de órganos destino
  getCatalogoMateriasEstadoDestino(param: EstadoSeleccionado): Observable<GenericResponse<CatalogoMateriasEstadoDestino[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    //return this.http.post<GenericResponse<ListadoAmparosRecibidosI[]>>(this.baseUrl + "ListadoNotificaciones", param);
    return this.http.get<GenericResponse<CatalogoMateriasEstadoDestino[]>>(this.exhortoEnviar + "ConsultarMateriasEstado?idEstado=" + param.idEstado, { context: checkToken() });
  }
  getViasPorMaterias(idMateria: number): Observable<GenericResponse<tipoVia[]>> {
    const url = `${this.cat}viasPorMateria?idMateria=${idMateria}`;
    return this.http.get<GenericResponse<tipoVia[]>>(url, { context: checkToken() });
  }
  // Método para obtener el catálogo municipios origen
  getCatalogoMunicipioOrigen(): Observable<GenericResponse<CatalogoMunicipioOrigen[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<CatalogoMunicipioOrigen[]>>(this.cat + "Municipio?idEstado=20", { context: checkToken() });
  }
  // Método para obtener el catálogo de órganos destino
  getCatalogoEstadoDestino(): Observable<GenericResponse<CatalogoEstadoDestino[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<CatalogoEstadoDestino[]>>(this.cat + "Estado", { context: checkToken() });
  }
  getCatalogojuzgadoOrigen(): Observable<GenericResponse<CatalogoJuzgadoOrigen[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<CatalogoJuzgadoOrigen[]>>(this.Juz, { context: checkToken() });
  }
  getCatalogoGenero(): Observable<GenericResponse<CatalogoGenero[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<CatalogoGenero[]>>(this.cat + "Genero", { context: checkToken() });
  }
  //Metodo para catologos de Materias
  getCatalogoMateria(): Observable<GenericResponse<CatalogoMateria[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<CatalogoMateria[]>>(this.cat + "MateriasUI", { context: checkToken() });
  }
  //Obtener el tipo de documento
  getCatalogoTipoDocumento(): Observable<GenericResponse<ListadoCatalogoTipoDocumento[]>> {
    //const headers = new HttpHeaders({'X-Api-Key': this.APIKEY});
    //construcción de la URL
    return this.http.get<GenericResponse<ListadoCatalogoTipoDocumento[]>>(this.cat + "TipoDocumento", { context: checkToken() });
  }
  getCatalogoTipoDiligencia(): Observable<GenericResponse<any[]>> {
    return this.http.get<GenericResponse<any[]>>(
      this.cat + 'tipoDiligencia',
      { context: checkToken() }
    );
  }
  getConfigMunicipioMateriaJuzgado(idMunicipio: number, idMateria: number): Observable<GenericResponse<ConfigMateriaJuzgado[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<ConfigMateriaJuzgado[]>>(this.configMatJuz + "?idMunicipio=" + idMunicipio + "&idMateria=" + idMateria, { context: checkToken() });
  }
  //Detalles del exhorto enviado
  getExhortosEnviadosDetalle(idExhortoEnviado: any): Observable<GenericResponse<detalleExhortosEnviados>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<detalleExhortosEnviados>>(this.exhortoEnviar + "DetalleExhortoEnviado?idExhortoEnviado=" + idExhortoEnviado, { context: checkToken() });
  }
  //Método para guardar documento de un exhorto enviado
  guardarDocumento(formData: FormData): Observable<any> {
    return this.http.post(`${this.exhortoEnviar}GuardarArchivos`, formData, { context: checkToken() });
  }
  //Guardar documento de la respuesta
  setDocumento(formData: FormData): Observable<any> {
    //const headers = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.post(`${this.apiAcuerdo}GuardarRespuestaExhortoRecibidoArchivo`, formData, { context: checkToken() });
    //return this.http.post(`${this.exhortoEnviar}GuardarRespuestaExhortoRecibidoArchivo`, formData, {context:checkToken()});
  }
  getCatalogoTipoParte(): Observable<GenericResponse<CatalogoTipoParte[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<CatalogoTipoParte[]>>(this.cat + "TipoParte", { context: checkToken() });
  }
  //Método para obtener los archvios y mostrarlos
  getFile(idArchivo: number, tipoDocumento: number): Observable<any> {
    // Construye la URL con los parámetros
    const url = `${this.apiUI}/getFile?idArchivo=${idArchivo}&tipo=${tipoDocumento}`;
    // Realiza la solicitud GET
    return this.http.get<any>(url, { context: checkToken() });
  }
  // Método para eliminar un archivo
  eliminarArchivo(idArchivo: number, tipoDocumento: number): Observable<any> {
    const url = `${this.apiUI}/EliminarArchivo?idArchivo=${idArchivo}&tipo=${tipoDocumento}`;
    return this.http.get<any>(url, { context: checkToken() });
  }
  validaFirmaPFX(param: validaFirmaRequest): Observable<any> {
    //return this.http.post(`${this.apiUI}/GuardarArchivoFirmado`, formData,{context:checkToken()});
    return this.http.post(`${this.eFirma}/ValidaFirma`, param, { context: checkToken() });
    //const url = `${this.apiUI}/getFile?idArchivo=${idArchivo}&tipo=${tipoDocumento}`;
  }
  guardaFirmaTemporal(param: guardaFirmaTmpRequest): Observable<any> {
    //return this.http.post(`${this.apiUI}/GuardarArchivoFirmado`, formData,{context:checkToken()});
    return this.http.post(`${this.ExhortosEfirma}GuardaFirmaTemporal`, param, { context: checkToken() });
    //const url = `${this.apiUI}/getFile?idArchivo=${idArchivo}&tipo=${tipoDocumento}`;
  }
  eliminarUnaFirma(idFirma: number): Observable<any> {
    return this.http.post(`${this.ExhortosEfirma}eliminarUnaFirma?idFirmaTmp=` + idFirma, null, { context: checkToken() });
  }
  aplicarFirmasAcuerdo(idArchivo: number): Observable<any> {
    return this.http.post(`${this.ExhortosEfirma}AplicarFirmasAcuerdos?idArchivo=` + idArchivo, null, { context: checkToken() });
  }
  aplicarFirmasExhorto(idArchivo: number): Observable<any> {
    return this.http.post(`${this.ExhortosEfirma}AplicarFirmasExhortos?idArchivo=` + idArchivo, null, { context: checkToken() });
  }
  aplicarFirmasPromocion(idArchivo: number): Observable<any> {
    return this.http.post(`${this.ExhortosEfirma}AplicarFirmasPromociones?idArchivo=` + idArchivo, null, { context: checkToken() });
  }
  getQuitarAsignacionJuzgado(idConfiguracion: number): Observable<GenericResponse<ConfigMateriaJuzgado[]>> {
    return this.http.get<GenericResponse<ConfigMateriaJuzgado[]>>(this.deleteConfigMatJuz + "?idConfiguracion=" + idConfiguracion + "", { context: checkToken() });
  }

  //Metodo para obtener los municipios del estado de oaxaca
  getCatalogoMunicipioOaxaca(): Observable<GenericResponse<CatalogoMunicipioDestino[]>> {
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<CatalogoMunicipioDestino[]>>(this.cat + "Municipio?idEstado=20", { context: checkToken() });
  }

    getCatalogoRegion(): Observable<GenericResponse<CatalogoRegion[]>>{
    return this.http.get<GenericResponse<CatalogoRegion[]>>(this.configJuz+"/Region", {context:checkToken()});
  }

  postAgregarJuzgadoMat(idMunicipio: number | undefined, idCatMateria: number | undefined, idCatJuzgado: number | undefined, idRegion: number | undefined): Observable<GenericResponse<AgregarJuzgadoMat>> {
    return this.http.post<GenericResponse<AgregarJuzgadoMat>>(this.configJuz + "/AsignarJuzgado", { idMunicipio, idCatMateria, idCatJuzgado, idRegion }, { context: checkToken() })
  }
    getCatalogoJuzgado(): Observable<GenericResponse<CatJuzgado[]>>{
    return this.http.get<GenericResponse<CatJuzgado[]>>(this.Juz,{context:checkToken()});
  }
    getCatalogoRegionMunicipio(idRegion: number): Observable<GenericResponse<CatalogoMunicipioDestino[]>> {
    return this.http.get<GenericResponse<CatalogoMunicipioDestino[]>>(this.configJuz+"/RegionMunicipio?idRegion="+idRegion,{context: checkToken()});
  }
   //Listado de exhortos enviados
  getExhortosEnviados(param:UI_ParamlistadoExhortosRecibidosRequest):Observable<GenericResponse<ListadoExhortosEnviados>>{;
    //const headers = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.post<GenericResponse<ListadoExhortosEnviados>>(this.exhortoEnviar + "ListadoExhortosEnviados",param,{context:checkToken()});
  }
   // obtenemos el detalle de un exhorto
  getListadoEstatus(tipoTramite: number):Observable<GenericResponse<ListadoEstatus[]>>{
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
     //return this.http.get<GenericResponse<DetalleExhortoRecibidoResponseI>>(this.baseUrl + "DetalleExhortoRecibido?idExhortoRecibido="+idExhortoRecibido,{context:checkToken()});
     const url = `${this.cat}Estatus?tipoTramite=${tipoTramite}`;
     return this.http.get<GenericResponse<|[]>>(url,{context:checkToken()});
  }
  //Obtiene el listado de exhortos recibidos
  getExhortosRecibidosListado(param:UI_ParamlistadoExhortosRecibidosRequest): Observable<GenericResponse<ListadoExhortosRecibidosI>>{
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.post<GenericResponse<ListadoExhortosRecibidosI>>(this.baseUrl + "ListadoExhortosRecibidos",param,{context:checkToken()});
  }
  //Respuestas de los exhortos enviados
  getRespuestaExhortoEnviado(idExhortoEnviado:number):Observable<GenericResponse<respuestExhortoEnviado>>{
    //const header = new HttpHeaders({'X-Api-Key': this.APIKEY});
    return this.http.get<GenericResponse<respuestExhortoEnviado>>(this.apiUI+"/verRespuestaExhortoEnviado?idExhortoEnviado="+idExhortoEnviado,{context:checkToken()});

  }
      //anviar los datos generales de una promocion
  enviarPromocionGenerales(idPromocionEnviado: number):Observable<GenericResponse<ConfirmacionDatosPromocionRecibida>>{
    const url = `${this.exhortoEnviar}EntregarGeneralesPromocion?idPromocionEnviada=${idPromocionEnviado}`;
    return this.http.post<GenericResponse<ConfirmacionDatosPromocionRecibida>>(url,null,{context:checkToken()});
  }
  //anviar los archivos de una promocion
  enviarPromocionArchivos(idPromocionEnviado: number):Observable<GenericResponse<ArchivoRecibidoPromocionConAcuse>>{
    const url = `${this.exhortoEnviar}EntregarArchivosPromocion?idPromocionEnviada=${idPromocionEnviado}`;
    return this.http.post<GenericResponse<ArchivoRecibidoPromocionConAcuse>>(url,null,{context:checkToken()});
  }
  //obtiene la lista de actualizaciones de un exhorto enviado
  getActualizacionesExhortoEnviado(idExhortoEnviado : number ):Observable<GenericResponse<actualizacionesExhortoEnviado[]>>{
    return this.http.get<GenericResponse<actualizacionesExhortoEnviado[]>>(this.exhortoEnviar + "verActualizacionesRecibidas?idExhortoEnviado="+idExhortoEnviado, {context:checkToken()});
  }
  // Método para obtener los movimientos de un exhorto enviado
  getMovimientosExhortoEnviado(idExhortoEnviado: number): Observable<GenericResponse<VerMovimientosEnviadosResponse[]>> {
    const url = `${this.turnos}/verMovimientosEnviados?idExhortoEnviado=${idExhortoEnviado}`;
    return this.http.get<GenericResponse<VerMovimientosEnviadosResponse[]>>(url,{context:checkToken()});
  }
    postGuardarArchivosPromocionExhortoEnviado(formData: FormData): Observable<GenericResponse<IdArchivoPromcionesEnviada>>{
    const url = `${this.exhortoEnviar}PromoverGuardarArchivos`;
    return this.http.post<GenericResponse<IdArchivoPromcionesEnviada>>(url,formData,{context:checkToken()});
  }
   getDetallePromocionExhortoEnviado(idExhortoEnviado : number, idPromocionEnviado: number): Observable<GenericResponse<PromocionExhortoEnviado>>{
    //const headers = new HttpHeaders({'X-Api-Key': this.APIKEY});
    //construcción de la URL
    return this.http.get<GenericResponse<PromocionExhortoEnviado>>(this.exhortoEnviar + "DetallePromocionExhortoEnviado?idExhortoEnviado="+idExhortoEnviado+"&idPromocion="+idPromocionEnviado, {context:checkToken()});
  }
   //Metodos de Promociones Exhortos Enviados
  postGuardarPromocionExhortoEnviado(param: PromocionExhortoEnviado): Observable<GenericResponse<folioPromocionExhortoEnviado>>{
    const url = `${this.exhortoEnviar}PromoverGuardarGenerales`;
    return this.http.post<GenericResponse<folioPromocionExhortoEnviado>>(url,param,{context:checkToken()});
  } 
    postActualizarPromocion(param: PromocionExhortoEnviado): Observable<GenericResponse<PromocionExhortoEnviado>>{
    const url = `${this.exhortoEnviar}actualizarPromocion`;
    return this.http.post<GenericResponse<PromocionExhortoEnviado>>(url,param,{context:checkToken()});
  } 
}
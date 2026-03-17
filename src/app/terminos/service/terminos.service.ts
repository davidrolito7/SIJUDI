import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatJuzgados, CatTramites, CatAnexos } from '../interface/terminos.model';
import { GenericResponse, ReporteDocumento } from '../interface/terminos.model';
import { environment } from '../../../environments/environment';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';

// Servicio para interactuar con la API RESTful del backend
@Injectable({
  providedIn: 'root',
})

export class TerminosService {


  //private apiUrl = 'https://localhost:7222/api';
  private apiUrl:string= environment.urlApiTerminos;


  constructor(private http: HttpClient) { }

  // -------------------------
  // CATÁLOGOS
  // -------------------------

  getCatalogoJuzgadosPrimeraInstancia()
    : Observable<GenericResponse<CatJuzgados[]>> {

    return this.http.get<GenericResponse<CatJuzgados[]>>(
      `${this.apiUrl}/Juzgados/instancia/P`,{ context: checkToken() }
    );
  }
  // -------------------------
  getCatalogoSalasSegundaInstancia()
    : Observable<GenericResponse<any[]>> {

    return this.http.get<GenericResponse<any[]>>(
      `${this.apiUrl}/Salas/instancia/S`,{ context: checkToken() }
    );
  }
  // -------------------------
  getCatalogoTramitesPrimeraInstancia()
    : Observable<GenericResponse<CatTramites[]>> {

    return this.http.get<GenericResponse<CatTramites[]>>(
      `${this.apiUrl}/Tramites/instancia/P`,{ context: checkToken() }
    );
  }

  getCatalogoTramitesSegundaInstancia() {
    return this.http.get<GenericResponse<CatTramites[]>>(
      `${this.apiUrl}/Tramites/instancia/S`,{ context: checkToken() }
    );
  }
  // -------------------------
  getCatalogoAnexosPrimeraInstancia()
    : Observable<GenericResponse<CatAnexos[]>> {

    return this.http.get<GenericResponse<CatAnexos[]>>(
      `${this.apiUrl}/Anexos`,{ context: checkToken() }
    );
  }

  // -------------------------
  // BÚSQUEDAS POR CLAVE
  // -------------------------
  getJuzgadoPorClave(clave: string): Observable<CatJuzgados> {
    return this.http.get<CatJuzgados>(
      `${this.apiUrl}/Juzgados/${encodeURIComponent(clave)}`,{ context: checkToken() }
    );
  }
  // -------------------------
  getTramitePorClave(clave: string): Observable<CatTramites> {
    return this.http.get<CatTramites>(
      `${this.apiUrl}/Tramites/${encodeURIComponent(clave)}`,{ context: checkToken() }
    );
  }

  // -------------------------
  // ESCRITOS (POST / PUT)
  // -------------------------
  guardarEscrito(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/Escritos`,
      payload,{ context: checkToken() }
    );
  }

  modificarEscrito(folio: string, payload: any) {
    return this.http.put(
      `${this.apiUrl}/Escritos/${encodeURIComponent(folio)}`,
      payload,{ context: checkToken() }
    );
  }
  // -------------------------
  // BUSCAR ESCRITOS
  // -------------------------

  buscarEscritos(params: {
    instancia: string;
    tipoBusqueda: string;
    valor: string;
  }): Observable<any[]> {

    const httpParams = new HttpParams()
      .set('Instancia', params.instancia)
      .set('TipoBusqueda', params.tipoBusqueda)
      .set('Valor', params.valor);

    return this.http.get<any[]>(
      `${this.apiUrl}/Escritos/buscar`,
      { params: httpParams,context: checkToken() },
    );
  }


  obtenerEscritoPorFolio(folio: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/Escritos/${encodeURIComponent(folio)}`,{context: checkToken()}
    );
  }
  // ==========================
  // REPORTES DOCUMENTOS PDF
  // ==========================

  generarReporteDocumentosPdf(params: {
    instancia: string;
    juzgado?: string;
    sala?: string;
    fechaInicio: string;
    fechaFin: string;
  }): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/Reportes/documentos/pdf`,
      {
        params: {
          Instancia: params.instancia,
          Juzgado: params.juzgado || '',
          Sala: params.sala || '',
          FechaInicio: params.fechaInicio,
          FechaFin: params.fechaFin
        },
        responseType: 'blob',
        context: checkToken()
      }
    );
  }

  // ==========================
  // REPORTES DOCUMENTOS JSON
  // ==========================

  obtenerReporteDocumentos(params: {
    instancia: string;
    juzgado?: string;
    sala?: string;
    fechaInicio: string;
    fechaFin: string;
  }): Observable<GenericResponse<ReporteDocumento[]>> {

    return this.http.get<GenericResponse<ReporteDocumento[]>>(
      `${this.apiUrl}/Reportes/documentos`,
      {
        params: {
          Instancia: params.instancia,
          Juzgado: params.juzgado || '',
          Sala: params.sala || '',
          FechaInicio: params.fechaInicio,
          FechaFin: params.fechaFin
        },context: checkToken()
      }
    );
  }

  // ==========================
  // CRUD GENÉRICO CATÁLOGOS
  // ==========================

  getCatalogo(tipo: string, instancia: string) {
    return this.http.get<any>(
      `${this.apiUrl}/${tipo}/instancia/${instancia}`,{context: checkToken()}
    );
  }

  crearCatalogo(tipo: string, data: any) {
    return this.http.post(
      `${this.apiUrl}/${tipo}`,
      data,{context: checkToken()}
    );
  }

  actualizarCatalogo(tipo: string, id: number, data: any) {
    return this.http.put(
      `${this.apiUrl}/${tipo}/${id}`,
      data,{context: checkToken()}
    );
  }

  eliminarCatalogo(tipo: string, id: number) {
    return this.http.delete(
      `${this.apiUrl}/${tipo}/${id}`,{context: checkToken()}
    );
  }

 getCatalogoAnexos() {
  return this.http.get<any>(`${this.apiUrl}/Anexos`,{context: checkToken()});
}

  // ==========================
  // CERTIFICACIÓN
  // ==========================
obtenerCertificacion(folio: string):Observable<any> {
  return this.http.get(
    `${this.apiUrl}/Certificacion?folio=${folio}`,
    { context: checkToken()}
  );
}


}




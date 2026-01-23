import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CatJuzgadoResponse, TramitesElectronicosRecibidosResponse, ValidarCausaResponse } from '../interface/tramites-juicio-oral.model';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://localhost:7057/api/PromocionesJuicioOral'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getTramitesElectronicosRecibidos(params?: any): Observable<ApiResponse<TramitesElectronicosRecibidosResponse[]>> {
    const url = `${this.apiUrl}/ListarTramitesElectronicosRecibidos`;
    return this.http.post<ApiResponse<TramitesElectronicosRecibidosResponse[]>>(
      url,
      null,
      { params, context: checkToken() }
    );
  }

    getCatJuzgados(): Observable<ApiResponse<CatJuzgadoResponse[]>> {
    const url = `${this.apiUrl}/CatalogoJuzgados`;
    return this.http.post<ApiResponse<CatJuzgadoResponse[]>>(
      url,
      null,
      { context: checkToken() }
    );
  }
  postValidarCausa(params?: any): Observable<ApiResponse<ValidarCausaResponse>> {
    const url = `${this.apiUrl}/ValidarCausa`;
    return this.http.post<ApiResponse<ValidarCausaResponse>>(
      url,
      null,
      { params, context: checkToken() }
    );
  }

  postEnviarTramite(formData: FormData): Observable<ApiResponse<TramitesElectronicosRecibidosResponse>> {
    const url = `${this.apiUrl}/GuardarTramiteElectronico`;
    return this.http.post<ApiResponse<TramitesElectronicosRecibidosResponse>>(
      url,
      formData,
      { context: checkToken() }
    );
  }
}

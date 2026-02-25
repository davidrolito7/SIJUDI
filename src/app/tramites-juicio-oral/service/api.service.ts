import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CatJuzgadoResponse, DetalleTramiteElectronicoRecibidoResponse, TramitesElectronicosRecibidosResponse, ValidarCausaResponse } from '../interface/tramites-juicio-oral.model';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://api.tribunaloaxaca.gob.mx/juiciooralApi/api/PromocionesJuicioOral'; // Replace with your API URL
private nasApiUrl = 'https://api.tribunaloaxaca.gob.mx/NasApi/api'
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

  getDetalleTramiteElectronicoRecibido(params: any): Observable<ApiResponse<DetalleTramiteElectronicoRecibidoResponse>> {
    const url = `${this.apiUrl}/detalleTramiteElectronicoRecibido`;
    return this.http.post<ApiResponse<DetalleTramiteElectronicoRecibidoResponse>>(
      url,
      null,
      { params, context: checkToken() }
    );
  }

  getDocumentoNas(params: { path: string; fileName: string }): Observable<ApiResponse<any>> {
  const url = `${this.nasApiUrl}/Nas`;
  return this.http.get<ApiResponse<any>>(url, {
    params,
    context: checkToken()
  });
}
}

import { map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { environment } from "src/environments/environment";
import {
  ApiResponse,
  busquedaExpediente,
  CatApelaciones,
  CatSalas,
  DTABusqueda,
  Nomenclatura,
} from '../interface/salas.interface';
import { TokenService } from '../../core/auth/service/token.service';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';

@Injectable({
  providedIn: 'root', // <-- Esto lo registra en el módulo raíz
})
export class SalasService {
  private BusquedaApelaciones = 'https://localhost:7240/api/consultaSalas/ObtieneBusquedaApelaciones'; // Reemplaza con tu URL real
  private catalogos = 'http://localhost:5221/Catalogos/';
  
  constructor(private http: HttpClient) {}

  getListadoInicios(params?: DTABusqueda): Observable<busquedaExpediente> {
    return this.http.post<busquedaExpediente>(`${this.BusquedaApelaciones}ListadoPreregistros`, {
      params,
      context: checkToken(),
    });
  }

  getCatApelaciones(
    idGeneral: number,
    idAreaSistemaUsuario: number,
    idPantalla: number
): Observable<ApiResponse<CatApelaciones[]>> {

    return this.http.get<ApiResponse<CatApelaciones[]>>(
        `${this.catalogos}obtieneCatApelaciones`,
        {
            params: {
                idGeneral ,
                idAreaSistemaUsuario,
                idPantalla
            },
            context: checkToken()
        }
    );
}

getCatalogoApelaciones(): Observable<ApiResponse<CatApelaciones[]>> {
  const cat = `${this.catalogos}obtieneCatApelaciones`;
  return this.http.get<ApiResponse<CatApelaciones[]>>(cat, { context: checkToken() });
}


getCatalogoNomenclaturas(): Observable<ApiResponse<Nomenclatura[]>> {
  const cat = `${this.catalogos}obtieneNomenclatura`;
  return this.http.get<ApiResponse<Nomenclatura[]>>(cat, { context: checkToken() });
}

getCatalogoSalas(): Observable<ApiResponse<CatSalas[]>> {
  const cat = `${this.catalogos}obtieneCatSalas`;
  return this.http.get<ApiResponse<CatSalas[]>>(cat, { context: checkToken() });
}
  getCatNomenclaturas(
    idGeneral: number,
    idAreaSistemaUsuario: number,
    idPantalla: number
): Observable<ApiResponse<Nomenclatura[]>> {

    return this.http.get<ApiResponse<Nomenclatura[]>>(
        `${this.catalogos}obtieneNomenclatura` ,
        {
            params: {
                idGeneral ,
                idAreaSistemaUsuario,
                idPantalla
            },
            context: checkToken()
        }
    );
}

//   getCaSalas(
//     idGeneral: number,
//     idAreaSistemaUsuario: number,
//     idPantalla: number
// ): Observable<ApiResponse<CatSalas[]>> {

//     return this.http.get<ApiResponse<CatSalas[]>>(
//         `${this.catalogos}obtieneCatSalas`,
//         {
//             params: {
//                 idGeneral ,
//                 idAreaSistemaUsuario,
//                 idPantalla
//             },
//             context: checkToken()
//         }
//     );
// }

  getCaSalas(
    idGeneral: number,
    idAreaSistemaUsuario: number,
    idPantalla: number
): Observable<ApiResponse<CatSalas[]>> {

    return this.http.get<ApiResponse<CatSalas[]>>(
        `${this.catalogos}obtieneCatSalas`,
        {
            params: {
                idGeneral ,
                idAreaSistemaUsuario,
                idPantalla
            },
            context: checkToken()
        }
    );
}
}

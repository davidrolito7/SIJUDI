import { map, Observable, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
//import { environment } from "src/environments/environment";
import { ApiResponse,busquedaExpediente,DTABusqueda } from "../interface/salas.interface";
import { TokenService } from "../../core/auth/service/token.service";
import { checkToken } from "../../core/auth/interceptor/token.interceptor";


@Injectable({
    providedIn: 'root' // <-- Esto lo registra en el módulo raíz
})

export class SalasService {

    private BusquedaApelaciones = 'https://localhost:5221/api/consultaSalas/ObtieneBusquedaApelaciones'; // Reemplaza con tu URL real

    constructor(private http: HttpClient) { } 
    
    
        getListadoInicios(params?: DTABusqueda): Observable<busquedaExpediente> {
            return this.http.post<busquedaExpediente>(
                `${this.BusquedaApelaciones}ListadoPreregistros`, { params, context: checkToken() }
            );
        }

}
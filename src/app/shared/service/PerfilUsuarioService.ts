import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { checkToken } from '../../core/auth/interceptor/token.interceptor';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PerfilUsuarioService {
  private baseUrlPermisos:string= environment.ConstantsService.ruta+"/api/Permisos";
  private baseUrlEfirma:string = environment.urlApiEfirma;
  //private baseUrlEfirma:string="https://api.tribunaloaxaca.gob.mx/efirma/api/efirma";
  //private baseUrlPermisos:string="https://api.tribunaloaxaca.gob.mx/permisos/api/Permisos";

  constructor(private http:HttpClient) { }

  //Método para guardar archivo .pfx
      guardarDocumentoPfx(formData: FormData): Observable<any> {
          //return this.http.post(`${this.apiUI}/GuardarArchivoFirmado`, formData,{context:checkToken()});
          return this.http.post(`${this.baseUrlEfirma}/guardarPFX`, formData,{context:checkToken()});
          //const url = `${this.apiUI}/getFile?idArchivo=${idArchivo}&tipo=${tipoDocumento}`;
        }
        //Metodo para obtener los datos del perfil del usuario 
        getDatosPerfilUsuario(nue: string, tipoBusqueda: number=1): Observable<any> {
        //const url = `${this.baseUrlPermisos}/DatosUsuario?Usuario=${nue}`;
        const url = `${this.baseUrlPermisos}/DatosUsuario?Usuario=${nue}&TipoBusqueda=${tipoBusqueda}`;
        return this.http.post(url, null,{context:checkToken()});
        }

        getDatosInformacionPFX(): Observable<any> {
        const url = `${this.baseUrlEfirma}/datosFirma`;
        //return this.http.get(url, null,{context:checkToken()});
        return this.http.get<any>(url, { context: checkToken() });
        }
}

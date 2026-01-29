import { Injectable } from '@angular/core';
import { Observable,  } from 'rxjs';
import { HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {GenericResponse} from '../../shared/interface/shared.interface';
import {CatJuzgado} from '../interface/catalogo.model';
import {checkToken} from '../../core/auth/interceptor/token.interceptor'

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
    private Juz = environment.urlApiExhortosElectronicos+"/Juzgado";

    constructor(private http:HttpClient) { }

    getCatalogoJuzgado(): Observable<GenericResponse<CatJuzgado[]>>{
        return this.http.get<GenericResponse<CatJuzgado[]>>(this.Juz,{context:checkToken()});
    }
}
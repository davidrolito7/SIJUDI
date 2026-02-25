import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogoService {

  private apiUrl = 'https://localhost:5001/api'; // ajusta si es necesario

  constructor(private http: HttpClient) {}

  getAll(tipo: string, instancia: string) {
    return this.http.get<any>(`${this.apiUrl}/${tipo}/instancia/${instancia}`);
  }

  create(tipo: string, data: any) {
    return this.http.post(`${this.apiUrl}/${tipo}`, data);
  }

  update(tipo: string, id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${tipo}/${id}`, data);
  }

  delete(tipo: string, id: number) {
    return this.http.delete(`${this.apiUrl}/${tipo}/${id}`);
  }
}

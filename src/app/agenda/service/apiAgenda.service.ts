import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { AreaResponse, DiaInhabilResponse, DiaInhabilSedeDetalleResponse, DiaInhabilSedePatchRequest, DiaInhabilSedeRequest, DiaInhabilSedeResponse, SedeRequest, SedeResponse } from "../interface/agenda.model";
import { GenericResponse } from "../../shared/interface/shared.interface";

@Injectable({
    providedIn: 'root',
})
export class ApiAgendaService {
    private apiUrl = environment.urlApiAgenda;

    private readonly http = inject(HttpClient);

    getSedes() {
        const url = `${this.apiUrl}/sedes`;
        return this.http.get<GenericResponse<SedeResponse[]>>(url);
    }

    getSedeById(id: number) {
        const url = `${this.apiUrl}/sedes/${id}`;
        return this.http.get<GenericResponse<SedeResponse>>(url);
    }

    postSede(sede: SedeRequest) {
        const url = `${this.apiUrl}/sedes`;
        return this.http.post<GenericResponse<SedeResponse>>(url, sede);
    }
    patchSede(id: number, sede: SedeRequest) {
        const url = `${this.apiUrl}/sedes/${id}`;
        return this.http.patch<GenericResponse<SedeResponse>>(url, sede);
    }

    getDiasInhabiles() {
        const url = `${this.apiUrl}/dias-inhabiles`;
        return this.http.get<GenericResponse<DiaInhabilResponse[]>>(url);
    }
    postDiaInhabil(diaInhabil: DiaInhabilResponse) {
        const url = `${this.apiUrl}/dias-inhabiles`;
        return this.http.post<GenericResponse<DiaInhabilResponse>>(url, diaInhabil);
    }
    patchDiaInhabil(id: number, diaInhabil: DiaInhabilResponse) {
        const url = `${this.apiUrl}/dias-inhabiles/${id}`;
        return this.http.patch<GenericResponse<DiaInhabilResponse>>(url, diaInhabil);
    }

    getDiasInhablesSedes() {
        const url = `${this.apiUrl}/DiaInhabilSede`;
        return this.http.get<GenericResponse<DiaInhabilSedeResponse[]>>(url);
    }

    postDiaInhabilSede(diaInhabilSede: DiaInhabilSedeRequest) {
        const url = `${this.apiUrl}/DiaInhabilSede`;
        return this.http.post<GenericResponse<DiaInhabilSedeResponse>>(url, diaInhabilSede);
    }
    patchDiaInhabilSede(idDiaInhabil: number, diaInhabilSede: DiaInhabilSedePatchRequest) {
        const url = `${this.apiUrl}/DiaInhabilSede/${idDiaInhabil}`;
        return this.http.patch<GenericResponse<DiaInhabilSedeResponse>>(url, diaInhabilSede);
    }
    getDiaInhabilSedeById(idDiaInhabil : number) {
        const url = `${this.apiUrl}/DiaInhabilSede/${idDiaInhabil }`;
        return this.http.get<GenericResponse<DiaInhabilSedeDetalleResponse>>(url);
    }

    getAreas() {
        const url = `${this.apiUrl}/sedes/areas`;
        return this.http.get<GenericResponse<AreaResponse[]>>(url);
    }

}

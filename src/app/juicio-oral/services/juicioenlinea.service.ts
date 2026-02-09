import { map, Observable, tap } from "rxjs";
import {
    DetalleInicioResponse,
    CatMateria,
    CatTipoDocumento,
    ApiResponse,
    CatSexos,
    CatTipoPartes,
    CatTipoVia,
    PreregistroCreadoResponse,
    ListarExpedientesResponse,
    DetalleRequerimiento,
    DocumentoRequerimiento,
    DatosUsuarioResponse,
    AudienciasResponse,
    HorasStartDisponiblesResponse,
    HorasEndDisponiblesResponse,
    CrearAudienciaRequest,
    PartesAudiencia,
    DetalleTramites,
    juzgados,
    Remitente,
    CancelarAudienciaRequest,
    AudienciaCreadaResponse,
    RespuestaRequerimientos,
    RespuestaTramites,
    RespuestaIniciosCreados,
    RespuestaExpedienteDetalle,
    RespuestaExpediente,
    RespuestaListadoAudiencia,
    RespuestaListadoSolicitud,
    CatMunicipios,
    DetalleExpedienteResponse,
    DocumentoResponse,
    ListadoAcuerdosResponse,

} from "../interfaces/juicioenlinea.model";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TokenService } from "../../core/auth/service/token.service";
import { checkToken } from "../../core/auth/interceptor/token.interceptor";

@Injectable({
    providedIn: 'root' // <-- Esto lo registra en el módulo raíz
})

export class JuicioService {

    private inicio = 'http://10.1.10.50:81/api/Inicio/';
    private firma = 'http://10.1.10.50:81/api/VerificaFirma';
    private catalogos = 'http://10.1.10.50:81/api/Catalogo/';
    private permisos = 'http://10.1.10.50:81/api/Permisos/';
    private requerimientos = 'http://10.1.10.50:81/api/Requerimiento/';
    private expediente = 'http://10.1.10.50:81/api/Expediente/';
    private documentos = 'http://10.1.10.50:81/api/Documento/';
    private tramites = 'http://10.1.10.50:81/api/Tramites/';
    private juzgados = 'http://10.1.10.50:81/api/Juzgados/';
    private remitente = 'http://10.1.10.50:81/api/Remitentes/';
    private audiencia = 'http://10.1.10.50:81/api/Audiencia/'
    private solicitud = 'http://10.1.10.50:81/api/Solicitud/'


    constructor(private http: HttpClient, private tokenService: TokenService) { }

    //* ########################################################################
    //* Audiencias  //http://10.1.10.50:81/api/Audiencia/Listar
    //* ########################################################################

    getListadoInicios(params?: any): Observable<RespuestaIniciosCreados> {
        return this.http.get<RespuestaIniciosCreados>(
            `${this.inicio}ListadoPreregistros`, { params, context: checkToken() }
        );
    }

    getDetalleInicios(idInicio: number): Observable<DetalleInicioResponse> {
        const url = `${this.inicio}DetallePreregistro/${idInicio}`;
        return this.http.get<DetalleInicioResponse>(url, { context: checkToken() }
        );
    }

    verificarFirma(request: any): Observable<ApiResponse<any>> {
        const url = `${this.firma}`;
        return this.http.post<ApiResponse<any>>(url, request, { context: checkToken() });
    }

    getDocumento(idDocumento: number): Observable<ApiResponse<DocumentoResponse>> {
        const url = `${this.inicio}Documento/${idDocumento}`;
        return this.http.get<ApiResponse<DocumentoResponse>>(url, { context: checkToken() });
    }

    crearInicio(formData: FormData): Observable<ApiResponse<PreregistroCreadoResponse>> {
        return this.http.post<ApiResponse<PreregistroCreadoResponse>>(
            this.inicio + 'CrearPreregistro', formData, { context: checkToken() }
        );
    }

    getCatalogoMaterias(): Observable<CatMateria[]> {
        const url = `${this.catalogos}Materias`;
        return this.http.get<{ data: CatMateria[] }>(url).pipe(
            map(response => response.data)
        );
    }

    //?: METODO PARA OBTENER LOS DATOS DE LA PARTE
    getDatosUsuario(data: any): Observable<ApiResponse<DatosUsuarioResponse>> {
        const url = `${this.permisos}DatosParte`;
        return this.http.post<ApiResponse<DatosUsuarioResponse>>(url, data, { context: checkToken() });
    }

    getCatalogoMunicipios(): Observable<CatMunicipios[]> {
        const url = `${this.catalogos}Municipios`;
        return this.http.get<{ data: CatMunicipios[] }>(url).pipe(
            map(response => response.data)
        );
    }
    getCatalogoVias(idCatMateria: number): Observable<CatTipoVia[]> {
        const url = `${this.catalogos}Vias/${idCatMateria}`;
        return this.http.get<{ data: CatTipoVia[] }>(url).pipe(
            map(response => response.data)
        );
    }

    getCatalogoSexos(): Observable<CatSexos[]> {
        const url = `${this.catalogos}Generos`;
        return this.http.get<{ data: CatSexos[] }>(url).pipe(
            map(response => response.data)
        );
    }

    getCatalogoTipoPartes(): Observable<CatTipoPartes[]> {
        const url = `${this.catalogos}Partes`;
        return this.http.get<{ data: CatTipoPartes[] }>(url).pipe(
            map(response => response.data)
        );
    }
    getCatTipoDocumento(): Observable<CatTipoDocumento[]> {
        const url = `${this.catalogos}TipoDocumentos`;
        return this.http.get<{ data: CatTipoDocumento[] }>(url).pipe(
            map(response => response.data)
        );

    }

    //Metodos del requerimiento
    crearRequerimientos(formData: FormData): Observable<any> {
        return this.http.post<any>(
            this.requerimientos + 'CrearRequerimiento',
            formData,
            { context: checkToken() }
        );
    }

    enviarRequerimiento(idRequerimiento: number, formData: FormData): Observable<any> {
        const url = `${this.requerimientos + 'SubirRequerimiento'}/${idRequerimiento}`;
        return this.http.post<any>(url, formData,
            { context: checkToken() }
        );
    }



    getListarRequerimientos(params?: any): Observable<RespuestaRequerimientos> {
        return this.http.get<RespuestaRequerimientos>(
            `${this.requerimientos}ListadoRequerimientos`,
            {
                params,
                context: checkToken()
            }
        );
    }

    getListarRequerimientosAbogados(params?: any): Observable<RespuestaRequerimientos> {
        return this.http.get<RespuestaRequerimientos>(
            `${this.requerimientos}ListadoRequerimientosAbogados`,
            {
                params,
                context: checkToken()
            }
        );
    }

    getDetalleRequerimiento(idRequerimiento: number): Observable<DetalleRequerimiento> {
        const url = `${this.requerimientos + 'DetalleRequerimiento'}/${idRequerimiento}`;
        return this.http.get<DetalleRequerimiento>(url, {
            context: checkToken()
        });
    }

    admitirRequerimiento(idRequerimiento: number): Observable<any> {
        const url = `${this.requerimientos + 'AdmitirRequerimiento'}/${idRequerimiento}`;

        return this.http.post<any>(url, {},
            { context: checkToken() }
        );
    }

    datos(usuario: string): Observable<any> {
        const url = `${this.requerimientos + 'Datos'}/${usuario}`;
        return this.http.get<any>(url,
            { context: checkToken() }
        );
    }

    denegarRequerimiento(idRequerimiento: number, formData: any): Observable<any> {
        const url = `${this.requerimientos + 'DenegarRequerimiento'}/${idRequerimiento}`;
        return this.http.post<any>(url, formData,
            { context: checkToken() }
        );
    }

    //Metodo requerimiento expirado
    expiradoRequerimiento(idRequerimiento: number): Observable<any> {
        const url = `${this.requerimientos + 'RequerimientoExpirado'}/${idRequerimiento}`;
        return this.http.post<any>(url, {}, { context: checkToken() });
    }

    getListadoExpedientes(params?: any): Observable<RespuestaExpediente> {
        return this.http.get<RespuestaExpediente>(
            `${this.expediente}Listar`, {
            params,
            context: checkToken()
        }
        );
    }

    getListarExpedienteAbogado(idExpediente: number): Observable<ListarExpedientesResponse[]> {
        const url = `${this.expediente + 'ExpedientesAbogados'}/${idExpediente}`;
        return this.http.get<{ data: ListarExpedientesResponse[] }>(url, {

            context: checkToken()
        }).pipe(map(response => response.data));
    }

    getDetalleExpediente(idExpediente: number, params?: any): Observable<RespuestaExpedienteDetalle> {
        const url = `${this.expediente + 'Detalle'}/${idExpediente}`;
        return this.http.get<RespuestaExpedienteDetalle>(url, {
            params,
            context: checkToken()
        });
    }


    //Docuementos
    getVerDocumentos(idDocumento: number): Observable<DocumentoRequerimiento> {
        const url = `${this.documentos}VerDocumento/${idDocumento}`;
        return this.http.get<DocumentoRequerimiento>(url, {
            context: checkToken()
        });
    }


    getPartesAudiencia(idExpediente: number): Observable<ApiResponse<PartesAudiencia[]>> {
        const url = `${this.expediente}PartesAudiencia/${idExpediente}`;
        return this.http.get<ApiResponse<PartesAudiencia[]>>(url, { context: checkToken() });
    }

    attachExpedienteToAbogado(idExpediente: number): Observable<ApiResponse<any>> {
        const url = `${this.expediente}Relacionar/${idExpediente}`;
        return this.http.post<ApiResponse<any>>(url, {}, { context: checkToken() });
    }


    getListarTramites(params?: any): Observable<RespuestaTramites> {
        return this.http.get<RespuestaTramites>(
            `${this.tramites}Listar`,
            {
                params,
                context: checkToken()
            }
        );
    }

    getDetalleTramite(idTramite: number): Observable<DetalleTramites> {
        const url = `${this.tramites + 'Detalle'}/${idTramite}`;
        return this.http.get<DetalleTramites>(url, {
            context: checkToken()
        });
    }

    crearTramite(formData: FormData): Observable<any> {
        const url = `${this.tramites + 'CrearTramite'}`;
        return this.http.post<any>(url, formData,
            { context: checkToken() }
        );
    }

    busquedaExpediente(formData: any): Observable<any> {
        const url = `${this.expediente + 'Busqueda'}`;
        return this.http.post<any>(url, formData,
            { context: checkToken() }
        );
    }

    getJuzgados(): Observable<juzgados[]> {
        const token = this.tokenService.getToken();
        return this.http.get<{ data: juzgados[] }>(
            `${this.juzgados}Listar`,
        ).pipe(map(response => response.data));
    }

    //Remitentes 
    getRemitentes(busqueda?: string): Observable<{ data: Remitente[] }> {
        // Creamos un objeto vacío
        let params: Record<string, string> = {};

        // Solo añadimos 'busqueda' si tiene un valor definido y no vacío
        if (busqueda && busqueda.trim() !== '') {
            params['busqueda'] = busqueda.trim();
        }

        return this.http.get<{ data: Remitente[] }>(this.remitente + 'Listar', { params, context: checkToken() });
    }


    //########################################################################
    // Audiencias  //http://10.1.10.50:81/api/Audiencia/Listar
    //########################################################################

    // getAudiencias(params?: any): Observable<ApiResponse<AudienciasResponse[]>> {

    //     const url = `${this.audiencia}Listar`;
    //     return this.http.get<ApiResponse<AudienciasResponse[]>>(url, { params, context: checkToken() });
    // }

    getAudiencias(params?: any): Observable<RespuestaListadoAudiencia> {
        return this.http.get<RespuestaListadoAudiencia>(
            `${this.audiencia}Listar`,
            {
                params,
                context: checkToken()
            }
        );
    }
    getDetalleAudiencia(idAudiencia: number): Observable<ApiResponse<AudienciasResponse[]>> {
        const url = `${this.audiencia}Detalle/${idAudiencia}`;
        return this.http.get<ApiResponse<AudienciasResponse[]>>(url, { context: checkToken() });
    }
    crearAudiencia(data: CrearAudienciaRequest): Observable<ApiResponse<AudienciaCreadaResponse>> {
        const url = `${this.audiencia}Crear`;
        return this.http.post<ApiResponse<AudienciaCreadaResponse>>(url, data, { context: checkToken() });
    }
    getHorasDisponiblesAudiencia(fecha: string, idAudiencia?: number): Observable<ApiResponse<HorasStartDisponiblesResponse>> {
        const url = `${this.audiencia}Disponibilidad`;
        const params: any = { fecha };
        if (idAudiencia !== undefined && idAudiencia !== null) {
            params.idAudiencia = idAudiencia;
        }
        return this.http.get<ApiResponse<HorasStartDisponiblesResponse>>(url, {
            params,
            context: checkToken()
        });
    }
    getHorasFinalAudiencia(fecha: string, start: string, idAudiencia?: number): Observable<ApiResponse<HorasEndDisponiblesResponse>> {
        const url = `${this.audiencia}rango-maximo`;
        const params: any = { fecha, start };
        if (idAudiencia !== undefined && idAudiencia !== null) {
            params.idAudiencia = idAudiencia;
        }
        return this.http.get<ApiResponse<HorasEndDisponiblesResponse>>(url, {
            params,
            context: checkToken()
        });
    }
    actualizarAudiencia(idAudiencia: number, data: { title: string; agenda: string; start: string; end: string }): Observable<ApiResponse<any>> {
        const url = `${this.audiencia}Editar/${idAudiencia}`;
        return this.http.put<ApiResponse<any>>(url, data, { context: checkToken() });
    }
    cancelarAudiencia(idAudiencia: number, formData: FormData): Observable<ApiResponse<CancelarAudienciaRequest>> {
        const url = `${this.audiencia}Cancelar/${idAudiencia}`;
        return this.http.post<ApiResponse<CancelarAudienciaRequest>>(url, formData, { context: checkToken() });
    }

    //########################################################################
    // Solicitudes de audiencia  //http://10.1.10.50:81/api/Solicitudes
    //########################################################################


    solicitarAudiencia(formData: FormData): Observable<ApiResponse<any>> {
        const url = `${this.solicitud}Crear`;
        return this.http.post<ApiResponse<any>>(url, formData, { context: checkToken() });
    }

    // getSolicitudesAudiencia(): Observable<ApiResponse<SolicitudesGrabacionesResponse[]>> {
    //     const url = `${this.solicitud}Listar`;
    //     return this.http.get<ApiResponse<SolicitudesGrabacionesResponse[]>>(url, { context: checkToken() });
    // }

    getSolicitudesAudiencia(params?: any): Observable<RespuestaListadoSolicitud> {
        return this.http.get<RespuestaListadoSolicitud>(
            `${this.solicitud}Listar`,
            {
                params,
                context: checkToken()
            }
        );
    }

    updateSolicitudesAudiencia(idAudiencia: number, formData: FormData): Observable<ApiResponse<any>> {
        const url = `${this.solicitud}Actualizar/${idAudiencia}`;
        return this.http.post<ApiResponse<any>>(url, formData, { context: checkToken() });
    }


    //########################################################################
    // Acuerdo  //http://10.1.10.50:81/api/Audiencia/Listar
    //########################################################################

    private acuerdo = 'http://10.1.10.50:81/api/Acuerdo';


    getTramitesExpediente(idExpediente: number): Observable<ApiResponse<DetalleExpedienteResponse>> {
        const url = `${this.tramites + 'Expediente'}/${idExpediente}`;
        return this.http.post<ApiResponse<DetalleExpedienteResponse>>(url, { context: checkToken() });
    }

    enviarAcuerdo(formData: FormData): Observable<ApiResponse<any>> {
        const url = `${this.acuerdo}/Crear`;
        return this.http.post<ApiResponse<any>>(url, formData, { context: checkToken() });
    }

    getListarAcuerdos(params?: any): Observable<ApiResponse<ListadoAcuerdosResponse[]>> {
        return this.http.get<ApiResponse<ListadoAcuerdosResponse[]>>(
            `${this.acuerdo}/Listar`, { params, context: checkToken() }
        );
    }
    getDetalleAcuerdo(idAcuerdo: number): Observable<ApiResponse<ListadoAcuerdosResponse>> {
        const url = `${this.acuerdo}/Detalle/${idAcuerdo}`;
        return this.http.get<ApiResponse<ListadoAcuerdosResponse>>(url, { context: checkToken() }
        );
    }
    multifirmaAcuerdo(request: any, idAcuerdo: number): Observable<ApiResponse<any>> {
        const url = `${this.acuerdo}/Actualizar/${idAcuerdo}`;
        return this.http.post<ApiResponse<any>>(url, request, { context: checkToken() }
        );
    }
    getDocumentoAcuerdo(idAcuerdo: number): Observable<ApiResponse<DocumentoResponse>> {
        const url = `${this.documentos}VerDocumentoAcuerdo/${idAcuerdo}`;
        return this.http.get<ApiResponse<DocumentoResponse>>(url, { context: checkToken() });
    }
}


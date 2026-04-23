
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
    nombre?: string;
    descripcion?: string;
    pagination?: Pagination;

}
export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}
//##########################################################
// LISTADO DE PREREGISTROS RESPONSE  //http://127.0.0.1:8000/api/Inicio/ListadoPreregistros

export interface ListadoDemandasResponse { //* OK
    idDemanda: number;
    folio: string;
    //sintesis: string;
    fechaHoraRecepcion: string;
    descripcionDemanda: string;
    idGeneral: string;
    usr: number;
    created_at: string;
    updated_at: string;
    cat_via_materia: CatMateriaVia;
    ultimo_estado: HistorialEstado;
}

export interface CatMateria {
    idCatMateria: number;
    descripcion: string;
}
export interface CatTipoVia {
    idCatTipoVia: number;
    descripcion: string;
}


//########################################################################
// DETALLE DE PREREGISTROS RESPONSE   //http://127.0.0.1:8000/api/Inicio/DetallePreregistro/{idDemanda}

export interface DetalleDemandaResponse {  //* OK
    idExpediente: number;
    NumExpediente: string;
    idCatJuzgado: string;
    fechaResponse: string;
    idDemanda: string;
    idSecretario: string;
    numSecretaria: string;
    juzgado: Juzgado;
    demanda: DemandaResponse;
}
export interface DemandaResponse {
    idDemanda: number;
    folio: string;
    idCatViaMateria: number;
    sintesis: string;
    fechaHoraRecepcion: string;
    descripcionDemanda: string;
    idGeneral: string;
    partes: Partes[];
    anexos_declarados: AnexosDeclarados[];
    documentos: Documentos[];
    cat_via_materia: CatMateriaVia;
    ultimo_estado: HistorialEstado;
    movimientos: Movimiento[];
    //tipo: string;
}

export interface Partes { //* OK
    idParte: number;
    idDemanda: number;
    idCatTipoParte: number;
    nombre: string;
    apellidoMaterno: string;
    apellidoPaterno: string;
    direccion: string;
    menorEdad: boolean;
    curp: string;
    idCatSexo: number;
    correo: string;
    correoAlterno?: string;
    cat_tipo_parte: CatTipoPartes;
}
export interface AnexosDeclarados {
    idAnexoDeclarado: number;
    idDemanda: number;
    idCatTipoDocumento: number;
    cantidad: number;
    valor: number;
    created_at: string;
    updated_at: string;
    cat_tipo_documento: CatTipoDocumento;
}
export interface CatTipoDocumento { //* OK
    idCatTipoDocumento: number;
    nombre: string;
    activo: string;
    descripcion: string

}
export interface Documentos { //* OK
    idDocumento: number;
    idDemanda: number;
    idCatTipoDocumento: number | null;
    nombre: string;
    folio: string;
    documento: string;
    montoAnexo: number | null;
    created_at: string;
    updated_at: string;
    //cat_tipo_documento: CatTipoDocumento;
    cat_sexo: CatSexos;
}
export interface CatMateriaVia { //* OK
    idCatMateriaVia: number;
    idCatMateria: number;
    idCatVia: number;
    created_at: string;
    updated_at: string;
    cat_materia: CatMateria;
    cat_via: CatVia;
}
export interface CatMateria { //* OK
    IdCatMateria: number;
    Descripcion: string;
    activo: string;
    created_at: string;
    updated_at: string;
}

export interface CatVia { //* OK
    idCatVia: number;
    descripcion: string;
    activo: string;
    created_at: string;
    updated_at: string;
}
export interface CatMunicipios { //* OK
    idMunicipio: number;
    Descripcion: string;
}
export interface HistorialEstado { //* OK
    descripcion: any;
    idDemanda: number;
    idCatEstadoInicio: number;
    fechaEstado: string;
    estado: Estado;
}
export interface Estado { //* OK
    idCatEstadoInicio: number;
    descripcion: string;
}

export interface Movimiento {
    idHistorialMovimientoDemanda: number;
    idDemanda: number;
    idCatEstadoDemanda: number;
    idMovimiento: number;
    cargoRecibe: string;
    idGeneralRecibe: number;
    fechaRecepcion: Date;
    cargoTurna: string;
    idGeneralTurna: number;
    fechaTurnado: Date;
    observaciones?: string;
    revocado: boolean;
    activo: boolean;
}
export interface DocumentoResponse {  //! QUITAR
    did: string;
    sid: string;
    file: string;
    nombre: string;
    descripcion: string;

}

//########################################################################
// CREAR DE PREREGISTRO REQUEST  //http://127.0.0.1:8000/api/Inicio/CrearPreregistro

// export interface DetalleDemandaRequest {
//     idCatMateria: number;
//     idCatTipoVia: number;
//     descripcionDemanda: string;
//     partes: PartesRequest[];
//     documentos: DocumentosRequest[];
// }

export interface PartesRequest { //* OK 
    //// idUsr: string | null;
    nombre: string;
    apellidoMaterno?: string;
    apellidoPaterno: string;
    correo: string;
    correoAlterno?: string;
    direccion: string;
    esMenorEdad: boolean;
    idCatSexo: number | null;
    idCatTipoParte: number | null;
    // IU
    descripcionTipoParte?: string;
    filtroParte?: 'busqueda' | 'manual';

}
export interface AnexosDelcaradosRequest {
    idCatTipoDocumento: number;
    descripcion?: string;
    cantidad: number;
    valor?: number;

}
export interface DocumentosRequest { //* OK
    //idCatTipoDocumento: number;
    nombre: string;
    documento: File;
    firmaDigital: number;
    // IU
    peso?: number;

}

export interface CatSexos {
    idCatSexo: number;
    descripcion: string;

}
export interface CatTipoPartes {
    idCatTipoParte: number;
    descripcion: string;


}
export interface CatTipoDocumento {
    idCatTipoDocumento: number;
    descripcion: string;
    activo: string;
    created_at: string;
    updated_at: string;
}

//REPONSE DE CREAR PREREGISTRO
export interface CrearDemandaResponse {
    idDemanda: number;
    folio: string;
    fechaHoraRecepcion: Date;
    expediente: ListarExpedientesResponse;
}
//REPONSE DE DATOS PARA PARTES PREREGISTRO
export interface DatosUsuarioResponse {
    idUsr: string;
    nombre: number;
    direccion: string;
    correo: string;
    correoAlterno: string;
}
//REPONSE DE DATOS DE USUARIO
export interface DatosUsRResponse {
    nombre: string;
    foto: string;
    correo: string;
    correoAlterno: string;
}
//########################################################################
// LISTAR EXPEDIENTES  //http://127.0.0.1:8000/api/Expediente/Listar

export interface ListarExpedientesResponse {
    idExpediente: number;
    NumExpediente: string;
    idCatJuzgado: string;
    fechaResponse: string;
    idDemanda: string;
    idSecretario: string;
    numSecretaria: string;
    tramites: DetalleTramites[];
    demanda: DemandaResponse;
    juzgado: Juzgado;
    ultimo_historial: HistorialExpediente;

}

export interface HistorialExpediente {
    idHistorialExpediente: number;
    idEstadoExpediente: string;
    descripcion: string;
    created_at: Date;
    estado: Estado;
}

export interface Estado { //* OK
    idEstadoExpediente: number;
    descripcion: string;
}
//########################################################################

//Requerimiento
export interface crearRequerimiento {
    idExpediente: number
    idAbogado: number
    descripcion: String
    documentoAcuerdo: File
    idSecretario: number
}
export interface subirRequerimiento {
    idCatTipoDocumento: number;
    documentoNuevo: File
    idAbogado: number
}

export interface listarRequerimientos {
    segundos: string;
    minutos: string;
    horas: string;
    dias: string;
    tiempoRestante: any;
    idRequerimiento: number,
    created_at: Date,
    fechaLimite: Date,
    idExpediente: number,
    expediente: ListarExpedientesResponse,
    abogado: abogado,
}

export interface DetalleRequerimiento {
    idRequerimiento: number,
    descripcion: string,
    idExpediente: number,
    created_at: Date,
    fechaLimite: Date,
    idAbogado: number;
    idSecretario: number;
    usuarioAbogado: string;
    usuarioSecretario: string;
    documento_acuerdo: Documentos;
    documento_acuse: Documentos;
    documento_oficio_requerimiento: Documentos;
    documentos_requerimiento: Documentos[];
    historial: Historial[];
    descripcionRechazo: string;
    expediente: ListarExpedientesResponse;
    tipo: string;
    folioRequerimiento: string;
    abogado: abogado;
}

export interface usuario {
    id: number,
    name: string,
}

export interface abogado {
    idAbogado: number,
    idUsr: number;
    idGeneral: number,
    nombre: string,
    correo: string,
    correoAlterno: string,
    created_at: Date,
}

export interface DocumentoRequerimiento {
    nombre: string;
    documento: string;
    idCatTipoDocumento: number;
}

export interface Historial {
    idHistorialEstadoRequerimientos: number
    idRequerimiento: number
    idCatEstadoRequerimientos: number,
    idUsuario: number
    created_at: Date,
    updated_at: Date,
    cat_estado_requerimiento: catEstadoRequerimientos
}

export interface catEstadoRequerimientos {
    idCatEstadoRequerimientos: number;
    nombre: string;
    descripcion: string;
    created_at: Date;
    updated_at: Date;
    idRequerimiento: number;
}


export interface DetalleExpedienteResponse { //* OK 
    idExpediente: number;
    NumExpediente: string;
    idCatJuzgado: string;
    fechaResponse: string;
    idDemanda: string;
    idSecretario: string;
    numSecretaria: string;
    juzgado: Juzgado;
    tramites: DetalleTramites[];
    pre_registro: DemandaResponse;
    requerimientos: DetalleRequerimiento;

}

export interface UsuarioPermisosResponse {
    success: boolean;
    message: string | null;
    errors: any;
    data: {
        mS_UserProfile: any[];
        pD_Abogados: any[];
    };
}



//########################################################################
// PARTES PARA CREAR AUDIENCIA  //http://127.0.0.1:8000/api/Audiencia/Crear


export interface PartesAudiencia {
    idParte?: string;
    idDemanda?: string;
    idUsr: number | null;
    idGeneral?: number;
    nombre: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    correo: string;
    correoAlterno?: string;
    direccion?: string;
    idCatSexo: number | null;
    sexoDescripcion?: string;
    idCatTipoParte: number | null;
    tipoParteDescripcion?: string;
    descripcionTipoParte?: string;
    filtroParte?: 'busqueda' | 'manual';
    esNueva?: boolean
    esAbogado: boolean;

}
export interface AudienciaCreadaResponse {
    idAudiencia: number;

}
export interface CrearAudienciaRequest {
    idExpediente: number;
    title: string;
    agenda: string;
    start: string; // formato: 'YYYY-MM-DD HH:mm:ss'
    end: string;   // formato: 'YYYY-MM-DD HH:mm:ss'
    invitees: CrearAudienciaInvitee[];
}
export interface CrearAudienciaInvitee {

    correo: string;
    correoAlterno?: string;
    nombre: string
    idUsr: number | null;
    idCatSexo: number | null;
    idCatTipoParte: number | null;
    direccion: string;

}

export interface InvitadosAudienciaResponse {
    idInvitado: number;
    idAudiencia: string;
    email: string;
    displayName: string;
    coHost: boolean;
    created_at: string;
    updated_at: string;
    idCatSexo: number;
    sexoDescripcion: string;
    idCatTipoParte: number;
    tipoParteDescripcion: string;
}
//########################################################################
// RESPONSE LISTADO DE AUDIENCIAS  //http://127.0.0.1:8000/api/Audiencia/Listar

export interface AudienciasResponse {
    idAudiencia: number;
    idExpediente: string;
    title: string;
    agenda: string;
    start: string;
    end: string;
    webLink: string;
    hostEmail: string;
    id: string;
    meetingNumber: string;
    password?: string;
    created_at: string;
    updated_at: string;
    folio: string;
    invitados: Invitados[];
    expediente: ListarExpedientesResponse;
    ultimo_estado: UltimoEstadoAudienciaResponse;
    grabaciones?: GrabacionesAudienciaResponse[];


}
export interface Invitados {
    idInvitado: number;
    idAudiencia: string;
    idUsr: number;
    correo: string;
    correoAlterno?: string;
    nombre: string;
    coHost: boolean;
    direccion: string;
    idCatSexo: number;
    sexoDescripcion: string;
    idCatTipoParte: number;
    tipoParteDescripcion: string;


}

export interface UltimoEstadoAudienciaResponse {
    idHistorialEstadoAudiencia: number;
    idAudiencia: string;
    idCatalogoEstadoAudiencia: string | number;
    descripcion: string;
    fechaHora: string;
    observaciones: string;
    idDocumento?: number;
}

export interface GrabacionesAudienciaResponse {
    idGrabacion: number;
    idAudiencia: string;
    id: string;
    topic: string;
    playbackUrl: string;
    password: string;
    durationSeconds: string;
}
export interface HorasStartDisponiblesResponse {
    fecha: string;
    ocupados: HorasOcupadas[];
    disponibles: string[];
}

export interface HorasOcupadas {
    start: string;
    end: string;
}

export interface HorasEndDisponiblesResponse {
    fecha: string;
    start: string;
    end: string[];
}

//########################################################################
//*CANCELACION DE AUDIENCIA  //http://

export interface CancelarAudienciaRequest {
    idCatTipoDocumento: number;
    documento: File;
    observaciones?: string;

}
//########################################################################
//*SOLICITAR GRABACIONES DE AUDIENCIA  //http://

export interface SolicitarGrabacionRequest {
    idAudiencia: number;
    documento: File;
    observaciones?: string;
}

//########################################################################
//*LISTADO DE SOLICITUDES DE GRABACIONES  

export interface SolicitudesGrabacionesResponse {
    idSolicitud: number;
    idGeneral: string;
    observaciones: string;
    idAudiencia: string;
    folio: string;
    created_at: string;
    updated_at: string;
    primer_estado: EstadosSolicitudResponse;
    ultimo_estado: EstadosSolicitudResponse;
    audiencia: AudienciasResponse;
}
export interface EstadosSolicitudResponse {
    idHistorialEstadoSolicitud: number;
    idSolicitud: string;
    idCatalogoEstadoSolicitud: string;
    fechaEstado: Date;
    idDocumento: string;
    observaciones: string;
    estado: EstadoSolicitud;
}

export interface EstadoSolicitud {
    idCatEstadoSolicitud: number;
    descripcion: string;
    activo: number;
}
//########################################################################
//*PANTALLAS DE USUARIO  //http://127.0.0.1:8000/api/Permisos/ModulosYPantallas

export interface SistemaModuloResponse {
    idSistemaModulo: number;
    nombre: string;
    descripcion: string;
    ejecutable: string;
    pantallas: Pantalla[];
}
export interface Pantalla {
    idPantalla: number;
    nombre: string;
    descripcion: string;
    idSistemaModulo: number;
    tipoCatalogo: number | null;
    idCatalogo: number | null;
    ejecutable: string;
    valores: string;
    exe: string;
    imagen: string;
    acceso: string;
    orden: number;
    fechaProduccion: string;
    visibleMenu: boolean;
}

//Tramites
export interface ListadoTramites {
    idTramite: number
    idCatTramite: number
    idGeneral: number
    usr: number
    folioOficio: string
    sintesis: string
    observaciones: string
    idExpediente: number
    notificado: number
    idDocumentoTramite: number
    created_at: Date
    historial: HistorialTramite[];
    cat_tramite: TipoTramite;
    expediente: ListarExpedientesResponse;
}

export interface DetalleTramites {
    idTramite: number
    idCatTramite: number
    idGeneral: number
    usr: number
    folioOficio: string
    sintesis: string
    observaciones: string
    idExpediente: number
    notificado: number
    idDocumentoTramite: number
    created_at: Date
    idAcuerdo?: number | null;
    historial: HistorialTramite;
    cat_tramite: TipoTramite;
    documento: Documentos;
    // expediente: DetalleExpediente;
    partes_tramite: Partes[];
    idCatRemitente: number;
    remitente: Remitente;
    expediente: ListarExpedientesResponse;

}

export interface HistorialTramite {
    idHistorialEstadoTramite: number
    idTramite: number,
    idCatEstadoTramite: number,
    created_at: Date,
    cat_estado_tramite: catEstadoTramite;
}

export interface catEstadoTramite {
    idCatEstadoTramite: number
    nombre: string
    activo: number
    created_at: Date
}
export interface TipoTramite {
    idCatTramite: number,
    nombre: string,
    activo: number,
    created_at: Date
}

export interface Juzgado {
    IdCatJuzgado: number
    nombre: string
    lugar: string
    Descripcion: string
}

export interface Remitente {
    idCatRemitente: number;
    categoria: string;
    dependencia: string;
    remitente: string;
    cargo: string;
    juzgados: Juzgado[];
}

//para paginar
export interface RespuestaRequerimientos {
    status: number;
    message: string;
    data: listarRequerimientos[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface RespuestaTramites {
    status: number;
    message: string;
    data: ListadoTramites[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface RespuestaIniciosCreados {
    status: number;
    message: string;
    data: ListadoDemandasResponse[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;

    };
}



export interface RespuestaExpedienteDetalle {
    success: boolean;
    status: number;
    data: {
        expediente: ListarExpedientesResponse;
        registros: RegistroExpediente[];
        pagination: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}

export interface RespuestaListadoAudiencia {
    success: boolean;
    status: number;
    data: AudienciasResponse[],
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };

}

export interface RespuestaListadoSolicitud {
    success: boolean;
    status: number;

    data: SolicitudesGrabacionesResponse[],
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };

}

export type RegistroExpediente =
    | DetalleDemandaResponse
    | DetalleRequerimiento
    | DetalleTramites
    | AudienciasResponse;



//########################################################################
//*ACUERDOS  //http://127.0.0.1:8000/api/Permisos/ModulosYPantallas

export interface ListadoAcuerdosResponse {
    idAcuerdo: number;
    folio: string;
    sintesis: string;
    observaciones: string;
    fechaAcuerdo: string;
    expediente?: DetalleExpedienteResponse;
    tramites?: DetalleTramites[];
    ultimo_estado?: HistorialEstadoAcuerdoResponse;
    documento?: DocumentoAcuerdoResponse;
}

export interface HistorialEstadoAcuerdoResponse {
    idHistorialEstadoAcuerdo: number;
    idAcuerdo: string;
    idCatEstadoAcuerdo: string;
    fechaHora: Date;
    observaciones: string;
    estado?: EstadoAcuerdoResponse;
}

export interface EstadoAcuerdoResponse {
    idCatEstadoAcuerdo: number;
    descripcion: string;
}

export interface DocumentoAcuerdoResponse {
    idDocumentoAcuerdo: number;
    idAcuerdo: number;
    nombre: string;
}
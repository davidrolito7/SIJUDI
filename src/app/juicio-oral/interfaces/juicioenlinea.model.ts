/**
 * ============================================
 * JUICIO EN LÍNEA - INTERFACES LIMPIAS
 * ============================================
 * 
 * Archivo optimizado sin interfaces no utilizadas
 * Organizado por módulos funcionales
 */

// ========================================
// 1️⃣ CORE & BASE TYPES
// ========================================

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

// ========================================
// 2️⃣ CATALOGOS
// ========================================

export interface CatMateria {
    IdCatMateria: number;
    Descripcion: string;
    activo?: string;
}

export interface CatTipoVia {
    idCatTipoVia: number;
    descripcion: string;
    activo?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CatVia {
    idCatVia: number;
    descripcion: string;
    activo: string;
    created_at: string;
    updated_at: string;
}

export interface CatMunicipios {
    idMunicipio: number;
    Descripcion: string;
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
    nombre: string;
    descripcion: string;
    activo: string;
    created_at?: string;
    updated_at?: string;
}

// ========================================
// 3️⃣ DEMANDAS
// ========================================

export interface DetalleDemandaResponse {
    idTramite: number;
    idCatTramite: string | number;
    idGeneral: string;
    folio: string;
    sintesis: string;
    observaciones: string;
    idExpediente: string | number;
    notificado: string | number;
    idCatRemitente?: number | null;
    idAcuerdo?: number | null;
    created_at: string;
    updated_at: string;
    idEntidad: string | number;
    tipoEntidad: 'Demanda';
    fechaRecepcion: string;
    entidad: DemandaEntity;
    expediente: ListarExpedientesResponse;
    ultimo_estado: HistorialEstadoTramite;
    movimientos: MovimientoTramite[];
    documentos: Documentos[];
}

export interface CrearDemandaResponse {
    idDemanda: number;
    folio: string;
    fechaHoraRecepcion: Date;
    expediente: ListarExpedientesResponse;
}

export interface DocumentoResponse {
    did: string;
    sid: string;
    file: string;
    nombre: string;
    descripcion: string;
}

// --- DEMANDAS: NESTED ---

export interface DemandaEntity {
    idDemanda: number;
    idCatJuzgado?: number | null;
    folioOficialia?: string | null;
    folio: string;
    idCatTipoExpediente?: number | null;
    idCatViaMateria: string | number;
    secretaria?: string | null;
    fechaHoraRecepcion: string;
    descripcionDemanda: string;
    archivado: string;
    activo: string;
    certificacion: string;
    idGeneralRecibe?: string | null;
    importadoNS: string;
    numContancia?: string | null;
    idGeneral: string;
    esCapturaOficialia: string;
    idAcuerdo?: number | null;
    created_at: string;
    updated_at: string;
    cveMunicipio: string;
    expediente: DetalleExpedienteResponse;
    partes: Partes[];
    documentos?: Documentos[];
    anexos_declarados?: AnexosDeclarados[];
    ultimo_estado: HistorialEstadoDemanda;
    cat_via_materia: CatMateriaVia;
    movimientos: MovimientoTramite[];
}

export interface Partes {
    idParte: number;
    idDemanda: number | string;
    idCatTipoParte: number | string;
    nombre: string;
    apellidoMaterno?: string;
    apellidoPaterno?: string;
    direccion: string;
    menorEdad: boolean | string;
    curp: string;
    idCatSexo: number | string;
    correo: string;
    correoAlterno?: string | null;
    activo?: string;
    created_at?: string;
    updated_at?: string;
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

export interface Documentos {
    idDocumento: number;
    idTramite?: number | string;
    nombre: string;
    documento: string;
    folio?: string;
    activo?: string;
    created_at: string;
    updated_at: string;
}

export interface CatMateriaVia {
    idCatMateriaVia: number;
    idCatMateria: number | string;
    idCatVia: number | string;
    idCatTipoVia?: number | string;
    activo?: string;
    created_at: string;
    updated_at: string;
    cat_materia: CatMateria;
    cat_via: CatVia;
}

export interface HistorialEstadoDemanda {
    idHistorialEstadoDemanda: number;
    idDemanda: string | number;
    idCatEstadoDemanda: number;
    fechaEstado: string;
    idGeneral: string;
    cat_estado_demanda: CatEstadoDemanda;
}

export interface CatEstadoDemanda {
    idCatEstadoDemanda: number;
    descripcion: string;
    activo?: string;
}

export interface HistorialEstado {
    descripcion: any;
    idDemanda: number;
    idCatEstadoInicio: number;
    fechaEstado: string;
    cat_estado_demanda: CatEstadoDemanda;
}

export interface MovimientoTramite {
    idHistorialMovimientoTramite: number;
    idTramite: string | number;
    idMovimiento: string | number;
    cargoRecibe: string;
    idGeneralRecibe: string | number;
    fechaRecepcion: string;
    cargoTurna?: string | null;
    idGeneralTurna?: string | null;
    fechaTurnado?: string | null;
    observaciones?: string | null;
    revocado: boolean;
    activo: boolean;
}

// ========================================
// 4️⃣ EXPEDIENTES
// ========================================

export interface ListarExpedientesResponse {
    idExpediente: number;
    NumExpediente: string;
    idArea: string;
    fechaResponse: string;
    idDemanda: string;
    idSecretario: string;
    numSecretaria: string;
    tramites: DetalleTramiteResponse[];
    demanda: DemandaEntity;
    area: Area;
    ultimo_historial: HistorialExpediente;
}

export interface DetalleExpedienteResponse {
    idExpediente: number;
    NumExpediente: string;
    idArea: string;
    fechaResponse: string;
    idDemanda: string;
    idSecretario?: string;
    numSecretaria?: string;
    idSubArea?: string;
    area: Area;
    tramites: DetalleTramiteResponse[];
    demanda: DemandaEntity;
    requerimientos: DetalleRequerimiento[];
    acuerdos: ListadoAcuerdosResponse[];
    audiencias: AudienciasResponse[];
}

// --- EXPEDIENTES: NESTED ---

export interface HistorialExpediente {
    idHistorialExpediente: number;
    idEstadoExpediente: string;
    descripcion: string;
    created_at: Date;
    cat_estado_expediente?: CatEstadoExpediente;
}

export interface CatEstadoExpediente {
    idEstadoExpediente: number;
    descripcion?: string;
}

// ========================================
// 5️⃣ TRÁMITES
// ========================================

export interface ListadoTramitesResponse {
    idTramite: number;
    idCatTramite: number;
    idGeneral: number;
    folio: string;
    sintesis: string;
    observaciones: string;
    idExpediente: number;
    notificado: number;
    idDocumentoTramite: number;
    created_at: Date;
    expediente: ListarExpedientesResponse;
    cat_tramite: TipoTramite;
    ultimo_estado: HistorialEstadoTramite;
}

export interface DetalleTramiteResponse {
    idTramite: number;
    idCatTramite: string | number;
    idGeneral: string;
    folio: string;
    sintesis: string;
    observaciones: string;
    idExpediente: string | number;
    notificado: string | number;
    idCatRemitente?: number | null;
    idAcuerdo?: number | null;
    created_at: string;
    updated_at: string;
    idEntidad: string | number;
    tipoEntidad: 'Tramite';
    fechaRecepcion: string;
    expediente: ListarExpedientesResponse;
    ultimo_estado: HistorialEstadoTramite;
    cat_tramite: TipoTramite;
    movimientos: MovimientoTramite[];
    documentos?: Documentos[];
    partes_tramite?: Partes[];
    documento?: Documentos;
    remitente?: Remitente;

}

// --- TRÁMITES: NESTED ---

export interface HistorialEstadoTramite {
    idHistorialEstadoTramite: number;
    idTramite: number | string;
    idCatEstadoTramite: number;
    fechaEstado?: string;
    created_at: string | Date;
    updated_at?: string;
    cat_estado_tramite: catEstadoTramite;
}

export interface catEstadoTramite {
    idCatEstadoTramite: number;
    nombre: string;
    activo: number | string;
    created_at?: string | Date;
}

export interface TipoTramite {
    idCatTramite: number;
    nombre: string;
    activo: number;
    created_at: Date;
}

// ========================================
// 6️⃣ REQUERIMIENTOS
// ========================================

export interface DetalleRequerimiento {
    idRequerimiento: number;
    descripcion: string;
    idExpediente: number;
    created_at: Date;
    fechaLimite: Date;
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

export interface DocumentoRequerimiento {
    nombre: string;
    documento: string;
    idCatTipoDocumento: number;
}

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

// --- REQUERIMIENTOS: NESTED ---

export interface listarRequerimientos {
    segundos: string;
    minutos: string;
    horas: string;
    dias: string;
    tiempoRestante: any;
    idRequerimiento: number;
    created_at: Date;
    fechaLimite: Date;
    idExpediente: number;
    expediente: ListarExpedientesResponse;
    abogado: abogado;
}

export interface Historial {
    idHistorialEstadoRequerimientos: number;
    idRequerimiento: number;
    idCatEstadoRequerimientos: number;
    idUsuario: number;
    created_at: Date;
    updated_at: Date;
    cat_estado_requerimiento: catEstadoRequerimientos;
}

export interface catEstadoRequerimientos {
    idCatEstadoRequerimientos: number;
    nombre: string;
    descripcion: string;
    created_at: Date;
    updated_at: Date;
    idRequerimiento: number;
}

export interface abogado {
    idAbogado: number;
    idUsr: number;
    idGeneral: number;
    nombre: string;
    correo: string;
    correoAlterno: string;
    created_at: Date;
}

export interface usuario {
    id: number;
    name: string;
}

// --- REQUERIMIENTOS: REQUESTS ---

export interface crearRequerimiento {
    idExpediente: number;
    idAbogado: number;
    descripcion: String;
    documentoAcuerdo: File;
    idSecretario: number;
}

export interface subirRequerimiento {
    idCatTipoDocumento: number;
    documentoNuevo: File;
    idAbogado: number;
}

// ========================================
// 7️⃣ AUDIENCIAS
// ========================================

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

export interface AudienciaCreadaResponse {
    idAudiencia: number;
}

export interface CrearAudienciaRequest {
    idExpediente: number;
    title: string;
    agenda: string;
    start: string;
    end: string;
    invitees: PartesAudiencia[];
}

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
    esNueva?: boolean;
    esAbogado: boolean;
}

export interface HorasStartDisponiblesResponse {
    fecha: string;
    ocupados: HorasOcupadas[];
    disponibles: string[];
}

export interface HorasEndDisponiblesResponse {
    fecha: string;
    start: string;
    end: string[];
}

export interface CancelarAudienciaRequest {
    idCatTipoDocumento: number;
    documento: File;
    observaciones?: string;
}

// --- AUDIENCIAS: NESTED ---

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

export interface HorasOcupadas {
    start: string;
    end: string;
}

// ========================================
// 8️⃣ SOLICITUDES
// ========================================

export interface RespuestaListadoSolicitud {
    success: boolean;
    status: number;
    data: SolicitudesGrabacionesResponse[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// --- SOLICITUDES: NESTED ---

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

// ========================================
// 9️⃣ ACUERDOS
// ========================================

export interface ListadoAcuerdosResponse {
    idAcuerdo: number;
    folio: string;
    sintesis: string;
    observaciones: string;
    fechaAcuerdo: string;
    expediente?: DetalleExpedienteResponse;
    tramites?: DetalleTramiteResponse[];
    ultimo_estado?: HistorialEstadoAcuerdoResponse;
    ultimo_documento: DocumentoAcuerdoResponse;
}

// --- ACUERDOS: NESTED ---

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

// ========================================
// 🔟 JUZGADOS & REMITENTES
// ========================================

export interface Area {
    IdArea: number;
    idMunicipio: string;
    Nombre: string;
    Dirección?: string;
    Activo: boolean;
}

export interface Remitente {
    idCatRemitente: number;
    categoria: string;
    dependencia: string;
    remitente: string;
    cargo: string;
    juzgados: Area[];
}

// ========================================
// 1️⃣1️⃣ USUARIOS
// ========================================

export interface DatosUsuarioResponse {
    idUsr: string;
    nombre: string;
    direccion: string;
    correo: string;
    correoAlterno: string;
}

export interface ContadoresTramites {
    demandas_pendientes_turnar: number;
    tramites_pendientes_turnar: number;
    pendientes_recibir: number;
    expedientes_activos: number;
    acuerdos_sin_firmar: number;
}

// ========================================
// 1️⃣2️⃣ SISTEMA & PANTALLAS
// ========================================

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

// ========================================
// 1️⃣3️⃣ REQUESTS (PARA CREAR/ACTUALIZAR)
// ========================================

export interface PartesRequest {
    nombre: string;
    apellidoMaterno?: string;
    apellidoPaterno?: string;
    apoderadoNombre?: string;
    apoderadoApellidoPaterno?: string;
    apoderadoApellidoMaterno?: string;
    apoderadoIdCatSexo?: number | null;
    moral?: boolean;
    correo: string;
    telefono?: string;
    direccion: string;
    esMenorEdad: boolean;
    idCatSexo: number | null;
    idCatTipoParte: number | null;
    fechaNacimiento?: Date | string | null;
    grupoVulnerable?: Array<string | number>;
    idDiscapacidad?: number[];
    idLenguaje?: number[];
    descripcionTipoParte?: string;
    filtroParte?: 'busqueda' | 'manual';
}

export interface AnexosDelcaradosRequest {
    idCatTipoDocumento: number;
    descripcion?: string;
    cantidad: number;
    fojas: number;
    valor?: number;
    archivo: File;
    esValor: boolean;
    observaciones?: string;
}

export interface DocumentosRequest {
    nombre: string;
    documento: File;
    firmaDigital: number;
    peso?: number;
}

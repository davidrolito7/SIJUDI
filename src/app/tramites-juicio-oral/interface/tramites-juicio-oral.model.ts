
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

export interface TramitesElectronicosRecibidosResponse {
    idTramiteElectronicoRecibido: number;
    folio: string;
    fechaEnvio: Date;
    idRelacion: number;
    observaciones: string;
    cantidadAnexos: number;
    activo: boolean;

    //este campo llega al enviar la promocion, no en el listado 
    juzgado?: string;
}

export interface DetalleTramiteElectronicoRecibidoResponse extends TramitesElectronicosRecibidosResponse {
    archivos: DetalleTramiteElectronicoRecibidoResponse[];
}

export interface DetalleTramiteElectronicoRecibidoResponse {
    idArchivo: number;
    idTramiteElectronicoRecibido: number;
    url: string;
    nombreArchivo: string;
    activo: boolean;
}

export interface CatJuzgadoResponse {
    idCatJuzgado: number;
    descripcion: string;
}

export interface ValidarCausaResponse {
    idCausa: number;
    idCatJuzgado: number;
    numCausa: string;
    numCarpeta: string;
    juzgado: string;
}   
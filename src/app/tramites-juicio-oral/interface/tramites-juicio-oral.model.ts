
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
    referencia: string;
    idTramiteElectronicoRecibido: number;
    nombreArchivo: string;
    activo: boolean;
    folioRecepcionJuz?: string;
    fechaHoraRec?: Date;

}

export interface CatJuzgadoResponse {
    idCatJuzgado: number;
    descripcion: string;
}

export interface ValidarCausaResponse {
    idCatJuzgado: number;
    idJuzgado: number;
    juzgado: string;
    tipoTramite: string;
    idCatTipoTramite: number;
    idCausa: number | null;
    numCausa: string | null;
    numCarpeta: string | null;
    idCuaderno: number | null;
    numCuaderno: string | null;
}
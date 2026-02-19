export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
    nombre?: string;
    descripcion?: string;
}


// export interface busquedaExpediente {
//      FoliodeOficialia = string;
// FoliodeApelacion string;
// FoliodeApelacionAnterior string;
// IdExpediente string;
// IdCatTipoTramite string;
// Tramite string;
// IdSala string;
// Salastring;
// IdSalaAnterior string;
// SalaAnterior string;
// IdCatApelacion string;
// Apelacion string;
// IdCatTipoApelacionstring;
// TipodeApelacionstring;
// FechadeAuto string;
// Expediente_Causa string;
// IdCatTipoEscrito string;
// TipodeEscrito string;
// FoliodelOficio string;
// NoFojas string;
// ExpedienteAcumulado string;
                               
// IdCatJuzgadoOrigen string;
// JuzgadoOrigen string;
// FechadeRecepcion string;
// ObservacionesdelaApelacion string;
// FechadeIngresoaSala string;
// EsReposicion = reader["Es Reposición"].ToString(),
// Anexos

// }
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
    nombre?: string;
    descripcion?: string;
}


   export interface DTABusqueda
   {
        IdGeneral :number;
 IdPantalla :number;
        IdSala :string

        TipoApelacion :string;
       FolioOficialia :string;
        IdNomenclatura :string;

       FolioExpediente :string;
        ExpedienteCausa :string;

       FechaRecepInicial :string;
       FechaRecepFinal :string;



        NombreParte :string;
   }


export interface busquedaExpediente {
     FoliodeOficialia : string;
FoliodeApelacion: string;
FoliodeApelacionAnterior: string;
IdExpediente: string;
IdCatTipoTramite: string;
Tramite: string;
IdSala: string;
Sala :string;
IdSalaAnterior: string;
SalaAnterior :string;
IdCatApelacion : string;
Apelacion: string;
IdCatTipoApelacion :string;
TipodeApelacion: string;
FechadeAuto: string;
Expediente_Causa: string;
IdCatTipoEscrito :string;
TipodeEscrito :string;
FoliodelOficio :string;
NoFojas :string;
ExpedienteAcumulado :string;
                               
IdCatJuzgadoOrigen : string;
JuzgadoOrigen :string;
FechadeRecepcion :string;
ObservacionesdelaApelacion :string;
FechadeIngresoaSala :string;
EsReposicion :string
Anexos : string

}

export interface busquedaPartes {
    IdExpedienteParte : string;
IdExpediente : string;
IdCatParte : string;
Parte : string;
Nombre : string;
Direccion : string;
MenorEdad : string;
IdCatSexo : string;
Sexo : string;
}

export interface busquedaAnexos{

   IdTramiteAnexoOtro : string;
TipoTramite : string;
IdExpediente : string;
IdCatAnexo : string;
Anexo : string;
EsValor : string;
MontoAnexo : string;
Cantidad : string;
Orden : string; 

}

export interface responseDataBusqueda {

expediente : busquedaExpediente[];
anexos : busquedaAnexos[];
partes : busquedaPartes[];
}


/* #######################
 CATALOGOS 
 ######################## */

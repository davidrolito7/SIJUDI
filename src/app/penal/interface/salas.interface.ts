export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
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
     foliodeOficialia : string;
foliodeApelacion: string;
foliodeApelacionAnterior: string;
idExpediente: string;
idCatTipoTramite: string;
tramite: string;
idSala: string;
sala :string;
idSalaAnterior: string;
salaAnterior :string;
idCatApelacion : string;
apelacion: string;
idCatTipoApelacion :string;
tipodeApelacion: string;
fechadeAuto: string;
expediente_Causa: string;
idCatTipoEscrito :string;
tipodeEscrito :string;
foliodelOficio :string;
noFojas :string;
expedienteAcumulado :string;
                               
idCatJuzgadoOrigen : string;
juzgadoOrigen :string;
fechadeRecepcion :string;
observacionesdelaApelacion :string;
fechadeIngresoaSala :string;
esReposicion :string
anexos : string

}

export interface busquedaPartes {
    idExpedienteParte : string;
idExpediente : string;
idCatParte : string;
parte : string;
nombre : string;
direccion : string;
menorEdad : string;
idCatSexo : string;
sexo : string;
}

export interface busquedaAnexos{

   idTramiteAnexoOtro : string;
tipoTramite : string;
idExpediente : string;
idCatAnexo : string;
anexo : string;
esValor : string;
montoAnexo : string;
cantidad : string;
orden : string; 

}

export interface responseDataBusqueda {

expediente : busquedaExpediente[];
anexos : busquedaAnexos[];
partes : busquedaPartes[];
}


/* #######################
 CATALOGOS 
 ######################## */
export interface CatApelaciones {
  idCatApelacion: number;
  descripcion: string;
}

export interface Nomenclatura {
  idCatNomenclatura: number;
  descripcion: string;
}

export interface CatSalas {
  idsala: number;
  descripcion: string;
}


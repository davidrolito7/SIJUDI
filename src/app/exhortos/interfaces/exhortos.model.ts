export interface CatalogoMateria{
    clave: number;
    idCatMateria: number;
    nombre: string;
    descripcion:string;
}
export interface CatalogoEstadoDestino{
    idEstado : number;
    descripcion: string;
}
export interface CatalogoMunicipioDestino{
    idMunicipio : number;
    clave : number;
    descripcion: string;
    idEstado : number;
}
export interface CatalogoMateriasEstadoDestino{
    idCatMateria: number;
    clave : string;
    nombre : string;
    descripcion?: string;
}
export interface CatalogoMunicipioOrigen{
    idMunicipio : number;
    clave : number;
    descripcion: string;
    idEstado : number;
}
export interface CatalogoJuzgadoOrigen{
    idJuzgado:number;
    clave:string;
   // descripcion:string;
    juzgado:string;
}
//Catalogo de vias
 export interface tipoVia
 {
     idCatTipoVia:number;
     descripcion:string;
     modelo:number;
     activo:boolean;
 }
 export interface catTipoDiligencia{
    id:string;
    descripcion:string;
    activo:boolean;
}
//Partes exhortos enviar
export interface partesExhortoEnviado{
    idParteExhortoEnviado: number;
    idExhortoEnviado: number;
    nombre: string;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    genero: string | null;
    esPersonaMoral: boolean;
    idTipoParte: number;
    tipoParteNombre: string;
    correoElectronico :string | null;
    telefono: string | null;
    activo: boolean;
}
export interface ProvomenteExhortoEnviado{
    idPromoventeExhortoEnviado: number;
    idPromocionEnviado: number;
    nombre: string;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    genero: string | null;
    esPersonaMoral: boolean;
    idTipoParte: number;
    tipoParteNombre: string;
    correoElectronico:string | null;
    telefono:string | null;
    activo: boolean;
}
export interface partesExhortoEnviadoRequest
{
    nombre: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    genero: string,
    esPersonaMoral: true,
    idTipoParte: 0,
    tipoParteNombre: string
}
export interface generalesExhortoEnviado{
    //generales_:{
    idExhortoEnviado: number;
    numeroExhorto:string;
    exhortoOrigenId:string;
    municipioDestino: string;
    estadoDestino: string;
    materiaNombre: string;
    municipioOrigen: string;
    juzgadoOrigenNombre: string;
    numeroExpedienteOrigen: string;
    numeroOficioOrigen: string;
    tipoJuicioAsuntoDelitos: string;
    juezExhortante: string;
    fojas: number;
    diasResponder: number;
    tipoDiligenciacionNombre: string;
    fechaOrigen: string;
    observaciones: string;
    fechaHoraRecepcion: string;
    folioSeguimiento: string;
    estatus: string;
    municipioTurnado: string;
    areaTurnadoNombre: string;
    urlInfo: string;
    fechaHora:string;
    idEstatus:number;
    //}
}
/*Clase para guardar datos generales de un exhorto envido en el endpoint
    /api/ExhortosEnviar/GuardarGenerales
*/
export interface ExhortoEnviadoGuardarGeneralesRequest{
    municipioDestinoId: number,
    materiaClave: string,
    estadoOrigenId: number,
    municipioOrigenId: number,
    juzgadoOrigenId: string,
    juzgadoOrigenNombre: string,
    numeroExpedienteOrigen: string,
    numeroOficioOrigen: string,
    idCatTipoVia:number,
    tipoJuicioAsuntoDelitos: string,
    juezExhortante: string,
    fojas: number,
    diasResponder: number,
    tipoDiligenciaId:string;
    tipoDiligenciacionNombre: string,
    observaciones: string,
    partes: partesExhortoEnviadoRequest[],
    promoventes: ProvomenteExhortoEnviado[],
    idUsuario: number,
    materiaNombre: string,
    estadoDestinoId: number,
    idCatMateria:number,

}
//objeto que se recibe como respuesta cuando se envia los datos generales de un exhorto enviado
export interface EnviadoConfirmacionDatosRecibidosResponse
{
    exhortoOrigenId:string;
    fechaHora:string;
}
//objeto que se recibe como respuesta cuando se envia los archivos del exhorto enviado
export interface EnviadoArchivoRecibidoConAcuseResponse
{
    archivo: ArchivoRecibidoResponse;
    acuse: acuseExhortoRecibido;
    restantes: ArchivosRestantesResponse[];
}
export interface ArchivoRecibidoResponse{
    nombreArchivo:string;
    tamaño:number;
}
export interface acuseExhortoRecibido
{
    exhortoOrigenId:string;
    folioSeguimiento:string;
    fechaHoraRecepcion:string;
    municipioAreaRecibeId:number;
    areaRecibeId:string;
    areaRecibeNombre:string;
    urlInfo:string;
    municipioAreaRecibeNombre:string;
}
export interface ArchivosRestantesResponse{
    nombreArchivo:string;
    hashSha1:string;
    hashSha256:string;
    tipoDocumento:number;
}
export interface EstadoSeleccionado{
    idEstado : number ;
}
export interface CatalogoMunicipioDestino{
    idMunicipio : number;
    clave : number;
    descripcion: string;
    idEstado : number;
}
export interface CatalogoMateriasEstadoDestino{
    idCatMateria: number;
    clave : string;
    nombre : string;
    descripcion?: string;
}
//Catalogo de vias
 export interface tipoVia
 {
     idCatTipoVia:number;
     descripcion:string;
     modelo:number;
     activo:boolean;
 }
 export interface CatalogoMunicipioOrigen{
    idMunicipio : number;
    clave : number;
    descripcion: string;
    idEstado : number;
}
export interface CatalogoEstadoDestino{
    idEstado : number;
    descripcion: string;
}
export interface CatalogoJuzgadoOrigen{
    idJuzgado:number;
    clave:string;
   // descripcion:string;
    juzgado:string;
}
export interface CatalogoGenero{
    idGenero:number;
    clave:string;
    descripcion:string;
}
export interface CatalogoMateria{
    clave: number;
    idCatMateria: number;
    nombre: string;
    descripcion:string;
}
//Interfaz para el catálogo de tipo de documentos
export interface ListadoCatalogoTipoDocumento{
    idTipoDocumento: number;
    nombre: string;
    activo: boolean;
}
export interface CONATRIB_catTipoDocumento {
    idTipoDocumento: number;
    nombre: string | null;
    activo: boolean;
}
export interface ConfigMateriaJuzgado{
    idMunicipio: number;
    municipio: string;
    idJuzgado: number;
    juzgado: string;
    idMateria: number;
    materia: string;
    idConfiguracion: number;
    region:string;
}
//Detalle de los exhortos enviados
export interface detalleExhortosEnviados{
    generales: generalesExhortoEnviado;
    archivos: archivoExhortoEnviado[];
    partes: partesExhortoEnviado[];
    promoventes:ProvomenteExhortoEnviado[];
    promociones : PromocionExhortoEnviado[];
}
//Archivos de exhortos enviados
export interface archivoExhortoEnviado{
    idArchivo: number;
    idExhortoEnviado: number;
    nombreArchivo: string;
    hashSha1: string;
    hashSha256: string;
    idTipoDocumento: number;
    tipoDocumento: {
      idTipoDocumento: number;
      nombre: string;
      activo: boolean;
    },
    tamaño: number;
    paginas: number;
    recibido: boolean;
    idClasificacionArchivo: number;
    ruta: string;
    firmado:boolean;
    fechaFirmado:Date;
    activo: boolean;
    selecParaFirma: boolean;
    firmantes:Firmantes[];
}
export interface PromocionExhortoEnviado {
    idPromocionEnviado:number;
    idExhortoEnviado: number;
    folioOrigenPromocion:string;
    fojas: number;
    fechaOrigen:string;
    observaciones: string
    fechaHora : string
    fechaRecepcion : string;
    folioPromocionRecibida:string;
    promoventes: ProvomenteExhortoEnviado[]
    archivos : archivoPromocionExhortoEnviado[]
}
export interface archivoPromocionExhortoEnviado{
    idArchivo: number
    idPromocionEnviada: number
    nombreArchivo: string
    hashSha1: string
    hashSha256: string
    idTipoDocumento: number
    tipoDocumento: {
      idTipoDocumento: number;
      nombre: string;
      activo: boolean;
    },
    tamaño: number
    paginas: number
    enviado: boolean
    idClasificacionArchivo: number
    ruta: string
    firmado: boolean
    fechaFirmado: string
    activo: boolean
    selecParaFirma: boolean
    firmantes:Firmantes[]
}
export interface Firmantes{
    idFirmaTmp:number;
    idUsuario:number;
    nombre:string;
}
export interface CatalogoTipoParte{
    idTipoParte:number;
    descripcion:string;
    Activo:boolean;
}
//Interfaz para el archivo de respuesta
export interface archivoRespuesta{
    idArchivo: number;
    idExhortoRecibido: number;
    nombreArchivo: string;
    hashSha1: string;
    hashSha256: string;
    idTipoDocumento: number;
    tipoDocumento: {
        idTipoDocumento: number;
        nombre: string;
        activo: boolean;
    },
    tamaño: number;
    paginas: number;
    recibido: boolean;
    idClasificacionArchivo: number;
    ruta: string;
    activo: boolean;
    tam: number;
    firmado : boolean;
    fechaFirmado: string;
    selecParaFirma: boolean;
    firmantes:Firmantes[];

}
 export interface validaFirmaRequest{
    idUsuario:number;
    password:string;
 }
  export interface guardaFirmaTmpRequest{
  idUsuario: number;
  idArchivo: number;
  idClasificacionArchivo: number;
  passwordFirma: string;
 }

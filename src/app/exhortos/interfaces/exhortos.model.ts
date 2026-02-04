import { BlobOptions } from "node:buffer";

//toda respuesta de la API devolverá esta clase generica, donde T puede ser cualquier tipo de objeto
/*export interface GenericResponse<T>{
    success:boolean;
    message:string;
    errors: string[];
    data:T;
}*/
//Esta interfaz es la estructura que recibimos de la api cuando consultamos el listado de exhortos recibidos
export interface ListadoExhortosRecibidosI{
    idExhortoRecibido:number;
    estadoOrigen:string;
    juzgadoOrigenNombre:string;
    municipioDestino:string;
    materiaNombre:string;
    numeroExpedienteOrigen:string;
    numeroOficioOrigen:string;
    fechaHoraRecepcion:string;
    folioSeguimiento:string;
    estatus:string;
    respuesta : number;
    numeroExhorto:string;
    municipioOrigen:string;
    url:string;
    fechaOrigen:string;
    observaciones:string;
    tipoJuicioAsuntoDelitos:string;
    diasResponder:number;
    fojas:number;
    juezExhortante:string;
    tipoDiligenciacionNombre:string;
    juzgadoDestino:string;
}
// esta interfaz es la estructura del request que se le envia como parametro a la API para consultar el listado de exhortos recibidos
export interface UI_ParamlistadoExhortosRecibidosRequest{
    fechaIni?:Date;
    fechaFin?:Date;
    estatus?:number;
    perfil?: string;
}

//Este modelo se recibe como response al llamar el endpoint
//https://electronico.tribunaloaxaca.gob.mx/api/Exhortos/DetalleExhortoRecibido
//GenericResponse<DetalleExhortoRecibidoResponse>

export interface DetalleExhortoRecibidoResponseI {
    archivos: CONATRIB_ExhortosRecibidosArchivos[];
    partes: CONATRIB_ExhortosRecibidosPartes[];
    generales: ListadoExhortosRecibidosI;
    promoventes: CONATRIB_ExhortoRecibidoPromoventes[];
    actualizaciones: actualizacionesExhortoRecibido[];
}

export interface CONATRIB_ExhortosRecibidosArchivos {
    idArchivo: number;
    idExhortoRecibido: number;
    nombreArchivo: string | null;
    hashSha1: string | null;
    hashSha256: string | null;
    idTipoDocumento: number;
    tipoDocumento: CONATRIB_catTipoDocumento | null;
    tamaño: number | null;
    paginas: number | null;
    recibido: boolean | null;
    idClasificacionArchivo: number;
    activo: boolean;
    firmado:boolean;
    fechaFirmado:Date;
}

export interface CONATRIB_ExhortosRecibidosPartes {
    idParteExhortoRecibido: number;
    idExhortoRecibido: number;
    nombre: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    genero: string | null;
    esPersonaMoral: boolean | null;
    tipoParte: CatalogoTipoParte;
    tipoParteNombre: string | null;
    correoElectronico:string;
    telefono:string;
    activo: boolean;
}

export interface CONATRIB_catTipoDocumento {
    idTipoDocumento: number;
    nombre: string | null;
    activo: boolean;
}

export interface DetallesExhortosRecibidasResponse {
    //actosReclamados: ActosReclamados[];
    partes: Partes[];
    //solicitud: Solicitud[];
   // documentos: Documentos[];
}

export interface Partes {
    idParteExhortoRecibido: number;
    idExhortoRecibido: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    genero: string;
    esPersonaMoral: boolean;
    idTipoParte: number;
    tipoParteNombre: string;
    activo: boolean;
}

//Interfaz para el catálogo de tipo de diligenciado
export interface ListadoCatalogoTipoDiligenciado{
    idTipoDiligenciado: number;
    descripcion: string;
}

//Interfaz para el catálogo de tipo de documentos
export interface ListadoCatalogoTipoDocumento{
    idTipoDocumento: number;
    nombre: string;
    activo: boolean;
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
export interface Firmantes{
    idFirmaTmp:number;
    idUsuario:number;
    nombre:string;
}

//Interfaz para respuesta de exhortos
export interface respuestaExhorto{
    generales: generales;
    archivos: archivos[];
}
//Interfaz para respuesta de exhortos

export interface UI_respuestaExhortoResponse{
    idRespuesta: number;
    observaciones: string;
    fechaRespuesta: string;
    folio: string;
    tipoDiligencia: string;
    idTipoDiligenciado: number;
    fechaHoraRecibe:string;
    archivos: archivos[];
}
//interface de "generales" de respuesta exhortos
export interface generales{
    idRespuesta: number;
    observaciones: string;
    fechaRespuesta: string;
    fechaRegistro : string;
    folio: string;
    tipoDiligencia: string;
    idTipoDiligenciado: number;
    fechaHoraRecepcion:string;
    fechaHora:string;
    fechaEnvio:string;
}
//interface de "archivos" de respuesta exhortos
export interface archivos{
    length: number; //número de elementos (archivos)
    forEach(arg0: (archivo: any) => void): unknown; //permite iterar sobre cada elemento de un array.
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

//Interfaz de las promociones de exhortos recibidos
export interface promocionExhortos{
    promo: promo;
    archivos: archivoPromocion[];
    promoventes:promoventes[];
}

//Interfaz promo
export interface promo{
    idPromocionRecibida: number;
    idExhortoRecibido: number;
    folioOrigenPromocion: number;
    fojas: number;
    fechaOrigen: string;
    observaciones: string;
    fechaRecepcion: string;
    folioPromocionRecibida: string;
    idEstatus: number;
}

export interface promoventes{
    idPromovente:number;
    idPromocionRecibida: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    genero: string;
    esPersonaMoral: boolean;
    tipoParte: CatalogoTipoParte;
    tipoParteNombre: string;
    correoElectronico:string;
    telefono:string;
    activo: boolean;
}

//interfaz de los archivos de la promocion de exhortos
export interface archivoPromocion{
    idArchivo: number;
    idPromocionRecibida: number;
    nombreArchivo: string;
    hashSha1: string;
    hashSha256: string;
    idTipoDocumento: number;
    tipoDocumento: {
      idTipoDocumento: number,
      nombre: string;
      activo: boolean;
    },
    tamaño: number;
    paginas: number;
    recibido: boolean;
    idClasificacionArchivo: number;
    ruta: string;
    activo: boolean;
}

//Listado de exhortos enviados
export interface ListadoExhortosEnviados{
    idExhortoEnviado: number;
    exhortoOrigenId: string;
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
}

//Detalle de los exhortos enviados
export interface detalleExhortosEnviados{
    generales: generalesExhortoEnviado;
    archivos: archivoExhortoEnviado[];
    partes: partesExhortoEnviado[];
    promoventes:ProvomenteExhortoEnviado[];
    promociones : PromocionExhortoEnviado[];
}

//Generales del exhorto enviado
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
    idMateriaOrigen:number;
    estadoOrigenId:number;
    idMunicipioOrigen:number;
    juzgadoOrigenId:number;
    idCatTipoVia:number;
    tipoDiligenciaId:string;
    idUsuario:number;
    materiaNombreOrigen:string;
    
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
    partes: partesExhortoEnviadoRequest[] | null,
    promoventes: ProvomenteExhortoEnviado[] | null,
    idUsuario: number,
    materiaNombre: string,
    estadoDestinoId: number,
    idCatMateria:number,

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

//Interfaz de la respuesta del exhorto enviado
export interface respuestExhortoEnviado{
    generales: generalesRespuestaExhortoEnviado;
    archivos: archivoExhortoEnviado[];
    videos: videosExhortosEnviadosrespuesta[];
}
//generales de respuesta del exhorto enviado
export interface generalesRespuestaExhortoEnviado{
    idRespuesta: number;
    idExhortoEnviado: number;
    respuestaOrigenId: string;
    municipioTurnado: {
      idMunicipio: number;
      clave: number;
      descripcion: string;
      idEstado: number;
    },
    areaTurnadoId: string;
    areaTurnadoNombre: string;
    numeroExhorto: string;
    tipoDiligenciado: {
      idTipoDiligenciado: number;
      descripcion: string;
    },
    observaciones: string;
    fechaRespuesta: string;
    activo: boolean;
    fechaHoraRecepcion:string;
}

//Verificar si se utiliza
export interface CatalogoClasificaciónArchivo{
    idClasificacionArchivo: number;
    descripcion: string;
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

export interface EstadoSeleccionado{
    idEstado : number ;
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
export interface CatalogoTipoParte{
    idTipoParte:number;
    descripcion:string;
    Activo:boolean;
}

export interface CatalogoMateria{
    clave: number;
    idCatMateria: number;
    nombre: string;
    descripcion:string;
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

export interface CatalogoRegion{
    idRegion: number;
    descripcion: string;
    activo: boolean;
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
    file:File;
}

export interface AgregarJuzgado{
    idCatJuzgado: number;
    cveJuzgado: string;
    descripcion: string;
    tipo: string;
    activo: boolean;
}

export interface CatJuzgado{
    idJuzgado: number;
    clave: string;
    descripcion: string;
    activo: boolean;
}

export interface ReasignarJuzgado{
    idExhortoRecibido: number;
    idMunicipio: number;
    idCatJuzgado: number;
    idCatMateria: number;
    observaciones: string;
}

export interface ConfirmacionActualizacion{
    exhortoId: string;
    actualizacionOrigenId: string;
    fechaHora: string;
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
    partes: partesExhortoEnviadoRequest[] | null,
    promoventes: ProvomenteExhortoEnviado[] | null,
    idUsuario: number,
    materiaNombre: string,
    estadoDestinoId: number,
    idCatMateria:number,

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
export interface turnosResponse{
    resultado: boolean;
    msg:string;
}
export interface VerMovimientosResponse {
    idExhortoRecibido:number;
    cargoTurna:string,
    idUsuarioTurna:number,
    nombreUsuarioTurna:string,
    fechaTurnado: Date;
    idUsuarioRecibe: number;
    nombreUsuarioRecibe: string;
    fechaRecepcion: Date;
    idMovimiento: number;
    radica: string;
    cargoOrigen: string;
    cargoDestino: string;
}
export interface VerMovimientosEnviadosResponse {
    idExhortoEnviado:number;
    cargoTurna:string,
    idUsuarioTurna:number,
    nombreUsuarioTurna:string,
    fechaTurnado: Date;
    idUsuarioRecibe: number;
    nombreUsuarioRecibe: string;
    fechaRecepcion: Date;
    idMovimiento: number;
    movimiento: string;
}
//objeto que la api retorna cuando se envia los datos generales de la respuesta de un exhorto al estado exhortante
export interface EnviadoRespuestaGeneralesResponse
{
    exhortoId:string;
    respuestaOrigenId:string;
    fechaHora:string;
}
//objetos que la api retorna cuando se envian los archivos del exhorto al estado exhortante
//******************************************* */
export interface EnviadoRespuestaArchivosResponse
{
    archivo: ArchivoRecibidoResponse;
    acuse: AcuseRespuestaExhortoRecibido;
    restantes: ArchivosRestantesResponse[];
}
export interface ArchivoRecibidoResponse{
    nombreArchivo:string;
    tamaño:number;
}
export interface AcuseRespuestaExhortoRecibido{
    exhortoId:string;
    respuestaOrigenId:string;
    fechaHoraRecepcion:string;
}
export interface ArchivosRestantesResponse{
    nombreArchivo:string;
    hashSha1:string;
    hashSha256:string;
    tipoDocumento:number;
}

export interface guardaExhortoRespuesta {
    idRespuesta : number;
}
//***************************************** */
//***************************************** */
export interface catTipoDiligencia{
    id:string;
    descripcion:string;
    activo:boolean;
}
//Objeto retornado por la api cuando se inserta los datos generales y los promoventes en una promocion del exhorto enviado
//******************************************* */
export interface folioPromocionExhortoEnviado{
    folioOrigenPromocion: string;
    idPromocionEnviada: number
}
//***************************************** */

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



export interface ArchivosGuardarPromocionEnviada {
    nombreArchivo: string | null;
    tipoDocumento: number;
    idPromocionEnviada: number | null;
    idExhortoEnviado: number | null;
    archivo: File | null;
}

export interface IdArchivoPromcionesEnviada {
    idArchivo: number;
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
export interface videosExhortosEnviadosrespuesta
{
    titulo:string;
    descripcion:string;
    fecha:string;
    urlAcceso:string;
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
export interface actualizacionesExhortoEnviado{
    actualizacionOrigenId:string;
    idTipoActualizacion:number;
    tipoActualizacionNombre:string;
    fechaHora:string;
    fechaHoraRecibido:string;
    descripcion:string;
}
export interface actualizacionesExhortoRecibido{
    idActualizacion:number;
    fechaActualizacion:string;
    tipoActualizacion:string;
    descripcion:string;
    nombreUsuarioActualizo:string;
    enviado:string;
}
export interface ConfirmacionDatosPromocionRecibida
{
    folioOrigenPromocion:string;
    fechaHora:string;
}
export interface ArchivoRecibidoPromocionConAcuse{
    archivo: ArchivoRecibidoResponse;
    acuse: AcusePromocionRecibida;
    restantes: ArchivosRestantesResponse[];
}
export interface AcusePromocionRecibida
{
    folioOrigenPromocion:string;
    folioPromocionRecibida:string;
    fechaHoraRecepcion:string;

}
export interface CONATRIB_ExhortoRecibidoPromoventes
{
    idPromoventeExhortoRecibido:number;
    idExhortoRecibido:number;
    nombre:string;
    apellidoPaterno:string;
    apellidoMaterno:string;
    genero:string;
    esPersonaMoral:boolean;
    tipoParte:CatalogoTipoParte;
    tipoParteNombre:string;
    correoElectronico:string;
    telefono:string;
    activo:boolean;
}
//Catalogo de vias
 export interface tipoVia
 {
     idCatTipoVia:number;
     descripcion:string;
     modelo:number;
     activo:boolean;
 }
 export interface cat_Materias
{
    idCatMateria:number;
    descripcion:string;
    claveMateria:string;
    activo:boolean;
}
 export interface ListadoEstatus{
   idEstatus : number;
   descripcion : string;
   Activo : boolean;
   idTipoTramite : number;
 }
 export interface IncompetenciaRequest{
  idExhortoRecibido: number;
  justificacion: string;
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
 export interface AgregarJuzgadoMat{
    idConfiguracion: number;
    idMunicipio: number;
    idCatMateria: number;
    idCatJuzgado: number;
    idRegion: number;
    activo: boolean;
}
// esta interfaz es la estructura del request que se le envia como parametro a la API para consultar el listado de exhortos recibidos
export interface UI_ParamlistadoExhortosRecibidosRequest{
    fechaIni?:Date;
    fechaFin?:Date;
    estatus?:number;
    perfil?: string;
}
//Listado de exhortos enviados
export interface ListadoExhortosEnviados{
    idExhortoEnviado: number;
    exhortoOrigenId: string;
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
}
export interface ListadoEstatus{
   idEstatus : number;
   descripcion : string;
   Activo : boolean;
   idTipoTramite : number;
 }
 // esta interfaz es la estructura del request que se le envia como parametro a la API para consultar el listado de exhortos recibidos
export interface UI_ParamlistadoExhortosRecibidosRequest{
    fechaIni?:Date;
    fechaFin?:Date;
    estatus?:number;
    perfil?: string;
}
//Esta interfaz es la estructura que recibimos de la api cuando consultamos el listado de exhortos recibidos
export interface ListadoExhortosRecibidosI{
    idExhortoRecibido:number;
    estadoOrigen:string;
    juzgadoOrigenNombre:string;
    municipioDestino:string;
    materiaNombre:string;
    numeroExpedienteOrigen:string;
    numeroOficioOrigen:string;
    fechaHoraRecepcion:string;
    folioSeguimiento:string;
    estatus:string;
    respuesta : number;
    numeroExhorto:string;
    municipioOrigen:string;
    url:string;
    fechaOrigen:string;
    observaciones:string;
    tipoJuicioAsuntoDelitos:string;
    diasResponder:number;
    fojas:number;
    juezExhortante:string;
    tipoDiligenciacionNombre:string;
    juzgadoDestino:string;
}
//Interfaz de la respuesta del exhorto enviado
export interface respuestExhortoEnviado{
    generales: generalesRespuestaExhortoEnviado;
    archivos: archivoExhortoEnviado[];
    videos: videosExhortosEnviadosrespuesta[];
}
export interface ConfirmacionDatosPromocionRecibida
{
    folioOrigenPromocion:string;
    fechaHora:string;
}
export interface ArchivoRecibidoPromocionConAcuse{
    archivo: ArchivoRecibidoResponse;
    acuse: AcusePromocionRecibida;
    restantes: ArchivosRestantesResponse[];
}
export interface actualizacionesExhortoEnviado{
    actualizacionOrigenId:string;
    idTipoActualizacion:number;
    tipoActualizacionNombre:string;
    fechaHora:string;
    fechaHoraRecibido:string;
    descripcion:string;
}
export interface VerMovimientosEnviadosResponse {
    idExhortoEnviado:number;
    cargoTurna:string,
    idUsuarioTurna:number,
    nombreUsuarioTurna:string,
    fechaTurnado: Date;
    idUsuarioRecibe: number;
    nombreUsuarioRecibe: string;
    fechaRecepcion: Date;
    idMovimiento: number;
    movimiento: string;
}
export interface IdArchivoPromcionesEnviada {
    idArchivo: number;
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
//Objeto retornado por la api cuando se inserta los datos generales y los promoventes en una promocion del exhorto enviado
//******************************************* */
export interface folioPromocionExhortoEnviado{
    folioOrigenPromocion: string;
    idPromocionEnviada: number
}

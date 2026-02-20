//este objeto es el response del endpoint Listado de notificaciones
//https://interconexion.tribunaloaxaca.gob.mx/Api/Notificacion/ListadoNotificaciones
export interface ListadoAmparosRecibidosI{
    idNotificacion:number;
    numeroExpediente:string;
    organo_impartidor_justicia:string;
    fechaRecepcion:string;
    fec_envio:string;
    materia:string;
    organoOrigen:string;
    estatus:string;
    numPromociones:number;
    expFisico:boolean;
}
//este objeto es el request que se envia al endpoint Listado de notificaciones
//https://interconexion.tribunaloaxaca.gob.mx/Api/Notificacion/ListadoNotificaciones
export interface UI_ParamlistadoAmparosRecibidosRequest{
    fechaIni?:Date;
    fechaFin?:Date;
    perfil:string;
}
export interface catalogoEstatus{
    idEstatus:number;
    nombre:string;
    activo:boolean;
}
//Este modelo se recibe como response al llamar el endpoint
//https://interconexion.tribunaloaxaca.gob.mx/Api/Notificacion/DetalleNotificacion
//GenericResponse<DetallesNotificacionesRecibidasResponse>
export interface detallesAmparoRecibida {
    generales: generales;
    actosReclamados: actosReclamados[];
    partes: partes[];
    solicitud: solicitud[];
    documentos: documentos[];
    numPromociones:number;
}
export interface generales{
    idNotificacion:number;
    numeroExpediente:string;
    organo_impartidor_justicia:string;
    fechaRecepcion:string;
    fec_envio:string;
    estatus:string;
    materia:string;
    organoOrigen:string;
    numPromociones: number;
    expFisico:boolean;
    recibido:boolean;
    idEstatus:number;
}
export interface actosReclamados {
    idActoReclamado: number;
    idNotificacion: number;
    nombre: string | null;
    aPaterno: string | null;
    aMaterno: string | null;
    idCaracter: number | null;
    descripcionCaracter: string | null;
    idTipoPersona: number | null;
    descripcionTipoPersona: string | null;
    personaId: string | null;
    activo: boolean;
    actosDetalles:actosReclamadosDetalle[];
}
export interface actosReclamadosDetalle {
    idDetalleActo: number;
    idActoReclamado: number;
    descripOpcionActoRec: string | null;
    idOpcionActoRec: number | null;
    tipoCampo: number | null;
    descripcionIdCampo: string | null;
    activo: boolean;
}
export interface partes {
    idParte: number;
    idNotificacion: number;
    nombre: string;
    caracter: string;
    tipoPersona: string;
    personaId: string;
    activo: boolean;
}
export interface solicitud {
    idSolicitud: number;
    idNotificacion: number;
    solicitudId: number;
    fec_envio: string;
}

export interface documentos {
    idArchivo: number;
    idNotificacion: number;
    idDocumento: number | null;
    nombreDocumento: string | null;
    nombrePKCS7: string | null;
    extension: string | null;
    longitud: number;
    firmado: boolean;
    fechaFirmado: string | null;
    hashDocumentoOriginal: string | null;
    idClasificacionArchivo: number;
    ruta: string | null;
    activo: boolean;
    idTipoArchivo: number;
}
export interface verMovimientosResponse {
    idNotificacion:number;
    fechaTurnado: Date,
    idUsuarioRecibe: number,
    nombreUsuarioRecibe: string,
    fechaRecepcion: Date,
    idMovimiento: number,
    movimiento: string
}
/*export interface getFileResponse{
    fileName:string;
    contentType:string;
    documento: File;
}*/

//MODELOS PARA LA PROMOCION

//Este modelo se recibe como response al llamar el endpoint
//https://interconexion.tribunaloaxaca.gob.mx/Api/UI/VerPromocion
//GenericResponse<UI_PromocionResponse>
export interface UI_PromocionResponse {
    idRespuesta: number;
    fec_envio: string;
    organoImpartidorJusticia: CatalogoOrganoDestino;
    numeroExpedienteOIJ: string | null;
    existeEE: boolean;
    urlEE: string | null;
    idTipoCuaderno:number;
    tipoCuaderno: number | null;
    idCodigoRetorno: number | null;
    fechaRecepcion: string | null;
    folioConfirmacion: number | null;
    mensaje: string | null;
    activo: boolean;
    estatus: number;
    archivos: PromocionDocumentos[];
}

export interface PromocionDocumentos {
    selecParaFirma: boolean;
    idArchivo: number;
    idRespuesta: number;
    nombreDocumento: string;
    nombrePKCS7: string | null;
    NombreEvidencia: string | null;
    extension: string | null;
    longitud: number;
    firmado: boolean;
    fechaFirmado: string;
    hashDocumentoOriginal: string | null;
    clasificacionArchivo: CatalogoClasificacionArchivo;
    ruta: string | null;
    firmantes: Firmantes[];
    file: File;
    activo: boolean;
}
export interface Firmantes{
    idFirmaTmp:number;
    idUsuario:number;
    nombre:string;
}

//request para el endpoint
//https://interconexion.tribunaloaxaca.gob.mx/api/Promocion/GuardarRespuestaNotificacion
export interface PromocionGeneralesRequest {
    idNotificacion: number;
    organoImpartidorJusticia: number;
    numeroExpedienteOIJ: string;
    existeEE: boolean;
    urlEE: string | null;
    tipoCuaderno: number;
}
//request para el endpoint
//https://interconexion.tribunaloaxaca.gob.mx/api/Promocion/GuardarRespuestaNotificacionArchivos
//se debe guardar el documento en uno por uno.
export interface RespuestaNotificacionArchivosRequest {
    idPromocion: number;
    archivo: File;
    clasificacionArchivo: number;

}
export interface PromocionGeneralesUpdate{
    idRespuesta: number;
    organoImpartidorJusticia: number;
    numeroExpedienteOIJ: string;
    existeEE: boolean;
    urlEE: string | null;
    tipoCuaderno: string;
    idTipoCuaderno:number;
}
//endpoint para ver los catalogos
//https://interconexion.tribunaloaxaca.gob.mx/api/Catalogo/OrganoDestino
export interface CatalogoTipoCuaderno{
    idTipoCuaderno: number;
    descripcion: string;
}
export interface CatalogoOrganoDestino{
    idOrganoDestino: number;
    clave: number;
    descripcion: string;
}
export interface CatalogoClasificacionArchivo{
    idClasificacionArchivo: number;
    descripcion: string;
}

/* clasificacion de archivos, este lo voy a meter en BD para que se jale mediante catalogo
SinClasificacion = 0,
Determinacion = 1,
DeterminacionAnexo = 2,
Promociones = 3,
Notificaciones = 4,
IntercambioCJF = 5,
OficioInterconexion = 6
*/

export interface FileRequest {
    idArchivo: number;
    tipo:TipoDocumento;
}

export enum TipoDocumento {
    NOTIFICACION=1,
    PROMOCION=2
}
export interface VerMovimientosResponse {
    idNotificacion:number;
    fechaTurnado: Date,
    idUsuarioRecibe: number,
    nombreUsuarioRecibe: string,
    fechaRecepcion: Date,
    idMovimiento: number,
    movimiento: string
}

// Catalogos de CFJ para expedientes fisicos
export interface CatalogoAmbito {
    cjF_catAmbitoId: number;
    descripcion: string;
    activo: boolean;

}
export interface CatalogoClasificacionRequest {
    idAmbito: number;
}
    export interface CatalogoClasificacionResponse {
        id: number;
        descripcion: string;
    }
export interface CatalogoCircuitoRequest {
    idAmbito: number;
    idClasificacion: number;
}
    export interface CatalogoCircuitoResponse {
        cjF_catCircuitoId: number;
        descripcion: string;
        activo: boolean;
    }
export interface CatalogoEstadoRequest {
    idAmbito: number;
    idClasificacion: number;
    idCircuito: number;
}
    export interface CatalogoEstadoResponse {
        id: number;
        descripcion: string;
    }
export interface CatalogoTipoOrganoRequest {
    idAmbito: number;
    idClasificacion: number;
    idCircuito: number;
    idTipoFiltro: number;
}
    export interface CatalogoTipoOrganoResponse {
        id: number;
        descripcion: string;
    }
export interface CatalogoMateriasRequest {
    idAmbito: number;
    idClasificacion: number;
    idCircuito: number;
    idTipoFiltro: number;
    idEstado: number,
    idTipoOrganismo: number;
}
    export interface CatalogoMateriasResponse {
        id: number;
        descripcion: string;
    }
export interface CatalogoOrganoRequest {
    idAmbito: number;
    idClasificacion: number;
    idCircuito: number;
    idTipoFiltro: number;
    idEstado: number;
    idTipoOrganismo: number;
    idMateria: number;

}
    export interface CatalogoOrganoResponse {
        id: number;
        descripcion: string;
    }
export interface CatalogoTipoAsuntoRequest {
    idAmbito: number;
    idClasificacion: number;
    idCircuito: number;
    idTipoFiltro: number;
    idEstado: number;
    idTipoOrganismo: number;
    idMateria: number;
    idOrgano: number;

}

    export interface CatalogoTipoAsuntoResponse {
        id: number;
        descripcion: string;
    }


//Api/Notificacion/NotificacionesViaConsultaAsunto para mostrar las
// notificaciones que se iniciarion a travéz de un expediente físico
export interface NotifiViaConsultaAsuntoResponse {
    idNotificacion:number;
    numeroDeAsunto: string;
    idOrgano:number;
    tipoAsunto:number;
    idTipoProcedimiento: number;
    idMateria:number;
    neun:number;

}

export interface ConsultarAsuntoRequest {
    numeroDeAsunto:string;
    idOrgano:string;
    idTipoAsunto:number;
    idMateria:number;
    idTipoProcedimiento:number;

}
export interface ConsultarAsuntoResponse {
    idMateria:number;
    idOrgano:string;
    idTipoAsunto:number;
    idTipoProcedimiento:number;
    isSuccess: boolean,
    neun: number,
    numeroDeAsunto:string;
    idNotificacion:number;


}
export interface getFileResponse{
    fileName:string;
    contentType:string;
    documento: File;
}

export interface DatosFirel {
  password : string;
  archivo_pfx :  File | null ;

}
export interface enviarPromocionRequest{
     //idNotificacion: number;
     idRespuesta: number;
     idGeneral: number;
}
export interface turnosResponse{
    resultado: boolean;
    msg:string;
}
 export interface guardaFirmaTmpRequest{
  idUsuario: number;
  idArchivo: number;
  idClasificacionArchivo: number;
  passwordFirma: string;
 }
 export interface CatalogoClasificacionArchivo{
    idClasificacionArchivo: number;
    descripcion: string;
}

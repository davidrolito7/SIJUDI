//toda respuesta de la API devolverá esta clase generica, donde T puede ser cualquier tipo de objeto
export interface GenericResponse<T>{
    success:boolean;
    status?: number;
    message?: string;
    errors: string[];
    data:T;
}

  export interface usuario  {
    nombre: string,
    curp?: string,
    folio: string,
    noEmpleado: string,
    tipoUsuario: string,
    //domicilio: string,
    celular?: string,
    telefono: string,
    correoAlterno: string,
    correo: string,
    direccionPart: string,
    direccionPartNoExt: string,
    direccionPartNoInt: string,
    direccionPartCP: string,
    direccionPartColonia: string,
    direccionPartMunicipio: string,
    direccionPartEstado: string,
    foto : string

  }

  export interface datosFirma {
    nombre: string,
    pfxFileName : string,
    pfxVigencia : Date, 
    fechaAlta: Date
  }

  
export interface OrigenArea {
  idArea: number;
  descripcion: string;
}

export interface OrigenSubArea {
  idSubArea: number;
  descripcion: string;
}

export interface OrigenSistemaPerfil {
  idSistemaPerfil: number;
  descripcion: string | null;
}

export interface OrigenNotificacion {
  area: OrigenArea;
  subArea: OrigenSubArea;
  sistemaPerfil: OrigenSistemaPerfil;
}

export interface NotificacionResponse {
  id: number;
  idTramite: number;
  idCatTipoTramite: number;
  folio: string;
  accion: string;
  mensaje: string;
  fecha_creacion: string;
  leida: boolean;
  origen: OrigenNotificacion;
}

export interface CrearNotificacionRequest {
  folio: string;
  accion: string;
  mensaje: string;
  idAreaDestino: number;
  idSistemaPerfilDestino: number;
  idSubAreaDestino: number;
}

export interface BandejaNotificacionesResponse {
  soloConteo: boolean;
  pendientes: number;
  notificaciones: NotificacionResponse[];
}

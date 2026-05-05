//toda respuesta de la API devolverá esta clase generica, donde T puede ser cualquier tipo de objeto
export interface GenericResponse<T>{
    success:boolean;
    message:string;
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
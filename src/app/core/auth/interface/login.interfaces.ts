export interface responseLogin{
    access_token:string;
    refresh_token:string
}

export interface responseCatalogoPerfiles{
  idSistemaPerfil : string;
  descripcion : string
}
export interface areas{
  idAreaSistema:number; 
	area:string; 
	idArea:number; 
	//nombreConexionBd:string;
}

export interface secciones {
  IdSeccion : number;
  descripcion : string;
  //Pantallas : boton[];
}
export interface boton {
  Idboton : number;
  Descripcion : string;
}
export interface ModulosUsuario{
  idSistemaModulo : string;
  nombre : string;
  descripcion : string;
  ejecutable : string;
  pantallas : Pantallas[];
}

export interface Pantallas {
  IdPantalla : string;
  nombre  : string;
  descripcion  : string;
  IdSistemaModulo   : string;
  TipoCatalogo  : string;
  IdCatalogo  : string;
  Ejecutable  : string;
  Valores  : string;
   Exe  : string;
  Imagen  : string;
   Acceso  : string;
  Orden  : string;
  visibleMenu : boolean;
  //FechaProduccion  : string;
}
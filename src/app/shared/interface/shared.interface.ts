//toda respuesta de la API devolverá esta clase generica, donde T puede ser cualquier tipo de objeto
export interface GenericResponse<T>{
    success:boolean;
    message:string;
    errors: string[];
    data:T;
}


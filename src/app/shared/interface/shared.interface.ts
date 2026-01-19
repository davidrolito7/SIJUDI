export interface GenericResponse<T>{
    success:boolean;
    message:string;
    errors: string[];
    data:T;
}
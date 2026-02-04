export interface CatJuzgado{
    idJuzgado: number;
    clave: string;
    descripcion: string;
    activo: boolean;
}
export interface AgregarJuzgado{
    idCatJuzgado: number;
    cveJuzgado: string;
    descripcion: string;
    tipo: string;
    activo: boolean;
}
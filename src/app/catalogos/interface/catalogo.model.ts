export interface CatJuzgado{
    idJuzgado: number;
    clave: string;
    descripcion: string;
    municipio: municipio;
    instancia: string;
    activo: boolean;
}
export interface AgregarJuzgado{
    idCatJuzgado: number;
    cveJuzgado: string;
    descripcion: string;
    tipo: string;
    activo: boolean;
}
export interface municipio{
    idMunicipio: number;
    clave: string;
    descripcion: string;
    idEstado: number;
}
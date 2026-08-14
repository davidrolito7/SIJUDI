export interface DiaInhabilSedeResponse {
  id: number;
  esGeneral: boolean;
  activo: boolean;
  fechaRegistro: Date;
  numeroSedes: number;
  diaInhabil: DiaInhabilResponse;
  sede: SedeResponse;
  sedes?: DiaInhabilSedeSedeResponse[];
  idAreasIncluidas?: number[];
}

export interface DiaInhabilSedeDetalleResponse {
  numeroSedes: number;
  diaInhabil: DiaInhabilResponse;
  sedes: DiaInhabilSedeSedeResponse[];
  idAreasIncluidas: number[];
}

export interface DiaInhabilResponse {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  activo: boolean;
}

export interface SedeResponse {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
//  idAreasIncluidas: number[];
  numeroAreas: number;
  areas: AreaResponse[];
  diaInhabilAreas: DiaInhabilAreaResponse[];
  areasExcluidas?: DiaInhabilAreaResponse[];
}

export interface AreaResponse {
  idArea: number;
  nombre: string;
  activo: boolean;
  idSede?: number;
  sede?: SedeResponse;
}

export interface DiaInhabilAreaResponse {
  id: number;
  idArea: number;
  nombreArea: string;
  tipoAplicacion: number;
  activo: boolean;
}


// Request interfaces
export interface SedeRequest{
    nombre: string;
    descripcion: string;
    idAreas: number[];
}

export interface DiaInhabilSedeRequest {
  idDiaInhabil: number;
  sedes: DiaInhabilSedeSedeRequest[];
  idAreasIncluidas: number[];
}

export interface DiaInhabilSedePatchRequest {
  sedes: DiaInhabilSedeSedeRequest[];
  idAreasIncluidas: number[];
}

export interface DiaInhabilSedeSedeRequest {
  idSede: number;
  esGeneral: boolean;
  idAreasExcluidas: number[];
}

export interface DiaInhabilSedeSedeResponse {
  id: number;
  esGeneral: boolean;
  activo: boolean;
  fechaRegistro: Date;
  idAreasIncluidas: number[];
  sede: SedeResponse;
}

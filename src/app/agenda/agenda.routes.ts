import { Routes } from "@angular/router";
import { ListarSede } from "./views/listar-sede/listar-sede";
import { CrearSede } from "./views/crear-sede/crear-sede";
import { ListarDiaInhabil } from "./views/listar-dia-inhabil/listar-dia-inhabil";
import { ListarInhabilSede } from "./views/listar-inhabil-sede/listar-inhabil-sede";
import { CrearInhabilSede } from "./views/crear-inhabil-sede/crear-inhabil-sede";

export const AGENDA_ROUTES: Routes = [
    {path: 'sedes', component: ListarSede},
    {path: 'crear-sede', component: CrearSede},
    {path: 'dia-inhabil', component: ListarDiaInhabil},
    {path: 'asignar-dia-inhabil', component: ListarInhabilSede},
    {path: 'crear-asignacion', component: CrearInhabilSede},

]
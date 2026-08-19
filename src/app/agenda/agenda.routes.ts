import { Routes } from "@angular/router";
import { ListarSede } from "./views/listar-sede/listar-sede";
import { CrearSede } from "./views/crear-sede/crear-sede";
import { ListarDiaInhabil } from "./views/listar-dia-inhabil/listar-dia-inhabil";
import { ListarInhabilSede } from "./views/listar-inhabil-sede/listar-inhabil-sede";
import { CrearInhabilSede } from "./views/crear-inhabil-sede/crear-inhabil-sede";

export const AGENDA_ROUTES: Routes = [
  {
    path: 'sedes',
    children: [
      { path: '', component: ListarSede },
      { path: 'crear', component: CrearSede },
      { path: 'editar', component: CrearSede },
    //   { path: 'editar', component: EditarSede },
    ]
  },
  {
    path: 'dias-inhabiles',
    children: [
      { path: '', component: ListarDiaInhabil },
    //   { path: 'crear', component: CrearDiaInhabil },
    //   { path: 'editar', component: EditarDiaInhabil },
    ]
  },
  {
    path: 'asignaciones',
    children: [
      { path: '', component: ListarInhabilSede },
      { path: 'crear', component: CrearInhabilSede },
     { path: 'editar', component: CrearInhabilSede },
    ]
  }
];
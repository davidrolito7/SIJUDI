import { Routes } from "@angular/router";
import { ListarAmparosRecibidos } from "../amparos/recibidos/listar/listar-amparos-recibidos";

export const AMPAROS_ROUTES: Routes = [
    {path: 'amparos-listar', component: ListarAmparosRecibidos},
    {path: 'detalles-amparo-recibido', loadComponent: () => import('../amparos/recibidos/detalles/detalles-amparo-recibido').then(m => m.DetallesAmparoRecibido)},
    {path: 'respuesta-amparo-recibido', loadComponent: () => import('../amparos/recibidos/respuesta/respuesta-amparo-recibido').then(m => m.RespuestaAmparoRecibido)},
    {path: 'acuerdo', loadComponent: () => import('../amparos/recibidos/acuerdo/acuerdo').then(m => m.Acuerdo)},
];
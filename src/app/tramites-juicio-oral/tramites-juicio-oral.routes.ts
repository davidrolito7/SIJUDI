import { Routes } from "@angular/router";
import { TramitesJuicioOral } from "./views/listar/tramites-juicio-oral";
import { CrearTramite } from "./views/crear-tramite/crear-tramite";

export const TRAMITES_JUICIO_ORAL_ROUTES: Routes = [
    { path: 'buscarPromocion', component: TramitesJuicioOral },
    { path: 'nuevaPromocion', component: CrearTramite}

];

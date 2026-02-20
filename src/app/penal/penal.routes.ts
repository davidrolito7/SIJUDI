import { Routes } from "@angular/router";
import { BusquedaApelaciones } from "./views/busqueda-apelaciones/busqueda-apelaciones";

export const PENAL_ROUTES: Routes = [
{
        path: 'oficialia',
        children: [
            { path: 'busqueda', component: BusquedaApelaciones  }
        ]
    }


]
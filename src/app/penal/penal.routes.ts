import { Routes } from '@angular/router';
import { BusquedaApelaciones } from "./views/busqueda-apelaciones/busqueda-apelaciones";
import { DetalleBusqueda } from './views/detalle-busqueda/detalle-busqueda';




export const PENAL_ROUTES: Routes = [
{
        path: 'oficialia',
        children: [
            { path: 'busqueda', component: BusquedaApelaciones  },
             { path: 'detalle', component: DetalleBusqueda },
        ]
    }


]
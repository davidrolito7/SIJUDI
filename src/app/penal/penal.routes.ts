import { Routes } from '@angular/router';
import { BusquedaApelaciones } from "./views/busqueda-apelaciones/busqueda-apelaciones";
import { DetalleBusqueda } from './views/detalle-busqueda/detalle-busqueda';




export const PENAL_ROUTES: Routes = [
{
        path: 'oficialia',
        data: { title: 'Oficialía' },
        children: [
            { path: 'busqueda', component: BusquedaApelaciones, data: { title: 'Busqueda' },  },
             { path: 'detalle', component: DetalleBusqueda, data: { title: 'Detalle' }, },
        ]
    }


]
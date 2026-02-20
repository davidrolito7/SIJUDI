import { Routes } from '@angular/router';
import { DetalleBusqueda } from './views/detalle-busqueda/detalle-busqueda/detalle-busqueda';


export const PENAL_ROUTES: Routes = [

    {
        path: 'busqueda',
        children: [
            { path: 'detalle', component: DetalleBusqueda },
            
        ]
    },
]
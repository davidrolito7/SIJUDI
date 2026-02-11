import { Routes } from '@angular/router';
import { ListarDemanda } from './views/listar-demanda/listar-demanda';
import { ListarAudiencias } from './views/listar-audiencias/listar-audiencias';
import { DetalleDemanda } from './views/detalle-demanda/detalle-demanda';
import { CrearDemanda } from './views/crear-demanda/crear-demanda';

export const JUICIO_ORAL_ROUTES: Routes = [
    {
        path: 'demandas',
        children: [
            { path: 'listar', component: ListarDemanda },
            { path: 'detalle', component: DetalleDemanda },
            { path: 'crear', component: CrearDemanda }
        ]
    },
    {
        path: 'audiencias',
        children: [
            { path: 'listar', component: ListarAudiencias },

        ]
    }
]
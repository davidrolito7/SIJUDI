import { Routes } from '@angular/router';
import { ListarDemanda } from './views/listar-demanda/listar-demanda';
import { ListarAudiencias } from './views/listar-audiencias/listar-audiencias';
import { DetalleDemanda } from './views/detalle-demanda/detalle-demanda';
import {ListarRequerimientos} from './views/listar-requerimientos/listar-requerimientos';
import { CrearDemanda } from './views/crear-demanda/crear-demanda';
import { DetalleRequerimientos } from './views/detalle-requerimientos/detalle-requerimientos';


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
    },
    { path: 'requerimientos',
        children: [
    { path: 'listar', component: ListarRequerimientos },
    { path: 'detalle', component: DetalleRequerimientos }
        ]
    }
]
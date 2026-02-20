import { Routes } from '@angular/router';
import { ListarDemanda } from './views/listar-demanda/listar-demanda';
import { ListarAudiencias } from './views/listar-audiencias/listar-audiencias';
import { DetalleAudiencia } from './views/detalle-audiencia/detalle-audiencia';
import { DetalleDemanda } from './views/detalle-demanda/detalle-demanda';
import { ListarRequerimientos } from './views/listar-requerimientos/listar-requerimientos';
import { CrearDemanda } from './views/crear-demanda/crear-demanda';
import { DetalleRequerimientos } from './views/detalle-requerimientos/detalle-requerimientos';
import { ListarExpediente } from './views/listar-expediente/listar-expediente';
import { DetalleExpediente } from './views/detalle-expediente/detalle-expediente';
import { CrearAudiencia } from './views/crear-audiencia/crear-audiencia';
import { CrearRequerimiento } from './views/crear-requerimiento/crear-requerimiento';

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
        path: 'expedientes',
        children: [
            { path: 'listar', component: ListarExpediente },
            { path: 'detalle', component: DetalleExpediente },
        ]
    },
    {
        path: 'audiencias',
        children: [
            { path: 'listar', component: ListarAudiencias },
            { path: 'detalle', component: DetalleAudiencia },
            { path: 'crear', component: CrearAudiencia}
        ]
    },
    {
        path: 'requerimientos',
        children: [
            { path: 'listar', component: ListarRequerimientos },
            { path: 'detalle', component: DetalleRequerimientos },
            {path: 'crear', component: CrearRequerimiento}
        ]
    }
];

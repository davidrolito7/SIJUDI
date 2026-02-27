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
import { ListarSolicitud } from './views/listar-solicitud/listar-solicitud';
import { ListarTramite } from './views/listar-tramite/listar-tramite';
import { CrearTramite } from './views/crear-tramite/crear-tramite';
import { DetalleTramite } from './views/detalle-tramite/detalle-tramite';
import { ListarAcuerdos } from './views/listar-acuerdo/listar-acuerdo';
import { CrearAcuerdo } from './views/crear-acuerdo/crear-acuerdo';

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
    },
    {
        path: 'solicitudes',
        children:[
            {path: 'listar', component: ListarSolicitud}
        ]
    },
    {
        path: 'tramites',
        children:[
            {path: 'crear', component: CrearTramite},
            {path: 'listar', component: ListarTramite},
            {path: 'detalle', component: DetalleTramite}
        ]
    },
    {
        path: 'acuerdos',
        children:[
            {path: 'listar', component: ListarAcuerdos},
            {path: 'crear', component: CrearAcuerdo}

        ]
    }
];

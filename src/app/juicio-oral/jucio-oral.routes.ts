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
import { DetalleAcuerdo } from './views/detalle-acuerdo/detalle-acuerdo';

export const JUICIO_ORAL_ROUTES: Routes = [

    {
        path: 'demandas',
        data: { title: 'Demandas' },
        children: [
            { path: 'listar', component: ListarDemanda, data: { title: 'Listar' } },
            { path: 'detalle', component: DetalleDemanda, data: { title: 'Detalle' } },
            { path: 'crear', component: CrearDemanda, data: { title: 'Crear' } }
        ]
    },
    {
        path: 'expedientes',
        data: { title: 'Expedientes' },
        children: [
            { path: 'listar', component: ListarExpediente, data: { title: 'Listar' } },
            { path: 'detalle', component: DetalleExpediente, data: { title: 'Detalle' } },
        ]
    },
    {
        path: 'audiencias',
        data: { title: 'Audiencias' },
        children: [
            { path: 'listar', component: ListarAudiencias, data: { title: 'Listar' } },
            { path: 'detalle', component: DetalleAudiencia, data: { title: 'Detalle' } },
            { path: 'crear', component: CrearAudiencia, data: { title: 'Crear' } }
        ]
    },
    {
        path: 'requerimientos',
        data: { title: 'Requerimientos' },
        children: [
            { path: 'listar', component: ListarRequerimientos, data: { title: 'Listar' } },
            { path: 'detalle', component: DetalleRequerimientos, data: { title: 'Detalle' } },
            { path: 'crear', component: CrearRequerimiento, data: { title: 'Crear' } }
        ]
    },
    {
        path: 'solicitudes',
        data: { title: 'Solicitudes' },
        children: [
            { path: 'listar', component: ListarSolicitud, data: { title: 'Listar' } }
        ]
    },
    {
        path: 'tramites',
        data: { title: 'Trámites' },
        children: [
            { path: 'crear', component: CrearTramite, data: { title: 'Crear' } },
            { path: 'listar', component: ListarTramite, data: { title: 'Listar' } },
            { path: 'detalle', component: DetalleTramite, data: { title: 'Detalle' } }
        ]
    },
    {
        path: 'acuerdos',
        data: { title: 'Acuerdos' },
        children: [
            { path: 'listar', component: ListarAcuerdos, data: { title: 'Listar' } },
            { path: 'crear', component: CrearAcuerdo, data: { title: 'Crear' } },
            { path: 'detalle', component: DetalleAcuerdo, data: { title: 'Detalle' } }
        ]
    }
];

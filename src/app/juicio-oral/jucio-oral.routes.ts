import { Routes } from '@angular/router';
import { ListarDemanda } from './views/listar-demanda/listar-demanda';
import { ListarAudiencias } from './views/listar-audiencias/listar-audiencias';

export const JUICIO_ORAL_ROUTES: Routes = [
   {
        path: 'demandas',
        children: [
            { path: 'listar', component: ListarDemanda },
          /// { path: 'detalle', component: DetalleInicioComponent },
           /// { path: 'crear', component: CrearInicioComponent }
        ]
        
    },
    {
        path: 'audiencias',
        children: [
            { path: 'listar', component: ListarAudiencias },
       
        ]
    }
]
import { Routes } from '@angular/router';
import { Siderbar } from './core/layout/siderbar/siderbar';
import { Login } from './core/auth/component/login/login';
import { Login2 } from './core/auth/component/login2fase/login2fase';
import { Home } from './home/home';
import { Form } from './form/form';
import { authMatchGuard } from './core/auth/guard/auth-guard';
import { Perfil } from './core/auth/component/perfil/perfil';
import { redirectGuard } from './core/auth/guard/redirect-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canMatch: [redirectGuard] },
  {
    path: 'login2fase',
    loadComponent: () =>
      import('./core/auth/component/login2fase/login2fase')
        .then(m => m.Login2),
    canMatch: [authMatchGuard],
  },

  { path: 'perfil', component: Perfil, canMatch: [authMatchGuard] },

  {
    path: '',
    component: Siderbar,
    canMatch: [authMatchGuard],
    children: [
      { path: 'form', component: Form },
      {
        path: 'tramites-juicio-oral', loadChildren: () =>
          import('./tramites-juicio-oral/tramites-juicio-oral.routes')
            .then(m => m.TRAMITES_JUICIO_ORAL_ROUTES)
      },
      {
        path: 'exhortos', loadChildren: () =>
          import('./exhortos/exhortos.routes')
            .then(m => m.EXHORTOS_ROUTES)
      },
      {
        path:'catalogos',loadChildren:() =>
          import('./catalogos/catalogos.route')
            .then(m=>m.CATALOGOS_ROUTES)
      },
        {path: 'juicioenlinea', loadChildren: () =>
          import('./juicio-oral/jucio-oral.routes')
            .then(m => m.JUICIO_ORAL_ROUTES)
        },
        {
          path: 'amparos', loadChildren: () =>
            import('./amparos/amparos.routes')
              .then(m => m.AMPAROS_ROUTES)
        },
        {path: 'penal', loadChildren: () =>
          import('./penal/penal.routes')
            .then(m => m.PENAL_ROUTES)
        },

    ],
  },

];

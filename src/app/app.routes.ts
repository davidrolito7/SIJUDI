import { Routes } from '@angular/router';
import { Siderbar } from './core/layout/siderbar/siderbar';
import { Login } from './core/auth/component/login/login';
import { Login2 } from './core/auth/component/login2fase/login2fase';
import { Home } from './home/home';
import { Form } from './form/form';
import { authGuard } from './core/auth/guard/auth-guard';
import { Perfil } from './core/auth/component/perfil/perfil';
import { redirectGuard } from './core/auth/guard/redirect-guard';
import { Listar } from './exhortos/recibidos/listar/listar';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [redirectGuard] },
  {
    path: 'login2fase',
    loadComponent: () =>
      import('./core/auth/component/login2fase/login2fase')
        .then(m => m.Login2),
    canMatch: [authGuard],
  },

  { path: 'perfil', component: Perfil, canActivate: [authGuard] },

  {
    path: '',
    component: Siderbar,
    canActivate: [authGuard],
    children: [
      { path: 'form', component: Form },
      {
        path: 'tramites-juicio-oral', loadChildren: () =>
          import('./tramites-juicio-oral/tramites-juicio-oral.routes')
            .then(m => m.TRAMITES_JUICIO_ORAL_ROUTES)
      }
    ],
  },

   { path: 'listar_exhortos_recibidos', component: Listar},
];

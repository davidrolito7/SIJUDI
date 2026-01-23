import { Routes } from '@angular/router';
import { Siderbar } from './core/layout/siderbar/siderbar';
import { Login } from './core/auth/component/login/login';
import { Login2 } from './core/auth/component/login2fase/login2fase';
import { Home } from './home/home';
import { Form } from './form/form';
import { authGuard } from './core/auth/guard/auth-guard';
import { Perfil } from './core/auth/component/perfil/perfil';

export const routes: Routes = [
  { path: '', redirectTo: 'tramites-juicio-oral', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'login2fase', component: Login2, canActivate: [authGuard] },
  { path: 'perfil', component: Perfil },

  {
    path: '',
    component: Siderbar,
    children: [
      { path: 'form', component: Form },
      {
        path: 'tramites-juicio-oral', loadChildren: () =>
          import('./tramites-juicio-oral/tramites-juicio-oral.routes')
            .then(m => m.TRAMITES_JUICIO_ORAL_ROUTES)
      }
    ],
  },
];

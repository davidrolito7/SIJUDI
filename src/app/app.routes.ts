import { Routes } from '@angular/router';
import { Siderbar } from './core/layout/siderbar/siderbar';
import { Login } from './core/auth/component/login/login';
import { Login2 } from './core/auth/component/login2fase/login2fase';
import { Home } from './home/home';
import { Form } from './form/form';
import { authGuard } from './core/auth/guard/auth-guard';
import { Perfil } from './core/auth/component/perfil/perfil';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login},
    
  // Aquí usamos canMatch para evitar que se cargue el componente si no pasa el guard
  //y para que no se cargue el modulo ademas de canMatch lo cargamos el component en modo lazy load
  {path: 'login2fase',loadComponent:()=>import('./core/auth/component/login2fase/login2fase').then(m=>m.Login2),canMatch:[authGuard]},
    // Aquí mantenemos canActivate porque ya es una vista interna
  { path: 'perfil', component: Perfil,canActivate: [authGuard] },
    
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
];

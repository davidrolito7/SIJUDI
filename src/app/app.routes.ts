import { Routes } from '@angular/router';
import { Siderbar } from './core/layout/siderbar/siderbar';
import { Login } from './core/auth/component/login/login';
import { Login2 } from './core/auth/component/login2fase/login2fase';
import { Home } from './home/home';
import { Form } from './form/form';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'login2fase', component: Login2 },
  {
    path: '',
    component: Siderbar,
    children: [
      { path: 'home', component: Home },
      { path: 'form', component: Form }, 
    ],
  },
];

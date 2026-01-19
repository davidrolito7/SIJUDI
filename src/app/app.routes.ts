import { Routes } from '@angular/router';
import { Siderbar } from './siderbar/siderbar';
import { Login } from './login/login';
import { Login2 } from './login2/login2';
import { Home } from './home/home';
import { Form } from './form/form';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'login2', component: Login2 },
  {
    path: '',
    component: Siderbar,
    children: [
      { path: 'home', component: Home },
      { path: 'form', component: Form }, 
    ],
  },
];

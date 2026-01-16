import { Routes } from '@angular/router';
import { Siderbar } from './siderbar/siderbar';
import { Login } from './login/login';
import { Login2 } from './login2/login2';

export const routes: Routes = [
    { path: '', redirectTo: 'sidebar', pathMatch: 'full' },
    { path: 'sidebar', component: Siderbar },
    { path: 'login', component: Login },
    { path: 'login2', component: Login2}
];

import { Routes } from '@angular/router';
import { CatalogoJuzgados } from './catalogo-juzgados/catalogo-juzgados';

export const CATALOGOS_ROUTES: Routes = [
  { path: 'juzgados', component: CatalogoJuzgados, title: 'Juzgados'/*, canActivate: [RedirectGuard]*/ },
 
];
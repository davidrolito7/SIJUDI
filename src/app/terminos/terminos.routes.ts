import { Routes } from '@angular/router'; 
import { ReportesDocumentosComponent } from './views/reportes-documentos/reportes-documentos';
import { Terminosprimerainstancia } from './views/terminosprimerainstancia/terminosprimerainstancia';
import { Terminossegundainstancia } from './views/terminossegundainstancia/terminossegundainstancia';
import { buscarTerminosComponent } from './views/buscar/buscar-terminos';
import { CatalogoCrud } from './views/catalogos/catalogo-crud/catalogo-crud';


export const TERMINOS_ROUTES: Routes = [
  { path: 'reportes/documentos', component: ReportesDocumentosComponent, title: 'Reporte'/*, canActivate: [RedirectGuard]*/ },
  { path: 'terminosprimerainstancia', component: Terminosprimerainstancia, title: 'primera instancia'/*, canActivate: [RedirectGuard] */},
  { path: 'terminossegundainstancia', component: Terminossegundainstancia, title: 'segunda instancia'/*, canActivate: [RedirectGuard]*/ },
  { path: 'buscar', component:buscarTerminosComponent},
  { path: 'catalogos',component:CatalogoCrud}
];
import { Routes } from '@angular/router';
import { ReportesDocumentosComponent } from './views/reportes-documentos/reportes-documentos';
import { Terminosprimerainstancia } from './views/terminosprimerainstancia/terminosprimerainstancia';
import { Terminossegundainstancia } from './views/terminossegundainstancia/terminossegundainstancia';
import { buscarTerminosComponent } from './views/buscar/buscar-terminos';
import { CatalogoCrud } from './views/catalogos/catalogo-crud/catalogo-crud';


export const TERMINOS_ROUTES: Routes = [
  { path: 'reportes/documentos', component: ReportesDocumentosComponent, data: { title: 'Reportes' } },
  { path: 'terminosprimerainstancia', component: Terminosprimerainstancia, data: { title: 'Primera Instancia' } },
  { path: 'terminossegundainstancia', component: Terminossegundainstancia, data: { title: 'Segunda Instancia' } },
  { path: 'buscar', component: buscarTerminosComponent, data: { title: 'Buscar' } },
  { path: 'catalogos', component: CatalogoCrud, data: { title: 'Catalagos' } },
];
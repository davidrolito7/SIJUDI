import { Routes } from '@angular/router';
//import { exhortosComponent } from './views/exhortos/exhortos.component';
//import { DetalleExhortosComponent } from './views/detalle-exhortos/detalle-exhortos.component';
//import { GenerarRespuestaComponent } from './views/generar-respuesta/generar-respuesta/generar-respuesta.component';
//import { PromocionExhortosComponent } from './views/promocion-exhortos/promocion-exhortos/promocion-exhortos.component';
//import { ExhortosEnviadosComponent } from './views/exhortos-enviados/exhortos-enviados/exhortos-enviados.component';
//import { DetalleExhortosEnviadosComponent } from './views/detalle-exhortos-enviados/detalle-exhortos-enviados/detalle-exhortos-enviados.component';
//import { RespuestaExhortoEnviadoComponent } from './views/respuesta-exhorto-enviado/respuesta-exhorto-enviado/respuesta-exhorto-enviado.component';
import { CrearExhortoComponent } from './enviados/crear/crear-exhorto';
//import { JuzgadoComponent } from './views/juzgado/juzgado.component';
//import { RecibirExhortoJuzgadoComponent } from './views/recibir-exhorto-juzgado/recibir-exhorto-juzgado.component';
//import { AcuerdoExhortosComponent } from './views/acuerdo-exhorto/acuerdo-exhortos/acuerdo-exhortos.component';
//import { PromocionExhortosEnviadosComponent } from './views/promocion-exhortos-enviados/promocion-exhortos-enviados.component';
import { redirectGuard } from '../core/auth/guard/redirect-guard';
import { Listar } from './recibidos/listar/listar';
import { AmbitosDeCompetencia } from './views/ambitos-de-competencia/ambitos-de-competencia';

export const EXHORTOS_ROUTES: Routes = [
  //{ path: 'exhortos', component: exhortosComponent, title: 'Exhortos'/*, canActivate: [RedirectGuard]*/ },
  //{ path: 'detalle', component: DetalleExhortosComponent, title: 'Detalle'/*, canActivate: [RedirectGuard] */},
  //{ path: 'detalle/generar-respuesta', component: GenerarRespuestaComponent, title: 'Generar respuesta', canActivate: [RedirectGuard] },
  //{ path: 'detalle/promocion-exhorto', component: PromocionExhortosComponent, title: 'Promociones de exhorto', canActivate: [RedirectGuard] },
  //{ path: 'acuerdos', component: AcuerdoExhortosComponent, title: 'Acuerdos Exhortos' },
  //{ path: 'exhortos-enviados', component: ExhortosEnviadosComponent, title: 'Exhortos enviados', canActivate: [RedirectGuard] },
  //{ path: 'exhortos-enviados/detalle', component: DetalleExhortosEnviadosComponent, title: 'Detalle', canActivate: [RedirectGuard] },
  { path: 'crear-exhorto', component: CrearExhortoComponent, title: 'Crear Exhorto para enviar'/*, canActivate: [redirectGuard]*/ },
  //{ path: 'exhortos-enviados/detalle/ver-respuesta', component: RespuestaExhortoEnviadoComponent, title: 'Crear Exhorto para enviar', canActivate: [RedirectGuard] },
  //{ path: 'exhortos-enviados/promocion-exhortos-enviados', component: PromocionExhortosEnviadosComponent, title: 'Promocionar Exhorto Enviado', canActivate: [RedirectGuard] },
  //{ path: 'asignarJuzgado', component: RecibirExhortoJuzgadoComponent, title: 'Asignar juzgado', canActivate: [RedirectGuard] },
  { path: 'configuracionJuzgado', component: AmbitosDeCompetencia  },
  { path: 'listar-exhortos-recibidos', component: Listar},
];
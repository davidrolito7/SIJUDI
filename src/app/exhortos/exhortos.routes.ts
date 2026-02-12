import { Routes } from '@angular/router';
//import { exhortosComponent } from './views/exhortos/exhortos.component';
//import { DetalleExhortosComponent } from './views/detalle-exhortos/detalle-exhortos.component';
//import { GenerarRespuestaComponent } from './views/generar-respuesta/generar-respuesta/generar-respuesta.component';
//import { PromocionExhortosComponent } from './views/promocion-exhortos/promocion-exhortos/promocion-exhortos.component';
import { ListaExhortosEnviados } from './enviados/listar/lista-exhorto-Enviado';
import { DetallesExhortoEnviado } from './enviados/detalles/detalles-exhorto-enviado'; 
//import { RespuestaExhortoEnviadoComponent } from './views/respuesta-exhorto-enviado/respuesta-exhorto-enviado/respuesta-exhorto-enviado.component';
import { CrearExhortoComponent } from './enviados/crear/crear-exhorto';
//import { JuzgadoComponent } from './views/juzgado/juzgado.component';
//import { RecibirExhortoJuzgadoComponent } from './views/recibir-exhorto-juzgado/recibir-exhorto-juzgado.component';
//import { AcuerdoExhortosComponent } from './views/acuerdo-exhorto/acuerdo-exhortos/acuerdo-exhortos.component';
//import { PromocionExhortosEnviadosComponent } from './views/promocion-exhortos-enviados/promocion-exhortos-enviados.component';
import { redirectGuard } from '../core/auth/guard/redirect-guard';
import { ListaExhortosRecibidos } from './recibidos/listar/lista-exhorto-recibido';
import { AmbitosDeCompetencia } from './views/ambitos-de-competencia/ambitos-de-competencia';
import { PromocionExhortoEnviadoComponent } from './enviados/promocion/promocion-exhorto-enviado';
import { RespuestaExhortoEnviado } from './enviados/respuesta/respuesta-exhorto-enviado';
import { DetallesExhortoRecibido } from './recibidos/detalles/detalles-exhorto-recibido';
import { RespuestaExhortoRecibido } from './recibidos/respuesta/respuesta-exhorto-recibido';
import { GenerarAcuerdo } from './recibidos/acuerdo/generar-acuerdo';

export const EXHORTOS_ROUTES: Routes = [
  { path: 'lista-exhortos-enviados', component: ListaExhortosEnviados, title: 'Exhortos enviados'/*, canActivate: [RedirectGuard]*/ },
  { path: 'detalles-exhorto-recibido', component: DetallesExhortoRecibido, title: 'Detalles exhortos recibidos'/*, canActivate: [RedirectGuard] */},
  { path: 'generar-acuerdo', component: GenerarAcuerdo, title: 'Generar respuesta'/*, canActivate: [RedirectGuard]*/ },
  //{ path: 'detalle/promocion-exhorto', component: PromocionExhortosComponent, title: 'Promociones de exhorto', canActivate: [RedirectGuard] },
  { path: 'respuesta-exhorto-recibido', component: RespuestaExhortoRecibido, title: 'Acuerdos Exhortos' },
  //{ path: 'exhortos-enviados', component: ExhortosEnviadosComponent, title: 'Exhortos enviados', canActivate: [RedirectGuard] },
  { path: 'detalles-exhorto-enviado', component: DetallesExhortoEnviado, title: 'Detalles exhortos enviados'/*, canActivate: [RedirectGuard] */},
  { path: 'crear-exhorto', component: CrearExhortoComponent, title: 'Crear Exhorto para enviar'/*, canActivate: [redirectGuard]*/ },
  { path: 'respuesta-exhorto-enviado', component: RespuestaExhortoEnviado, title: 'Crear Exhorto para enviar'/*, canActivate: [RedirectGuard]*/ },
  { path: 'promocion-exhorto-enviado', component: PromocionExhortoEnviadoComponent, title: 'Promocionar Exhorto Enviado'/*, canActivate: [RedirectGuard] */},
  //{ path: 'asignarJuzgado', component: RecibirExhortoJuzgadoComponent, title: 'Asignar juzgado', canActivate: [RedirectGuard] },
  { path: 'configuracionJuzgado', component: AmbitosDeCompetencia  },
  { path: 'lista-exhortos-recibidos', component: ListaExhortosRecibidos},
];
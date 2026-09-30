import { Routes } from '@angular/router';
import { redirectGuard } from '../core/auth/guard/redirect-guard';
import { RecibirExhortoJuzgado } from './recibidos/recibir-exhorto-juzgado/recibir-exhorto-juzgado';

export const EXHORTOS_ROUTES: Routes = [
  { path: 'lista-exhortos-enviados', loadComponent: () => import('../exhortos/enviados/listar/lista-exhorto-Enviado').then(m => m.ListaExhortosEnviados), title: 'Exhortos enviados'/*, canActivate: [RedirectGuard]*/ },
  { path: 'detalles-exhorto-recibido', loadComponent: () => import('../exhortos/recibidos/detalles/detalles-exhorto-recibido').then(m => m.DetallesExhortoRecibido), title: 'Detalles exhortos recibidos'/*, canActivate: [RedirectGuard] */ },
  { path: 'generar-acuerdo', loadComponent: () => import('../exhortos/recibidos/acuerdo/generar-acuerdo').then(m => m.GenerarAcuerdo), title: 'Generar respuesta'/*, canActivate: [RedirectGuard]*/ },
  { path: 'listado-promociones', loadComponent: () => import('../exhortos/recibidos/listado-promociones/listado-promociones').then(m => m.ListadoPromociones), title: 'Listado de promociones'/*, canActivate: [RedirectGuard]*/ },

  // se oculta esta vista ya que es redundante con la vista de detalles exhorto recibido, se deja el código comentado por si se requiere en un futuro
  //  { path: 'respuesta-exhorto-recibido',loadComponent:()=> import('../exhortos/recibidos/respuesta/respuesta-exhorto-recibido').then(m=>m.RespuestaExhortoRecibido), title: 'Acuerdos Exhortos' },
  { path: 'detalles-exhorto-enviado', loadComponent: () => import('../exhortos/enviados/detalles/detalles-exhorto-enviado').then(m => m.DetallesExhortoEnviado), title: 'Detalles exhortos enviados'/*, canActivate: [RedirectGuard] */ },
  { path: 'crear-exhorto', loadComponent: () => import('../exhortos/enviados/crear/crear-exhorto').then(m => m.CrearExhortoComponent), title: 'Crear Exhorto para enviar'/*, canActivate: [redirectGuard]*/ },
  { path: 'respuesta-exhorto-enviado', loadComponent: () => import('../exhortos/enviados/respuesta/respuesta-exhorto-enviado').then(m => m.RespuestaExhortoEnviado), title: 'Crear Exhorto para enviar'/*, canActivate: [RedirectGuard]*/ },
  { path: 'promocion-exhorto-enviado', loadComponent: () => import('../exhortos/enviados/promocion/promocion-exhorto-enviado').then(m => m.PromocionExhortoEnviadoComponent), title: 'Promocionar Exhorto Enviado'/*, canActivate: [RedirectGuard] */ },
  { path: 'configuracionJuzgado', loadComponent: () => import('../exhortos/views/ambitos-de-competencia/ambitos-de-competencia').then(m => m.AmbitosDeCompetencia) },
  { path: 'lista-exhortos-recibidos', loadComponent: () => import('../exhortos/recibidos/listar/lista-exhorto-recibido').then(m => m.ListaExhortosRecibidos) },
  { path: 'asignarJuzgado', component: RecibirExhortoJuzgado, title: 'Recibir Exhorto' },
];
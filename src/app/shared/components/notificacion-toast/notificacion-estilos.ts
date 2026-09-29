import { NotificacionResponse } from '../../interface/shared.interface';

export interface EstiloAccion {
  etiqueta: string;
  icono: string;
  acento: string;      // franja izquierda y barra de progreso
  iconoColor: string;  // recuadro del icono
  badgeColor: string;  // etiqueta del tipo de tramite
}

type EstiloVisual = Omit<EstiloAccion, 'etiqueta'>;

//Configuracion visual por idCatTipoTramite; la usan el toast y el listado de notificaciones del header
//para que ambos se vean igual. Las clases van completas (sin interpolar) para que Tailwind las detecte
const ESTILOS_TIPO_TRAMITE: Record<number, EstiloVisual> = {
  // EXPEDIENTE
  1: {
    icono: 'pi-folder', acento: 'bg-slate-500',
    iconoColor: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400'
  },
  // INICIO
  2: {
    icono: 'pi-file-plus', acento: 'bg-blue-500',
    iconoColor: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
  },
  // PROMOCIÓN RECIBIDA
  3: {
    icono: 'pi-inbox', acento: 'bg-sky-500',
    iconoColor: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
    badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
  },
  // ACUERDO
  4: {
    icono: 'pi-file-edit', acento: 'bg-indigo-500',
    iconoColor: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
  },
  // NOTIFICACIÓN DE RESOLUCIONES
  5: {
    icono: 'pi-megaphone', acento: 'bg-amber-500',
    iconoColor: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
  },
  // ACUERDO DE OFICIO
  6: {
    icono: 'pi-file-check', acento: 'bg-violet-500',
    iconoColor: 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
    badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'
  },
  // ENTREGA DE VALORES
  7: {
    icono: 'pi-wallet', acento: 'bg-emerald-500',
    iconoColor: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
  },
  // INTERLOCUTORIA
  8: {
    icono: 'pi-bookmark', acento: 'bg-orange-500',
    iconoColor: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
  },
  // SENTENCIA
  9: {
    icono: 'pi-verified', acento: 'bg-red-500',
    iconoColor: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
  },
  // OFICIO RECIBIDO
  10: {
    icono: 'pi-envelope', acento: 'bg-teal-500',
    iconoColor: 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
    badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
  },
  // OFICIO ENVIADO
  11: {
    icono: 'pi-send', acento: 'bg-cyan-500',
    iconoColor: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
    badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400'
  },
  // EXHORTO RECIBIDO
  12: {
    icono: 'pi-download', acento: 'bg-purple-500',
    iconoColor: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
  },
  // EXHORTO ENVIADO
  13: {
    icono: 'pi-upload', acento: 'bg-pink-500',
    iconoColor: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400'
  },
};

//El default usa el color primary del tema
const ESTILO_DEFAULT: EstiloVisual = {
  icono: 'pi-bell', acento: 'bg-primary',
  iconoColor: 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800',
  badgeColor: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
};

//Color por idCatTipoTramite y etiqueta tomada de tipoTramite.descripcion
export function estiloNotificacion(notif: NotificacionResponse | null | undefined): EstiloAccion {
  const id = notif?.tipoTramite?.idCatTipoTramite ?? notif?.idCatTipoTramite;
  const visual = (id != null ? ESTILOS_TIPO_TRAMITE[id] : undefined) ?? ESTILO_DEFAULT;
  return { ...visual, etiqueta: notif?.tipoTramite?.descripcion || 'Notificación' };
}

//Area • perfil • subarea en una sola linea, omitiendo los que vengan vacios
export function origenResumen(notif: NotificacionResponse | null | undefined): string {
  const o = notif?.origen;
  return [o?.area?.descripcion, o?.sistemaPerfil?.descripcion, o?.subArea?.descripcion]
    .filter(Boolean)
    .join(' • ');
}

//Texto completo del origen para el tooltip (un dato por renglon)
export function origenDetalle(notif: NotificacionResponse | null | undefined): string {
  const o = notif?.origen;
  return [
    o?.area?.descripcion ? `Área: ${o.area.descripcion}` : '',
    o?.sistemaPerfil?.descripcion ? `Perfil: ${o.sistemaPerfil.descripcion}` : '',
    o?.subArea?.descripcion ? `Subárea: ${o.subArea.descripcion}` : '',
  ].filter(Boolean).join('\n');
}

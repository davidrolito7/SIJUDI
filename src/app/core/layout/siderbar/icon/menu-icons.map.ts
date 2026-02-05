import { ModulosUsuario, Pantallas } from "../../../auth/interface/login.interfaces";

const PANTALLA_ICON_BY_IMAGEN: Record<string, string> = {
  'svg-ex-crear': 'ex-crear',
  'svg-ex-recibidos': 'ex-recibidos',
  'svg-ex-enviados': 'ex-enviados',
};

// OJO: como tu archivo tiene espacio, en URL debe ir %20
const MODULO_SVG_BY_ID: Record<number, string> = {
  3360: 'AmparoElectronico.svg',
  3361: 'ExhortoElectronico.svg',
};

export function iconForPantalla(p: Pantallas): string {
  const key = (p.Imagen ?? '').trim();
  return PANTALLA_ICON_BY_IMAGEN[key] ?? 'default';
}

export function svgSrcForModulo(m: ModulosUsuario): string {
  const id = Number(m.idSistemaModulo);
  const file = MODULO_SVG_BY_ID[id] ?? 'default.svg';
  return `icons/${file}`;
}

// menu-icons.map.ts
export function iconNameForModulo(m: ModulosUsuario): string {
  const id = Number(m.idSistemaModulo);
  return MODULO_SVG_BY_ID[id]?.replace('.svg', '') ?? 'default';
}
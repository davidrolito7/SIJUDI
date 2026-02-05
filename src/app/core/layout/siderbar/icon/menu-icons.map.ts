import { ModulosUsuario, Pantallas } from "../../../auth/interface/login.interfaces";

const PANTALLA_SVG_BY_IMAGEN: Record<string, string> = {
  'svg-ex-crear': 'crear.svg',
  'svg-ex-recibido': 'exhortoRecibido.svg',
  'svg-ex-enviado': 'exhortoEnviado.svg',
  //'svg-ex-ambito': 'exhortoAmbito.svg',
};

const MODULO_SVG_BY_ID: Record<number, string> = {
  3360: 'amparoElectronico.svg',
  3361: 'exhortoElectronico.svg',
};

export function svgSrcForModulo(m: ModulosUsuario): string {
  const id = Number(m.idSistemaModulo);
  const file = MODULO_SVG_BY_ID[id] ?? 'default.svg';
  return `icons/${file}`;
}

export function svgSrcForPantalla(p: Pantallas): string {
  const key = (p.imagen ?? '').trim();
  const file = PANTALLA_SVG_BY_IMAGEN[key] ?? 'default.svg';
  return `icons/${file}`;
}


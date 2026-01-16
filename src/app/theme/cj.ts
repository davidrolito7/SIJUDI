import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';

export const Custom = definePreset(Lara, {
  semantic: {
    primary: {
      50:  '#c1ded4', // verde claro
      100: '#b7d5c9',
      200: '#a9ccbf',
      300: '#8fbbae',
      400: '#6ca091',
      500: '#315d53', // verde oscuro (principal)
      600: '#294b43',
      700: '#203a33',
      800: '#182a25',
      900: '#101b17'
    },
    secondary: {
      50:  '#f3eadc',
      100: '#eadcc4',
      200: '#ddc8a4',
      300: '#cdb07f',
      400: '#bc9865',
      500: '#b2915b', // café
      600: '#9a7b4e',
      700: '#7f6542',
      800: '#665137',
      900: '#4d3d2b'
    },
 
  }
});
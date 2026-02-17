import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter, withDebugTracing, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
//import Lara from '@primeuix/themes/lara';
import { Custom } from './theme/cj';

import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { tokenInterceptor } from './core/auth/interceptor/token.interceptor';
import es from 'primelocale/es.json';

registerLocaleData(localeEs);


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // withDebugTracing(),
      withRouterConfig({
        urlUpdateStrategy: 'deferred',
        canceledNavigationResolution: 'computed',
      })
    ),
    provideAnimationsAsync(),
    provideZonelessChangeDetection(),
    providePrimeNG({
      translation: es.es,
      theme: {
        preset: Custom,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, components, utilities'
          }
        }
      }
    }),

    provideHttpClient(
      withInterceptors([tokenInterceptor]),
      withInterceptorsFromDi(),
      //withFetch()
    ),

  ]
};

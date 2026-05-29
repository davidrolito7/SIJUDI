import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import es from 'primelocale/es.json';

import { routes } from './app.routes';
import { Custom } from './theme/cj';
import { tokenInterceptor } from './core/auth/interceptor/token.interceptor';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    provideRouter(
      routes,
      withRouterConfig({
        urlUpdateStrategy: 'deferred',
        canceledNavigationResolution: 'computed',
      })
    ),

    provideAnimationsAsync(),

    providePrimeNG({
      translation: es.es,
      theme: {
        preset: Custom,
        options: {
          darkModeSelector: '.dark',
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
    ),
  ]
};
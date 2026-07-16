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
      license: 'eyJpZCI6ImUxMDY4Mzg3LWEyMmQtNGExOS1iNGUyLTQ5MjUwNWE0MTZjOSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODM2OTc0MjUsImV4cCI6MTgxNTIzMzQyNX0.3v2B5VugG78r88n98jB9nCZDBYa1Yqq3yuz5aMvHce7jFG3pI3dSickDDfFCUNT_Fnr467NZ4TQ1BE4_kHraDA',
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
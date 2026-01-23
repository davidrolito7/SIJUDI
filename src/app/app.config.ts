import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
//import Lara from '@primeuix/themes/lara';
import { Custom } from './theme/cj';
<<<<<<< HEAD
import { provideHttpClient, withFetch } from '@angular/common/http';
=======
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { tokenInterceptor } from './core/auth/interceptor/token.interceptor';
>>>>>>> b8b847614338e633adfbb77747bb6c4fa70e8eb3

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    providePrimeNG({
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
<<<<<<< HEAD
    provideHttpClient(withFetch())
=======
    provideHttpClient(
      withInterceptors([tokenInterceptor]),
      withInterceptorsFromDi(),
      withFetch()
    ),
>>>>>>> b8b847614338e633adfbb77747bb6c4fa70e8eb3
  ]
};

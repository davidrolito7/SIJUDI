import { HttpContext, HttpContextToken, HttpHandlerFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap, catchError, throwError, take, filter, tap, finalize } from 'rxjs';
import { TokenService } from '../service/token.service';
import { AuthService } from '../service/auth.service';
import { NetworkService } from '../service/network.service';

const CHECK_TOKEN = new HttpContextToken<boolean>(() => false);

export function checkToken() {
  return new HttpContext().set(CHECK_TOKEN, true);
}

export function tokenInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const networkService = inject(NetworkService);

  const addToken = (req: HttpRequest<unknown>) => {
    const accessToken = tokenService.getToken();
    if (accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
      });
      return next(authReq);
    }
    return next(req);
  };

  if (request.context.get(CHECK_TOKEN)) {
    return networkService.isOnline().pipe(
      take(1),
      switchMap(isOnline => {
        if (!isOnline) {
          alert('Sin conexión a internet. Función no disponible.');
          return throwError(() => new Error('Sin conexión a Internet'));
        }

        const isValidToken = tokenService.isValidToken();
        if (isValidToken) {
          return addToken(request);
        }

        const refreshToken = tokenService.getRefreshToken();
        const accessToken = tokenService.getToken();
        const isValidRefreshToken = tokenService.isValidRefreshToken();
        const remember = typeof window !== 'undefined'
          ? sessionStorage.getItem(tokenService.nameRefreshToken) !== null
          : false;
          
        if (!refreshToken || !isValidRefreshToken) {
          return next(request);
        }

        if (authService.getIsRefreshing()) {
          return authService.getRefreshTokenSubject().pipe(
            filter(token => token !== null),
            take(1),
            switchMap(() => addToken(request))
          );
        }

        authService.setIsRefreshing(true);
        authService.getRefreshTokenSubject().next(null);

        return authService.refresToken(accessToken || '', refreshToken, remember).pipe(
          tap(() => {}),
          switchMap(response => {
            const newAccessToken = response.data.access_token;
            authService.getRefreshTokenSubject().next(newAccessToken);
            return addToken(request);
          }),
          catchError(() => {
            tokenService.removeToken();
            tokenService.removeRefreshToken();
            tokenService.notifySessionExpired();
            return throwError(() => new Error('Error al renovar el token'));
          }),
          finalize(() => {
            authService.setIsRefreshing(false);
          })
        );
      })
    );
  }

  return next(request);
}

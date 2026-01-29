import { CanMatchFn, CanActivateFn, Router, UrlSegment } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../service/token.service';

function checkAuth(targetUrl: string): true | ReturnType<Router['parseUrl']> {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const isValidToken = tokenService.isValidRefreshToken();
  tokenService.setValidacionCompletada(true);

  if (!isValidToken) {
    tokenService.clearTwoFactorValidated();
    tokenService.clearPerfilCompleted();
    return router.parseUrl('/login');
  }

  const twoOk = tokenService.isTwoFactorValidated();
  const isLogin2fase = targetUrl === '/login2fase' || targetUrl.startsWith('/login2fase/');
  const isPerfil = targetUrl === '/perfil' || targetUrl.startsWith('/perfil/');

  if (!twoOk && !isLogin2fase) return router.parseUrl('/login2fase');
  if (twoOk && isLogin2fase) return router.parseUrl('/perfil');

  const perfilDone = tokenService.isPerfilCompleted();
  if (twoOk && perfilDone && isPerfil) return router.parseUrl('/tramites-juicio-oral');

  return true;
}

//  Guard para canMatch
export const authMatchGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const url = '/' + (segments.map(s => s.path).join('/') || '');
  return checkAuth(url);
};

//  Guard para canActivate 
export const authActivateGuard: CanActivateFn = (_route, state) => checkAuth(state.url);

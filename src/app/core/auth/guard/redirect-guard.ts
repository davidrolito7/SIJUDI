import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../service/token.service';

export const redirectGuard: CanMatchFn = (_route, segments) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const url = '/' + (segments.map(s => s.path).join('/') || '');
  //const ok = tokenService.isValidRefreshToken();
  const ok = tokenService.isOneFactorValidated();

  if (url === '/login' && ok ) {
    const twoOk = tokenService.isTwoFactorValidated();
    return router.parseUrl(twoOk ? '/perfil' : '/login2fase');
  }

  return true;
};

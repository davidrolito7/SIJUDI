import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanMatch,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment
} from '@angular/router';
import { TokenService } from '../service/token.service';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate, CanMatch {
  constructor(private tokenService: TokenService, private router: Router) { }

  private checkAuth(targetUrl: string): boolean {
    try {
      const isValidToken = this.tokenService.isValidRefreshToken();
      this.tokenService.setValidacionCompletada(true);

      if (!isValidToken) {
        // limpiar flags si la sesión ya no es válida
        this.tokenService.clearTwoFactorValidated?.();
        this.tokenService.clearPerfilCompleted?.();

        this.router.navigate(['/login']);
        return false;
      }

      const twoOk = this.tokenService.isTwoFactorValidated();
      const isLogin2fase = targetUrl.startsWith('/login2fase');

      //  validado 2FA/llave privada, solo permitimos /login2fase
      if (!twoOk && !isLogin2fase) {
        this.router.navigate(['/login2fase']);
        return false;
      }

      //  validó 2FA
      if (twoOk && isLogin2fase) {
        this.router.navigate(['/perfil']);
        return false;
      }

      // si ya completó perfil, no permitir volver a /perfil
      const perfilDone = this.tokenService.isPerfilCompleted?.() ?? false;
      const isPerfil = targetUrl === '/perfil' || targetUrl.startsWith('/perfil/');
      if (twoOk && perfilDone && isPerfil) {
        this.router.navigate(['/tramites-juicio-oral'], { replaceUrl: true });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en AuthGuard al verificar el token:', error);
      this.tokenService.setValidacionCompletada(true);
      this.router.navigate(['/login']);
      return false;
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAuth(state.url);
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean {
    const url = '/' + (segments?.map(s => s.path).join('/') || '');
    return this.checkAuth(url);
  }
}

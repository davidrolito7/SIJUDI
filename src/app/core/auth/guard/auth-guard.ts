import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Router,UrlTree,ActivatedRouteSnapshot,RouterStateSnapshot,Route,UrlSegment  } from '@angular/router';
import {TokenService} from '../service/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate, CanMatch {
  constructor(private tokenService: TokenService, private router: Router) {}

  
  private checkAuth():  boolean
     {
    try{
        const isValidToken = this.tokenService.isValidRefreshToken();
        // Marcar validación completada
        this.tokenService.setValidacionCompletada(true);

        if (!isValidToken) {
           // ❌ Usuario no autenticado → devuelve UrlTree en vez de false
           // Esto evita que Angular intente cargar la ruta y permite redirigir de forma limpia
           // return this.router.parseUrl('/login?expired=true');
            this.router.navigate(['/login']);
            return false;
        }
        return true;
      }
    catch(error){
       console.error('Error en AuthGuard al verificar el token:', error);
        this.tokenService.setValidacionCompletada(true);
        //this.router.navigate(['/login']);
        this.router.navigate(['/login']);
        return false;
    }
  }

  // Se ejecuta cuando ya se resolvió la ruta
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean  {
    return this.checkAuth();
  }

  // Se ejecuta antes de cargar el componente o módulo
  canMatch(route: Route, segments: UrlSegment[]): boolean  {
    return this.checkAuth();
  }

}

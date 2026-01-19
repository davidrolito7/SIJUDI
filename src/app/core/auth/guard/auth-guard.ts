import { Injectable } from '@angular/core';
import { CanActivate, Router,UrlTree  } from '@angular/router';
import {TokenService} from '../service/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}

  canActivate():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    try{
        const isValidToken = this.tokenService.isValidRefreshToken();
        // Marcar validación completada
        this.tokenService.setValidacionCompletada(true);

        if (!isValidToken) {
           // ❌ Usuario no autenticado → devuelve UrlTree en vez de false
           // Esto evita que Angular intente cargar la ruta y permite redirigir de forma limpia
           // return this.router.parseUrl('/login?expired=true');
            return this.router.parseUrl('/login');
        }
        return true;
      }
    catch(error){
       console.error('Error en AuthGuard al verificar el token:', error);
        this.tokenService.setValidacionCompletada(true);
        //this.router.navigate(['/login']);
        return this.router.parseUrl('/login');
    }
  }
}

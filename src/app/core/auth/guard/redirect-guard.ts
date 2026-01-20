import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { TokenService } from '../service/token.service';
import { AuthService } from '../service/auth.service';

export const redirectGuard: CanActivateFn = (route, state) => {
  try {
    const tokenService = inject(TokenService);
    const router = inject(Router);
    const authService = inject(AuthService);

    const isValidRefreshToken = tokenService.isValidRefreshToken();
    //const refreshToken = tokenService.getRefreshToken();
  

  // Si el token es válido y el usuario intenta entrar a /login → redirigir a /inicio
    if (state.url === '/login' && isValidRefreshToken)  
      return router.parseUrl('/inicio');

    //console.log('Validando RedirectGuard para la ruta:', state.url);
    //console.log(isValidRefreshToken)

    // Si el token no es válido y el usuario intenta entrar a cualquier ruta protegida → redirigir a /login
    if (!isValidRefreshToken ) {
       //return router.parseUrl('/login'); // 👈 devuelve UrlTree
      //router.navigate(['/login']);
      return true;
    }
    else{
      if (authService.pantallasUsuario().length>0 ) {
        console.log('Tiene valor:', authService.pantallasUsuario());
      } else {
        console.log('No tiene valor asignado');

        if(typeof localStorage !=='undefined'){
         
          const items = (localStorage.getItem('pantallas')?.toString() || '').split(',');
          items.forEach((item, index) => {
            authService.agregarPantalla( item);
          });
        }
      }
      const permiso = authService.buscarPantallaPermiso(state.url.substring(8));

      if ( permiso.length>0) {
        //router.navigate(['/inicio']);
        //return router.parseUrl('/inicio'); // 👈 devuelve UrlTree
        return true;
      }else{
        if(state.url=='/inicio/dashboard'){
        return true;
        }else if(state.url=='/inicio/perfil-selecionado'){
          return true;
        }
        else{
          //router.navigate(['/inicio/paginasp']);
          return router.parseUrl('/inicio/paginasp');
          //return true;
        }
      }

    }
/*  //Comentado por el momento para hacer pruebas de los permisos
    // ⏳ Esperar hasta que se carguen las pantallas
    const maxWait = 50; // máximo 50 intentos (5s si es cada 100ms)
    await firstValueFrom(
      interval(100).pipe(
        take(maxWait),
        filter(() => authService.pantallasCargadas())
      )
    );
*/



  } catch (error) {
    console.error('Error en RedirectGuard:', error);
    return true;
  }
};

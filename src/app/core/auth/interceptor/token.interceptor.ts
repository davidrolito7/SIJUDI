import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpContextToken,
  HttpContext
} from '@angular/common/http';
import { Observable, switchMap, catchError, throwError, take, filter, tap, finalize} from 'rxjs';
import { TokenService } from '../service/token.service';
import { AuthService } from '../service/auth.service';
import { NetworkService } from '../service/network.service';

//declaramos un conexto
const CHECK_TOKEN = new HttpContextToken<boolean>(()=>false);

export function checkToken(){
  return new HttpContext().set(CHECK_TOKEN,true);
}

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  ServerTime: string="";
  today:Date = new Date();

  constructor(
    private tokenService:TokenService,
    private authService:AuthService,
    private networkService: NetworkService 
  ) {}

  //aqui llegan todos los request
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(CHECK_TOKEN)) {
      return this.networkService.isOnline().pipe(
        take(1),
        switchMap(isOnline => {
          if (!isOnline) {
            alert('Sin conexión a internet. Función no disponible.')
            //console.warn("⚠️ Sin conexión a Internet, no se puede renovar el token.");
            return throwError(() => new Error("Sin conexión a Internet"));
          }

          const isValidToken = this.tokenService.isValidToken();
          return isValidToken ? this.addToken(request, next) : this.updateAccessTokenAndRefreshToken(request, next);
        })
      );
    }
    return next.handle(request);
  }

  //vamos a interceptar el request original para modificarlo agregando una logica, despues ejecutamos el request con NEXT.handle
  private addToken(request: HttpRequest<unknown>,next: HttpHandler){
    const accessToken = this.tokenService.getToken();
    if(accessToken){
      const authRequest= request.clone({
        headers: request.headers.set('Authorization',`Bearer ${accessToken}`)
      });
      return next.handle(authRequest); //retornamos el request que modificamos con el header agregado
    }
    return next.handle(request);//si no existe un accestoken entonces revolvemos el request original
  }

  updateAccessTokenAndRefreshToken(request: HttpRequest<unknown>, next: HttpHandler) {
    const refreshToken = this.tokenService.getRefreshToken();
    const accessToken = this.tokenService.getToken();
    const isValidRefreshToken = this.tokenService.isValidRefreshToken();
    const remember = localStorage.getItem(this.tokenService.nameRefreshToken) !== null;
    //console.log('El refresh token es:', refreshToken)
    //console.log('El access token es:', accessToken)
    //console.log('Es valido el refresh token:', isValidRefreshToken)
    //console.log('Recordar', remember)
  
    if (!refreshToken || !isValidRefreshToken) {
      this.tokenService.notifySessionExpired();
      return next.handle(request);
    }
  
    if (this.authService.getIsRefreshing()) {
      // Ya hay una renovación en curso → esperamos el resultado
      return this.authService.getRefreshTokenSubject().pipe(
        filter(token => token !== null),
        take(1),
        switchMap(newAccessToken => this.addToken(request, next))
      );
    }
  
    this.authService.setIsRefreshing(true);
    this.authService.getRefreshTokenSubject().next(null); // reseteamos
  
    return this.authService.refresToken(accessToken || "", refreshToken, remember).pipe(
      tap(response => {
        //console.log("🔁 Token renovado exitosamente:", response);
      }),
      switchMap(response => {
        const newAccessToken = response.data.access_token;
        this.authService.getRefreshTokenSubject().next(newAccessToken);
        return this.addToken(request, next);
      }),
      catchError(error => {
        this.tokenService.removeToken();
        this.tokenService.removeRefreshToken();
        this.tokenService.notifySessionExpired();
        return throwError(() => new Error("Error al renovar el token"));
      }),
      finalize(() => {
        this.authService.setIsRefreshing(false);
      })
    );
  }  

  getDateTime(){
    //consultamos la fecha y hora del servidor.
    this.authService.getDateTime().pipe(take(1)).subscribe({
      next:(response => {
        this.ServerTime= response;
        this.today = this.ServerTime === "" ? new Date() : new Date(this.ServerTime);
      }),
      error: (err => {
        //console.error("Error al obtener la fecha del servidor", err);
      })
    });
  }
}

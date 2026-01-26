import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode ,JwtPayload} from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  nameToken='token_TE_PJO';//token del sistema tribunal electronico del poder judcial de oaxaca
  nameRefreshToken='refreshT_TE_PJO';
  isBrowser: boolean=false;

  private sessionExpiredSubject = new BehaviorSubject<boolean>(false);
  sessionExpired$ = this.sessionExpiredSubject.asObservable();
  private validacionCompletada = new BehaviorSubject<boolean>(false);
  private readonly TWO_FACTOR_KEY = 'twoFactorValidated';
  private readonly PERFIL_COMPLETED_KEY = 'perfilCompleted';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  setValidacionCompletada(valor: boolean) {
    this.validacionCompletada.next(valor);
  }
  
  validacionLista(): Observable<boolean> {
    return this.validacionCompletada.asObservable();
  }

  notifySessionExpired() {
    this.sessionExpiredSubject.next(true);
  }

  saveToken(token: string, remember: boolean) {
    if (remember) {
      localStorage.setItem(this.nameToken, token);
    } else {
      sessionStorage.setItem(this.nameToken, token);
    }
  }

  getToken() {
    if (this.isBrowser) {
      return localStorage.getItem(this.nameToken) || sessionStorage.getItem(this.nameToken);
    }
    return null;
  }

  removeToken() {
    if (this.isBrowser && localStorage) {
      localStorage.removeItem(this.nameToken);
      sessionStorage.removeItem(this.nameToken);
    }
  }

  saveRefreshToken(refreshToken: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(this.nameRefreshToken, refreshToken);
  } else {
    sessionStorage.setItem(this.nameRefreshToken, refreshToken);
  }
  }

  getRefreshToken() {
    //console.log('isBrowser in getRefreshToken', this.isBrowser);
    //console.log('localStorage in getRefreshToken', localStorage);
    if (this.isBrowser) {
      //console.log('Getting refresh token in localStorage',localStorage.getItem(this.nameRefreshToken));
      //console.log('Getting refresh token in sessionStorage',sessionStorage.getItem(this.nameRefreshToken));
      return localStorage.getItem(this.nameRefreshToken) || sessionStorage.getItem(this.nameRefreshToken);
    }
    return null;
  }

  removeRefreshToken() {
    if (this.isBrowser && localStorage) {
      localStorage.removeItem(this.nameRefreshToken);
      sessionStorage.removeItem(this.nameRefreshToken);
    }
  }

  isValidToken(){
    const token = this.getToken();
    if(!token){
      console.log('session expired: no token found');
      return false;
    }
    
    try {
      const decodeToken = jwtDecode<JwtPayload>(token);
      if (decodeToken?.exp) {
        const tokenDate = new Date(0);
        tokenDate.setUTCSeconds(decodeToken.exp);
        return tokenDate.getTime() > new Date().getTime();
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
    return false;
  }

  isValidRefreshToken() {
    const token = this.getRefreshToken() ?? '';
    if (!token || token === '') {
      console.log('session expired: no Refreshtoken found');
      if(this.isBrowser){
        this.notifySessionExpired();
        return false;
      }
      else
        return true;
    }

    try{
      const decodeToken = jwtDecode<JwtPayload>(token);
      if (decodeToken && decodeToken?.exp) {
        const tokenDate = new Date(0);
        tokenDate.setUTCSeconds(decodeToken.exp);
        const today = new Date();

        if (tokenDate.getTime() <= today.getTime()) {
          this.notifySessionExpired();
          return false;
        }
        return true;
      }

      this.notifySessionExpired();
      return false;
    } catch (error) {
      console.error("Error al decodificar el refresh token:", error);
      this.notifySessionExpired();
      return false;
    }
  }
  getUserFromToken(){
    const token = this.getToken();
    if(!token) return null;
    
    try {
      const decodedToken: any = jwtDecode(token);
      const userDataString = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata"];
  
      if (!userDataString) return null;
  
      const userData = JSON.parse(userDataString);
      //return userData.Usr;
      return userData;
    } catch (error) {
      //console.error("Error al obtener usuario del token:");
      return null;
    }
  }

  setTwoFactorValidated(value: boolean): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(this.TWO_FACTOR_KEY, value ? 'true' : 'false');
  }

  isTwoFactorValidated(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(this.TWO_FACTOR_KEY) === 'true';
  }

  clearTwoFactorValidated(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.TWO_FACTOR_KEY);
  }
  
  setPerfilCompleted(value: boolean): void {
    if (!this.isBrowser) return;
    sessionStorage.setItem(this.PERFIL_COMPLETED_KEY, value ? 'true' : 'false');
  }

  isPerfilCompleted(): boolean {
    if (!this.isBrowser) return false;
    return sessionStorage.getItem(this.PERFIL_COMPLETED_KEY) === 'true';
  }

  clearPerfilCompleted(): void {
    if (!this.isBrowser) return;
    sessionStorage.removeItem(this.PERFIL_COMPLETED_KEY);
  }
}

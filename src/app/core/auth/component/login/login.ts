import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { catchError, map, of, switchMap } from 'rxjs';

import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';
import { MessageService } from 'primeng/api';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { environment } from '../../../../../environments/environment';
import { UserMenuStore } from '../../../layout/siderbar/user-menu.store';
import { PantallasService } from '../../../../juicio-oral/services/pantallas.service';

import { Title } from '@angular/platform-browser';

const SISTEMA_ID = 1;
const AREA_ID = 1;
const PERFIL_ID = 10;
const SUBAREA_ID = 1007;

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    Spinner,
  ],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  usuario: string = '';
  contrasenia: string = '';
  idSistema: number = 1;
  recordar: boolean = false;
  verPassword: boolean = false;
  isLoading: boolean = false;

  @ViewChild('passwordInput') passwordInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private el: ElementRef,
    private tokenService: TokenService,
    private mensaje: MessageService,
    private cd: ChangeDetectorRef,
    private menuStore: UserMenuStore,
    private pantallasService: PantallasService,
    private title: Title
  ) {}

  ngOnInit() {this.title.setTitle('Login - Sistema Integral de Justicia Digital | Poder Judicial del Estado de Oaxaca');}

  forgotPassword() {
    window.open('https://virtual.tribunaloaxaca.gob.mx/ForgotPassword', '_blank');
  }
  preRegistro() {
    window.open('https://virtual.tribunaloaxaca.gob.mx/preregrune', '_blank');
  }
  passwordFocus() {
    if (this.usuario?.trim()) {
      this.passwordInput.nativeElement.focus();
    }
  }

  passwordEnter() {
    if (!this.contrasenia?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingrese su contraseÃ±a.', life: 3000 });
      return;
    }
    this.validarUsuario();
  }

  togglePassword() {
    this.verPassword = !this.verPassword;
  }

  validarUsuario() {
    if (!this.usuario?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingrese su usuario.', life: 3000 });
      return;
    }
    if (!this.contrasenia?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingrese su contraseÃ±a.', life: 3000 });
      return;
    }

    this.isLoading = true;
    this.cd.detectChanges();

    this.authService.login(this.usuario, this.contrasenia, this.idSistema, this.recordar).subscribe({
      next: async (response) => {
        if (response.success) {
          this.authService.actualizaPerfilSeleccionado('');

          if (environment.DEV_SKIP_2FA) {
            this.continuarSinTwoFactor();
          } else {
            await this.tokenService.setTwoFactorValidated(false);
            await this.tokenService.setPerfilCompleted(false);
            this.router.navigate(['login2fase']);
          }
        } else {
          this.mensaje.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Usuario o contraseÃ±a incorrectos.',
            life: 3000,
          });
        }
      },
      error: () => {
        this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'OcurriÃ³ un error al intentar ingresar.', life: 3000 });
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  private continuarSinTwoFactor(): void {
    const user = this.tokenService.getUserFromToken();
    if (!user?.idGeneral) {
      this.mensaje.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener el usuario desde el token.',
        life: 3000,
      });
      this.isLoading = false;
      this.cd.detectChanges();
      return;
    }

    this.authService.obtenerDatosUsuario(user.idGeneral).subscribe({
      next: async (resp) => {
        const abogado = resp.data?.pD_Abogados?.[0];
        const idTipoPersona = abogado?.idTipoPersona ?? null;
        const nombre = (abogado?.nombre ?? '').toString().trim();
        const foto = (abogado?.foto ?? '').toString().trim();

        sessionStorage.setItem('AbogadoNombre', nombre);
        sessionStorage.setItem('AbogadoFotoBase64', foto);

        await this.tokenService.setTwoFactorValidated(true);

        if (idTipoPersona === 1) {
          this.loginContextoAutomatico(user.idGeneral, nombre, foto);
          return;
        }

        await this.tokenService.setPerfilCompleted(false);
        this.router.navigate(['/perfil']);
      },
      error: () => {
        this.mensaje.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron obtener los datos del usuario.',
          life: 3000,
        });
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  private loginContextoAutomatico(idGeneral: number, nombre: string, foto: string): void {
    this.authService.getAreas(SISTEMA_ID, idGeneral).pipe(
      map(r => (r.data ?? []) as any[]),
      switchMap(areas => {
        const area = areas.find(a => a.idArea === AREA_ID);
        const areaName = area?.area ?? '';
        const idAreaSistema = area?.idAreaSistema ?? 0;

        return this.authService.obtenerIdAreaSistemaUsuario(idGeneral, SISTEMA_ID, AREA_ID).pipe(
          map(r => r.data?.idAreaSistemaUsuario ?? 0),
          switchMap(idAreaSistemaUsuario => {
            if (!idAreaSistemaUsuario) return of(null);

            return this.authService.GetPerfiles(idAreaSistemaUsuario).pipe(
              map((r: any) => {
                const perfiles = r.data ?? [];
                const perfil = perfiles.find((p: any) => p.idSistemaPerfil === PERFIL_ID);
                const perfilDesc = perfil?.descripcion ?? '';

                return this.authService.getSubAreas(idAreaSistema, idGeneral).pipe(
                  map((rs: any) => {
                    const subAreas = rs.data ?? [];
                    const subArea = subAreas.find((s: any) => s.idSubArea === SUBAREA_ID);
                    const subAreaNombre = subArea?.descripcion ?? '';

                    return { idAreaSistemaUsuario, areaName, perfilDesc, subAreaNombre };
                  })
                );
              }),
              switchMap(obs => obs)
            );
          })
        );
      }),
      switchMap(ctx => {
        if (!ctx) return of(null);

        const request = {
          idSistema: SISTEMA_ID,
          idArea: AREA_ID,
          idSistemaPerfil: PERFIL_ID,
          idSubArea: SUBAREA_ID,
        };

        return this.authService.postLoginContexto(request, false).pipe(
          map(response => ({ response, ...ctx }))
        );
      }),
      catchError(() => {
        this.mensaje.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al preparar el contexto de sesiÃ³n.',
          life: 3000,
        });
        this.isLoading = false;
        this.cd.detectChanges();
        return of(null);
      }),
    ).subscribe({
      next: async (result) => {
        if (!result || !result.response?.success) {
          this.mensaje.add({
            severity: 'error',
            summary: 'Acceso denegado',
            detail: result?.response?.message ?? 'No se puede continuar.',
            life: 3000,
          });
          this.isLoading = false;
          this.cd.detectChanges();
          return;
        }

        const { idAreaSistemaUsuario, areaName, perfilDesc, subAreaNombre } = result;
        this.guardarContextoStorage(nombre, foto, idAreaSistemaUsuario, areaName, perfilDesc, subAreaNombre);

        await this.tokenService.setPerfilCompleted(true);

        const perfilOk = await this.tokenService.isPerfilCompleted();
        if (!perfilOk) {
          this.mensaje.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al guardar la sesiÃ³n, intente de nuevo.',
            life: 3000,
          });
          this.isLoading = false;
          this.cd.detectChanges();
          return;
        }

        this.pantallasService.limpiarPantallas();

        this.menuStore.refresh()
          .pipe(catchError(() => of([])))
          .subscribe(() => {
            this.router.navigate(['/home'], { replaceUrl: true });
          });
      },
      error: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  private guardarContextoStorage(
    nombre: string,
    foto: string,
    idAreaSistemaUsuario: number,
    areaName: string,
    perfilDesc: string,
    subAreaNombre: string,
  ): void {
    localStorage.setItem('recordarUsuario', 'false');

    sessionStorage.setItem('areaSeleccionada', String(AREA_ID));
    sessionStorage.setItem('perfilSeleccionado', String(PERFIL_ID));
    sessionStorage.setItem('perfilSeleccionadoDesc', perfilDesc);
    sessionStorage.setItem('idAreaSistemaUsuario', String(idAreaSistemaUsuario));
    sessionStorage.setItem('SubAreaNombre', subAreaNombre);
    sessionStorage.setItem('AreaName', areaName);
    sessionStorage.setItem('AbogadoNombre', nombre);
    sessionStorage.setItem('AbogadoFotoBase64', foto);
    sessionStorage.setItem('SubAreaId', String(SUBAREA_ID));

    const toRemove = [
      'areaSeleccionada', 'perfilSeleccionado', 'perfilSeleccionadoDesc',
      'idAreaSistemaUsuario', 'AreaName', 'AreaBd', 'AbogadoNombre',
      'pantallas_usuario', 'SubAreaNombre', 'SubAreaId', 'AbogadoFotoBase64',
    ];
    toRemove.forEach(k => localStorage.removeItem(k));
  }

  @HostListener('window:beforeunload', ['$event'])
  clearSession(_event: Event) {
    if (!localStorage.getItem('userSession')) {
      sessionStorage.removeItem('userSession');
    }
  }
}

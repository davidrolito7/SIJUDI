import { Component, OnInit, ChangeDetectorRef, DestroyRef, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FileUploadModule } from 'primeng/fileupload';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';
import { MessageService } from 'primeng/api';
import { twoAccess } from '../../interface/login.interfaces';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { UserMenuStore } from '../../../layout/siderbar/user-menu.store';
import { PantallasService } from '../../../../juicio-oral/services/pantallas.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../environments/environment';
import { QrGeneratorComponent } from '../../../../shared/components/qr-generator-component/qr-generator-component';

const SISTEMA_ID = 1;
const AREA_ID = 1;
const PERFIL_ID = 10;
const SUBAREA_ID = 1007;
const PERFIL_POR_TIPO_PERSONA: Record<number, number> = {
  1: 10,
  6: 1011,
  7: 1012,
};

@Component({
  selector: 'app-login2',
  providers: [MessageService],
  imports: [
    SelectModule, FormsModule, ButtonModule, InputMaskModule, CommonModule,
    SelectButtonModule, ToggleButtonModule, FileUploadModule, PasswordModule,
    QrGeneratorComponent, DialogModule, ToastModule, ReactiveFormsModule, Spinner,
  ],
  templateUrl: './login2fase.html',
  styleUrl: './login2fase.css',
})
export class Login2 implements OnInit {

  llavePrivadaForm!: FormGroup;
  llaveFile: File | null = null;
  objectTwoAccess: twoAccess | null = null;
  codigo: string = '';
  qrData: string = '';
  visible: boolean = false;
  isLoading = signal<boolean>(false);
  step: 1 | 2 = 1;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private mensaje: MessageService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private menuStore: UserMenuStore,
    private pantallasService: PantallasService,
    private destroyRef: DestroyRef,
  ) { }

  ngOnInit() {
    this.llavePrivadaForm = this.fb.group({
      password: ['', Validators.required],
    });
    this.iniciarFlujo();
  }

  private iniciarFlujo(): void {
    const user = this.tokenService.getUserFromToken();
    if (!user?.idGeneral) {
      this.getGoogle();
      return;
    }

    this.isLoading.set(true);
    this.cd.detectChanges();

    this.authService.obtenerDatosUsuario(user.idGeneral).subscribe({
      next: async (resp) => {
        const abogado = resp.data?.pD_Abogados?.[0];
        const idTipoPersona = abogado?.idTipoPersona ?? null;
        const nombre = (abogado?.nombre ?? '').toString().trim();
        const foto = (abogado?.foto ?? '').toString().trim();
        sessionStorage.setItem('AbogadoNombre', nombre);
        sessionStorage.setItem('AbogadoFotoBase64', foto);

        if (environment.DEV_SKIP_2FA) {
          await this.routeAuthenticatedUser(idTipoPersona, nombre, foto);
        } else {
          this.getGoogle();
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.cd.detectChanges();
        this.getGoogle();
      },
    });
  }

  loginOptions = [
    {
      label: 'Google Authenticator',
      mobileLabel: 'Authenticator',
      value: 1
    },
    {
      label: 'Llave Privada',
      mobileLabel: 'Llave Privada',
      value: 2
    }
  ];

  private async handlePostTwoFactor(): Promise<void> {
    const user = this.tokenService.getUserFromToken();

    if (!user?.idGeneral) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el usuario desde el token.', life: 3000 });
      this.isLoading.set(false);
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

        await this.routeAuthenticatedUser(idTipoPersona, nombre, foto);
      },
      error: () => {
        this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener datos del usuario.', life: 3000 });
        this.isLoading.set(false);
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading.set(false);
        this.cd.detectChanges();
      },
    });
  }

  private async routeAuthenticatedUser(idTipoPersona: number | null, nombre: string, foto: string): Promise<void> {
    if (idTipoPersona !== 3) { // diferente de empleado
      this.loginContextoAutomatico(idTipoPersona, nombre, foto);
      return;
    }

    await this.tokenService.setTwoFactorValidated(true);
    await this.tokenService.setPerfilCompleted(false);

    const ok = await this.tokenService.isTwoFactorValidated();
    if (ok) {
      this.router.navigate(['/perfil']);
    } else {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la sesiÃ³n, intente de nuevo.', life: 3000 });
    }
  }

  private loginContextoAutomatico(idTipoPersona: number | null, nombre: string, foto: string): void {
    const user = this.tokenService.getUserFromToken();
    const idG = user?.idGeneral ?? 0;
    const idSistemaPerfil = idTipoPersona ? PERFIL_POR_TIPO_PERSONA[idTipoPersona] ?? PERFIL_ID : PERFIL_ID;

    if (!idG) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el identificador del usuario.', life: 3000 });
      return;
    }

    this.authService.getAreas(SISTEMA_ID, idG).pipe(
      map(r => (r.data ?? []) as any[]),
      switchMap(areas => {
        const area = areas.find(a => a.idArea === AREA_ID);
        const areaName = area?.area ?? '';
        const idAreaSistema = area?.idAreaSistema ?? 0;

        return this.authService.obtenerIdAreaSistemaUsuario(idG, SISTEMA_ID, AREA_ID).pipe(
          map(r => r.data?.idAreaSistemaUsuario ?? 0),
          switchMap(idAreaSistemaUsuario => {
            if (!idAreaSistemaUsuario) return of(null);

            return this.authService.GetPerfiles(idAreaSistemaUsuario).pipe(
              map((r: any) => {
                const perfiles = r.data ?? [];
                const perfil = perfiles.find((p: any) => p.idSistemaPerfil === idSistemaPerfil);
                const perfilDesc = perfil?.descripcion ?? '';

                return this.authService.getSubAreas(idAreaSistema, idG).pipe(
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
          idSistemaPerfil,
          idSubArea: SUBAREA_ID,
        };

        return this.authService.postLoginContexto(request, false).pipe(
          map(response => ({ response, ...ctx }))
        );
      }),
      catchError(() => {
        this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Error al preparar el contexto de sesiÃ³n.', life: 3000 });
        return of(null);
      }),
    ).subscribe({
      next: async (result) => {
        if (!result || !result.response?.success) {
          this.mensaje.add({ severity: 'error', summary: 'Acceso denegado', detail: result?.response?.message ?? 'No se puede continuar.', life: 3000 });
          return;
        }

        const { idAreaSistemaUsuario, areaName, perfilDesc, subAreaNombre } = result;
        this.guardarContextoStorage(nombre, foto, idAreaSistemaUsuario, areaName, idSistemaPerfil, perfilDesc, subAreaNombre);

        await this.tokenService.setTwoFactorValidated(true);
        await this.tokenService.setPerfilCompleted(true);

        const perfilOk = await this.tokenService.isPerfilCompleted();
        if (!perfilOk) {
          this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la sesiÃ³n, intente de nuevo.', life: 3000 });
          return;
        }

        this.pantallasService.limpiarPantallas();

        this.menuStore.refresh()
          .pipe(
            catchError(() => of([])),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(() => {
            this.router.navigate(['/home'], { replaceUrl: true });
          });
      },
    });
  }

  private guardarContextoStorage(
    nombre: string,
    foto: string,
    idAreaSistemaUsuario: number,
    areaName: string,
    idSistemaPerfil: number,
    perfilDesc: string,
    subAreaNombre: string,
  ): void {
    localStorage.setItem('recordarUsuario', 'false');

    sessionStorage.setItem('areaSeleccionada', String(AREA_ID));
    sessionStorage.setItem('perfilSeleccionado', String(idSistemaPerfil));
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

  onValidarCodeAthenticator() {
    if (!this.codigo?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Ingrese el cÃ³digo para continuar.', life: 3000 });
      return;
    }

    this.isLoading.set(true);
    this.cd.detectChanges();

    this.authService.postSendTwoFactorCodeAuthenticator(this.codigo).subscribe({
      next: async (response) => {
        if (response.success) {
          await this.handlePostTwoFactor();
        } else {
          this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'CÃ³digo incorrecto.', life: 3000 });
          this.isLoading.set(false);
          this.cd.detectChanges();
        }
      },
      error: () => {
        this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'OcurriÃ³ un error al intentar validar.', life: 3000 });
        this.isLoading.set(false);
        this.cd.detectChanges();
      },
    });
  }

  getGoogle() {
    this.isLoading.set(true);
    this.cd.detectChanges();

    this.authService.GetTwoValidation().subscribe({
      next: (response) => {
        if (response.success) {
          this.objectTwoAccess = response.data;
          this.objectTwoAccess!.encodedSecret ??= '';
          this.qrData = `otpauth://totp/Oaxaca-TV-${this.objectTwoAccess!.user}?secret=${this.objectTwoAccess!.encodedSecret}`;
          this.step = 1;
        } else {
          this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la configuraciÃ³n 2FA.', life: 3000 });
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.cd.detectChanges();
      },
      complete: () => {
        this.isLoading.set(false);
        this.cd.detectChanges();
      },
    });
  }

  onFileSelect(event: any) {
    const file: File | undefined = event.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pjo') {
      this.llaveFile = null;
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Solo se permiten archivos con extensiÃ³n .pjo', life: 3000 });
      return;
    }
    this.llaveFile = file;
  }

  onFileClear() { this.llaveFile = null; }

  onValidarLlavePrivada() {
    if (!this.llaveFile || this.llavePrivadaForm.invalid) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Seleccione un archivo .pjo y capture la contraseÃ±a.', life: 3000 });
      return;
    }

    const password = this.llavePrivadaForm.get('password')!.value;
    const formData = new FormData();
    formData.append('file', this.llaveFile, this.llaveFile.name);

    this.isLoading.set(true);
    this.cd.detectChanges();

    this.authService.postValidaPrivateKey(formData, password).subscribe({
      next: async (response) => {
        if (response.success) {
          await this.handlePostTwoFactor();
        } else {
          this.mensaje.add({ severity: 'error', summary: 'Error', detail: response.message || 'Llave privada o contraseña incorrectas.', life: 3000 });
          this.isLoading.set(false);
          this.cd.detectChanges();
        }
      },
      error: () => {
        this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al validar la llave privada.', life: 3000 });
        this.isLoading.set(false);
        this.cd.detectChanges();
      },
    });
  }

  codigoEnter() {
    if (!this.codigo?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingrese el código de Authenticator.', life: 3000 });
      return;
    }
    this.onValidarCodeAthenticator();
  }

  contraseniaEnter() {
    const pass = this.llavePrivadaForm.get('password')!.value;
    if (!pass?.trim()) {
      this.mensaje.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingrese su contraseña.', life: 3000 });
      return;
    }
    this.onValidarLlavePrivada();
  }

  onLogout(): void { this.tokenService.logout(); }
}

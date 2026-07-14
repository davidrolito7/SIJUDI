import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/service/auth.service';
import { normalizeCreationOptions } from '../../utils/webauthn.utils';
import { Header } from "../header/header";
import { Breadcrub } from "../breadcrub/breadcrub";


@Component({
  selector: 'app-llave-acceso',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    Header,
    Breadcrub
],
  providers: [MessageService],
  templateUrl: './llave-acceso.html',
  styleUrl: './llave-acceso.css',
})
export class LlaveAcceso {
  isLoading = false;

  constructor(
    private authService: AuthService,
    private mensaje: MessageService,
    private cd: ChangeDetectorRef,
  ) { }

  async registrarLlaveAcceso() {
    if (!window.PublicKeyCredential) {
      this.mensaje.add({
        severity: 'error',
        summary: 'No compatible',
        detail: 'Este navegador no soporta llaves de acceso.',
        life: 3000,
      });
      return;
    }

    const nombreDispositivo = this.obtenerNombreDispositivo();

    this.isLoading = true;
    this.cd.detectChanges();

    this.authService.passkeyRegisterOptions(nombreDispositivo).subscribe({
      next: async (resp) => {
        try {
          if (!resp.success || !resp.data?.operationId || !resp.data?.options) {
            this.mensaje.add({
              severity: 'error',
              summary: 'Error',
              detail: resp.message ?? 'No se pudo iniciar el registro de la llave de acceso.',
              life: 3000,
            });

            this.isLoading = false;
            this.cd.detectChanges();
            return;
          }

          console.log('Passkey register options:', resp.data.options);

          const credential = await navigator.credentials.create(
            normalizeCreationOptions(resp.data.options)
          ) as PublicKeyCredential | null;

          if (!credential) {
            throw new Error('No se pudo crear la credencial WebAuthn.');
          }

          const attestationResponse = credential.toJSON();
          console.log('Passkey attestation response:', attestationResponse);

          this.authService.passkeyRegister(
            resp.data.operationId,
            attestationResponse,
            nombreDispositivo
          ).subscribe({
            next: (registerResp) => {
              if (!registerResp.success) {
                this.mensaje.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: registerResp.message ?? 'No se pudo registrar la llave de acceso.',
                  life: 3000,
                });
                return;
              }

              this.mensaje.add({
                severity: 'success',
                summary: 'Llave registrada',
                detail: 'Tu llave de acceso se registró correctamente.',
                life: 3000,
              });
            },
            error: (error) => {
              console.error('Error PasskeyRegister:', error);

              this.mensaje.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al guardar la llave de acceso.',
                life: 3000,
              });
            },
            complete: () => {
              this.isLoading = false;
              this.cd.detectChanges();
            },
          });
        } catch (error: any) {
          console.error('Error navigator.credentials.create:', error);

          this.mensaje.add({
            severity: 'warn',
            summary: 'No se completó',
            detail: error?.message ?? 'Se canceló el registro de la llave de acceso.',
            life: 5000,
          });

          this.isLoading = false;
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error PasskeyRegisterOptions:', error);

        this.mensaje.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo iniciar el registro de la llave de acceso.',
          life: 3000,
        });

        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  private obtenerNombreDispositivo(): string {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows')) return 'Windows Hello';
    if (ua.includes('mac')) return 'Mac';

    return 'Llave de acceso';
  }
}

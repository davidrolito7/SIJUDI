import { Component, OnInit } from '@angular/core';
import { Breadcrub } from "../breadcrub/breadcrub";
import { PerfilUsuarioService } from '../../service/PerfilUsuarioService';
import { TokenService } from '../../../core/auth/service/token.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { datosFirma } from '../../interface/shared.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    Breadcrub,
    ToastModule
  ],
  providers: [
    MessageService
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  isLoading = false;
  datosFirma!: datosFirma;

  constructor(
    private tokenService: TokenService,
    private messageService: MessageService,
    private perfilUsuarioService: PerfilUsuarioService
  ) {}

  ngOnInit(): void {
    this.getDatosInformacionPFX();
  }

  getDatosInformacionPFX(): void {
    this.isLoading = true;

    this.perfilUsuarioService.getDatosInformacionPFX()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (responsePfx: any) => {
          if (responsePfx.success) {
            this.datosFirma = responsePfx.data;

            const fechaActual = new Date();
            const fechaVigencia = new Date(this.datosFirma.pfxVigencia);

            const diferenciaMs = fechaVigencia.getTime() - fechaActual.getTime();
            const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

            if (diasRestantes <= 15 && diasRestantes >= 0) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Firma próxima a vencer',
                detail: `Tu certificado PFX vence en ${diasRestantes} día(s).`,
                sticky: true
              });
            }

            if (diasRestantes < 0) {
              this.messageService.add({
                severity: 'error',
                summary: 'Firma vencida',
                detail: 'Tu certificado PFX ya se encuentra vencido.',
                sticky: true
              });
            }

          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Error',
              detail: responsePfx.message
            });
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al obtener la información del certificado PFX.',
            sticky: true
          });
        }
      });
  }
}
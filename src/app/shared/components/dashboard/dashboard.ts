import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { TokenService } from '../../../core/auth/service/token.service';
import { ContadoresService } from '../../../juicio-oral/services/contadores.service';
import { datosFirma } from '../../interface/shared.interface';
import { PerfilUsuarioService } from '../../service/PerfilUsuarioService';
import { Header } from '../header/header';
import { DashboardEstadisticas } from './components/dashboard-estadisticas/dashboard-estadisticas';
import { DashboardExhortos } from './components/dashboard-exhortos/dashboard-exhortos';
import { DashboardOficialia } from './components/dashboard-oficialia/dashboard-oficialia';

interface DashboardTab {
  id: 'oficialia' | 'exhortos' | 'estadisticas';
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  summary: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    ToastModule,
    DashboardOficialia,
    DashboardExhortos,
    DashboardEstadisticas,
  ],
  providers: [MessageService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  isLoading = false;
  isRefreshing = false;
  datosFirma!: datosFirma;
  contadores$!: Observable<any>;
  selectedDashboard: DashboardTab['id'] = 'estadisticas';
  horaActual = new Date();

  dashboards: DashboardTab[] = [
    {
      id: 'estadisticas',
      title: 'Estadísticas Generales',
      shortTitle: 'Estadísticas',
      description: 'Consulta un resumen general de la información y los indicadores del sistema.',
      icon: 'pi pi-chart-line',
      summary: 'Resumen general de estadísticas.'
    },
    {
      id: 'oficialia',
      title: 'Oficialía de Partes Virtual',
      shortTitle: 'Oficialía',
      description: 'Seguimiento operativo de demandas, promociones y bandeja de recepción con datos reales del sistema.',
      icon: 'pi pi-desktop',
      summary: 'Usa el contador real de pendientes por recibir.'
    },
    {
      id: 'exhortos',
      title: 'Exhortos electrónicos',
      shortTitle: 'Exhortos',
      description: 'Módulo separado para concentrar su tablero sin seguir creciendo el dashboard principal.',
      icon: 'pi pi-send',
      summary: 'Contenido estático temporal.'
    }

  ];
  private readonly tokenService = inject(TokenService);
  private readonly messageService = inject(MessageService);
  private readonly perfilUsuarioService = inject(PerfilUsuarioService);
  private readonly contadoresService = inject(ContadoresService);

  constructor(

  ) {
    this.contadores$ = this.contadoresService.contadores;
  }

  ngOnInit(): void {
    this.selectedDashboard = this.esAbogado() ? 'estadisticas' : 'oficialia';
    this.actualizarHora();
    this.contadoresService.cargarContadores();
  }

  ngOnDestroy(): void {
    this.contadoresService.detenerPolling();
  }

  get visibleDashboards(): DashboardTab[] {
    if (this.esAbogado()) {
      return this.dashboards.filter(dashboard => dashboard.id === 'estadisticas');
    }

    return this.dashboards.filter(dashboard => dashboard.id !== 'estadisticas');
  }

  get currentDashboard(): DashboardTab {
    return this.visibleDashboards.find(dashboard => dashboard.id === this.selectedDashboard) ?? this.visibleDashboards[0];
  }

  get selectedIndex(): number {
    return this.visibleDashboards.findIndex(dashboard => dashboard.id === this.selectedDashboard);
  }

  get indicatorWidth(): number {
    return 100 / this.visibleDashboards.length;
  }

  get indicatorTransform(): string {
    return `translateX(${this.selectedIndex * 100}%)`;
  }

  selectDashboard(dashboardId: DashboardTab['id']): void {
    if (this.selectedDashboard === dashboardId) {
      return;
    }

    this.selectedDashboard = dashboardId;
  }

  refreshDashboard(): void {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    this.contadoresService.cargarContadores();

    setTimeout(() => {
      this.actualizarHora();
      this.isRefreshing = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Dashboard actualizado',
        detail: `Se actualizaron las métricas de ${this.currentDashboard.title}.`,
        life: 2500
      });
    }, 700);
  }

  onTabKeydown(event: KeyboardEvent, index: number): void {
    const dashboards = this.visibleDashboards;
    const lastIndex = dashboards.length - 1;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = index === lastIndex ? 0 : index + 1;
      this.selectDashboard(dashboards[nextIndex].id);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const previousIndex = index === 0 ? lastIndex : index - 1;
      this.selectDashboard(dashboards[previousIndex].id);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.selectDashboard(dashboards[0].id);
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.selectDashboard(dashboards[lastIndex].id);
    }
  }

  trackByDashboardId(_: number, dashboard: DashboardTab): string {
    return dashboard.id;
  }

  actualizarHora(): void {
    this.horaActual = new Date();
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

esAbogado(): boolean {
  const user = this.tokenService.getUserFromToken();
  return [10, 1011].includes(user?.idSistemaPerfil);
}
}

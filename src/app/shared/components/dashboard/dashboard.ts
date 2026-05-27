import { Component, OnDestroy, OnInit } from '@angular/core';
import { Breadcrub } from "../breadcrub/breadcrub";
import { ToastModule } from "primeng/toast";
import { PerfilUsuarioService } from '../../service/PerfilUsuarioService';
import { TokenService } from '../../../core/auth/service/token.service';
import { MessageService } from 'primeng/api';
import { datosFirma } from '../../interface/shared.interface';
import { finalize, Observable } from 'rxjs';
import { ContadoresService } from '../../../juicio-oral/services/contadores.service';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type DashboardTone =
  | 'orange'
  | 'blue'
  | 'purple'
  | 'red'
  | 'emerald'
  | 'indigo'
  | 'cyan'
  | 'teal';

type MetricPriority = 'critical' | 'warning' | 'info' | 'success';

interface DashboardMetric {
  title: string;
  value: string | number;
  icon: string;
  tone: DashboardTone;
  badge: string;
  badgePriority: MetricPriority;
  helper: string;
  route?: string;
  pantallaId?: number;
}

interface DashboardSystem {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  updatedAt: string;
  summary: string;
  primaryMetrics: DashboardMetric[];
  secondaryMetrics: DashboardMetric[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Breadcrub,
    ToastModule,
    RouterLink
  ],
  providers: [
    MessageService
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {

  isLoading = false;
  isRefreshing = false;

  datosFirma!: datosFirma;
  contadores$!: Observable<any>;
  idAreaConectada: number | null = null;

  horaActual = new Date();

  selectedDashboard = 'juicio-linea';

  dashboards: DashboardSystem[] = [
    {
      id: 'juicio-linea',
      title: 'Oficialía de Partes Virtual',
      shortTitle: 'Oficialía',
      description: 'Seguimiento operativo de demandas, promociones, firmas y expedientes electrónicos.',
      icon: 'pi pi-desktop',
      updatedAt: 'Hoy, 10:42 h',
      summary: '4 métricas críticas requieren atención en Juicio en Línea.',
      primaryMetrics: [
        {
          title: 'Demandas recibidas',
          value: 128,
          icon: 'pi pi-file-import',
          tone: 'blue',
          badge: 'Este mes',
          badgePriority: 'info',
          helper: 'Demandas ingresadas recientemente al sistema.',
          pantallaId: 1
        },
        {
          title: 'Firmas pendientes',
          value: 36,
          icon: 'pi pi-pencil',
          tone: 'red',
          badge: 'Crítico',
          badgePriority: 'critical',
          helper: 'Documentos que requieren validación de firma.',
          pantallaId: 2
        },
        {
          title: 'Promociones',
          value: 214,
          icon: 'pi pi-send',
          tone: 'purple',
          badge: 'En trámite',
          badgePriority: 'warning',
          helper: 'Promociones turnadas a áreas resolutoras.',
          pantallaId: 3
        },
        {
          title: 'Expedientes activos',
          value: 892,
          icon: 'pi pi-folder-open',
          tone: 'emerald',
          badge: 'Activos',
          badgePriority: 'success',
          helper: 'Expedientes con actividad procesal reciente.',
          pantallaId: 4
        }
      ],
      secondaryMetrics: [
        {
          title: 'Notificaciones electrónicas',
          value: 76,
          icon: 'pi pi-bell',
          tone: 'cyan',
          badge: 'Próx. 7 días',
          badgePriority: 'info',
          helper: 'Notificaciones programadas.'
        },
        {
          title: 'Acuerdos generados',
          value: 52,
          icon: 'pi pi-check-square',
          tone: 'teal',
          badge: 'Hoy',
          badgePriority: 'success',
          helper: 'Acuerdos listos para revisión.'
        },
        {
          title: 'Borradores',
          value: 19,
          icon: 'pi pi-file-edit',
          tone: 'indigo',
          badge: 'Pendientes',
          badgePriority: 'warning',
          helper: 'Borradores sin cierre procesal.'
        }
      ]
    },
    {
      id: 'oficialia',
      title: 'Exhortos electrónicos',
      shortTitle: 'Exhortos',
      description: 'Control de recepción, clasificación, turnado y atención inicial de documentos.',
      icon: 'pi pi-inbox',
      updatedAt: 'Hoy, 09:58 h',
      summary: 'La recepción documental mantiene carga alta durante la jornada.',
      primaryMetrics: [
        {
          title: 'Documentos recibidos',
          value: 342,
          icon: 'pi pi-file',
          tone: 'orange',
          badge: 'Recepción',
          badgePriority: 'warning',
          helper: 'Documentos ingresados en línea.'
        },
        {
          title: 'Turnos pendientes',
          value: 48,
          icon: 'pi pi-share-alt',
          tone: 'red',
          badge: 'Pendientes',
          badgePriority: 'critical',
          helper: 'Requieren asignación a unidad competente.'
        },
        {
          title: 'Clasificados',
          value: 286,
          icon: 'pi pi-tags',
          tone: 'blue',
          badge: 'Este mes',
          badgePriority: 'info',
          helper: 'Documentos clasificados correctamente.'
        },
        {
          title: 'Atendidos',
          value: 238,
          icon: 'pi pi-check-circle',
          tone: 'emerald',
          badge: 'Completados',
          badgePriority: 'success',
          helper: 'Registros finalizados sin observaciones.'
        }
      ],
      secondaryMetrics: [
        {
          title: 'Observados',
          value: 12,
          icon: 'pi pi-exclamation-triangle',
          tone: 'red',
          badge: 'Revisión',
          badgePriority: 'critical',
          helper: 'Documentos con datos incompletos.'
        },
        {
          title: 'Digitalizados',
          value: 174,
          icon: 'pi pi-cloud-upload',
          tone: 'cyan',
          badge: 'Hoy',
          badgePriority: 'info',
          helper: 'Archivos incorporados al expediente digital.'
        },
        {
          title: 'Eficiencia operativa',
          value: '86%',
          icon: 'pi pi-percentage',
          tone: 'teal',
          badge: 'Mensual',
          badgePriority: 'success',
          helper: 'Promedio de atención institucional.'
        },
      ]
    },
    {
      id: 'audiencias',
      title: 'Procedimientos Civiles y Familiares',
      shortTitle: 'Juzgado',
      description: 'Vista ejecutiva de audiencias programadas, celebradas, diferidas y próximas.',
      icon: 'pi pi-calendar-clock',
      updatedAt: 'Hoy, 08:31 h',
      summary: '7 audiencias próximas requieren confirmación de sala o enlace.',
      primaryMetrics: [
        {
          title: 'Programadas',
          value: 64,
          icon: 'pi pi-calendar-plus',
          tone: 'indigo',
          badge: 'Próx. 7 días',
          badgePriority: 'info',
          helper: 'Audiencias próximas con fecha confirmada.'
        },
        {
          title: 'Por confirmar',
          value: 7,
          icon: 'pi pi-clock',
          tone: 'orange',
          badge: 'Pendientes',
          badgePriority: 'warning',
          helper: 'Pendientes de sala, enlace o disponibilidad.'
        },
        {
          title: 'Diferidas',
          value: 9,
          icon: 'pi pi-calendar-times',
          tone: 'red',
          badge: 'Atención',
          badgePriority: 'critical',
          helper: 'Requieren nueva programación.'
        },
        {
          title: 'Celebradas',
          value: 41,
          icon: 'pi pi-check',
          tone: 'emerald',
          badge: 'Este mes',
          badgePriority: 'success',
          helper: 'Audiencias concluidas correctamente.'
        }
      ],
      secondaryMetrics: [
        {
          title: 'Virtuales',
          value: 23,
          icon: 'pi pi-video',
          tone: 'cyan',
          badge: 'Activas',
          badgePriority: 'info',
          helper: 'Audiencias con enlace generado.'
        },
        {
          title: 'Presenciales',
          value: 18,
          icon: 'pi pi-building',
          tone: 'teal',
          badge: 'Sala',
          badgePriority: 'success',
          helper: 'Audiencias con sala asignada.'
        },
        {
          title: 'Eficiencia operativa',
          value: '86%',
          icon: 'pi pi-percentage',
          tone: 'teal',
          badge: 'Mensual',
          badgePriority: 'success',
          helper: 'Promedio de atención institucional.'
        },
      ]
    },
    {
      id: 'estadisticas',
      title: 'Estadísticas Generales',
      shortTitle: 'Estadísticas',
      description: 'Consolidado general de actividad institucional, productividad y alertas relevantes.',
      icon: 'pi pi-chart-line',
      updatedAt: 'Hoy, 11:05 h',
      summary: 'Indicadores generales estables con incremento en recepción documental.',
      primaryMetrics: [
        {
          title: 'Actividad total',
          value: '1,482',
          icon: 'pi pi-chart-bar',
          tone: 'blue',
          badge: 'Este mes',
          badgePriority: 'info',
          helper: 'Movimientos registrados en todos los sistemas.'
        },
        {
          title: 'Alertas críticas',
          value: 21,
          icon: 'pi pi-exclamation-circle',
          tone: 'red',
          badge: 'Crítico',
          badgePriority: 'critical',
          helper: 'Alertas que requieren atención prioritaria.'
        },
        {
          title: 'Procesos completados',
          value: 973,
          icon: 'pi pi-verified',
          tone: 'emerald',
          badge: 'Completados',
          badgePriority: 'success',
          helper: 'Trámites finalizados sin incidencias.'
        },
        {
          title: 'Trámites activos',
          value: 388,
          icon: 'pi pi-sync',
          tone: 'purple',
          badge: 'En trámite',
          badgePriority: 'warning',
          helper: 'Procesos abiertos en seguimiento.'
        }
      ],
      secondaryMetrics: [
        {
          title: 'Eficiencia operativa',
          value: '86%',
          icon: 'pi pi-percentage',
          tone: 'teal',
          badge: 'Mensual',
          badgePriority: 'success',
          helper: 'Promedio de atención institucional.'
        },
        {
          title: 'Carga diaria',
          value: 312,
          icon: 'pi pi-wave-pulse',
          tone: 'orange',
          badge: 'Hoy',
          badgePriority: 'warning',
          helper: 'Movimientos registrados durante la jornada.'
        },
        {
          title: 'Usuarios activos',
          value: 147,
          icon: 'pi pi-users',
          tone: 'cyan',
          badge: 'Activos',
          badgePriority: 'info',
          helper: 'Usuarios con actividad reciente.'
        }
      ]
    }
  ];

  constructor(
    private tokenService: TokenService,
    private messageService: MessageService,
    private perfilUsuarioService: PerfilUsuarioService,
    private contadoresService: ContadoresService,
  ) {
    this.contadores$ = this.contadoresService.contadores;
  }

  ngOnInit(): void {
    // this.getDatosInformacionPFX();
    this.contadoresService.cargarContadores();
    this.actualizarHora();
  }

  ngOnDestroy(): void {
    this.contadoresService.detenerPolling();
  }

  get currentDashboard(): DashboardSystem {
    return this.dashboards.find(
      dashboard => dashboard.id === this.selectedDashboard
    ) ?? this.dashboards[0];
  }

  get selectedIndex(): number {
    return this.dashboards.findIndex(
      dashboard => dashboard.id === this.selectedDashboard
    );
  }

  get indicatorWidth(): number {
    return 100 / this.dashboards.length;
  }

  get indicatorTransform(): string {
    return `translateX(${this.selectedIndex * 100}%)`;
  }

  selectDashboard(dashboardId: string): void {
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
    const lastIndex = this.dashboards.length - 1;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = index === lastIndex ? 0 : index + 1;
      this.selectDashboard(this.dashboards[nextIndex].id);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const previousIndex = index === 0 ? lastIndex : index - 1;
      this.selectDashboard(this.dashboards[previousIndex].id);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.selectDashboard(this.dashboards[0].id);
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.selectDashboard(this.dashboards[lastIndex].id);
    }
  }

  getContador(IdPantalla: number): Observable<number | null> {
    return this.contadoresService.getContadorParaPantalla(IdPantalla);
  }

  getMetricValue(metric: DashboardMetric): string | number | null {
    return metric.value;
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

  getToneClasses(tone: DashboardTone): string {
    const tones: Record<DashboardTone, string> = {
      orange:
        'bg-orange-50 text-orange-600 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20',
      blue:
        'bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
      purple:
        'bg-purple-50 text-purple-600 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/20',
      red:
        'bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
      emerald:
        'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
      indigo:
        'bg-indigo-50 text-indigo-600 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',
      cyan:
        'bg-cyan-50 text-cyan-600 ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/20',
      teal:
        'bg-teal-50 text-teal-600 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20'
    };

    return tones[tone];
  }

  getMetricHoverClasses(tone: DashboardTone): string {
    const tones: Record<DashboardTone, string> = {
      orange:
        'hover:border-orange-200 hover:bg-orange-50/40 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/5',
      blue:
        'hover:border-blue-200 hover:bg-blue-50/40 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/5',
      purple:
        'hover:border-purple-200 hover:bg-purple-50/40 dark:hover:border-purple-500/30 dark:hover:bg-purple-500/5',
      red:
        'hover:border-red-200 hover:bg-red-50/40 dark:hover:border-red-500/30 dark:hover:bg-red-500/5',
      emerald:
        'hover:border-emerald-200 hover:bg-emerald-50/40 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5',
      indigo:
        'hover:border-indigo-200 hover:bg-indigo-50/40 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5',
      cyan:
        'hover:border-cyan-200 hover:bg-cyan-50/40 dark:hover:border-cyan-500/30 dark:hover:bg-cyan-500/5',
      teal:
        'hover:border-teal-200 hover:bg-teal-50/40 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/5'
    };

    return tones[tone];
  }

  getBadgeClasses(priority: MetricPriority): string {
    const priorities: Record<MetricPriority, string> = {
      critical:
        'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
      warning:
        'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20',
      info:
        'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
      success:
        'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20'
    };

    return priorities[priority];
  }

  trackByDashboardId(_: number, dashboard: DashboardSystem): string {
    return dashboard.id;
  }

  trackByMetricTitle(_: number, metric: DashboardMetric): string {
    return metric.title;
  }
}
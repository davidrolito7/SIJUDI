import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ApiService } from '../../service/api.service';
import { CatJuzgadoResponse, TramitesElectronicosRecibidosResponse } from '../../interface/tramites-juicio-oral.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { TramitesBusquedaState, TramitesBusquedaStateService } from '../../service/tramites-busqueda-state.service';

@Component({
  selector: 'app-tramites-juicio-oral',
  imports: [
    CommonModule, TableModule, InputTextModule, TagModule, SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule, ReactiveFormsModule,
    Spinner, BreadcrumbModule, AvatarModule, InputMaskModule, ConfirmDialog, TooltipModule
  ],
  templateUrl: './tramites-juicio-oral.html',
  styleUrl: './tramites-juicio-oral.css',
  providers: [ConfirmationService]
})
export class TramitesJuicioOral implements OnInit {
  validarCausaForm!: FormGroup;

  tramitesElectronicosRecibidos: TramitesElectronicosRecibidosResponse[] = [];
  catJuzgados: CatJuzgadoResponse[] = [];

  isLoading = false;
  mostrarTramites = signal(false);

  private readonly apiService = inject(ApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly busquedaState = inject(TramitesBusquedaStateService);

  catTipoTramite = [
    { label: 'CAUSA', value: 33 },
    { label: 'CUADERNO ANTECEDENTE', value: 34 },
    // { label: 'CUADERNO DE EJECUCIÃ“N', value: 47 },
  ];
  searchValue: string | undefined;

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'unqualified':
        return 'danger';
      case 'qualified':
        return 'success';
      case 'new':
        return 'info';
      case 'negotiation':
        return 'warn';
      case 'renewal':
        return null;
      default:
        return null;
    }
  }

  ngOnInit(): void {
    this.validarCausaForm = this.fb.group({
      idCatTipoTramite: [null, Validators.required],
      numeroExpediente: ['', Validators.required],
      idJuzgado: [{ value: null, disabled: true }, Validators.required],
      idPantalla: [1]
    });

    this.updateNumeroExpedienteValidator(this.validarCausaForm.get('idCatTipoTramite')?.value);
    this.validarCausaForm.get('idCatTipoTramite')?.valueChanges.subscribe((idCatTipoTramite) => {
      this.updateNumeroExpedienteValidator(idCatTipoTramite);
    });

    this.restaurarBusquedaSiExiste();
  }

  cargarCatalogoJuzgados(idCatTipoTramite: number | null) {
    const juzgadoCtrl = this.validarCausaForm.get('idJuzgado');
    const numeroExpedienteCtrl = this.validarCausaForm.get('numeroExpediente');

    this.catJuzgados = [];
    juzgadoCtrl?.setValue(null, { emitEvent: false });
    juzgadoCtrl?.disable({ emitEvent: false });
    numeroExpedienteCtrl?.reset('', { emitEvent: false });
    this.tramitesElectronicosRecibidos = [];
    this.mostrarTramites.set(false);
    this.busquedaState.limpiar();

    if (idCatTipoTramite == null) {
      return;
    }

    this.isLoading = true;
    this.apiService.getCatJuzgados({ idCatTipoTramite }).subscribe({
      next: (response) => {
        this.catJuzgados = response.data;
        juzgadoCtrl?.enable({ emitEvent: false });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar juzgados:', error);
        this.isLoading = false;
      }
    });
  }

  get numeroExpedienteMask(): string {
    return this.validarCausaForm.get('idCatTipoTramite')?.value === 34 ? '999999/9999' : '9999/9999';
  }

  get numeroExpedientePlaceholder(): string {
    return this.validarCausaForm.get('idCatTipoTramite')?.value === 34 ? '000000/0000' : '0000/0000';
  }

  private updateNumeroExpedienteValidator(idCatTipoTramite: number | null): void {
    const numeroExpedienteCtrl = this.validarCausaForm.get('numeroExpediente');
    const pattern = idCatTipoTramite === 34 ? /^\d{6}\/\d{4}$/ : /^\d{4}\/\d{4}$/;

    numeroExpedienteCtrl?.setValidators([Validators.required, Validators.pattern(pattern)]);
    numeroExpedienteCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  private restaurarBusquedaSiExiste(): void {
    const estado = this.busquedaState.recuperar();

    if (!estado) {
      return;
    }

    this.updateNumeroExpedienteValidator(estado.filtros.idCatTipoTramite);

    this.validarCausaForm.patchValue({
      idCatTipoTramite: estado.filtros.idCatTipoTramite,
      idJuzgado: estado.filtros.idJuzgado,
      idPantalla: estado.filtros.idPantalla
    }, { emitEvent: false });
    this.catJuzgados = estado.catJuzgados;
    this.tramitesElectronicosRecibidos = estado.resultados;
    this.mostrarTramites.set(estado.mostrarTramites);

    if (estado.filtros.idCatTipoTramite != null && estado.catJuzgados.length > 0) {
      this.validarCausaForm.get('idJuzgado')?.enable({ emitEvent: false });
    } else {
      this.validarCausaForm.get('idJuzgado')?.disable({ emitEvent: false });
    }

    queueMicrotask(() => {
      this.validarCausaForm.get('numeroExpediente')?.setValue(estado.filtros.numeroExpediente, { emitEvent: false });
      this.validarCausaForm.get('numeroExpediente')?.markAsTouched();
      this.validarCausaForm.get('numeroExpediente')?.updateValueAndValidity({ emitEvent: false });
      this.validarCausaForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  onBuscarTramitesElectronicos() {
    if (this.validarCausaForm.invalid) {
      this.validarCausaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.mostrarTramites.set(false);
    const params = this.validarCausaForm.getRawValue();

    this.apiService.getTramitesElectronicosRecibidos(params).subscribe(
      (response) => {
        this.isLoading = false;

        if (response.success) {
          this.tramitesElectronicosRecibidos = response.data;
          this.mostrarTramites.set(true);
          this.guardarEstadoActual();
        } else {
          this.tramitesElectronicosRecibidos = [];
          this.mostrarTramites.set(false);
          this.guardarEstadoActual();
          this.confirmationService.confirm({
            key: 'info',
            accept: () => { /* empty */ },
          });
        }
      },
      (error: unknown) => {
        console.error('Error al buscar trÃ¡mites electrÃ³nicos:', error);
        this.isLoading = false;
      }
    );
  }

  detalle(idTramiteElectronicoRecibido: number) {
    this.guardarEstadoActual();
    this.router.navigate(['/juicio-oral/detalle'], { state: { idTramiteElectronicoRecibido } });
  }

  descargarAcuse(id: number): void {
    this.isLoading = true;
    this.apiService.getAcuseTramite(id)
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const disposition = response.headers.get('content-disposition') ?? '';
          const match = disposition.match(/filename="([^"]+)"/);
          const filename = match ? match[1] : `Acuse_${id}.pdf`;

          const url = window.URL.createObjectURL(response.body!);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          console.error('Error al descargar el acuse');
        }
      });
  }

  limpiarBusqueda() {
    this.busquedaState.limpiar();
    this.validarCausaForm.reset({ idPantalla: 1 });
    this.validarCausaForm.get('idJuzgado')?.disable({ emitEvent: false });
    this.catJuzgados = [];
    this.tramitesElectronicosRecibidos = [];
    this.mostrarTramites.set(false);
  }

  private guardarEstadoActual(): void {
    const estado: TramitesBusquedaState = {
      filtros: this.validarCausaForm.getRawValue(),
      catJuzgados: [...this.catJuzgados],
      resultados: [...this.tramitesElectronicosRecibidos],
      mostrarTramites: this.mostrarTramites()
    };

    this.busquedaState.guardar(estado);
  }
}

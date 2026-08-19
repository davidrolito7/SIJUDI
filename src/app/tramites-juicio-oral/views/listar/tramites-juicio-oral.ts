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
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { TramitesBusquedaState, TramitesBusquedaStateService } from '../../service/tramites-busqueda-state.service';
import { TokenService } from '../../../core/auth/service/token.service';
import { finalize } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

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
  busquedaForm!: FormGroup;

  tramitesElectronicosRecibidos: TramitesElectronicosRecibidosResponse[] = [];
  catJuzgados: CatJuzgadoResponse[] = [];

  isLoading = signal(false);
  mostrarTramites = signal(false);

  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly busquedaState = inject(TramitesBusquedaStateService);
  private readonly tokenService = inject(TokenService);

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
    this.busquedaForm = this.fb.group({
      idCatTipoTramite: [null, Validators.required],
      numeroExpediente: ['', Validators.required],
      idJuzgado: [{ value: null, disabled: true }, Validators.required],
    });

    this.updateNumeroExpedienteValidator(this.busquedaForm.get('idCatTipoTramite')?.value);
    this.busquedaForm.get('idCatTipoTramite')?.valueChanges.subscribe((idCatTipoTramite) => {
      this.updateNumeroExpedienteValidator(idCatTipoTramite);
    });

    this.restaurarBusquedaSiExiste();

    if (!this.eresAbogado()) {
      this.cargarTodosLosJuzgados();
    }
  }

  cargarCatalogoJuzgados(idCatTipoTramite: number | null): void {
    const juzgadoCtrl = this.busquedaForm.get('idJuzgado');

    this.busquedaForm.get('numeroExpediente')?.reset('', { emitEvent: false });
    this.mostrarTramites.set(false);

    if (!this.eresAbogado()) {
      return;
    }

    this.catJuzgados = [];
    juzgadoCtrl?.setValue(null, { emitEvent: false });
    juzgadoCtrl?.disable({ emitEvent: false });

    if (idCatTipoTramite === null) {
      return;
    }

    this.isLoading.set(true);
    this.apiService.getCatJuzgados(idCatTipoTramite).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        this.catJuzgados = response.data;
        juzgadoCtrl?.enable({ emitEvent: false });
      },
      error: (error: unknown) => {
        console.error('Error al cargar juzgados:', error);
      }
    });
  }

  eresAbogado(): boolean {
    return this.tokenService.getUserFromToken()?.idSistemaPerfil === 10;
  }

  private cargarTodosLosJuzgados(): void {
    const juzgadoCtrl = this.busquedaForm.get('idJuzgado');

    this.isLoading.set(true);
    this.apiService.getAllCatJuzgados().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        this.catJuzgados = response.data;
        const juzgadoActual = juzgadoCtrl?.value;
        const juzgadoExiste = this.catJuzgados.some(
          ({ idCatJuzgado }) => idCatJuzgado === juzgadoActual
        );

        juzgadoCtrl?.setValue(
          juzgadoExiste ? juzgadoActual : null,
          { emitEvent: false }
        );
        juzgadoCtrl?.enable({ emitEvent: false });
      },
      error: (error: unknown) => {
        console.error('Error al cargar todos los juzgados:', error);
      }
    });
  }

  get numeroExpedienteMask(): string {
    return this.busquedaForm.get('idCatTipoTramite')?.value === 34 ? '999999/9999' : '9999/9999';
  }

  get numeroExpedientePlaceholder(): string {
    return this.busquedaForm.get('idCatTipoTramite')?.value === 34 ? '000000/0000' : '0000/0000';
  }

  private updateNumeroExpedienteValidator(idCatTipoTramite: number | null): void {
    const numeroExpedienteCtrl = this.busquedaForm.get('numeroExpediente');
    const pattern = idCatTipoTramite === 34 ? /^\d{6}\/\d{4}$/ : /^\d{4}\/\d{4}$/;

    numeroExpedienteCtrl?.setValidators([Validators.required, Validators.pattern(pattern)]);
    numeroExpedienteCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  private restaurarBusquedaSiExiste(): void {
    const estado = this.busquedaState.recuperar();

    if (!estado) {
      return;
    }

    if (estado.idSistemaPerfil !== this.getIdSistemaPerfil()) {
      this.busquedaState.limpiar();
      this.resetearBusquedaPorCambioDePerfil();
      return;
    }

    this.updateNumeroExpedienteValidator(estado.filtros.idCatTipoTramite);

    this.busquedaForm.patchValue({
      idCatTipoTramite: estado.filtros.idCatTipoTramite,
      idJuzgado: estado.filtros.idJuzgado,
      idPantalla: estado.filtros.idPantalla
    }, { emitEvent: false });
    this.catJuzgados = estado.catJuzgados;
    this.tramitesElectronicosRecibidos = estado.resultados;
    this.mostrarTramites.set(estado.mostrarTramites);

    if (estado.filtros.idCatTipoTramite != null && estado.catJuzgados.length > 0) {
      this.busquedaForm.get('idJuzgado')?.enable({ emitEvent: false });
    } else {
      this.busquedaForm.get('idJuzgado')?.disable({ emitEvent: false });
    }

    queueMicrotask(() => {
      this.busquedaForm.get('numeroExpediente')?.setValue(estado.filtros.numeroExpediente, { emitEvent: false });
      this.busquedaForm.get('numeroExpediente')?.markAsTouched();
      this.busquedaForm.get('numeroExpediente')?.updateValueAndValidity({ emitEvent: false });
      this.busquedaForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  onBuscarTramitesElectronicos() {
    if (this.busquedaForm.invalid) {
      this.busquedaForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.mostrarTramites.set(false);
    const params = this.busquedaForm.getRawValue();

    this.apiService.getTramitesElectronicosRecibidos(params).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe(
      (response) => {

        if (response.success) {
          this.tramitesElectronicosRecibidos = response.data;
          this.mostrarTramites.set(true);
          this.guardarEstadoActual();
        } else {
          this.tramitesElectronicosRecibidos = [];
          this.mostrarTramites.set(false);
          this.guardarEstadoActual();
        }
      },
      (error: unknown) => {
        this.tramitesElectronicosRecibidos = [];
        this.mostrarTramites.set(false);
        this.guardarEstadoActual();
        console.error('Error al buscar trÃ¡mites electrÃ³nicos:', error);
      }
    );
  }

  detalle(idTramiteElectronicoRecibido: number) {
    this.guardarEstadoActual();
    this.router.navigate(['/juicio-oral/detalle'], { state: { idTramiteElectronicoRecibido } });
  }

  descargarAcuse(id: number): void {
    this.isLoading.set(true);
    this.apiService.getAcuseTramite(id)
      .pipe(finalize(() => this.isLoading.set(false)))
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
        },
        error: () => {
          console.error('Error al descargar el acuse');
        }
      });
  }

  limpiarBusqueda() {
    this.busquedaState.limpiar();
    const juzgadoCtrl = this.busquedaForm.get('idJuzgado');

    this.busquedaForm.reset({
      idCatTipoTramite: null,
      numeroExpediente: '',
      idJuzgado: null
    });

    if (this.eresAbogado()) {
      this.catJuzgados = [];
      juzgadoCtrl?.disable({ emitEvent: false });
    } else {
      juzgadoCtrl?.enable({ emitEvent: false });
    }

    this.tramitesElectronicosRecibidos = [];
    this.mostrarTramites.set(false);
  }

  private getIdSistemaPerfil(): number | null {
    return this.tokenService.getUserFromToken()?.idSistemaPerfil ?? null;
  }

  private resetearBusquedaPorCambioDePerfil(): void {
    this.busquedaForm.reset({
      idCatTipoTramite: null,
      numeroExpediente: '',
      idJuzgado: null
    }, { emitEvent: false });
    this.busquedaForm.get('idJuzgado')?.disable({ emitEvent: false });
    this.catJuzgados = [];
    this.tramitesElectronicosRecibidos = [];
    this.mostrarTramites.set(false);
  }

  private guardarEstadoActual(): void {
    const estado: TramitesBusquedaState = {
      idSistemaPerfil: this.getIdSistemaPerfil(),
      filtros: this.busquedaForm.getRawValue(),
      catJuzgados: [...this.catJuzgados],
      resultados: [...this.tramitesElectronicosRecibidos],
      mostrarTramites: this.mostrarTramites()
    };

    this.busquedaState.guardar(estado);
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import {
  AreaResponse,
  DiaInhabilResponse,
  DiaInhabilSedePatchRequest,
  DiaInhabilSedeRequest,
  DiaInhabilSedeSedeRequest,
  SedeResponse,
} from '../../interface/agenda.model';
import { ApiAgendaService } from '../../service/apiAgenda.service';
import { Spinner } from '../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-crear-inhabil-sede',
  imports: [
    CommonModule, ReactiveFormsModule, Spinner, SelectModule, TableModule,
    ButtonDirective, InputTextModule, IconFieldModule, InputIconModule, ToastModule,
  ],
  templateUrl: './crear-inhabil-sede.html',
  styleUrl: './crear-inhabil-sede.css',
  providers: [MessageService],
})
export class CrearInhabilSede implements OnInit {
  isLoading = signal(false);
  modoEdicion = signal(false);
  diasInhabiles = signal<DiaInhabilResponse[]>([]);
  sedes = signal<SedeResponse[]>([]);
  areas = signal<AreaResponse[]>([]);
  areasExtraordinariasDisponibles = signal<AreaResponse[]>([]);

  sedesSeleccionadas: SedeResponse[] = [];
  sedesExpandidas: Record<string, boolean> = {};
  areasExtraordinarias: AreaResponse[] = [];
  areasExcluidasPorSede: Record<number, number[]> = {};
  formAsignacion: FormGroup;
  private idDiaInhabilEdicion: number | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly apiAgendaService = inject(ApiAgendaService);
  private readonly messageService = inject(MessageService);

  constructor() {
    this.formAsignacion = this.fb.group({
      idDiaInhabil: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    const state = window.history.state as { idDiaInhabil?: number };
    if (state?.idDiaInhabil !== undefined) {
      this.idDiaInhabilEdicion = state.idDiaInhabil;
      this.modoEdicion.set(true);
      this.formAsignacion.controls['idDiaInhabil'].setValue(state.idDiaInhabil);
      this.formAsignacion.controls['idDiaInhabil'].disable();
    }
    this.cargarCatalogos(this.idDiaInhabilEdicion);
  }

  private cargarCatalogos(idDiaInhabil: number | null): void {
    this.isLoading.set(true);
    forkJoin({
      diasInhabiles: this.apiAgendaService.getDiasInhabiles(),
      sedes: this.apiAgendaService.getSedes(),
      areas: this.apiAgendaService.getAreas(),
    }).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: ({ diasInhabiles, sedes, areas }) => {
        this.diasInhabiles.set(diasInhabiles.data);
        this.sedes.set(sedes.data);
        this.areas.set(areas.data);
        this.actualizarAreasExtraordinariasDisponibles();
        if (idDiaInhabil !== null) this.cargarAsignacion(idDiaInhabil);
      },
      error: (error) => console.error('Error al cargar los catálogos de asignación:', error),
    });
  }

  private cargarAsignacion(idDiaInhabil: number): void {
    this.isLoading.set(true);
    this.apiAgendaService.getDiaInhabilSedeById(idDiaInhabil)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const configuracion = response.data;
          const sedesConfiguradas = configuracion.sedes;
          this.sedesSeleccionadas = sedesConfiguradas.map((configuracionSede) => configuracionSede.sede);
          this.areasExcluidasPorSede = Object.fromEntries(
            sedesConfiguradas.map((configuracionSede) => [
              configuracionSede.sede.id,
              configuracionSede.sede.areasExcluidas?.map((area) => area.idArea) ?? [],
            ]),
          );
          this.sedesExpandidas = {};
          const idsAreasIncluidas = new Set(
            sedesConfiguradas.flatMap((configuracionSede) => configuracionSede.idAreasIncluidas ?? []),
          );
          this.areasExtraordinarias = this.areas().filter((area) =>
            idsAreasIncluidas.has(area.idArea) && !this.perteneceASedeSeleccionada(area),
          );
          this.actualizarAreasExtraordinariasDisponibles();
        },
        error: (error) => {
          console.error('Error al cargar la asignación:', error);
          this.messageService.add({ severity: 'error', summary: 'No se pudo cargar la asignación', detail: 'Intenta nuevamente.' });
        },
      });
  }

  areasDeSede(sede: SedeResponse): AreaResponse[] {
    return sede.areas?.length ? sede.areas : this.areas().filter((area) => area.idSede === sede.id);
  }

  areasExcluidas(sede: SedeResponse): number[] {
    return this.areasExcluidasPorSede[sede.id] ?? [];
  }

  areasIncluidas(sede: SedeResponse): AreaResponse[] {
    const idsExcluidos = this.areasExcluidas(sede);
    return this.areasDeSede(sede).filter((area) => !idsExcluidos.includes(area.idArea));
  }

  actualizarAreasIncluidas(sede: SedeResponse, areasIncluidas: AreaResponse[]): void {
    const idsIncluidos = new Set(areasIncluidas.map((area) => area.idArea));
    this.areasExcluidasPorSede[sede.id] = this.areasDeSede(sede)
      .filter((area) => !idsIncluidos.has(area.idArea))
      .map((area) => area.idArea);
  }

  private actualizarAreasExtraordinariasDisponibles(): void {
    this.areasExtraordinariasDisponibles.set(
      this.areas().filter((area) => !this.perteneceASedeSeleccionada(area)),
    );
  }

  private perteneceASedeSeleccionada(area: AreaResponse): boolean {
    const idSede = area.idSede ?? area.sede?.id;
    return idSede !== undefined && this.sedesSeleccionadas.some((sede) => sede.id === idSede);
  }

  claseAreaConSede(area: AreaResponse): string {
    const idSede = area.idSede ?? area.sede?.id;
    return idSede === undefined ? '' : `sede-asignada-${idSede % 6}`;
  }

  alCambiarSedes(sedes: SedeResponse[]): void {
    this.sedesSeleccionadas = sedes;
    const idsSeleccionados = new Set(sedes.map((sede) => sede.id));
    Object.keys(this.areasExcluidasPorSede).forEach((id) => {
      if (!idsSeleccionados.has(Number(id))) delete this.areasExcluidasPorSede[Number(id)];
    });
    this.sedesExpandidas = Object.fromEntries(
      Object.entries(this.sedesExpandidas).filter(([id]) => idsSeleccionados.has(Number(id))),
    );
    this.areasExtraordinarias = this.areasExtraordinarias.filter(
      (area) => !this.perteneceASedeSeleccionada(area),
    );
    this.actualizarAreasExtraordinariasDisponibles();
  }

  guardarAsignacion(): void {
    if (this.formAsignacion.invalid || !this.sedesSeleccionadas.length) {
      this.formAsignacion.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Información requerida', detail: 'Selecciona un día inhábil y al menos una sede.' });
      return;
    }

    const sedes: DiaInhabilSedeSedeRequest[] = this.sedesSeleccionadas.map((sede) => {
      const idAreasExcluidas = this.areasExcluidas(sede);
      return { idSede: sede.id, esGeneral: idAreasExcluidas.length === 0, idAreasExcluidas };
    });
    const idAreasIncluidas = this.areasExtraordinarias.map((area) => area.idArea);
    const idDiaInhabil = this.idDiaInhabilEdicion ?? this.formAsignacion.getRawValue().idDiaInhabil;
    const solicitud: DiaInhabilSedePatchRequest = { sedes, idAreasIncluidas };
    const solicitudPost: DiaInhabilSedeRequest = { idDiaInhabil, sedes, idAreasIncluidas };

    this.isLoading.set(true);
    const peticion = this.modoEdicion()
      ? this.apiAgendaService.patchDiaInhabilSede(idDiaInhabil, solicitud)
      : this.apiAgendaService.postDiaInhabilSede(solicitudPost);

    peticion.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.modoEdicion() ? 'Asignación actualizada' : 'Asignación creada', detail: 'Los cambios fueron guardados.' });
        //this.router.navigate(['/agenda/asignar-dia-inhabil']);
      },
      error: (error ) => {
        console.error('Error al guardar la asignación:', error);
        this.messageService.add({ severity: 'error', summary: 'No se pudo guardar', detail: 'Por favor, intenta de nuevo.' });
      },
    });
  }
}

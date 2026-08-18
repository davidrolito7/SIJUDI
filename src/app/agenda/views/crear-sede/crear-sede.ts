import { Component, inject, OnInit, signal, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { InputMaskModule } from 'primeng/inputmask';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ApiAgendaService } from '../../service/apiAgenda.service';
import { AreaResponse, SedeRequest } from '../../interface/agenda.model';
import { BadgeModule } from 'primeng/badge';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-crear-sede',
  imports: [CommonModule, ReactiveFormsModule, Spinner, SelectModule, InputMaskModule, TableModule, IconFieldModule, InputIconModule, ButtonDirective, InputTextModule, FloatLabelModule, BadgeModule, ToastModule],
  templateUrl: './crear-sede.html',
  styleUrl: './crear-sede.css',
  providers: [MessageService]
})
export class CrearSede implements OnInit {
  isLoading = signal(false);
  areas = signal<AreaResponse[]>([]);

  areasSeleccionadas: AreaResponse[] = [];
  formGeneral!: FormGroup;

  idSede: number | undefined;
  modoEdicion = signal(false);
  private readonly idsAreasSedeActual = new Set<number>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly apiAgendaService = inject(ApiAgendaService);
  private readonly messageService = inject(MessageService);

  constructor() {
    this.formGeneral = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      icono: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.obtenerListadoAreas();

    const state = window.history.state as { idSede?: number };

    if (state?.idSede !== undefined) {
      this.idSede = state.idSede;
      this.modoEdicion.set(true);

      this.obtenerDetalleSede(this.idSede);
    }
  }

  obtenerListadoAreas() {
    this.apiAgendaService.getAreas().subscribe({
      next: (response) => {
        this.areas.set(response.data);
      },
      error: (error) => {
        console.error('Error al obtener el listado de areas:', error);
      }
    });
  }

  obtenerDetalleSede(idSede: number) {
    this.apiAgendaService.getSedeById(idSede).subscribe({
      next: (response) => {
        const sede = response.data;
        if (sede) {
          this.formGeneral.patchValue({
            nombre: sede.nombre,
            descripcion: sede.descripcion,
          });
          this.areasSeleccionadas = sede.areas;
          this.idsAreasSedeActual.clear();
          sede.areas.forEach((area) => this.idsAreasSedeActual.add(area.idArea));
        } else {
          console.warn('No se encontró la sede con el id proporcionado.');
        }
      },
      error: (error) => {
        console.error('Error al obtener el detalle de la sede:', error);
      }
    });
  }

areaEstaAsignada(area: AreaResponse): boolean {
  return area.idSede != null;
}

  alCambiarAreasSeleccionadas(areas: AreaResponse[]): void {
    const areasBloqueadasDeLaSedeActual = this.areas().filter(
      (area) => this.idsAreasSedeActual.has(area.idArea),
    );
    const idsBloqueadas = new Set(areasBloqueadasDeLaSedeActual.map((area) => area.idArea));
    this.areasSeleccionadas = [
      ...areasBloqueadasDeLaSedeActual,
      ...areas.filter((area) => !idsBloqueadas.has(area.idArea) && !this.areaEstaAsignada(area)),
    ];
  }

  claseSedeAsignada(area: AreaResponse): string {
    const idSede = area.idSede ?? area.sede?.id;
    return idSede === undefined ? '' : `sede-asignada-${idSede % 6}`;
  }

  guardarSede(): void {
    if (this.formGeneral.invalid) {
      this.formGeneral.markAllAsTouched();
      return;
    }

    const { nombre, descripcion } = this.formGeneral.getRawValue();

    const sedeRequest: SedeRequest = {
      nombre,
      descripcion,
      idAreas: this.areasSeleccionadas.map(area => area.idArea),
    };

    this.isLoading.set(true);

    const solicitud = this.modoEdicion() && this.idSede !== undefined
      ? this.apiAgendaService.patchSede(this.idSede, sedeRequest)
      : this.apiAgendaService.postSede(sedeRequest);

    solicitud
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.modoEdicion() ? 'Sede actualizada' : 'Sede creada',
            detail: 'Tus cambios han sido guardados.',
          });

         // this.router.navigate(['/agenda/sedes']);
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Surgió un error', detail: 'Por favor, intenta de nuevo.' });
          console.error(`Error al ${this.modoEdicion() ? 'actualizar' : 'crear'} la sede:`, error);
        }
      });
  }


  mostrarAddDocumentos() {
    return true; // Cambia esto según la lógica que determines para mostrar u ocultar el formulario
  }


  iconosPaisaje = [
    { valor: 'mar', svg: '#ico-mar' },
    { valor: 'montana', svg: '#ico-montana' },
    { valor: 'valle', svg: '#ico-valle' },
    { valor: 'nubes', svg: '#ico-nubes' },
    { valor: 'cerros', svg: '#ico-cerros' },
    { valor: 'soleado', svg: '#ico-sol' },
    { valor: 'lluvia', svg: '#ico-lluvia' },
    { valor: 'tormenta', svg: '#ico-tormenta' },
    { valor: 'niebla', svg: '#ico-niebla' },
    { valor: 'viento', svg: '#ico-viento' },
    { valor: 'bosque', svg: '#ico-bosque' },
    { valor: 'desierto', svg: '#ico-desierto' },
    { valor: 'rio', svg: '#ico-rio' },
    { valor: 'ciudad', svg: '#ico-ciudad' },
    { valor: 'pueblo', svg: '#ico-pueblo' }
  ];

}

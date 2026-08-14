import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { DatePickerModule } from 'primeng/datepicker';

import { ApiAgendaService } from '../../service/apiAgenda.service';
import { DiaInhabilResponse } from '../../interface/agenda.model';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { TextareaModule } from 'primeng/textarea';
import { finalize } from 'rxjs';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-listar-dia-inhabil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    InputMaskModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    ButtonDirective,
    InputTextModule,
    FloatLabelModule,
    DrawerModule,
    DatePickerModule,
    TextareaModule,
    ToastModule,
    Spinner,
  ],
  templateUrl: './listar-dia-inhabil.html',
  styleUrl: './listar-dia-inhabil.css',
    providers: [MessageService]

})
export class ListarDiaInhabil implements OnInit {
  isLoading = signal(false);
@ViewChild('drawer') drawer!: Drawer;
  /** Evita envíos duplicados sin cubrir la vista con el overlay global. */
  isSaving = signal(false);

  dias = signal<DiaInhabilResponse[]>([]);

  visibleRight = false;

  modoEdicion = signal(false);

  diaSeleccionadoId = signal<number | null>(null);

  formFiltrosTabla!: FormGroup;
  formDiaInhabil!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly apiAgendaService = inject(ApiAgendaService);
  private readonly messageService = inject(MessageService);

  constructor() {
    this.formFiltrosTabla = this.fb.group({
      nombre: [''],
    });

    this.formDiaInhabil = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerListadoDiasInhabiles();
  }

  obtenerListadoDiasInhabiles() {
    this.isLoading.set(true);

    this.apiAgendaService
      .getDiasInhabiles()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.dias.set(response.data);
        },
        error: (error) => {
          console.error('Error al obtener el listado de dias inhabiles:', error);
        },
      });
  }

  nuevoDiaInhabil() {
    this.modoEdicion.set(false);
    this.diaSeleccionadoId.set(null);

    this.formDiaInhabil.reset();

    this.visibleRight = true;
  }

  editarDiaInhabil(dia: DiaInhabilResponse) {
    this.modoEdicion.set(true);

    this.diaSeleccionadoId.set(dia.id);

    this.formDiaInhabil.patchValue({
      nombre: dia.nombre,
      descripcion: dia.descripcion,
      fechaInicio: dia.fechaInicio ? new Date(dia.fechaInicio) : null,
      fechaFin: dia.fechaFin ? new Date(dia.fechaFin) : null,
    });

    this.visibleRight = true;
  }

  guardarDiaInhabil() {
    if (this.formDiaInhabil.invalid) {
      this.formDiaInhabil.markAllAsTouched();
      return;
    }

    const formValue = this.formDiaInhabil.getRawValue();

    const diaInhabil: DiaInhabilResponse = {
      ...formValue,

      // Ajusta estas fechas dependiendo de lo que espere tu API.
      fechaInicio: this.formatearFecha(formValue.fechaInicio),
      fechaFin: this.formatearFecha(formValue.fechaFin),
    };

    if (this.modoEdicion()) {
      this.actualizarDiaInhabil(diaInhabil);
    } else {
      this.crearDiaInhabil(diaInhabil);
    }
  }

  private crearDiaInhabil(diaInhabil: DiaInhabilResponse) {
    this.isSaving.set(true);

    this.apiAgendaService
      .postDiaInhabil(diaInhabil)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.dias.update((dias) => [...dias, response.data]);
          this.cerrarDrawer();
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado correctamente',
            detail: 'Día inhábil creado correctamente',
          });
        },

        error: (error) => {
          console.error(
            'Error al crear el día inhábil:',
            error
          );
          this.messageService.add({
            severity: 'info',
            summary: 'Lo sentimos',
            detail: 'Error al crear el día inhábil',
          });
        }
      });
  }
  private actualizarDiaInhabil(diaInhabil: DiaInhabilResponse) {
    const id = this.diaSeleccionadoId();

    if (id === null) {
      return;
    }

    this.isSaving.set(true);

    this.apiAgendaService
      .patchDiaInhabil(id, diaInhabil)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.dias.update((dias) =>
            dias.map((dia) => (dia.id === id ? response.data : dia)),
          );
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado correctamente',
            detail: 'Día inhábil actualizado correctamente',
          });
          this.cerrarDrawer();
        },

        error: (error) => {
          console.error(
            'Error al actualizar el día inhábil:',
            error
          );
          this.messageService.add({
            severity: 'info',
            summary: 'Lo sentimos',
            detail: 'Error al actualizar el día inhábil',
          });
        }
      });
  }

cerrarDrawer() {
  this.drawer?.close(new Event('click'));
  this.visibleRight = false;
}

  limpiarFormularioDrawer() {
    this.formDiaInhabil.reset();
    this.modoEdicion.set(false);
    this.diaSeleccionadoId.set(null);
  }

  private formatearFecha(fecha: Date | null): string | null {
    if (!fecha) {
      return null;
    }

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}

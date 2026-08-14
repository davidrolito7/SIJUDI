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
import { DiaInhabilSedeResponse } from '../../interface/agenda.model';

@Component({
  selector: 'app-listar-inhabil-sede',
  imports: [CommonModule, ReactiveFormsModule, Spinner, SelectModule, InputMaskModule, TableModule, IconFieldModule, InputIconModule, ButtonDirective, InputTextModule, FloatLabelModule],
  templateUrl: './listar-inhabil-sede.html',
  styleUrl: './listar-inhabil-sede.css',
})
export class ListarInhabilSede implements OnInit {
  isLoading = signal(false);
  formFiltrosTabla!: FormGroup;

  diasInhabilesSedes = signal<DiaInhabilSedeResponse[]>([]);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly apiAgendaService = inject(ApiAgendaService);


  constructor() {
    this.formFiltrosTabla = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerListadoDiasInhabilesSedes();
  }
    


  obtenerListadoDiasInhabilesSedes() {
    this.apiAgendaService.getDiasInhablesSedes().subscribe({
      next: (response) => {
        this.diasInhabilesSedes.set(response.data);
      },
      error: (error) => {
        console.error('Error al obtener el listado de dias inhabiles sedes:', error);
      }
    });
  }



  irANuevaAsignacion() {
    this.router.navigate(['/agenda/crear-asignacion']);
  }

   detalleSede(idDiaInhabil : number) {
    this.router.navigate(['/agenda/crear-asignacion'], { state: { idDiaInhabil } });
  }
}

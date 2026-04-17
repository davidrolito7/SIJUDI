import { Component, signal } from '@angular/core';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { ButtonModule } from "primeng/button";
import { InputMaskModule } from "primeng/inputmask";
import { SelectModule } from "primeng/select";
import { DatePickerModule } from "primeng/datepicker";
import { FormsModule } from '@angular/forms';
import { Toast } from "primeng/toast";
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-turnar-demanda',
  imports: [FormsModule, Breadcrub, Spinner, ButtonModule, InputMaskModule, SelectModule, DatePickerModule, Toast, TableModule, TagModule, InputTextModule, IconFieldModule, InputIconModule, CommonModule],
  templateUrl: './turnar-demanda.html',
  styleUrl: './turnar-demanda.css',
})
export class TurnarDemanda {
  inicios = signal<any[]>([]);
  totalRecords = 0;        // ← total para que PrimeNG sepa cuántas páginas hay
  rowsPerPage = 10;        // ← rows actuales, se actualiza desde el evento lazy

  isLoading = signal(false);

  constructor() { }

  estadoOptions = [
    { label: 'Todo', value: 0 },
    { label: 'Enviado', value: 1 },
    { label: 'Asignado', value: 2 },
    { label: 'Finalizado', value: 3 },
  ];
  filtro: { folio: string; rangeDates: Date[] | ''; estado: number } = {
    folio: '',
    rangeDates: '',
    estado: 0,
  };

  // ── Evento lazy de PrimeNG ──────────────────────────────────────────
  // Se dispara al cargar, cambiar página y cambiar rows per page
  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.rowsPerPage;
    const first = event.first ?? 0;

    this.rowsPerPage = rows;
    const page = Math.floor(first / rows) + 1;

    // this.actualizarURL(page);
    // this.cargarDatos(page, rows);
  }

  limpiarFiltros(): void {
    this.filtro = { estado: 0, rangeDates: '', folio: '' };
    // this.router.navigate([], {
    //   relativeTo: this.route,
    //   queryParams: { estado: null, folio: null, fechaInicio: null, fechaFinal: null, page: 1 },
    //   queryParamsHandling: 'merge',
    // });
    // this.cargarDatos(1, this.rowsPerPage);
  }

  aplicarFiltros(): void {
    // this.actualizarURL(1);
    // this.cargarDatos(1, this.rowsPerPage);
  }


}

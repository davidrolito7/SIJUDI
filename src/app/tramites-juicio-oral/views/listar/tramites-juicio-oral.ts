import { Component, OnInit, signal } from '@angular/core';
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
import { ConfirmationService, MenuItem } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-tramites-juicio-oral',
  imports: [
    CommonModule, TableModule, InputTextModule, TagModule, SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule, ReactiveFormsModule,
    Spinner, BreadcrumbModule, AvatarModule, InputMaskModule, ConfirmDialog, TooltipModule,
    Breadcrub
  ],
  templateUrl: './tramites-juicio-oral.html',
  styleUrl: './tramites-juicio-oral.css',
  providers: [ConfirmationService]

})
export class TramitesJuicioOral implements OnInit {
  //* === FORMULARIOS ===
  validarCausaForm!: FormGroup;

  //* === LISTAS Y DATOS TEMPORALES ===
  tramitesElectronicosRecibidos: TramitesElectronicosRecibidosResponse[] = [];
  catJuzgados: CatJuzgadoResponse[] = [];
  //* === ESTADOS DE UI Y MODALES ===
  //* === FLAGS Y VARIABLES DE CONTROL ===
  isLoading: boolean = false;
  mostrarTramites = signal(false);


  constructor(
    private readonly fb: FormBuilder,
    private apiService: ApiService,
    private readonly confirmationService: ConfirmationService,
    private router: Router,


  ) { }
  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  catTipoTramite = [
    { label: 'CAUSA', value: 33 },
    { label: 'CUADERNO DE EJECUCIÓN', value: 47 },
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
      numeroExpediente: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{4}$/)]],
      idJuzgado: [{ value: null, disabled: true }, Validators.required],
      idPantalla: [1]
    });
  }

  cargarCatalogoJuzgados(idCatTipoTramite: number | null) {
    const juzgadoCtrl = this.validarCausaForm.get('idJuzgado');
    this.catJuzgados = [];
    juzgadoCtrl?.setValue(null, { emitEvent: false });
    juzgadoCtrl?.disable({ emitEvent: false });
    this.mostrarTramites.set(false);
    this.tramitesElectronicosRecibidos = [];

    if (idCatTipoTramite == null) return;

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

  onBuscarTramitesElectronicos() {
    this.isLoading = true;
    this.mostrarTramites.set(false);
    const params = this.validarCausaForm.getRawValue();
    this.apiService.getTramitesElectronicosRecibidos(params).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.tramitesElectronicosRecibidos = response.data;
          this.mostrarTramites.set(true);
        } else {
          this.confirmationService.confirm({
            key: 'info',
            accept: () => { },
          });
        }
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  detalle(idTramiteElectronicoRecibido: number) {
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
}

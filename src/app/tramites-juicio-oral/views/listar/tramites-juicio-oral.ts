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

@Component({
  selector: 'app-tramites-juicio-oral',
  imports: [
    CommonModule, TableModule, InputTextModule, TagModule, SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule, ReactiveFormsModule,
    Spinner, BreadcrumbModule, AvatarModule, InputMaskModule, ConfirmDialog
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


  ) { }
  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

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
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadCatJuzgados();

    this.validarCausaForm = this.fb.group({
      numeroCausa: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{4}$/)]],
      idJuzgado: [null, Validators.required],
      idPantalla: [1]
    });
  }

  onBuscarTramitesElectronicos() {
    this.isLoading = true;
    this.mostrarTramites.set(false);
    const params = this.validarCausaForm.value;
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

  loadCatJuzgados() {
    this.isLoading = true;
    this.apiService.getCatJuzgados().subscribe(
      (response) => {
        if (response.success) {
          this.catJuzgados = response.data;
          this.isLoading = false;

        } else {
          this.isLoading = false;
        }

      },
      (error) => {
        this.isLoading = false;
      }
    );
  }
}

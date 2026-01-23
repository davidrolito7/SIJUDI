import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ApiService } from '../../service/api.service';
import { CatJuzgadoResponse, TramitesElectronicosRecibidosResponse, ValidarCausaResponse } from '../../interface/tramites-juicio-oral.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { TextareaModule } from 'primeng/textarea';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfDialog } from '../../../shared/components/pdf-dialog/pdf-dialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputMaskModule } from 'primeng/inputmask';
@Component({
  selector: 'app-crear-tramite',
  imports: [
    CommonModule, TableModule, InputTextModule, TagModule, SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule, ReactiveFormsModule,
    Spinner, TextareaModule, FileUploadModule, PdfDialog, ConfirmDialog, AvatarModule, BreadcrumbModule, InputMaskModule
  ],
  templateUrl: './crear-tramite.html',
  styleUrl: './crear-tramite.css',
  providers: [ConfirmationService]
})
export class CrearTramite {
  //* === FORMULARIOS ===
  validarCausaForm!: FormGroup;

  //* === LISTAS Y DATOS TEMPORALES ===
  tramitesElectronicosRecibidos: TramitesElectronicosRecibidosResponse | null = null;
  catJuzgados: CatJuzgadoResponse[] = [];
  documentosAnexados: File[] = [];
  causaValidada: ValidarCausaResponse | null = null;

  //* === ESTADOS DE UI Y MODALES ===
  //* === FLAGS Y VARIABLES DE CONTROL ===
  isLoading: boolean = false;
  mostrarAddDocumentos = signal(false);
  mostrarDocumento = false;


  //* === OTROS  ===
  documentoUrl: SafeResourceUrl | null = null;
  nombre = '';

  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  constructor(
    private readonly fb: FormBuilder,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private readonly confirmationService: ConfirmationService,

  ) { }

  loading = false;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadCatJuzgados();

    this.validarCausaForm = this.fb.group({
      numeroCausa: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{4}$/)]],
      idJuzgado: [null, Validators.required],
      observaciones: [''],
      idPantalla: [1]
    });
  }

  onValidarCausa() {
    this.isLoading = true;
    this.mostrarAddDocumentos.set(false);
    const params = this.validarCausaForm.value;
    this.apiService.postValidarCausa(params).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.causaValidada = response.data,
            this.mostrarAddDocumentos.set(true);
        } else {
          this.confirmationService.confirm({
            key: 'info',
            accept: () => { },
          });
        }

      },
      (error) => {
        this.mostrarAddDocumentos.set(false);
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

  onAnexosSelect(event: FileSelectEvent) {
    this.documentosAnexados = [...this.documentosAnexados, ...event.files];

  }

  onVerDocumento(file: File): void {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      this.nombre = file.name;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarDocumento = true;
    } else {
      console.error('Documento inválido');
    }
  }

  eliminarAnexo(index: number) {
    this.confirmationService.confirm({
      key: 'anexo',
      accept: () => this.onEliminarDocumento(index),
      reject: () => { }
    });

  }

  onEliminarDocumento(index: number): void {
    this.documentosAnexados.splice(index, 1);
  }

  onEnviarTramite(): void {

    if (this.validarCausaForm.invalid) {
      this.validarCausaForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.validarCausaForm.value;

    formData.append('idCausa', this.causaValidada?.idCausa?.toString() ?? '');
    formData.append('IdCatJuzgado', this.causaValidada?.idCatJuzgado?.toString() ?? '');
    formData.append('Observaciones', formValue.observaciones ?? '');

    this.documentosAnexados.forEach((file) => {
      formData.append('Archivos', file, file.name);
    });

    this.apiService.postEnviarTramite(formData).subscribe({
      next: (response) => {
        this.isLoading = false
        this.tramitesElectronicosRecibidos = response.data;
        this.confirmationService.confirm({
          key: 'success',
          accept: () => {
            this.mostrarAddDocumentos.set(false);

            this.validarCausaForm.reset();
            this.documentosAnexados = [];
            this.causaValidada = null;
          },
          reject: () => {
            this.mostrarAddDocumentos.set(false);

            this.validarCausaForm.reset();
            this.documentosAnexados = [];
            this.causaValidada = null;
          }

        });
      },
      error: () => (this.isLoading = false),
    });
  }
}

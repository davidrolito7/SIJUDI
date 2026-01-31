import { Component } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';


interface EstatusExhortos {
    idEstatusExhorto: number;
    descripcion: string;
}
@Component({
  selector: 'app-ListaExhortosRecibidos',
   standalone: true,
  imports: [DatePickerModule, TableModule, InputTextModule, TagModule, SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule, ReactiveFormsModule,
     BreadcrumbModule, AvatarModule, InputMaskModule,FloatLabelModule],
  templateUrl: './lista-exhorto-recibido.html',
  styleUrl: './lista-exhorto-recibido.css',
 
    
})
export class ListaExhortosRecibidos {


    //* === FORMULARIOS ===
  validarExhortosRecibidos!: FormGroup;

  //* === LISTAS Y DATOS TEMPORALES ===
   exhortosRecibidos: [] = [];
   catEstatusExhortos: EstatusExhortos[] = [];
  


  constructor(
    private readonly fb: FormBuilder,
    //private apiService: ApiService,
    


  ) { }
  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  searchValue: string | undefined;
    // fechaInicial: Date | undefined;
    //   fechaFinal: Date | undefined;

  clearFecha() {

    this.validarExhortosRecibidos.get('fechaInicial')?.setValue('');
        this.validarExhortosRecibidos.get('fechaFinal')?.setValue('');

  }
  clear(table: Table) {
    // this.fechaInicial = undefined;
    // this.fechaFinal = undefined;

  }

  

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.cargarEstatus();

    this.validarExhortosRecibidos = this.fb.group({
      expOrigen: [''],
      idEstatusExhorto: [null, Validators.required],
      idPantalla: [1],
      fechaInicial:[],
      fechaFinal:[]
    });
  }

  onBuscarExhortosRecibidos() {
    
  }

  cargarEstatus() {
        this.catEstatusExhortos.push({
            idEstatusExhorto: 4,
            descripcion: "Pendiente de recibir",
        },
        {
            idEstatusExhorto: 5,
            descripcion: "Recibido",
        },
        {
            idEstatusExhorto: 6,
            descripcion: "En proceso de diligencia",
        },
        {
            idEstatusExhorto: 7,
            descripcion: "Acordado",
        },
        {
            idEstatusExhorto: 8,
            descripcion: "Respondido"},
        {
            idEstatusExhorto: 9,
            descripcion: "Incompetencia",
        }
    );
  }

}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Button } from "primeng/button";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { DatePicker } from "primeng/datepicker";
import { Select } from "primeng/select";
import { Avatar } from "primeng/avatar";
import { Breadcrumb } from "primeng/breadcrumb";

interface EstatusExhortos {
    idEstatusExhorto: number;
    descripcion: string;
}
@Component({
  selector: 'app-ListaExhortosEnviados',
  imports: [Button, TableModule, IconField, InputIcon, DatePicker, Select, Avatar, Breadcrumb,ReactiveFormsModule],
  templateUrl: './lista-exhorto-Enviado.html',
  styleUrl: './lista-exhorto-Enviado.css',
})
export class ListaExhortosEnviados {

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

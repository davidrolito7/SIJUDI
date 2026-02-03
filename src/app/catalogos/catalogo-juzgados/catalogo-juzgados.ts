import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Table, TableModule } from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {InputIconModule} from 'primeng/inputicon'
import { IconFieldModule } from 'primeng/iconfield';
import {CatalogoService} from '../services/catalogo.service';
import {AuthService} from '../../core/auth/service/auth.service';
import {CatJuzgado} from '../interface/catalogo.model';
import { Spinner } from '../../shared/components/spinner/spinner';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer';

@Component({
  standalone:true,
  selector: 'app-catalogo-juzgados',
  imports: [ToastModule,TableModule,ButtonModule,InputIconModule,IconFieldModule,Spinner, InputTextModule, TagModule, DrawerModule],
  templateUrl: './catalogo-juzgados.html',
  styleUrl: './catalogo-juzgados.css',
  providers:[MessageService]
})
export class CatalogoJuzgados {
  listaJuzgado: CatJuzgado[] = [];
  searchValue: string | undefined;
  isLoading: boolean = false;
  visibleDrawer: boolean = false;

  constructor(private catalogoService: CatalogoService, 
              private authService: AuthService,
              private messageService:MessageService,
              private cdr: ChangeDetectorRef){}

  ngOnInit(){
    this.CatalogoJuzgado();
  }
   CatalogoJuzgado(){
    this.isLoading=true;
    this.cdr.detectChanges();
    this.catalogoService.getCatalogoJuzgado().subscribe({
      next: (response:any) => {
        if(response.success)
        { //console.log('Datos recibidos del catálogo:', response);
          this.listaJuzgado = response.data;
          //console.log(this.listaJuzgado)
        }
        else
        {
          this.messageService.add({severity: 'error', summary: response.message, detail:response.errors})
        }
      },
      error:(e)=>
      {
        //console.error('Error al cargar el catálogo de materias', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el catálogo de Juzgados' });
      },
      complete:() =>{
        this.isLoading=false;
        this.cdr.detectChanges();
      }      
    });
  }
  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }
}

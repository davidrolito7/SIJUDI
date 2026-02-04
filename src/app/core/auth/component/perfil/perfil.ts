import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputMaskModule } from 'primeng/inputmask';

import { TokenService } from '../../service/token.service';
import { AuthService } from '../../service/auth.service';
import { areasResponse, responseCatalogoPerfiles } from '../../interface/login.interfaces';
import { MessageService } from 'primeng/api';
import { GenericResponse } from '../../../../shared/interface/shared.interface';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { Spinner } from "../../../../shared/components/spinner/spinner";



interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, SelectModule, ButtonModule, InputMaskModule, CheckboxModule, FormsModule, ToastModule, Spinner],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  providers: [MessageService]
})
export class Perfil {
  cities: City[] | undefined;
  selectedCity: City | undefined;
  idGeneral : number = 0;
  listaAreas!: areasResponse[];
  idAreaSistemaUsuario : number = 0;
  perfil: responseCatalogoPerfiles[] = [];
  //idAreaSistemaSeleccionada!: number;
  areaSeleccionada = signal<number>(0);
  perfilSeleccionado = signal<number>(0);
  perfilNombreSeleccionado =signal<string>('');
  recordar: boolean = false;
  isLoading:boolean=false;

  constructor(private router: Router, 
              private tokenService: TokenService, 
              private authService:AuthService, 
              private messageService : MessageService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
      const areaSeleccionada = Number(localStorage.getItem('areaSeleccionada'));
      const perfil = Number(localStorage.getItem('perfilSeleccionado'));
      const recordar = localStorage.getItem('recordarUsuario');
      //const perfilNombre =  localStorage.getItem('perfilSeleccionadoDesc');
      this.recordar = recordar === 'true' ? true : false;
  
      this.areaSeleccionada.set(areaSeleccionada || 0);
      this.perfilSeleccionado.set(perfil || 0);
     

    if(this.areaSeleccionada()!==0 && this.perfilSeleccionado()!==0){
        this.obtenerAreas(() => {
        this.obtenerPerfiles(areaSeleccionada);
      });
      
    }else{
      this.obtenerAreas();
    }
    
    
    
  }

onAreaChange(value: number) {
  this.areaSeleccionada.set(value);
  this.obtenerPerfiles(value);
}


obtenerAreas(callback?: () => void) {
const usuario = this.tokenService.getUserFromToken(); //localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
      if(usuario !== null){
        if (usuario.Usr) {
          //this.isLoading=true;
          //this.cdr.detectChanges;
          this.authService.obtenerDatosUsuario(usuario.Usr).subscribe({
            next: (response) => {
              if (response.success && response.data?.pD_Abogados?.length > 0) {
                const abogado = response.data.pD_Abogados[0];
    /*
                this.nombre = abogado.nombre;
                this.correo = abogado.correo;
                this.foto = abogado.foto;
                */
                this.idGeneral= abogado.idGeneral;
                this.cargarCatalogoAreas(4169)
                //if (callback) {
                //  callback();
                //}
              } else {
                //console.warn('No se encontraron datos de usuario en la API.');
              }
            },
            error: (error) => {
              //console.error('Error al obtener datos del usuario:', error);
              //this.isLoading=false;
              //this.cdr.detectChanges;
            },
            complete:()=>{
              //this.isLoading=false;
              //this.cdr.detectChanges;
            }
          });
        }
      }

}

cargarCatalogoAreas(idSistema: number): void {
  //this.isLoading=true;
  //this.cdr.detectChanges;
  this.authService.getAreas(idSistema, this.idGeneral).subscribe({
    next: (response) => {
      this.listaAreas = response.data as areasResponse[];

      const areaGuardada = Number(localStorage.getItem('areaSeleccionada'));

      if (
        areaGuardada &&
        this.listaAreas.some(a => a.idArea === areaGuardada)
      ) {
        this.areaSeleccionada.set(areaGuardada);
        //this.cdr.detectChanges();
      } else {
        this.areaSeleccionada.set(0);
        localStorage.setItem('areaSeleccionada', "0"); 
      }
    },
    error:(e)=>{
      //this.isLoading=false;
      //this.cdr.detectChanges;
    },
    complete:()=>{
      //this.isLoading=false;
      //this.cdr.detectChanges;
    }
  });
}


obtenerPerfiles(idAreaSistema: number){
  //this.isLoading=true;
  //this.cdr.detectChanges;
  this.areaSeleccionada.set(idAreaSistema);
  this.authService.obtenerIdAreaSistemaUsuario(this.idGeneral,4169,idAreaSistema).subscribe({
                next: (responseAreaSistemaUsuario) => {
                  const AreaSistemaUsuario = responseAreaSistemaUsuario.data.idAreaSistemaUsuario;
                  this.idAreaSistemaUsuario= AreaSistemaUsuario;
                  
                  localStorage.setItem('idAreaSistemaUsuario', AreaSistemaUsuario);
                  this.perfilSeleccionado.set(0);
                  this.cargarCatalogoPerfiles(); 
                },
                error: (error) => {
                  this.isLoading=false;
                  this.cdr.detectChanges;   
                },
                complete:()=>{
                  this.isLoading=false;
                  this.cdr.detectChanges;
                }
              });
}



 async cargarCatalogoPerfiles(): Promise<void>{
    //this.isLoading=true;
    //this.cdr.detectChanges;
    this.authService.GetPerfiles(this.idAreaSistemaUsuario).subscribe({
      next: (response: GenericResponse<responseCatalogoPerfiles[]>) => {
            const perfilGuardado = Number(localStorage.getItem('perfilSeleccionado'));
            this.perfil = response.data;
            if (perfilGuardado > 0 && this.perfil.some(p => p.idSistemaPerfil === perfilGuardado)) {
              this.perfilSeleccionado.set(perfilGuardado);
            } else {
              this.perfilSeleccionado.set(0);
                localStorage.setItem('perfilSeleccionado', "0"); 
            }

            this.cdr.detectChanges();
          },
      error: (error) => {
              this.messageService?.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar el catálogo de tipo de cuadernos'
              });
              this.isLoading=false;
              this.cdr.detectChanges;
            },
      complete:()=>{
        this.isLoading=false;
        this.cdr.detectChanges;
      }
    });
  }




  continuar(): void {

if (this.areaSeleccionada() <= 0 || this.perfilSeleccionado() <= 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Campos requeridos',
      detail: 'Debes seleccionar un área y un perfil'
    });
    return;
  }

  //obtenemos la descripcion del perfil
  const perfilSelec = this.perfil.find(f=>f.idSistemaPerfil === this.perfilSeleccionado());
  if(perfilSelec !== undefined)
    this.perfilNombreSeleccionado.set(perfilSelec.descripcion);

  if (this.recordar) {
    localStorage.setItem('recordarUsuario', 'true');
    localStorage.setItem('areaSeleccionada', this.areaSeleccionada().toString());
    localStorage.setItem('perfilSeleccionado', this.perfilSeleccionado().toString()); 
    localStorage.setItem('perfilSeleccionadoDesc',this.perfilNombreSeleccionado().toString());
    localStorage.setItem('idAreaSistemaUsuario',this.idAreaSistemaUsuario.toString());

    
    // Limpia sesión por seguridad
    sessionStorage.removeItem('areaSeleccionada');
    sessionStorage.removeItem('perfilSeleccionado');
    sessionStorage.removeItem('perfilSeleccionadoDesc');
    sessionStorage.removeItem('idAreaSistemaUsuario');

  } else {
    localStorage.setItem('recordarUsuario', 'false');

    sessionStorage.setItem('areaSeleccionada', this.areaSeleccionada().toString());
    sessionStorage.setItem('perfilSeleccionado', this.perfilSeleccionado().toString());
    sessionStorage.setItem('perfilSeleccionadoDesc',this.perfilNombreSeleccionado().toString());
    sessionStorage.setItem('idAreaSistemaUsuario',this.idAreaSistemaUsuario.toString())

    // Limpia localStorage para no dejar residuos
    localStorage.removeItem('areaSeleccionada');
    localStorage.removeItem('perfilSeleccionado');
    localStorage.removeItem('perfilSeleccionadoDesc');
    localStorage.removeItem('idAreaSistemaUsuario');
  }  

  this.messageService.add({
  severity: 'success',
  summary: 'Operación exitosa',
  detail: 'Área y perfil seleccionados correctamente'
});

    this.tokenService.setPerfilCompleted(true);
    this.router.navigate(['/tramites-juicio-oral'], { replaceUrl: true });
    return;
  }

  

}


function getUserFromToken() {
  throw new Error('Function not implemented.');
}


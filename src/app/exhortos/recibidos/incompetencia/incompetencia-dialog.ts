import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Dialog } from "primeng/dialog";
import {ButtonModule} from 'primeng/button';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { IncompetenciaRequest } from '../../interfaces/exhortos.model';
import { ExhortosService} from '../../services/exhorto.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incompetencia-dialog',
  imports: [Dialog,ButtonModule,ReactiveFormsModule],
  templateUrl: './incompetencia-dialog.html',
  styleUrl: './incompetencia-dialog.css',
})
export class IncompetenciaDialog {
  visible: boolean = false;
  idExhorto: number | undefined;

   incompetenciaForm =new FormGroup({
    justificacion: new FormControl('')
  });
  
  request!:IncompetenciaRequest;
  //@Input() idExhorto:number | undefined;
  
  constructor(
    private messageService: MessageService,
    private exhortosService: ExhortosService,
    private router: Router,
  ){}
  open(idexhorto: number | undefined) {
    this.visible = true;
    this.idExhorto= idexhorto;
  }

  close() {
    this.visible = false;
  }
  GuardarIncompetencia() {
    this.request = {
      idExhortoRecibido: this.idExhorto == undefined ? 0 : this.idExhorto,
      justificacion: this.incompetenciaForm.value.justificacion as string
    };

    this.exhortosService.setIncompetencia(this.request).subscribe({
      next:(response  =>{
          if(response.success){
            this.messageService.add({ severity: 'success', summary: 'Ok', detail: 'Operación guardada' })
            //this.aceptar.emit();
            this.visible=false;
          this.router.navigate(['/exhortos/lista-exhortos-recibidos']);
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message +'\n'+ response.errors });
          }
      }),
      error:(e =>{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e.message });
      }),
      complete:()=>{
        
      }
    });
    
    
  }

}

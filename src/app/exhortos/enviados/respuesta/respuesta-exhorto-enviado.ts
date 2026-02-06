import { Component, OnInit } from '@angular/core';
import { respuestExhortoEnviado } from '../../interfaces/exhortos.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ExhortosService } from '../../services/exhorto.service';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { downloadBase64 } from '../../../shared/functions/utils';

@Component({
  selector: 'app-respuesta',
  imports: [CommonModule],
  templateUrl: './respuesta-exhorto-enviado.html',
  styleUrl: './respuesta-exhorto-enviado.css',
})
export class Respuesta implements OnInit {
responseRespuestaExhortos: respuestExhortoEnviado | any;
  fileContent: SafeResourceUrl | undefined;
  visible: boolean = false;
  idExhortoEnviado: number | undefined;
  constructor(
    private exhortosService: ExhortosService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private messageService: MessageService,

  ){}

  ngOnInit(){
    const state = window.history.state as { idExhortoEnviado: number };

    //console.log('State recibido:', state);

    if (state && state.idExhortoEnviado) {
      this.idExhortoEnviado = state.idExhortoEnviado;
      this.getRespuestaExhortoEnviado(this.idExhortoEnviado);


    } else {
      // Si no hay state, redirigir a la lista de amparos
      this.router.navigate(['/inicio/exhortos-enviados']);
    }
  }

  getRespuestaExhortoEnviado(idExhortoEnviado: number){
    this.exhortosService.getRespuestaExhortoEnviado(idExhortoEnviado).subscribe({
      next: (responseRespuestaExhortos: GenericResponse<respuestExhortoEnviado>) =>{
        if(responseRespuestaExhortos.success){
          //console.log(responseRespuestaExhortos);
          this.responseRespuestaExhortos = responseRespuestaExhortos.data;
        }
        else{
          this.messageService.add({severity:'error',summary: responseRespuestaExhortos.message, detail:responseRespuestaExhortos.errors[0] });
        }
      },  
      error: (error) => {
        //console.error('Error al cargar las respuestas del exhorto enviado', error);
        this.messageService.add({severity:'error',summary: 'Error', detail:error.message});
      }
    });
  }

  mostrarArchivo(idArchivo: number, tipoDocumento: number): void {
    this.exhortosService.getFile(idArchivo, tipoDocumento).subscribe({
      next: (response) => {
        if(response.success){
          //console.log("recibe respuesta");
          const base64String = response.data.documento;
          const nombre= response.data.fileName;
                          const ext= nombre.split('.')[1];
                          downloadBase64(base64String, nombre,ext );

          //this.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${base64String}`);
          //this.visible = true;
        }else{
          this.messageService.add({severity:'error',summary: response.message, detail:response.errors});
        }
      },
      error: (error) => {
        //console.error('Error al recibir el archivo', error);
        this.messageService.add({severity:'error',summary: 'Error', detail:error.message});
      }
    });
  }

}


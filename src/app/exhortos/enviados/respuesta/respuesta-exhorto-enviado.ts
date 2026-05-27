import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { archivoExhortoEnviado, respuestExhortoEnviado } from '../../interfaces/exhortos.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ExhortosService } from '../../services/exhorto.service';
import { GenericResponse } from '../../../shared/interface/shared.interface';
import { base64ToFile, downloadBase64 } from '../../../shared/functions/utils';
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";

@Component({
  selector: 'app-RespuestaExhortoEnviado',
  imports: [CommonModule, TableModule, Button, PdfDialog],
  templateUrl: './respuesta-exhorto-enviado.html',
  styleUrl: './respuesta-exhorto-enviado.css',
  providers:[MessageService]
})
export class RespuestaExhortoEnviado implements OnInit {
responseRespuestaExhortos= signal<respuestExhortoEnviado | null>(null);
  fileContent: SafeResourceUrl | undefined;
  visible: boolean = false;
  idExhortoEnviado: number | undefined;
  constructor(
    private exhortosService: ExhortosService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private messageService: MessageService,
    private cd: ChangeDetectorRef,


  ){}
   isLoading: boolean = false;
  nombre = '';
  documentoUrl: SafeResourceUrl | null = null;
  mostrarDocumento = signal<boolean>(false);
  dialogData: any = {}; // Para almacenar la información del archivo del diálogo

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
          this.responseRespuestaExhortos.set(responseRespuestaExhortos.data);
          this.cd.detectChanges();
        }
        else{
          this.messageService.add({severity:'error',summary: responseRespuestaExhortos.message, detail:responseRespuestaExhortos.errors[0] });
          this.cd.detectChanges();
        }
      },  
      error: (error) => {
        //console.error('Error al cargar las respuestas del exhorto enviado', error);
        this.messageService.add({severity:'error',summary: 'Error', detail:error.message});
        this.cd.detectChanges();
      }
    });
  }
  onVerDocumento(fileBase64: string, nombre:string, mime:string): void {
      const file = base64ToFile(fileBase64,nombre, mime);
      if (file instanceof File) {
        const url = URL.createObjectURL(file);
        //this.nombre = file.name;
        this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.mostrarDocumento.set(true);
      } else {
        console.error('Documento inválido');
      } 
    } 
  //Llamada al servicio para obtener los Archivos base64 pdf
  mostrarArchivo(documento: archivoExhortoEnviado, tipoDocumento: number): void {
    const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
    this.isLoading=true;
    this.cd.detectChanges();
    this.exhortosService.getFile(documento.idArchivo, tipoDocumento).subscribe({
      next: (response) => {
        //console.log("recibe respuesta");
        const base64String = response.data.documento;
          if(documento.tamanio<= FIVE_MB && response.data.fileName.split('.')[1]==='pdf' )
              
              this.onVerDocumento(base64String,documento.nombreArchivo, 'application/pdf'); // se visualiza en modal
          else{
            const nombre= response.data.fileName;
            this.dialogData.fileName=nombre;
            const ext= nombre.split('.')[1];
            downloadBase64(base64String, nombre,ext );
          }

        //const nombre= response.data.fileName;
        //const ext= nombre.split('.')[1];

        //downloadBase64(base64String, nombre,ext );
        //this.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${base64String}`);
        //this.visible = true;
      },
      error: (error) => {
        //console.error('Error al recibir el archivo', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
          this.isLoading=false;
        this.cd.detectChanges();
      },
      complete:()=>{
        this.isLoading=false;
        this.cd.detectChanges();
      }
    });
  }
  

}


import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Toast } from "primeng/toast";
import { TableModule } from "primeng/table";
import { PromocionDocumentos, UI_PromocionResponse } from '../../interfaces/amparos.models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { Router } from '@angular/router';
import { AmparosService } from '../../services/amparo.service';
import { Button } from "primeng/button";
import { base64ToFile, downloadBase64 } from '../../../shared/functions/utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";

@Component({
  selector: 'app-RespuestaAmparoRecibido',
  imports: [Toast, TableModule, Breadcrub, Spinner, Button, PdfDialog, ConfirmDialog],
  templateUrl: './respuesta-amparo-recibido.html',
  styleUrl: './respuesta-amparo-recibido.css',
  providers:[MessageService, ConfirmationService]
})
export class RespuestaAmparoRecibido {
   expandedRows: { [key: number]: boolean } = {};
   detallesPromocion: UI_PromocionResponse[] = [];
   idNotificacion: number |0= 0;
   isLoading: boolean = false;

   nombre = '';
    documentoUrl: SafeResourceUrl | null = null;
    mostrarDocumento = signal<boolean>(false);
    dialogData: any = {}; // Para almacenar la información del archivo del diálogo

  constructor(private messageService: MessageService, 
    private router :Router,
    private amparosService: AmparosService,
    private cd: ChangeDetectorRef, 
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService, ) {}

  ngOnInit() {

    const state = window.history.state as { idNotificacion: number };

    if (state && state.idNotificacion) {
      this.idNotificacion = state.idNotificacion;
      this.cargarDetallesPromocion(this.idNotificacion); // Cargar los detalles de la notifiacion con el idNotificacion


    } else {
      // Si no hay state, redirigir a la lista de amparos
      //this.router.navigate(['/inicio/promocion']);
     
    }

  }
  cargarDetallesPromocion(idNotificacion: number): void {
    this.idNotificacion = idNotificacion; // Almacena el idNotificacion
    this.isLoading = true;
    this.cd.detectChanges();
    this.amparosService.getPromocionDetalles(idNotificacion).subscribe({
      next: (response) => {
        if(response.success){
          this.detallesPromocion = response.data;
          this.isLoading = false;
          this.cd.detectChanges();
          //this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.message });
        }
        else{
          //console.log(response.errors);
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
        }
      },
      error: (error) => {
        console.error('Error al cargar detalle de promoción', error);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }
  /*expandAll(){
    this.detallesPromocion.forEach(promocion => {
      this.expandedRows[promocion.idRespuesta] = true;
    });
  }
  collapseAll(){
    this.expandedRows = {};
  }*/
  toggleRow(promocion: any) {
  if (this.expandedRows[promocion.idRespuesta]) {
    delete this.expandedRows[promocion.idRespuesta];
  } else {
    this.expandedRows[promocion.idRespuesta] = true;
  }
}
/*
  onRowExpand(event: any): void {
    this.expandedRows[event.data.idRespuesta] = true;}
  onRowCollapse(event: any): void {
    delete this.expandedRows[event.data.idRespuesta];
  }*/
  redirectToPromocion(idNotificacion: number, idRespuesta: number): void {
    this.router.navigate(['/amparos/acuerdo'], {
      state: { idNotificacion, idRespuesta }
    });
  }
  enviarPromocion(idPromocion: number | undefined): void {
    // Aquí puedes implementar la lógica para enviar la promoción
    // Por ejemplo, podrías hacer una llamada a un servicio para enviar la promoción al backend
  }
  //Llamada al servicio para obtener los Archivos base64 pdf
  mostrarArchivo(documento: PromocionDocumentos): void {
    const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
    this.isLoading=true;
    this.cd.detectChanges();
    this.amparosService.getFilePromocion(documento.idArchivo).subscribe({
      next: (response) => {
        //console.log("recibe respuesta");
        if(response.success){
            const base64String = response.data.documento;
                    if(documento.longitud<= FIVE_MB && response.data.fileName.split('.')[1]==='pdf' )
                        
                        this.onVerDocumento(base64String,documento.nombreDocumento ?? 'documento', 'application/pdf'); // se visualiza en modal
                    else{
                      const nombre= response.data.fileName;
                      this.dialogData.fileName=nombre;
                      const ext= nombre.split('.')[1];
                      downloadBase64(base64String, nombre,ext );
                    }
        }
        else
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
      },
      error: (error) => {
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
  eliminarDocumento(documento: PromocionDocumentos) {
    //tipoDocumento=2 que son archivos de exhortos enviados
      this.confirmationService.confirm({
        key: 'eliminarArchivo',
        accept: () => this.onEliminarDocumento(documento),
        reject: () => { }
      });
    }
  
  onEliminarDocumento(documento: PromocionDocumentos) {
    // Llamada al servicio para eliminar el documento
    this.isLoading=true;
    this.cd.detectChanges();
    const tipoDocumento = 2; // Puedes cambiar este valor según sea necesario
    this.amparosService.eliminarArchivo(documento.idArchivo, tipoDocumento).subscribe({
      next: (response:any )=> {
        if (response.success) {
          // Encuentra el índice del documento que quieres eliminar
          const indexRespuesta = this.detallesPromocion.findIndex(resp => resp.idRespuesta === documento.idRespuesta);
          if(indexRespuesta !== -1){
            const indexDoc = this.detallesPromocion[indexRespuesta].archivos.findIndex(doc => doc.idArchivo === documento.idArchivo);
            if(indexDoc !== -1){
              this.detallesPromocion[indexRespuesta].archivos.splice(indexDoc, 1);
            }
          }
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento eliminado' });
        } else {
          this.messageService.add({ severity: 'error', summary: response.message, detail: response.errors });
        }
      },
      error:(error) => {
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

import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Toast } from "primeng/toast";
import { CommonModule} from '@angular/common';
import { detallesAmparoRecibida,documentos,verMovimientosResponse } from '../../interfaces/amparos.models';
import { TableModule } from "primeng/table";
import { Message } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { AmparosService } from '../../services/amparo.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Button } from "primeng/button";
import { Spinner } from "../../../shared/components/spinner/spinner";
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { Tag } from "primeng/tag";
import { base64ToFile, blobToBase64, downloadBase64, downloadFile } from '../../../shared/functions/utils';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";


@Component({
  selector: 'app-DetallesAmparoRecibido',
  imports: [Toast, CommonModule, TableModule, Button, Spinner, Breadcrub, Tag, PdfDialog],
  templateUrl: './detalles-amparo-recibido.html',
  styleUrl: './detalles-amparo-recibido.css',
  providers: [MessageService]
})
export class DetallesAmparoRecibido {
   //señales para controlar botones de turnos
    puedeRecibir = signal<boolean>(false);
    puedeTurnarRevocar = signal<boolean>(false);
    idNotificacion: number | undefined;
    isLoading: boolean = false;

    nombre = '';
    documentoUrl: SafeResourceUrl | null = null;
    mostrarDocumento = signal<boolean>(false);
    dialogData: any = {}; // Para almacenar la información del archivo del diálogo

    detallesNotificacion= signal<detallesAmparoRecibida | null>(null);
    movimientos = signal<verMovimientosResponse[]>([]);;

     expandedRows: { [key: number]: boolean } = {};
     constructor(
        private messageService: MessageService,
        private amparosService: AmparosService,
        //private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private router: Router,
        private cd: ChangeDetectorRef
        
    ) {}
    ngOnInit() {

        const state = window.history.state as { idNotificacion: number };

        //console.log('State recibido:', state);

        if (state && state.idNotificacion) {
            this.idNotificacion = state.idNotificacion;
            this.cargarDetallesNotificacion(this.idNotificacion);
            this.obtenerMovimientos(this.idNotificacion);

        } else {
            // Si no hay state, redirigir a la lista de amparos
            this.router.navigate(['/amparos/detalles-amparo-recibido']);
        }

    }
    recibir()
    {
        if(this.idNotificacion !== undefined)
        {
            this.isLoading=true;
            this.cd.detectChanges();
            this.amparosService.recibir(this.idNotificacion).subscribe({
                next:(response =>{
                        if(response.success){
                            if(response.data.resultado){
                                this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.data.msg, icon:'pi pi-check-circle' });
                                this.puedeTurnarRevocar.set(true); // una vez que recibe ya puede turnar, revocar o crear promocion
                            }
                            else{
                                this.messageService.add({ severity: 'warn', summary: 'Ok', detail: response.data.msg });
                            }
                        }
                }),
                error:(err => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
                    this.isLoading=false;
                    this.cd.detectChanges();
                }),
                complete:()=>{
                    //console.log('fin');
                    this.isLoading=false;
                    this.cd.detectChanges();
                }

            });
        }

    }
    turnar(){
        if(this.idNotificacion !== undefined)
        {
            this.isLoading=true;
            this.amparosService.Turnar(this.idNotificacion).subscribe({
                next:(response =>{
                    if(response.success){
                        if(response.data.resultado){
                            this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.data.msg, icon:'pi pi-check-circle' });
                            this.puedeRecibir.set(false);// si turna, ya no puede recibir
                            this.puedeTurnarRevocar.set(false);// tampoco puede turnar, revocar, crear
                        }
                        else{
                            this.messageService.add({ severity: 'warn', summary: 'Ok', detail: response.data.msg });
                        }
                    }
                }),
                error:(err=>{
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
                    this.isLoading=false;
                }),
                complete:()=>{
                    this.isLoading=false;
                }

            });
        }
    }
    revocar(){
        if(this.idNotificacion !== undefined)
        {
            this.isLoading=true;
            this.amparosService.revocar(this.idNotificacion).subscribe({
                next:(response=>{
                    if(response.success){
                        if(response.data.resultado){
                            this.messageService.add({ severity: 'success', summary: 'Ok', detail: response.data.msg, icon:'pi pi-check-circle' });
                            this.puedeRecibir.set(false);// si turna, ya no puede recibir
                            this.puedeTurnarRevocar.set(false);// tampoco puede turnar, revocar, crear
                        }
                        else{
                            this.messageService.add({ severity: 'warn', summary: 'Ok', detail: response.data.msg });
                        }
                    }
                }),
                error:(err=>{
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
                    this.isLoading=false;
                }),
                complete:()=>{
                    this.isLoading=false;
                }

            });
        }
    }
    //Metodo para navegar el componenete promocion que es donde se crean las promociones
    crearPromocion() { //Ya tenemos el idNotificacion alcenado, solo se lo pasamos al estado
        //console.log('Navegando a crear promoción con idNotificacion:', this.idNotificacion);
        this.router.navigate(['/inicio/amparos/detalle/promocion'], { state: { idNotificacion: this.idNotificacion } });
    }
    verDetallePromociones(){
      //console.log('Navegando a ver promociones con idNotificacion:', this.idNotificacion);
        this.router.navigate(['/amparos/respuesta-amparo-recibido'], { state: { idNotificacion: this.idNotificacion } });
    }
 
    onRowExpand(event: any): void {
        this.expandedRows[event.data.idActoReclamado] = true;
    }
    onRowCollapse(event: any): void {
        delete this.expandedRows[event.data.idActoReclamado];
    }
    showDialog(id: number){}
    //Llamada el servicio para obtener los detalles de la notifiacion
    cargarDetallesNotificacion(idNotificacion: number): void {
        this.isLoading=true;
        this.amparosService.getDetallesNotificacion(idNotificacion).subscribe({
            next: (response:any) => {
                if(response.success) {
                    //console.log('Datos recibidos:', response);
                    this.detallesNotificacion.set(response.data); // Almacena los datos recibidos en la variable
                    this.puedeRecibir.set(!this.detallesNotificacion()?.generales.recibido);
                    //Solo puede turnar si ya fue recibido
                    this.puedeTurnarRevocar.set(this.detallesNotificacion()?.generales?.recibido ?? false);
                }else{
                    this.messageService.add({severity: 'error', summary: response.message, detail:response.message})
                }
            },
            error:(e) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el detalle' });
                this.isLoading=false;
            },
            complete:()=>{
                this.isLoading=false;
            }
    });
    }
    obtenerMovimientos(idNotificacion: number) {
        this.amparosService.getMovimientos(idNotificacion).subscribe(
            (response) => {
                //console.log('Datos recibidos:', response);
                this.movimientos.set(response.data); // Almacena los datos recibidos en la variable
            },
            (error) => {
                console.error('Error al cargar detalle de notificación', error);
            }
        );
    }
    getTagConfig(estatus: string): { icon: string; severity: 'success' | 'warn' | 'info' | 'secondary' } {
    switch (estatus) {
      case 'Respondido':
        return { icon: 'pi pi-check', severity: 'success' };
      case 'Pendiente de enviar':
        return { icon: 'pi pi-exclamation-triangle', severity: 'warn' };
      case 'Enviado':
        return { icon: 'pi pi-send', severity: 'success' };
      default:
        return { icon: 'pi pi-info-circle', severity: 'info' };
    }
  }
  //Llamada al servicio para obtener los Archivos base64 pdf
    mostrarArchivo(documento: documentos): void {
      const FIVE_MB = 5 * 1024 * 1024; // menos a 5 megas se abren en modal... los mayores se descargan
      this.isLoading=true;
      this.cd.detectChanges();
      this.amparosService.getFileNotificacion(documento.idArchivo).subscribe({
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

}

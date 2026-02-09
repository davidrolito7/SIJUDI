import { Component } from '@angular/core';
import { PdfDialog } from "../../../shared/components/pdf-dialog/pdf-dialog";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";

@Component({
  selector: 'app-respuestaExhortoRecibido',
  imports: [PdfDialog, TableModule, Button],
  templateUrl: './respuesta-exhorto-recibido.html',
  styleUrl: './respuesta-exhorto-recibido.css',
})
export class RespuestaExhortoRecibido {

}

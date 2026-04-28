import { ChangeDetectorRef, Component } from '@angular/core';
import { Breadcrub } from '../breadcrub/breadcrub';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { usuario } from '../../interface/shared.interface';
import { TokenService } from '../../../core/auth/service/token.service';
import { PerfilUsuarioService } from '../../service/PerfilUsuarioService';
import { MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';
import { Spinner } from "../spinner/spinner";
 

@Component({
  selector: 'app-perfil-usuario',
  
  imports: [ReactiveFormsModule, FormsModule, ToastModule, Breadcrub, Button, ButtonModule, TabsModule, FileUploadModule, PasswordModule, TagModule, Spinner],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
  providers: [MessageService] 
})
export class PerfilUsuario {
constructor(
  private tokenService:TokenService,
  private fb: FormBuilder,
  private messageService: MessageService,
  private perfilUsuarioService:PerfilUsuarioService,
  private cd: ChangeDetectorRef,
) {}

 selectedTab: string = 'info'; // Pestaña activa
  usuario!: usuario;
  foto: string = '';
  formularioFirma !: FormGroup;
  archivoSeleccionado: File | null = null;
  errorMessage: string = '';
  isLoading = false;
  value: number = 0;

  ngOnInit(): void {
    this.formularioFirma = this.fb.group({
      password: ['', Validators.required],
      file_pfx: [null, Validators.required],
    });
    this.getDatosPerfil();
  }

  getDatosPerfil(){
    var data = this.tokenService.getUserFromToken();
    this.isLoading = true;
    this.cd.detectChanges();  
    
      // Aquí iría la lógica para enviar el archivo al backend
      this.perfilUsuarioService.getDatosPerfilUsuario(data.Usr ).subscribe({
            next: (response: any) => {
              if (response.success) {
                
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Información cargada.' });
              
              this.usuario = response.data.pD_Abogados[0];
              //this.foto = this.usuario.foto;
              
                
              } else {
                this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message });
                
                
              }
              this.isLoading = false;
              this.cd.detectChanges();
            },
            error: (error) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener la información.' });
              this.isLoading = false;
              this.cd.detectChanges();
              this.resetForm();
            }
          });
  }

  get fotoFinal(): string {
      return this.foto
        ? 'data:image/png;base64,' + this.foto
        : 'assets/img/perfilgenerico.png';
    }

    resetForm() {
    this.formularioFirma.reset();
    this.archivoSeleccionado = null;
    
  }
 onFileSelected(event: FileSelectEvent) {
  const file = event.files[0];
  if (file) {
    this.archivoSeleccionado = file;
    this.formularioFirma.patchValue({ file_pfx: file });
  }
}

   onUpload() {
    if (this.archivoSeleccionado && this.formularioFirma.valid) {
      var data = this.tokenService.getUserFromToken();
      const formData = new FormData();
      formData.append('idUsuario', data.idGeneral as string);
      formData.append('pfxFileContent', this.archivoSeleccionado, this.archivoSeleccionado.name);
      formData.append('password', this.formularioFirma.value.password as string);

      this.isLoading=true;
      this.cd.detectChanges();
      // Aquí iría la lógica para enviar el archivo al backend
      this.perfilUsuarioService.guardarDocumentoPfx(formData).subscribe({
            next: (response: any) => {
              if (response.success) {
                
                
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento .pfx guardado exitosamente' });
              this.resetForm();  
                
              } else {
                this.messageService.add({ severity: 'warn', summary: 'Error', detail: response.message,sticky:true}); //life: 8000 // tiempo en milisegundos (8 segundos)

                
                
              }
              this.isLoading = false;
              this.cd.detectChanges();
            },
            error: (error) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el documento (.pfx)' ,life: 10000});
              this.isLoading = false;
              this.cd.detectChanges();
              this.resetForm();
            }
          });
    }
    else{
        if(!this.archivoSeleccionado){
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Selecciona un archivo .PFX' });
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ingresa la contraseña' });
        }
        
        this.isLoading = false;
    }
  }

  onFileClear() {
  this.archivoSeleccionado = null;
  this.formularioFirma.patchValue({ file_pfx: null });
}
}

import { ChangeDetectorRef, Component } from '@angular/core';
import { Header } from '../header/header';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { usuario, datosFirma } from '../../interface/shared.interface';
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
import { JsonPipe } from '@angular/common';
 import { of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { UsrProfile } from '../../../core/auth/interface/login.interfaces';

@Component({
  selector: 'app-perfil-usuario',

  imports: [ DatePipe, ReactiveFormsModule, FormsModule, ToastModule, Header, Button, ButtonModule, TabsModule, FileUploadModule, PasswordModule, TagModule, Spinner],
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
  mS_UserProfile !: UsrProfile;
  datosFirma!: datosFirma;
  pfxVigencia: boolean = false;
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
/*
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

                  //Obtenemos la informacion del pfx
                  this.perfilUsuarioService.getDatosInformacionPFX().subscribe({
                    next: (response: any) => {
                      if (response.success) {
                        this.datosFirma = response.data;
                          console.log(this.datosFirma.nombre);
                      }
                    }
                  });

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
  }*/

 getDatosPerfil() {
  const data = this.tokenService.getUserFromToken();

  this.isLoading = true;
  this.cd.detectChanges();

  this.perfilUsuarioService.getDatosPerfilUsuario(data.idGeneral)
    .pipe(
      switchMap((response: any) => {
        if (!response.success) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Error',
            detail: response.message
          });

          return of(null);
        }

        this.usuario = response.data.pD_Abogados[0];
       this.mS_UserProfile = response.data.mS_UserProfile[0];
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Información cargada.'
        });

        // Se espera a que este servicio termine antes de quitar el loading
        return this.perfilUsuarioService.getDatosInformacionPFX();
      }),
      finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      })
    )
    .subscribe({
      next: (responsePfx: any) => {
        if (!responsePfx) {
          return;
        }

        if (responsePfx.success) {
          this.datosFirma = responsePfx.data;
          console.log(this.datosFirma.nombre);

          const fechaActual = new Date();
          const fechaVigencia = new Date(this.datosFirma.pfxVigencia);

          const diferenciaMs = fechaVigencia.getTime() - fechaActual.getTime();
          const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

          if (diasRestantes <= 15 && diasRestantes >= 0) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Firma próxima a vencer',
              detail: `Tu certificado PFX vence en ${diasRestantes} día(s).`,
              sticky: true
            });
          }

          if (diasRestantes < 0) {
            this.messageService.add({
              severity: 'error',
              summary: 'Firma vencida',
              detail: 'Tu certificado PFX ya se encuentra vencido.',
              sticky: true
            });
          }

        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Error',
            detail: responsePfx.message
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener la información.',
          sticky: true
        });

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
                this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message,sticky:true}); //life: 8000 // tiempo en milisegundos (8 segundos)



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



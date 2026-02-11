import { Component, HostListener, OnInit } from '@angular/core';
import { AnexosDelcaradosRequest, CatMateria, CatMunicipios, CatSexos, CatTipoDocumento, CatTipoPartes, CatTipoVia, CatVia, DatosUsuarioResponse, DocumentosRequest, PartesRequest } from '../../interfaces/juicioenlinea.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { JuicioService } from '../../services/juicioenlinea.service';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
@Component({
  selector: 'app-crear-demanda',
 imports: [CommonModule, FormsModule, ToastModule, SelectModule, DialogModule, ButtonModule,
    InputTextModule, ConfirmDialogModule, ReactiveFormsModule, MultiSelectModule, TextareaModule, InputNumberModule, ToggleSwitchModule, FileUploadModule, RadioButtonModule],
  templateUrl: './crear-demanda.html',
  styleUrl: './crear-demanda.css',
})
export class CrearDemanda {
  //* === DATOS DEL USUARIO Y CATÁLOGOS ===
  usrData: DatosUsuarioResponse | null = null;
  catMaterias: CatMateria[] = [];
  catTipoVias: CatTipoVia[] = [];
  catTipoDocumentos: CatTipoDocumento[] = [];
  catSexos: CatSexos[] = [];
  catTipoPartes: CatTipoPartes[] = [];
  catMunicipios: CatMunicipios[] = [];

  //* === FORMULARIOS ===
  formulario!: FormGroup;
  parteForm!: FormGroup;
  declaracionAnexoForm!: FormGroup;
  anexoForm!: FormGroup;
  buscarUsr!: FormGroup;
  firmaForm!: FormGroup;

  //* === LISTAS Y DATOS TEMPORALES ===
  listaPartes: PartesRequest[] = [];
  listaAnexos: DocumentosRequest[] = [];
  anexosDeclarados: AnexosDelcaradosRequest[] = [];

  //* === ESTADOS DE UI Y MODALES ===
  visible: boolean = false;
  visibleListAnexo: boolean = false;
  visibleAnexo: boolean = false;
  visibleDocumento: boolean = false;
  isLoading: boolean = false;
  documentoUrl: SafeResourceUrl | null = null;
  nombre = '';
  visibleFirma: boolean = false;

  //* === FLAGS Y VARIABLES DE CONTROL ===
  formEnviado: boolean = false;
  filtroParte: 'busqueda' | 'manual' = 'busqueda';
  editandoParte: boolean = false;
  indiceParteEditando: number = -1;

  mostrarCampoValor: boolean = false; // Nueva propiedad para controlar la visibilidad del campo "valor"
  mostrarInputNombre: boolean = false; // Input de "otro" en catálogo tipo documento

  folio: string | null = null;
  tipoBusqueda: string | null = null;
  firmaVerificada: boolean = false;
  showPassword = false;


  constructor(
  //  private readonly flowbiteService: FlowbiteService,
    private readonly fb: FormBuilder,
    private readonly confirmationService: ConfirmationService,
    private readonly sanitizer: DomSanitizer,
    private juicioService: JuicioService,
    private router: Router,
    private messageService: MessageService,

  ) {

  }

  ngOnInit(): void {
    //this.cargarLocalStorage();
  //  this.flowbiteService.loadFlowbite(() => initFlowbite());
    this.cargarCatalogoMunicipios(); // cat
    this.cargarCatalogoMaterias(); // cat
    this.cargarCatTipoDocumento(); // cat
    this.cargarCatalogoSexos(); // cat
    this.cargarCatalogoTipoPartes(); // cat
    // this.startTutorial();

    this.formulario = this.fb.group({
      // folioPreregistro: ['00010/2025', Validators.required],
      // idCatMunicipio: [null, Validators.required],
      idCatMateria: [null, Validators.required],
      idCatTipoVia: [{ value: null, disabled: true }, Validators.required],
      descripcionDemanda: ['', [Validators.required, Validators.maxLength(250)]],
      //observaciones: ['', [Validators.required, Validators.maxLength(250)]],
      // partes: this.fb.array([]),
      // documentos: this.fb.array([]),
      // archivoPfx_Efirma: ['', Validators.required],
      // password_Efirma: ['', Validators.required]
    });

    this.parteForm = this.fb.group({
      idUsr: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoPaterno: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoMaterno: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(250)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(250)]],
      correoAlterno: ['', [Validators.email, Validators.maxLength(250)]],
      esMenorEdad: [false], // valor por defecto: false (no menor de edad)
      idCatSexo: [null, Validators.required],
      idCatTipoParte: [null, Validators.required],
    }, { validators: this.correosDiferentesValidator.bind(this) });

    this.declaracionAnexoForm = this.fb.group({
      idCatTipoDocumento: [null, Validators.required],
      descripcion: [''], // se vuelve requerido solo si es "Otro"
      cantidad: [1, [Validators.required, Validators.min(1)]],
      esValor: [false],
      valor: [null] // <-- necesitas este control si lo vas a usar en el modal

    });
    this.anexoForm = this.fb.group({
      nombre: [''],
      documento: ['', Validators.required],
      //  valor: [null],
      // idCatTipoDocumento: [null, Validators.required],
      firmaDigital: [0]
    });

    this.buscarUsr = this.fb.group({
      tipoBusqueda: [null, Validators.required],
      curp: ['', [Validators.required, Validators.maxLength(18)]],
      usuario: [null, [Validators.required, Validators.maxLength(20)]],
    });

    this.firmaForm = this.fb.group({
      password_Efirma: ['', [Validators.required, Validators.maxLength(50)]],
    });

    const alerta = history.state.alerta;
    if (alerta) {
      this.messageService.add(alerta)
    }

    //!console.log('Alerta en estado:', history.state);

    this.formulario.get('idCatMateria')?.valueChanges.subscribe(val => {
      const viaCtrl = this.formulario.get('idCatTipoVia');
      if (!val) {
        viaCtrl?.disable({ emitEvent: false });
        viaCtrl?.setValue(null, { emitEvent: false });
        this.catTipoVias = [];
      } else {
        viaCtrl?.setValue(null, { emitEvent: false });
        viaCtrl?.disable({ emitEvent: false }); // Mantén deshabilitado hasta que llegue el response
        this.catTipoVias = [];
      }
    });

    this.declaracionAnexoForm.get('idCatTipoDocumento')?.valueChanges.subscribe((val) => {
      const selectedValue = Number(val);

      // === DESCRIPCION (último = Otro) ===
      const ultimo = this.catTipoDocumentos?.[this.catTipoDocumentos.length - 1];
      const esOtro = !!ultimo && selectedValue === Number(ultimo.idCatTipoDocumento);

      this.mostrarInputNombre = esOtro;

      const descCtrl = this.declaracionAnexoForm.get('descripcion');

      if (esOtro) {
        descCtrl?.setValidators([Validators.required, Validators.maxLength(200)]);
        this.declaracionAnexoForm.patchValue({ descripcion: '' }, { emitEvent: false });
      } else {
        descCtrl?.clearValidators();
        const tipoSel = this.catTipoDocumentos.find(t => Number(t.idCatTipoDocumento) === selectedValue);
        this.declaracionAnexoForm.patchValue({ descripcion: tipoSel ? tipoSel.descripcion : '' }, { emitEvent: false });
      }

      descCtrl?.updateValueAndValidity({ emitEvent: false });
    });

    this.declaracionAnexoForm.get('esValor')?.valueChanges.subscribe((on: boolean) => {
      const valorCtrl = this.declaracionAnexoForm.get('valor');
      if (!valorCtrl) return;

      if (on) {
        valorCtrl.setValidators([Validators.required]);
      } else {
        valorCtrl.clearValidators();
        valorCtrl.reset(null, { emitEvent: false });  // limpia el valor
        valorCtrl.markAsPristine();                  // quita dirty
        valorCtrl.markAsUntouched();
      }

      valorCtrl?.updateValueAndValidity({ emitEvent: false });
    });

  }
  // Listener para el evento beforeunload
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: Event): void {
    if (this.formulario.dirty) {
      // Muestra el mensaje de confirmación nativo del navegador
      event.preventDefault();
      (event as BeforeUnloadEvent).returnValue = 'Si realizas esta acción, los cambios se perderán.';
    }
  }
  // Método para actualizar validadores
  actualizarValidadores() {
    if (this.filtroParte === 'manual') {
      this.parteForm.get('nombre')?.setValidators([Validators.required, Validators.maxLength(100)]);
      this.parteForm.get('apellidoPaterno')?.setValidators([Validators.required]);
      this.parteForm.get('apellidoMaterno')?.setValidators([Validators.required]);
      this.parteForm.reset();
    } else {
      this.parteForm.get('nombre')?.setValidators([Validators.required, Validators.maxLength(90)]);
      this.parteForm.get('apellidoPaterno')?.clearValidators();
      this.parteForm.get('apellidoMaterno')?.clearValidators();
      this.parteForm.get('apellidoPaterno')?.setValue('');
      this.parteForm.get('apellidoMaterno')?.setValue('');
      this.parteForm.reset();
      this.buscarUsr.reset();
    }
    this.parteForm.get('nombre')?.updateValueAndValidity();
    this.parteForm.get('apellidoPaterno')?.updateValueAndValidity();
    this.parteForm.get('apellidoMaterno')?.updateValueAndValidity();
  }


  // get partes(): FormArray {
  //   return this.formulario.get('partes') as FormArray;
  // }

  // get documentos(): FormArray {
  //   return this.formulario.get('documentos') as FormArray;
  // }

  onTipoBusquedaChange() {
    this.tipoBusqueda = this.buscarUsr.get('tipoBusqueda')?.value;
    this.buscarUsr.get('usuario')?.setValue('');
    this.buscarUsr.clearValidators();
  }

  getPlaceholder() {
    switch (this.tipoBusqueda) {
      case "2": return '00000/2025';
      case "1": return 'ID General';
      case "3": return 'Código de llave';
      case "4": return 'Número de empleado';
      default: return '';
    }
  }

  aplicarMascaraBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    if (this.tipoBusqueda === "2") {
      // Solo números y agrega slash después de 5 dígitos
      valor = valor.replace(/\D/g, '').slice(0, 9);
      if (valor.length > 5) {
        valor = valor.slice(0, 5) + '/' + valor.slice(5, 9);
      }
    } else if (this.tipoBusqueda === "1" || this.tipoBusqueda === "4") {
      // Solo números
      valor = valor.replace(/\D/g, '');
    } else if (this.tipoBusqueda === "3") {
      // Solo alfanumérico, máximo 8
      valor = valor.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    }

    this.buscarUsr.get('usuario')?.setValue(valor, { emitEvent: false });
  }

  onBuscarUsuario() {
    this.parteForm.reset();
    this.isLoading = true; // Activa el spinner
    const datosParte = this.buscarUsr.value;

    const request = {
      usuario: datosParte.usuario,
      curp: datosParte.curp,
      tipoBusqueda: datosParte.tipoBusqueda
    };

    this.juicioService.getDatosUsuario(request).subscribe({
      next: (response) => {
        this.isLoading = false; // Desactiva el spinner al recibir respuesta
        if (response && response.success) {
          this.usrData = response.data;
          this.parteForm.patchValue({
            idUsr: this.usrData.idUsr,
            nombre: this.usrData.nombre,
            correo: this.usrData.correo,
            correoAlterno: this.usrData.correoAlterno,
            direccion: this.usrData.direccion
          });
          this.messageService.add({ severity: 'success', summary: 'Datos encontrados', detail: "Verifique si los datos son correctos" });

        } else {
          this.messageService.add({ severity: 'info', summary: 'Verifique la información', detail: response.message });
        }
      },
      error: (error) => {
        this.isLoading = false; // Desactiva el spinner si hay error
        this.messageService.add({ severity: 'warn', summary: 'Ocurrió un error inesperado', detail: "Intente mas tarde" });

        // No muestra mensaje para otros errores
        console.error('Error al obtener los datos del usuario:', error);
      }
    });

  }

  onVerificarFirma() {
    this.isLoading = true;
    const values = this.firmaForm.value;
    const request = {
      password_Efirma: values.password_Efirma
    };

    this.juicioService.verificarFirma(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.visibleFirma = false;
        if (response && response.success) {
          this.firmaVerificada = true;
          this.messageService.add({ severity: 'success', summary: 'Firma verificada', detail: 'La firma digital es válida.' });

        } else {
          this.messageService.add({ severity: 'info', summary: 'Lo sentimos', detail: response?.message });
          this.resetFirmaForm();

        }
      },
      error: (error) => {
        this.isLoading = false;
        this.visibleFirma = false;
        this.resetFirmaForm();

      }
    });
  }

  resetFirmaForm() {
    this.firmaForm.reset();
    this.visibleFirma = false;

    // Restablece manualmente el campo de archivo
    const fileInput = document.getElementById('firma') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  agregarParte() {
    this.formEnviado = true;

    if (this.parteForm.invalid) {
      this.parteForm.markAllAsTouched();
      return;
    }

    const valores = this.parteForm.getRawValue();

    const nuevaParte: PartesRequest = {
      ...valores,
      idUsr: valores.idUsr?.toString().trim() || null,
      nombre: (valores.nombre ?? '').toUpperCase(),
      apellidoPaterno: (valores.apellidoPaterno ?? '').toUpperCase(),
      apellidoMaterno: (valores.apellidoMaterno ?? '').toUpperCase(),
      direccion: (valores.direccion ?? '').toUpperCase(),
      correo: (valores.correo ?? '').toUpperCase(),
      correoAlterno: (valores.correoAlterno ?? '').toUpperCase(),
      filtroParte: this.filtroParte,
    };

    // Validación para evitar duplicados por idUsr
    if (
      nuevaParte.idUsr &&
      this.listaPartes.some((p: PartesRequest, idx: number) =>
        p.idUsr === nuevaParte.idUsr && idx !== this.indiceParteEditando
      )
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Usuario duplicado',
        detail: 'Este usuario ya fue agregado como parte.'
      });

      this.formEnviado = false;

      //this.parteForm.markAsPristine();
      this.parteForm.markAsUntouched();
      this.parteForm.updateValueAndValidity({ emitEvent: false });

      return;
    }

    const tipoParteSeleccionada = this.catTipoPartes.find(
      (tipo) => tipo.idCatTipoParte === Number(nuevaParte.idCatTipoParte)
    );
    if (tipoParteSeleccionada) {
      nuevaParte.descripcionTipoParte = tipoParteSeleccionada.descripcion;
    }

    if (this.editandoParte) {
      this.listaPartes[this.indiceParteEditando] = { ...nuevaParte };
      this.editandoParte = false;
      this.indiceParteEditando = -1;
    } else {
      this.listaPartes.push({ ...nuevaParte });
      console.log('Parte agregada:', this.listaPartes);
    }

    //  this.sincronizarFormArrayPartes();
    this.visible = false;
    this.parteForm.reset();
    this.formEnviado = false;
    //this.formulario.get('partes')?.updateValueAndValidity();
    this.resetAnexoForm();
  }

  editarParte(index: number) {
    this.editandoParte = true;
    this.indiceParteEditando = index;

    const parte = this.listaPartes[index];
    // Asigna el filtro según cómo fue creada la parte
    this.filtroParte = parte.filtroParte || (
      (!parte.apellidoPaterno && !parte.apellidoMaterno) ? 'busqueda' : 'manual'
    );
    this.buscarUsr.reset(); // Limpia el formulario de búsqueda de usuario
    this.actualizarValidadores(); // Asegura validadores correctos
    this.parteForm.patchValue(parte);
    this.visible = true;

    this.resetAnexoForm(); // Resetea el formulario de anexos
  }

  eliminarParte(index: number) {
    this.listaPartes.splice(index, 1);
    //  this.sincronizarFormArrayPartes();
    // Notifica al formulario que se ha actualizado el array de partes
    //  this.formulario.get('partes')?.updateValueAndValidity();

  }

  resetParteForm() {
    this.buscarUsr.reset(); // Limpia el formulario de búsqueda de usuario
    this.parteForm.reset(); // Limpia el formulario de partes
    this.visible = false;   // Cierra el modal de partes
    this.formEnviado = false; // Resetea el estado de envío
  }

  agregarListAnexo() {
    if (this.declaracionAnexoForm.invalid) {
      this.declaracionAnexoForm.markAllAsTouched();
      return;
    }
  
    const raw = this.declaracionAnexoForm.getRawValue();
    const id = Number(raw.idCatTipoDocumento);
  
    const cantidadNueva = Number(raw.cantidad ?? 0);
    const valorNuevo = raw.valor != null && raw.valor !== '' ? Number(raw.valor) : undefined;
    const descripcionNueva = (raw.descripcion ?? '').toString().trim();
  
    // Regla:
    //  Si trae "valor" => siempre agregar como nuevo
    //  Si NO trae "valor" => evitar duplicado por id, sumando cantidad
    if (valorNuevo === undefined) {
      const idxExistente = this.anexosDeclarados.findIndex(a =>
        Number(a.idCatTipoDocumento) === id && (a.valor == null)
      );
  
      if (idxExistente !== -1) {
        this.anexosDeclarados[idxExistente] = {
          ...this.anexosDeclarados[idxExistente],
          cantidad: Number(this.anexosDeclarados[idxExistente].cantidad ?? 0) + cantidadNueva,
          // si la descripción existente está vacía, toma la nueva
          descripcion: (this.anexosDeclarados[idxExistente].descripcion ?? '').toString().trim() || descripcionNueva
        };
  
        this.resetDeclaracionAnexoForm();
        return;
      }
    }
  
    // Si trae valor insertar nuevo
    this.anexosDeclarados.push({
      idCatTipoDocumento: id,
      descripcion: descripcionNueva,
      cantidad: cantidadNueva,
      valor: valorNuevo
    });
  
    this.resetDeclaracionAnexoForm();
  }
  // ...existing code...
  // agregarAnexo() {
  //   if (this.anexoForm.invalid) {
  //     this.anexoForm.markAllAsTouched();
  //     return;
  //   }

  //   const anexo = this.anexoForm.getRawValue();

  //   if (!(anexo.documento instanceof File)) {
  //     this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Debes seleccionar un archivo.' });
  //     return;
  //   }

  //   const nuevoAnexo: DocumentosRequest = {
  //     ...anexo,
  //     //  idCatTipoDocumento: Number(anexo.idCatTipoDocumento),
  //     // valor: anexo.valor != null ? Number(anexo.valor) : null,
  //     firmaDigital: Number(anexo.firmaDigital),
  //     documento: anexo.documento
  //   };

  //   this.listaAnexos.push(nuevoAnexo);



  //   this.resetAnexoForm();
  // }

  onToggleFirmaDigital(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.anexoForm.patchValue({ firmaDigital: checked ? 1 : 0 });
  }

  onToggleMenorEdad(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.parteForm.patchValue({ esMenorEdad: checked });
  }

  resetAnexoForm() {
    this.anexoForm.reset(); // Reinicia el formulario

    this.mostrarInputNombre = false; // Oculta el campo de texto personalizado
    this.mostrarCampoValor = false;  // Oculta el campo de "valor"

    // Limpia validadores del campo "valor"
    const valorCtrl = this.anexoForm.get('valor');
    valorCtrl?.clearValidators();
    valorCtrl?.updateValueAndValidity();

    this.visibleAnexo = false; // Cierra el modal

    // Restablece manualmente el campo de archivo
    const fileInput = document.getElementById('documento') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Restablece el valor del campo de archivo
    }
  }

  resetDeclaracionAnexoForm() {
    this.declaracionAnexoForm.reset({
      cantidad: 1,     // <- vuelve al default
    });
    this.visibleListAnexo = false;
  }

  eliminarAnexoDeclarado(index: number) {
    this.anexosDeclarados.splice(index, 1);
    //    this.sincronizarFormArrayDocumentos(); // <-- sincroniza el FormArray

    // Notifica al formulario que se ha actualizado el array de documentos
    //this.formulario.get('documentos')?.updateValueAndValidity();

  }
  eliminarAnexo(index: number) {
    this.listaAnexos.splice(index, 1);
    //    this.sincronizarFormArrayDocumentos(); // <-- sincroniza el FormArray

    // Notifica al formulario que se ha actualizado el array de documentos
    //this.formulario.get('documentos')?.updateValueAndValidity();

  }

  onAnexosSelect(event: any): void {
    const files: File[] = event?.files ?? event?.currentFiles ?? [];

    if (!files.length) return;

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const nuevoAnexo: DocumentosRequest = {
        nombre: file.name,
        documento: file,
        firmaDigital: 0,   // pendiente
        peso: file.size
      };

      console.log('Archivo seleccionado:', nuevoAnexo);
      this.listaAnexos.push(nuevoAnexo);
    }

    // limpia el selector para poder volver a elegir el mismo archivo si hace falta
    //this.fu?.clear();

    // opcional: cerrar modal al seleccionar
    this.visibleAnexo = false;
  }

  onFirmaDigitalChange(index: number, checked: boolean): void {
    if (index < 0 || index >= this.listaAnexos.length) return;
    this.listaAnexos[index].firmaDigital = checked ? 1 : 0;
    console.log('Cambio firmaDigital en índice', index, 'a', this.listaAnexos);
  }
  verDocumento(anexo: DocumentosRequest): void {
    if (anexo?.documento instanceof File) {
      const url = URL.createObjectURL(anexo.documento);
      this.nombre = anexo.nombre;
      this.documentoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.visibleDocumento = true;
    } else {
      console.error('Documento inválido');
    }
  }

  showDialog() {
    this.buscarUsr.reset();
    this.editandoParte = false;
    this.visible = true;
    this.formEnviado = false; // <-- reset para el siguiente uso
    this.actualizarValidadores(); // <-- ¡Agrega esto!

  }

  showModalAnexo() {
    this.visibleAnexo = true;
  }
  showModalListAnexo() {
    this.visibleListAnexo = true;
  }
  confirm1(event: Event, index: number) {
    this.confirmationService.confirm({
      key: 'parte',
      target: event.target as EventTarget,
      accept: () => this.eliminarParte(index),
      reject: () => { }
    });
  }

  confirm2(event: Event, index: number) {
    this.confirmationService.confirm({
      key: 'anexo',
      target: event.target as EventTarget,
      message: '¿Está seguro de eliminar este documento?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.eliminarAnexo(index),
      reject: () => { }
    });
  }
  confirm3(event: Event, index: number) {
    this.confirmationService.confirm({
      key: 'declarado',
      target: event.target as EventTarget,
      accept: () => this.eliminarAnexoDeclarado(index),
      reject: () => { }
    });
  }

  autorizarFirel(event: Event) {
    this.confirmationService.confirm({
      key: 'firma',
      target: event.target as EventTarget,
      accept: () => this.onVerificarFirma(),
      reject: () => { }
    });
  }

  enviarDemanda(event: Event) {
    this.confirmationService.confirm({
      key: 'demanda',
      target: event.target as EventTarget,
      accept: () => this.enviarFormulario(),
      reject: () => { }
    });
  }

  enviarFormulario() {
    this.isLoading = true; // Activa el spinner

    const formValue = this.formulario.getRawValue();
    const data = {
      ...formValue,
      descripcionDemanda: formValue.descripcionDemanda ? formValue.descripcionDemanda.toUpperCase() : '',
      partes: this.listaPartes,
      anexosDeclarados: this.anexosDeclarados,
      documentos: this.listaAnexos
    };

    const formData = new FormData();

    formData.append('password_Efirma', this.firmaForm.value.password_Efirma);
    console.log('data a enviar:', data);
    console.log('Datos a enviar:', data);
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        if (key === 'partes') {
          data[key].forEach((parte, index) => {
            const { descripcionTipoParte, ...parteSinDescripcion } = parte;
            Object.keys(parteSinDescripcion).forEach(subKey => {
              // Si el campo es apellidoPaterno, apellidoMaterno o idUsr y está vacío, NO lo envíes
              if (
                (
                  subKey === 'apellidoPaterno' ||
                  subKey === 'apellidoMaterno' ||
                  subKey === 'idUsr'
                ) &&
                (!parteSinDescripcion[subKey] || parteSinDescripcion[subKey].toString().trim() === '')
              ) {
                // No hacer append, omitir el campo
                return;
              }
              formData.append(`partes[${index}][${subKey}]`, parteSinDescripcion[subKey]);
            });
          });
        }
        if (key === 'documentos') {
          data[key].forEach((documento, index) => {
            Object.keys(documento).forEach(subKey => {
              if (subKey === 'documento' && documento[subKey] instanceof File) {
                formData.append(`documentos[${index}][${subKey}]`, documento[subKey]);
              } else if (subKey !== 'documento') {
                formData.append(`documentos[${index}][${subKey}]`, documento[subKey] ?? '');
              }
            });
          });
        }
        if (key === 'anexosDeclarados') {
          (data as any)[key].forEach((anexo: any, index: number) => {
            Object.keys(anexo).forEach(subKey => {
              formData.append(`anexosDeclarados[${index}][${subKey}]`, anexo[subKey] ?? '');
            });
          });
        }
      } else {
        formData.append(key, data[key]);
      }
    });
    console.log('Datos a enviar:', formData);

    this.juicioService.crearInicio(formData).subscribe({
      next: (respuesta) => {
        this.isLoading = false; // Desactiva el spinner al recibir respuesta
        if (respuesta && respuesta.success) {
          this.folio = respuesta.data.folio;
          const idPreregistro = respuesta.data.idPreregistro;
          this.confirmationService.confirm({
            key: 'success',
            accept: () => {
              this.detalle(idPreregistro);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false; // Desactiva el spinner si hay error
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: "Ocurrió un error" });
      }
    });
  }

  detalle(idInicio: number) {
    console.log('Navegando a detalle:', idInicio);
    this.router.navigate(['/demandas/detalle'], { state: { idInicio } });
  }

  getError(controlName: string, form: FormGroup = this.parteForm): string {
    const control = form.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    } else if (control?.hasError('pattern')) {
      return 'Formato inválido';
    } else if (control?.hasError('maxlength')) {
      return 'Se excedió el número máximo de caracteres';
    }

    return '';
  }
  shouldShowError(controlName: string, form: FormGroup = this.parteForm): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched || this.formEnviado) : false;
  }

  cargarCatalogoMaterias() {
    this.juicioService.getCatalogoMaterias().subscribe({
      next: (materias) => {
        this.catMaterias = materias;
      },
      error: (error) => {
        console.error('Error al cargar el catálogo de materias:', error);
      }
    });
  }

  cargarCatalogoVias(idCatMateria: number | null) {
    const viaCtrl = this.formulario.get('idCatTipoVia');

    // Limpia siempre 
    this.catTipoVias = [];
    viaCtrl?.setValue(null, { emitEvent: false });
    viaCtrl?.disable({ emitEvent: false });

    if (idCatMateria == null) return;

    this.juicioService.getCatalogoVias(idCatMateria).subscribe({
      next: (vias) => {
        this.catTipoVias = vias ?? [];
        viaCtrl?.enable({ emitEvent: false });
      },
      error: (error) => {
        // ya quedó limpio y deshabilitado arriba
        console.error('Error al cargar el catálogo de vías:', error);
      }
    });
  }
  cargarCatalogoSexos() {
    this.juicioService.getCatalogoSexos().subscribe({
      next: (response) => {
        this.catSexos = response;
      },
      error: (error) => {
        console.error('Error al cargar el catálogo de materias:', error);
      }
    });
  }

  cargarCatalogoTipoPartes() {
    this.juicioService.getCatalogoTipoPartes().subscribe({
      next: (response) => {
        this.catTipoPartes = response;
      },
      error: (error) => {
        console.error('Error al cargar el catálogo de materias:', error);
      }
    });
  }
  cargarCatalogoMunicipios() {
    this.juicioService.getCatalogoMunicipios().subscribe({
      next: (response) => {
        this.catMunicipios = response;
      },
      error: (error) => {
        console.error('Error al cargar el catálogo de materias:', error);
      }
    });
  }
  cargarCatTipoDocumento() {
    this.juicioService.getCatTipoDocumento().subscribe({
      next: (tipoDocumento) => {
        this.catTipoDocumentos = tipoDocumento;
        console.log('Cataolog documentos cargados:', this.catTipoDocumentos);
      },
      error: (error) => {
        console.error('Error al cargar el catálogo de materias:', error);
      }
    });
  }

  private validarPartesYDocumentosListas(): boolean {
    const partes = this.listaPartes ?? [];
    const documentos = this.listaAnexos ?? [];

    // regla: mínimo 1 y 1
    if (partes.length < 1 || documentos.length < 1) return false;

    const actores = [1, 2, 3, 4, 5, 21, 22, 24, 25];
    const demandados = [7, 9, 10, 11, 14];

    const tieneActor = partes.some(p => actores.includes(Number(p.idCatTipoParte)));
    const tieneDemandado = partes.some(p => demandados.includes(Number(p.idCatTipoParte)));

    return tieneActor && tieneDemandado;
  }

  canEnviar(): boolean {
    return this.formulario.valid && this.validarPartesYDocumentosListas();
  }
  correosDiferentesValidator(form: FormGroup) {
    // Solo aplica en modo manual
    if (this.filtroParte === 'manual') {
      const correo = form.get('correo')?.value?.toLowerCase().trim();
      const correoAlterno = form.get('correoAlterno')?.value?.toLowerCase().trim();
      if (correo && correoAlterno && correo === correoAlterno) {
        return { correosIguales: true };
      }
    }
    return null;
  }

  // startTutorial() {
  //   const driverObj = driver({
  //     nextBtnText: 'Siguiente',
  //     prevBtnText: 'Atrás',
  //     doneBtnText: 'Finalizar',
  //     showProgress: true,
  //     showButtons: ['next', 'previous'],
  //     steps: [
  //       { element: '#idCatMunicipio', popover: { title: 'Selecciona un municipio', description: 'Haz clic aquí y elige el municipio donde quieras llevar a cabo tu proceso.', side: "left", align: 'start' } },
  //       { element: '#idCatMateria', popover: { title: 'Selecciona la materia del caso', description: 'Haz clic aquí y elige la materia a la que pertenece tu demanda.', side: "left", align: 'start' } },
  //       { element: '#idCatTipoVia', popover: { title: 'Elige la vía correspondiente', description: 'Después de seleccionar la materia, selecciona la vía que aplique a tu demanda.', side: "bottom", align: 'start' } },
  //       { element: '#descripcionDemanda', popover: { title: 'Describe brevemente tu demanda', description: 'Escribe un resumen corto que explique el motivo o el contexto de la demanda.', side: "bottom", align: 'start' } },
  //       { element: '#agregarParte', popover: { title: 'Agrega una parte al expediente', description: 'Presiona este botón para añadir una persona u organización relacionada con la demanda .', side: "left", align: 'start' } },
  //       { element: '#listadoPartes', popover: { title: 'Listado de partes agregadas', description: 'Aquí verás todas las partes que hayas agregado. Puedes editarlas o eliminarlas si es necesario', side: "left", align: 'start' } },
  //     ]
  //   });

  //   driverObj.drive();
  // }
}

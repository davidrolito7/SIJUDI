import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { JuicioService } from '../../services/juicioenlinea.service';
import { CatSexos, DatosUsuarioResponse, HorasEndDisponiblesResponse, HorasStartDisponiblesResponse, PartesAudiencia } from '../../interfaces/juicioenlinea.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Breadcrub } from "../../../shared/components/breadcrub/breadcrub";
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmDialog } from "../../../shared/components/confirm-dialog/confirm-dialog";
import { Spinner } from '../../../shared/components/spinner/spinner';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-crear-audiencia',
  imports: [DialogModule, ConfirmDialog, CommonModule, ToastModule, ButtonModule, FormsModule, DatePickerModule, ReactiveFormsModule, Spinner, SelectModule, InputTextModule, TextareaModule, Breadcrub, TableModule, TagModule, InputGroupModule, InputGroupAddonModule, RadioButtonModule, ToggleSwitchModule  ],
  templateUrl: './crear-audiencia.html',
  styleUrl: './crear-audiencia.css',
  providers: [ConfirmationService, MessageService]

})
export class CrearAudiencia {
  isLoading: boolean = false;

  NumExpediente!: string;
  idExpediente!: number;
  idAudiencia!: number;
  listaPartes= signal< PartesAudiencia[]>([]);
  catSexos: CatSexos[] = [];
  listaInvitados: any[] = []; // <-- Nuevo arreglo para invitados
  esEdicionAudiencia = false;
  originalStart: string | null = null;
  originalEnd: string | null = null;
  // En tu componente .ts
  mostrarFormularioAgregar: boolean = false;
  formGenerales!: FormGroup;
  parteForm!: FormGroup;
  filtroParte: 'busqueda' | 'manual' = 'busqueda'; // Define el filtro inicial
  catTipoPartes: any[] = [];
  horasDisponibles: HorasStartDisponiblesResponse | null = null;
  horasEndDisponibles: HorasEndDisponiblesResponse | null = null;

  usrData: DatosUsuarioResponse | null = null;
  buscarUsr!: FormGroup;

  editandoParte: boolean = false;
  indiceParteEditando: number = -1;
  visible: boolean = false;
  formEnviado: boolean = false;

  tipoBusqueda: string | null = null;

  ngOnInit(): void {
    // Inicializa el formulario primero
    this.formGenerales = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      agenda: ['', [Validators.required, Validators.maxLength(100)]],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      partes: this.fb.array([]) // Inicializa el FormArray
    });

    const state = window.history.state as any;

    // Si viene de expediente
    if (state && state.idExpediente) {
      this.idExpediente = state.idExpediente;
      this.NumExpediente = state.NumExpediente;
    }

    // Si viene de reprogramar audiencia
    if (state && state.idAudiencia) {
      this.esEdicionAudiencia = true;
      this.NumExpediente = state.expediente.NumExpediente;
      this.idAudiencia = state.idAudiencia;

      // Extrae fecha y horas de start y end
      let fecha = '';
      let horaInicio = '';
      let horaFin = '';
      let fechaComoDate: Date | null = null;

      if (state.start) {
        const [f, h] = state.start.split(' ');
        if (f) {
          const [anio, mes, dia] = f.split('-');
          fechaComoDate = new Date(Number(anio), Number(mes) - 1, Number(dia));
          fecha = this.transformarFechaAFormatoDMY(f); // solo para onFechaCambia/onHoraCambia
        }
        horaInicio = h ? h.substring(0, 5) : '';
        this.originalStart = state.start;
      }
      if (state.end) {
        const [, h] = state.end.split(' ');
        horaFin = h ? h.substring(0, 5) : '';
        this.originalEnd = state.end;
      }

      this.formGenerales.patchValue({
        title: state.title,
        agenda: state.agenda || '',
        fecha: fechaComoDate,
        horaInicio,
        horaFin,
      });

      console.log('Datos en el formulario:', this.formGenerales.value);

      if (fecha) {
        this.fechaSeleccionada = fecha;
        this.horaInicioSeleccionada = horaInicio;
        this.onFechaCambia(fecha);
        this.onHoraCambia(fecha, horaInicio);
      }

      if (state.invitados && Array.isArray(state.invitados)) {
        this.listaInvitados = state.invitados;
        console.log('Invitados recibidos:', this.listaInvitados);
      }
    }


    this.cargarPartesAudiencia(this.idExpediente);
    this.cargarCatalogoSexos();
    this.cargarCatalogoTipoPartes();

    this.parteForm = this.fb.group({
      idUsr: [null],
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

    this.buscarUsr = this.fb.group({
      tipoBusqueda: [null, Validators.required],
      curp: ['', [Validators.required, Validators.maxLength(18)]],
      usuario: [null, [Validators.required, Validators.maxLength(20)]],
    });

  }

  constructor(
    private juicioService: JuicioService,
    private readonly fb: FormBuilder,
    private messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private router: Router,


  ) { }

  onTipoBusquedaChange() {
    this.tipoBusqueda = this.buscarUsr.get('tipoBusqueda')?.value;
    this.buscarUsr.get('usuario')?.setValue('');
    this.buscarUsr.clearValidators();
  }
  cargarPartesAudiencia(idExpediente: number) {
    this.juicioService.getPartesAudiencia(idExpediente).subscribe({
      next: (response) => {
        // Mapea cada parte del backend a PartesRequest
        this.listaPartes.set(response.data.map(parte => ({
          idParte: parte.idParte,
          idPreregistro: parte.idPreregistro,
          idUsr: parte.idUsr,
          nombre: parte.nombre,
          apellidoPaterno: '', // Si no viene, déjalo vacío
          apellidoMaterno: '',
          correo: parte.correo,
          correoAlterno: parte.correoAlterno,
          direccion: parte.direccion,
          idCatSexo: parte.idCatSexo ? Number(parte.idCatSexo) : null,
          sexoDescripcion: parte.sexoDescripcion,
          idCatTipoParte: parte.idCatTipoParte ? Number(parte.idCatTipoParte) : null,
          tipoParteDescripcion: parte.tipoParteDescripcion,
          descripcionTipoParte: parte.tipoParteDescripcion,
          filtroParte: 'busqueda',
          esNueva: false,
          esAbogado: parte.esAbogado || false
        })));
        //this.sincronizarFormArrayPartes();
        // Si quieres seguir usando partesAudiencia para la tabla, iguala:
        console.log('Partes de audiencia cargadas:', this.listaPartes());
      },
      error: (error) => {
        console.error('Error al cargar las partes de la audiencia:', error);
      }
    });
  }

  showDialog() {
    this.buscarUsr.reset();
    this.editandoParte = false;
    this.visible = true;
    this.formEnviado = false; // <-- reset para el siguiente uso
    this.actualizarValidadores(); // <-- ¡Agrega esto!

  }

  agregarParte() {
    this.formEnviado = true;
    if (this.parteForm.invalid) {
      this.parteForm.markAllAsTouched();
      return;
    }

    const valores = this.parteForm.getRawValue();

    // Siempre convierte a mayúsculas
    const nombre = valores.nombre ? valores.nombre.toUpperCase() : '';
    const apellidoPaterno = valores.apellidoPaterno ? valores.apellidoPaterno.toUpperCase() : '';
    const apellidoMaterno = valores.apellidoMaterno ? valores.apellidoMaterno.toUpperCase() : '';
    const direccion = valores.direccion ? valores.direccion.toUpperCase() : '';
    const correo = valores.correo ? valores.correo.toUpperCase() : '';
    const correoAlterno = valores.correoAlterno ? valores.correoAlterno.toUpperCase() : '';

    // Busca las descripciones en los catálogos
    const sexo = this.catSexos.find(s => Number(s.idCatSexo) === Number(valores.idCatSexo));
    const tipoParte = this.catTipoPartes.find(t => Number(t.idCatTipoParte) === Number(valores.idCatTipoParte));

    const nuevaParte: PartesAudiencia = {
      ...valores,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      correoAlterno,
      direccion,
      filtroParte: this.filtroParte,
      sexoDescripcion: sexo ? sexo.descripcion : '',
      tipoParteDescripcion: tipoParte ? tipoParte.descripcion : '',
      esNueva: true

    };
    // Validación para evitar duplicados por idUsr
    if (
      nuevaParte.idUsr &&
      this.listaPartes().some((parte, idx) =>
        parte.idUsr === nuevaParte.idUsr && idx !== this.indiceParteEditando
      )
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Usuario duplicado',
        detail: 'Este usuario ya fue agregado como parte.'
      });
      return;
    }

    const tipoParteSeleccionada = this.catTipoPartes.find(
      (tipo) => tipo.idCatTipoParte === Number(nuevaParte.idCatTipoParte)
    );
    if (tipoParteSeleccionada) {
      nuevaParte.descripcionTipoParte = tipoParteSeleccionada.descripcion;
    }

    if (this.editandoParte) {
      this.listaPartes()[this.indiceParteEditando] = { ...nuevaParte };
      this.editandoParte = false;
      this.indiceParteEditando = -1;
    } else {
      this.listaPartes().push({ ...nuevaParte });
      console.log('Parte agregada:', this.listaPartes());
    }

    //this.sincronizarFormArrayPartes();
    this.visible = false;
    this.parteForm.reset();
    this.formEnviado = false;
    this.formGenerales.get('partes')?.updateValueAndValidity();
  }

  editarParte(index: number) {
    this.editandoParte = true;
    this.indiceParteEditando = index;

    const parte = this.listaPartes()[index];
    // Asigna el filtro según cómo fue creada la parte
    this.filtroParte = parte.filtroParte || (
      (!parte.apellidoPaterno && !parte.apellidoMaterno) ? 'busqueda' : 'manual'
    );
    this.buscarUsr.reset(); // Limpia el formulario de búsqueda de usuario
    this.actualizarValidadores();
    this.parteForm.patchValue(parte);
    this.visible = true;

  }

  confirm1(event: Event, index: number) {
    console.log('Confirmación de eliminación de parte:', index);
    this.confirmationService.confirm({
      key: 'parte',
      target: event.target as EventTarget,
      accept: () => this.eliminarParte(index),
      reject: () => { }
    });
  }

  eliminarParte(index: number) {
    this.listaPartes().splice(index, 1);
    //this.sincronizarFormArrayPartes();
    // Notifica al formulario que se ha actualizado el array de partes
    this.formGenerales.get('partes')?.updateValueAndValidity();
    console.log('Parte eliminada:', this.listaPartes());
  }

  resetParteForm() {
    this.buscarUsr.reset(); // Limpia el formulario de búsqueda de usuario
    this.parteForm.reset(); // Limpia el formulario de partes
    this.visible = false;   // Cierra el modal de partes
    this.formEnviado = false; // Resetea el estado de envío
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

  // private sincronizarFormArrayPartes() {
  //   const partesFormArray = this.formGenerales.get('partes') as FormArray;
  //   partesFormArray.clear();
  //   this.listaPartes().forEach(item => {
  //     const esBusqueda = !item.apellidoPaterno && !item.apellidoMaterno;

  //     partesFormArray.push(this.fb.group({
  //       idUsr: [item.idUsr],
  //       filtroParte: [item.filtroParte],
  //       nombre: [item.nombre, [Validators.required, Validators.maxLength(100)]],
  //       apellidoMaterno: [
  //         item.apellidoMaterno,
  //         esBusqueda ? [] : [Validators.required, Validators.maxLength(100)]
  //       ],
  //       apellidoPaterno: [
  //         item.apellidoPaterno,
  //         esBusqueda ? [] : [Validators.required, Validators.maxLength(100)]
  //       ],
  //       direccion: [item.direccion,  Validators.maxLength(250)],
  //       idCatSexo: [item.idCatSexo, Validators.required],
  //      idCatTipoParte: [item.idCatTipoParte, Validators.required]
  //     }));
  //   });
  //   partesFormArray.updateValueAndValidity();
  // }

  get partes(): FormArray {
    return this.formGenerales.get('partes') as FormArray;
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
    } else if (this.tipoBusqueda === "1") {
      // Solo números, máximo 6 dígitos
      valor = valor.replace(/\D/g, '').slice(0, 6);
    } else if (this.tipoBusqueda === "3") {
      // Solo alfanumérico, máximo 8
      valor = valor.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    } else if (this.tipoBusqueda === "4") {
      // Solo números, máximo 4 dígitos
      valor = valor.replace(/[^0-9]/g, '').slice(0, 4);
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
          // Habilitar temporalmente para patchValue, luego deshabilitar
          const camposReadonly = ['nombre', 'correo', 'correoAlterno', 'direccion'];
          camposReadonly.forEach(campo => {
            this.parteForm.get(campo)?.enable({ emitEvent: false });
          });

          this.parteForm.patchValue({
            idUsr: this.usrData.idUsr,
            nombre: this.usrData.nombre,
            correo: this.usrData.correo,
            correoAlterno: this.usrData.correoAlterno,
            direccion: this.usrData.direccion
          });
          // Volver a deshabilitar
          camposReadonly.forEach(campo => {
            this.parteForm.get(campo)?.disable({ emitEvent: false });
          });
          this.messageService.add({ severity: 'success', summary: 'Datos encontrados', detail: "Verifique si los datos son correctos" });

        } else {
          this.messageService.add({ severity: 'info', summary: 'Verifique la información', detail: response.message });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'warn', summary: 'Ocurrió un error inesperado', detail: "Intente mas tarde" });

        console.error('Error al obtener los datos del usuario:', error);
      }
    });

  }
  shouldShowError(controlName: string, form: FormGroup = this.parteForm): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched || this.formEnviado) : false;
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

  cargarCatalogoSexos() {
    this.juicioService.getCatalogoSexos().subscribe({
      next: (response) => {
        this.catSexos = response.data;
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

  fechaSeleccionada: string = '';
  horaInicioSeleccionada: string = '';

  onFechaDatepickerChange(event: Date) {
    if (!event) return;

    const dia = String(event.getDate()).padStart(2, '0');
    const mes = String(event.getMonth() + 1).padStart(2, '0');
    const anio = event.getFullYear();

    const fechaFormato = `${dia}/${mes}/${anio}`; // dd/mm/yyyy
    this.fechaSeleccionada = fechaFormato;

    this.formGenerales.patchValue({ horaInicio: null, horaFin: null });
    this.onFechaCambia(fechaFormato);
  }
  onFechaCambia(fecha: string) {
    let fechaTransformada = '';

    if (fecha.includes('/')) {
      // Si la fecha está en formato dd/mm/yyyy
      const [dia, mes, anio] = fecha.split('/');
      fechaTransformada = `${anio}-${mes}-${dia}`;
    } else if (fecha.includes('-')) {
      // Si la fecha está en formato yyyy-mm-dd
      fechaTransformada = fecha; // Ya está en el formato correcto
    } else {
      console.error('Formato de fecha inválido:', fecha);
      return;
    }

    this.juicioService.getHorasDisponiblesAudiencia(fechaTransformada, this.idAudiencia).subscribe({
      next: (response) => {
        this.horasDisponibles = response.data;
      },
      error: (error) => {
        console.error('Error al obtener las horas del día:', fechaTransformada, error);
      }
    });
  }

  onHoraInicioChange(event: any) {
    this.horaInicioSeleccionada = event.value;
    if (this.fechaSeleccionada && this.horaInicioSeleccionada) {
      this.onHoraCambia(this.fechaSeleccionada, this.horaInicioSeleccionada);
    }
  }

  onHoraCambia(fecha: string, start: string) {
    let fechaTransformada = '';

    if (fecha.includes('/')) {
      // Si la fecha está en formato dd/mm/yyyy
      const [dia, mes, anio] = fecha.split('/');
      fechaTransformada = `${anio}-${mes}-${dia}`;
    } else if (fecha.includes('-')) {
      // Si la fecha está en formato yyyy-mm-dd
      fechaTransformada = fecha; // Ya está en el formato correcto
    } else {
      console.error('Formato de fecha inválido:', fecha);
      return;
    }

    this.juicioService.getHorasFinalAudiencia(fechaTransformada, start, this.idAudiencia).subscribe({
      next: (response) => {
        this.horasEndDisponibles = response.data;

        // Selecciona automáticamente la opción que empiece con horaFin
        const horaFinForm = this.formGenerales.get('horaFin')?.value;
        if (horaFinForm && this.horasEndDisponibles?.end) {
          const opcion = this.horasEndDisponibles.end.find((h: string) => h.startsWith(horaFinForm));
          if (opcion) {
            setTimeout(() => {
              this.formGenerales.patchValue({ horaFin: opcion });
            });
          }
        }
      },
      error: (error) => {
        console.error('Error al obtener las horas del día: ', fechaTransformada, error);
      }
    });
  }

  confirmarAudiencia(event: Event) {
    this.confirmationService.confirm({
      key: 'audiencia',
      target: event.target as EventTarget,
      accept: () => this.crearAudienciaDesdeFormulario(),
      reject: () => { }
    });
  }
  confirmarPutAudiencia(event: Event) {
    this.confirmationService.confirm({
      key: 'actualizarAudiencia',
      target: event.target as EventTarget,
      accept: () => this.actualizarAudienciaDesdeFormulario(),
      reject: () => { }
    });
  }
  crearAudienciaDesdeFormulario() {
    this.isLoading = true; // Activa el spinner

    console.log('Botón crear audiencia presionado');
    if (this.formGenerales.invalid) {
      console.warn('Formulario inválido:', this.formGenerales.value);
      this.formGenerales.markAllAsTouched();
      return;
    }
    if (!this.listaPartes().length) {
      console.warn('No hay partes agregadas');
      return;
    }

    // Función para limpiar paréntesis y espacios extra
    const limpiarHora = (hora: string) => hora.replace(/\s*\(.*?\)\s*/g, '').trim();
    const generales = this.formGenerales.value;

    // Transformar la fecha al formato yyyy-mm-dd
    const fecha: Date = generales.fecha;
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaTransformada = `${anio}-${mes}-${dia}`;

    const start = `${fechaTransformada} ${limpiarHora(generales.horaInicio)}:00`;
    const end = `${fechaTransformada} ${limpiarHora(generales.horaFin)}:00`;

    const invitees = this.listaPartes().map(parte => ({
      correo: parte.correo,
      correoAlterno: parte.correoAlterno,
      nombre: `${parte.nombre} ${parte.apellidoPaterno || ''} ${parte.apellidoMaterno || ''}`.trim(),
      idUsr: parte.idUsr, // este sí puede ser null según tu interfaz
      idCatSexo: parte.idCatSexo, // usa 0 o algún valor por defecto si es null
      idCatTipoParte: parte.idCatTipoParte, // igual aquí
      direccion: parte.direccion || '',
      esAbogado: parte.esAbogado || false // Asegúrate de que este campo exista en tu interfaz
    })); // opcional: filtra los que no tengan sexo o tipo parte

    const request = {
      idExpediente: this.idExpediente,
      title: generales.title,
      agenda: generales.agenda,
      start,
      end,
      invitees
    };

    console.log('Request final:', request);

    this.juicioService.crearAudiencia(request).subscribe({
      next: (resp) => {
        this.isLoading = false; // Desactiva el spinner al recibir respuesta

        if (resp && resp.success) {
          this.detalle(resp.data.idAudiencia, 'crear'); // Navega al detalle con el mensaje de creación

        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Lo sentimos',
            detail: resp?.message || 'La audiencia ya tiene una audiencia programda.'
          });
        }
      },
      error: (err) => {
        this.isLoading = false; // Desactiva el spinner si hay error
        this.messageService.add({
          severity: 'error',
          summary: 'Error del servidor',
          detail: 'Ocurrió un error inesperado, verifique su conexión e inténtelo de nuevo más tarde'
        });
        console.error('Error inesperado:', err);
      }
    });
  }

  // Método para navegar al detalle de la audiencia
  detalle(idAudiencia: number, tipoMensaje: 'crear' | 'actualizar'): void {
    this.router.navigate(['/audiencias/detalle'], { state: { idAudiencia, tipoMensaje } });
  }

  actualizarAudienciaDesdeFormulario() {
    this.isLoading = true; // Activa el spinner
    console.log('Botón actualizar audiencia presionado');
    if (this.formGenerales.invalid) {
      console.warn('Formulario inválido:', this.formGenerales.value);
      this.formGenerales.markAllAsTouched();
      return;
    }

    // Función para limpiar paréntesis y espacios extra
    const limpiarHora = (hora: string) => hora.replace(/\s*\(.*?\)\s*/g, '').trim();
    const generales = this.formGenerales.value;

    // Transformar la fecha al formato yyyy-mm-dd
    const fecha: Date = generales.fecha;
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaTransformada = `${anio}-${mes}-${dia}`;

    const start = `${fechaTransformada} ${limpiarHora(generales.horaInicio)}:00`;
    const end = `${fechaTransformada} ${limpiarHora(generales.horaFin)}:00`;

    // Verifica si los valores no han cambiado
    if (
      this.originalStart &&
      this.originalEnd &&
      (start === this.originalStart || start === this.originalStart.replace('.000', '')) &&
      (end === this.originalEnd || end === this.originalEnd.replace('.000', ''))
    ) {
      this.messageService.add({
        severity: 'info',
        summary: 'Eliga una fecha y hora diferente',
        detail: 'No hay cambios en la fecha y hora de la audiencia.'
      });
      return;
    }
    const request = {
      title: generales.title,
      agenda: generales.agenda,
      start,
      end
    };

    console.log('Request para actualizar:', request);

    this.juicioService.actualizarAudiencia(this.idAudiencia, request).subscribe({
      next: (resp) => {
        this.isLoading = false;
        if (resp && resp.success) {
          this.detalle(resp.data.idAudiencia, 'actualizar'); // Navega al detalle con el mensaje de actualización
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Lo sentimos', detail: resp?.message || 'No se pudo reprogramar la audiencia. Contacte a soporte.' });
        }
      },
      error: (err) => {
        this.isLoading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error del servidor',
          detail: 'Ocurrió un error inesperado, verifique su conexión e inténtelo de nuevo más tarde'
        });
        console.error('Error inesperado:', err);
      }
    });
  }
  transformarFechaAFormatoDMY(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
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
}

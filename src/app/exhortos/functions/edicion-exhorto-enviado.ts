import { detalleExhortosEnviados } from '../interfaces/exhortos.model';

//arma el objeto "datosExhorto" que crear-exhorto usa para cargar un exhorto enviado en modo edicion, a partir
//del detalle que regresa el API (DetalleExhortoEnviado). Se comparte entre detalles-exhorto-enviado (boton
//Editar) y crear-exhorto (al refrescar la pagina se vuelve a consultar el detalle y se reconstruye)
export function construirDatosEdicionExhorto(detalle: detalleExhortosEnviados | null | undefined) {
  return {
    municipioDestinoId: detalle?.generales.municipioDestino,
    materiaOrigenId: detalle?.generales.idMateriaOrigen,
    estadoOrigenId: detalle?.generales.estadoOrigenId,
    municipioOrigenId: detalle?.generales.municipioOrigen,
    municipioOrigenTrue: detalle?.generales.idMunicipioOrigen,
    juzgadoOrigenId: detalle?.generales.juzgadoOrigenId,
    juzgadoOrigenNombre: detalle?.generales.juzgadoOrigenNombre,
    numeroExpedienteOrigen: detalle?.generales.numeroExpedienteOrigen,
    numeroOficioOrigen: detalle?.generales.numeroOficioOrigen,
    idCatTipoVia: detalle?.generales.idCatTipoVia,
    tipoJuicioAsuntoDelitos: detalle?.generales.tipoJuicioAsuntoDelitos,
    juezExhortante: detalle?.generales.juezExhortante,
    partes: detalle?.partes,
    fojas: detalle?.generales.fojas,
    diasResponder: detalle?.generales.diasResponder,
    tipoDiligenciaId: detalle?.generales.tipoDiligenciaId,
    tipoDiligenciacionNombre: detalle?.generales.tipoDiligenciacionNombre,
    observaciones: detalle?.generales.observaciones,
    idUsuario: detalle?.generales.idUsuario,
    materiaNombre: detalle?.generales.materiaNombre,
    estadoDestinoId: detalle?.generales.estadoDestino,
    promoventes: detalle?.promoventes,
    idCatMateria: detalle?.generales.materiaNombreOrigen,
    idExhortoEnviado: detalle?.generales.idExhortoEnviado, // importante para actualizar
    fechaHora: detalle?.generales.fechaHora,
    fechaHoraRecepcion: detalle?.generales.fechaHoraRecepcion,
    numeroExhorto: detalle?.generales.numeroExhorto,
    idEstatus: detalle?.generales.idEstatus,
    estatus: detalle?.generales.estatus
  };
}

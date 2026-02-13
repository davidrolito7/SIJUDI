
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import dayjs from "dayjs";
import { logoBase64 } from "../../../assets/imgPJO";
import { DetalleExhortoRecibidoResponseI, promocionExhortos,respuestaExhorto } from '../interfaces/exhortos.model';
import { table } from "node:console";
 
//import { variable64 } from "../../assets/img";
(<any>pdfMake).addVirtualFileSystem(pdfFonts);

/*ESTE ARCHIVVO GENERA UN PDF QUE IMPRIME TODOS LOS DETALLES DE UN EXHORTO RECIBIDO
  30/05/2025
  VERSION 1.0
  JOSUE G.G.
*/
/*var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};*/

const generateExRecibidosPDF = (
  detalle: DetalleExhortoRecibidoResponseI,//Product[],
  promociones: promocionExhortos[],
  respuesta: respuestaExhorto[]
) => {
  const generales=detalle.generales;
  const partes = detalle.partes;
  const actualizaciones = detalle.actualizaciones;
  const archivos = detalle.archivos;
  const promoventes = detalle.promoventes;
  


  //console.log(respuesta);

  const tableBodyPartes = [
    [
      { text: "Nombre", style: "tableHeader", fontSize:10,fillColor: '#D3D3D3' },
      { text: "Apellido Paterno", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Apellido Materno", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Género", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3'},
      { text: "Tipo persona", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Tipo parte", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Correo", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Teléfono", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
    ],
    ...partes.map((parte) => [
      {text: parte.nombre, fontSize:8},
      {text: parte.apellidoPaterno,fontSize:8},
      {text: parte.apellidoMaterno, fontSize:8},
      {text: parte.genero, fontSize:8},
      {text: parte.esPersonaMoral ? 'Moral':'Fisica', fontSize:8},
      {text: parte.tipoParte.descripcion, fontSize:8},
      {text: parte.correoElectronico, fontSize:8},
      {text: parte.telefono, fontSize:8}
    ]),
  ];
  const tableBodyPromoventes = [
    [
      { text: "Nombre", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Apellido Paterno", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Apellido Materno", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Género", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Tipo persona", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Tipo parte", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Correo", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Teléfono", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
    ],
    ...promoventes.map((parte) => [
       {text: parte.nombre, fontSize:8},
      {text: parte.apellidoPaterno,fontSize:8},
      {text: parte.apellidoMaterno, fontSize:8},
      {text: parte.genero, fontSize:8},
      {text: parte.esPersonaMoral ? 'Moral':'Fisica', fontSize:8},
      {text: parte.tipoParte.descripcion, fontSize:8},
      {text: parte.correoElectronico, fontSize:8},
      {text: parte.telefono, fontSize:8}
    ]),
  ];
  const tableBodyArchivos = [
    [
      { text: "Nombre archivo", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Tipo documento", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Páginas", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Tamaño (Kilobytes)", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Firmado", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Fecha firmado", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
    ],
    ...archivos.map((archivo) => [
      {text: archivo.nombreArchivo, fontSize:8},
      {text: archivo.tipoDocumento?.nombre, fontSize:8},
      {text: archivo.paginas, fontSize:8},
      {text: ((archivo.tamanio === null ? 0 : archivo.tamanio)  /1024).toFixed(2), fontSize:8},
      {text: archivo.firmado, fontSize:8},
      {text: archivo.fechaFirmado, fontSize:8},
    ]),
  ];
  const tableBodyActualizaciones = [
    [
      { text: "Fecha", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Actualización", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Descripcion", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Enviada", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
    ],
    ...actualizaciones.map((actualizacion) => [
      {text: actualizacion.fechaActualizacion, fontSize:8},
      {text: actualizacion.tipoActualizacion, fontSize:8},
      {text: actualizacion.descripcion, fontSize:8},
      {text: actualizacion.enviado, fontSize:8},
    ]),
  ];
  const tableBodyPromociones = [
    [
      { text: "Folio origen", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Fojas", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Observaciones", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Fecha recepción", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Folio recepción", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
    ],
    ...(Array.isArray(promociones) ? promociones.flatMap((p,index) => {
      //let headerRow = [{ text: `HIJO${index + 1}`, bold: true, colSpan: 5, alignment: "center", fontSize: 10, margin: [0, 5, 0, 5] }, {}, {}, {}, {}];


      let rows=[
        //headerRow, // Agrega el encabezado antes de cada tabla hijo
        [
           /*{ text: p.folioOrigen, fontSize: 9, bold: true, colSpan: 5, fillColor: '#E0E0E0' },
              {}, {}, {}, {}*/
          {text: p.promo.folioOrigenPromocion, fontSize:8},
          {text: p.promo.fojas, fontSize:8},
          {text: p.promo.observaciones, fontSize:8},
          {text: dayjs(p.promo.fechaRecepcion).format("YYYY-MM-DD HH:mm:ss"), fontSize:8},
          {text: p.promo.folioPromocionRecibida, fontSize:8},

        ],
        [
          //{text:"Promoventes"},
          {
            table:{
              widths:[60,40,40,30,40,55,"*",50],
              body:[
                [{ text: `Promoventes`, bold: true, colSpan: 8, alignment: "center", fontSize: 10, margin: [0, 5, 0, 5] }, {}, {}, {}, {}, {}, {}, {}], // Encabezado de tabla hijo
                [
                    {text:"Nombre", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Apellido paterno", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Apellido materno", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Género", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Tipo persona", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Tipo parte", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Correo", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Teléfono", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                ],
                ...(Array.isArray(p.promoventes) ? p.promoventes.map((h) =>[
                  {text: `  ➜${h.nombre}`,fontSize:8},
                  {text: h.apellidoPaterno, fontSize:8},
                  {text: h.apellidoMaterno,fontSize:8},
                  {text: h.genero,fontSize:8},
                  {text: h.esPersonaMoral ? 'Moral':'Fisica', fontSize:8},
                  {text: h.tipoParte.descripcion,fontSize:8},
                  {text: h.correoElectronico,fontSize:8},
                  {text: h.telefono,fontSize:8}
                ]):[])
              ]
            },
            colSpan:5,
            margin: [10, 2, 0, 2]
          },
          {}, {}, {}, {}
        ],
        [
          //{text:"Promoventes"},
          {
            table:{
              headerRows: 1,
              widths:["*","*",50,50],
              body:[
                [{ text: `Archivos`, bold: true, colSpan: 4, alignment: "center", fontSize: 10, margin: [0, 5, 0, 5] }, {}, {}, {}], // Encabezado de tabla hijo
                [
                    {text:"Nombre", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Tipo documento", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Páginas", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Tamaño (Kilobytes)", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                ],
                ...(Array.isArray(p.archivos) ? p.archivos.map((h) =>[
                  {text: `  ➜${h.nombreArchivo}`,fontSize:8},
                  {text: h.tipoDocumento?.nombre, fontSize:8},
                  {text: h.paginas,fontSize:8},
                  {text: ((h.tamaño === null ? 0 : h.tamaño)  /1024).toFixed(2),fontSize:8},
                ]):[])
              ]
            },
            colSpan:5,
            margin: [10, 2, 0, 2]
          },
          {}, {}, {}, {}
        ]
      ];
    return rows;
    }):[])
  ];
  const tableBodyRespuesta = [
    [
      { text: "Folio", style: "tableHeader",fontSize:10 ,fillColor: '#D3D3D3'},
      { text: "Fecha registro", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Tipo diligencia", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Fecha recepcion", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
      { text: "Observaciones", style: "tableHeader",fontSize:10,fillColor: '#D3D3D3' },
    ],
    ...(Array.isArray(respuesta) ? respuesta.flatMap((r) => {
      let rows=[
        [
          {text: r.generales.folio, fontSize:8},
          {text: dayjs(r.generales.fechaRegistro).format("YYYY-MM-DD HH:mm:ss"), fontSize:8},
          {text: r.generales.tipoDiligencia, fontSize:8},
          {text: dayjs(r.generales.fechaHoraRecepcion).format("YYYY-MM-DD HH:mm:ss"), fontSize:8},
          {text: r.generales.observaciones, fontSize:8},
        ],
        [
          {
            table:{
              widths:["*","*","*","*"],
              body:[
                [{ text: `Archivos`, bold: true, colSpan: 4, alignment: "center", fontSize: 10, margin: [0, 5, 0, 5] }, {}, {}, {}], // Encabezado de tabla hijo
                [
                    {text:"Nombre", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Tipo documento", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Páginas", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                    {text:"Tamaño (Kilobytes)", style:"tableHeader",fontSize:9,fillColor: '#A9A9A9'},
                ],
                ...(Array.isArray(r.archivos) ? r.archivos.map((h) =>[
                  {text: `  ➜${h.nombreArchivo}`,fontSize:8},
                  {text: h.tipoDocumento?.nombre, fontSize:8},
                  {text: h.paginas,fontSize:8},
                  {text: ((h.tamanio === null ? 0 : h.tamanio)  /1024).toFixed(2),fontSize:8},
                ]):[])
              ]
            },
            colSpan:5,
            margin:[10,2,0,2]
          },
          {}, {}, {}, {}

        ]
      ];
      return rows;
    }):[])
  ];
  //const totalGeneral = products.reduce((sum, product) => sum + product.total, 0);
  const totalGeneral=0;

  const content: any[] = [];

  const fechaRecepcion = new Date(generales.fechaHoraRecepcion);

const opciones: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

  content.push({
    columns: [
      { image: logoBase64.miLogo, width: 200 },
      {
        stack: [
           { text: "Exhorto recibido", style: "subheader" },
           { text: generales.juzgadoDestino, style: "header" },
          {
            columns:[ {text: "Numero de exhorto:" , style: "header", alignment:"right",margin: [0, 0, -80, 0]}, //margen reducido
                      {text: generales.numeroExhorto, style: "header" ,color:"red",alignment:"right"}
                    ],
                    columnGap: 0, // Opcional para eliminar espacio automático entre columnas
          },
          { text: `Fecha de recepción: ${fechaRecepcion.toLocaleString("en-CA", opciones).replace(",","") }`, style: "subheader" },
        ],
        alignment: "right",
      },
    ],
  });


  content.push({
    qr: generales.url,
    foreground:"#812095",
    fit: 100,
    alignment: "right",
    margin: [0, 10, 0, 10],
  }, {text:generales.url,alignment: "right",fontSize:8});


  content.push({ text: "\n" });

  //Origen - generales*******************************************************************************
  //content.push({text: 'Información de origen', style: 'header'})

 


  content.push({
    columns:[
      {
        table: {
          headerRows: 1,
          widths: [55, 180],
          body: [
            [{ text: "Información de origen", style: "header",colSpan:2, alignment:"center",fillColor: '#D3D3D3' },{}],
            [{ text: "Estado:",fontSize:8, alignment:"right" },{text: generales.estadoOrigen, fontSize:8, alignment:"left"}],
            [{ text: "Municipio:",fontSize:8, alignment:"right" },{text: generales.municipioOrigen, fontSize:8, alignment:"left"}],
            [{ text: "Juzgado:",fontSize:8, alignment:"right" },{text: generales.juzgadoOrigenNombre, fontSize:8, alignment:"left"}],
            [{ text: "Juez exhortante:",fontSize:8, alignment:"right" },{text: generales.juezExhortante, fontSize:8, alignment:"left"}],
            [{ text: "Tipo Juicio:",fontSize:8, alignment:"right" },{text: generales.tipoJuicioAsuntoDelitos, fontSize:8, alignment:"left"}],
            [{ text: "Tipo diligenciación:",fontSize:8, alignment:"right" },{text: generales.tipoDiligenciacionNombre, fontSize:8, alignment:"left"}],
            [{ text: "Fecha origen:",fontSize:8, alignment:"right" },{text: dayjs(generales.fechaOrigen).format("YYYY-MM-DD HH:mm:ss"), fontSize:8, alignment:"left"}],
            [{ text: "Expediente:",fontSize:8, alignment:"right" },{text: generales.numeroExpedienteOrigen, fontSize:8, alignment:"left"}],
            [{ text: "Oficio:",fontSize:8, alignment:"right" },{text: generales.numeroOficioOrigen, fontSize:8, alignment:"left"}],
            [{ text: "Días/responder:",fontSize:8, alignment:"right" },{text: generales.diasResponder, fontSize:8, alignment:"left"}],
            [{ text: "Fojas:",fontSize:8, alignment:"right" },{text: generales.fojas, fontSize:8, alignment:"left"}],
            [{ text: "Observaciones:",fontSize:8, alignment:"right" },{text: generales.observaciones, fontSize:8, alignment:"left"}],

          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: [50, 180],
          body: [
            [{ text: "Información de destino", style: "header",colSpan:2, alignment:"center" ,fillColor: '#D3D3D3'},{}],
            [{ text: "Juzgado destino:",fontSize:8, alignment:'right' },{text: generales.juzgadoDestino, fontSize:8, alignment:'left'}],
            [{ text: "No. Exhorto:",fontSize:8, alignment:'right' },{text: generales.numeroExhorto, fontSize:8, alignment:'left', color:"red", bold:true}],
            [{ text: "Municipio:",fontSize:8, alignment:'right' },{text: generales.municipioDestino, fontSize:8, alignment:'left'}],
            [{ text: "Materia:",fontSize:8, alignment:'right' },{text: generales.materiaNombre, fontSize:8, alignment:'left'}],
            [{ text: "Fecha recepción:",fontSize:8, alignment:'right' },{text: fechaRecepcion.toLocaleString("en-CA", opciones).replace(",","") , fontSize:8, alignment:'left'}],
            [{ text: "Folio seg:",fontSize:8, alignment:'right' },{text: generales.folioSeguimiento, fontSize:8, alignment:'left'}],
            [{ text: "Estatus:",fontSize:8, alignment:'right' },{text: generales.estatus, fontSize:8, alignment:'left', background: selectClass(generales.estatus)}]
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 10],
      }
    ]
});

  content.push({ text: "\n" });

  //partes****************************************************************************************
  content.push({text: 'Partes', style: 'header'})

  content.push({
    table: {
      headerRows: 1,
      widths: [50, 40, 40,35,40, 50,100,60],
      body: tableBodyPartes,
    },
    layout: "lightHorizontalLines",
    margin: [0, 10, 0, 10],
  });

  content.push({ text: "\n" });

  //promoventes************************************************************************************
  content.push({text: 'Promoventes', style: 'header'})

  content.push({
    table: {
      headerRows: 1,
      widths: [50, 40, 40,35,40, 50,100,60],
      body: tableBodyPromoventes,
    },
    layout: "lightHorizontalLines",
    margin: [0, 10, 0, 10],
  });

  content.push({ text: "\n" });

  //archivos****************************************************************************************
  content.push({text: 'Archivos', style: 'header'})

  content.push({
    table: {
      headerRows: 1,
      widths: [170,"*", "*", "*","*","*"],
      body: tableBodyArchivos,
    },
    layout: "lightHorizontalLines",
    margin: [0, 10, 0, 10],
  });

    //actualizaciones************************************************************************************
  content.push({text: 'Actualizaciones', style: 'header'})

  content.push({
    table: {
      headerRows: 1,
      widths: [100, 80, "*",50],
      body: tableBodyActualizaciones,
    },
    layout: "lightHorizontalLines",
    margin: [0, 10, 0, 10],
  });

  content.push({ text: "\n" });

   //Promociones************************************************************************************
  content.push({text: 'Promociones', style: 'header'})
  content.push({
    table: {
      headerRows: 1,
      widths: [50,30, "*", 60,50],
      body: tableBodyPromociones,
    },
    layout: "lightHorizontalLines",
    margin: [0, 10, 0, 10],
  });
   //Respuesta*************************************************************************************
  content.push({text: 'Respuesta', style: 'header'})
  content.push({
    table: {
      headerRows: 1,
      widths: [40,60, 60, 60,"*"],
      body: tableBodyRespuesta,
    },
    layout: "lightHorizontalLines",
    margin: [0, 10, 0, 10],
  });
  /*content.push({
    columns: [
      { text: "", width: "*" },
      {
        text: `Total: $ ${totalGeneral}`,
        style: "total",
        alignment: "right",
        margin: [0, 10, 0, 10],
      },
    ],
  });*/


  const styles = {
    header: {
      fontSize: 14,
      bold: true,
    },
    subheader: {
      fontSize: 12,
      margin: [0, 5, 0, 5],
    },
    tableHeader: {
      bold: true,
      fontSize: 12,
      color: "black",
    },
    total: {
      fontSize: 12,
      bold: true,
    },
  };


  
  // imprimimos pie de pagina
  const footer= function (currentPage: number, pageCount: number) {
    const fechaHora = new Date().toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return {
      columns: [
        { text: `Fecha y hora de impresión: ${fechaHora}`, alignment: "left", margin: [40, 0, 0, 10], fontSize:8, color:"gray" },
        { text: `Página ${currentPage} de ${pageCount}`, alignment: "right", margin: [0, 0, 40, 10],fontSize:8 ,color:"gray"},
      ],
    };
  }
  const docDefinition: any = {
    content,
    footer,
    styles,
    //defaultStyle: { font: 'Roboto' }
  };
  pdfMake.createPdf(docDefinition).open();
};


function selectClass(estatus: string){
    if(estatus === "Recibido"){
      return '#FFC4A5'
    }else if(estatus === "Pendiente de recibir"){
      return '#FFC4A5'
    }else if(estatus === "En proceso de diligencia"){
      return '#D2A8C5'
    }else if(estatus === "Acordado"){
      return '#D2A8C5'
    }else if(estatus === "Respondido"){
      return '#B2D186'
    }else{
      return '#BAD7FE'
    }

  }

export default generateExRecibidosPDF;
export const environment = {
    production:false,
    DEV_SKIP_2FA: true, // Cambia a false para restaurar el flujo normal con 2FA
    ConstantsService:{
        //ruta : 'https://pruebas.tribunaloaxaca.gob.mx/permisos',
        idSistema: 4169,
        ruta : 'https://localhost:7260'
    },
    urlApiEfirma: 'https://api.tribunaloaxaca.gob.mx/efirma/api',
    urlApiExhortosElectronicos: "https://pruebas.tribunaloaxaca.gob.mx/exhortoselectronicos/api",
    //urlApiAmparosPJF:'https://localhost:44397/Api',
    urlApiAmparosPJF:'https://pruebas.tribunaloaxaca.gob.mx/amparosApi/api',

    urlApiTerminos:'https://pruebas.tribunaloaxaca.gob.mx/terminosApi/api'
    //ModuloExhortos:'Exhortos'
};



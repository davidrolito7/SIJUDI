export const environment = {
    production: true,
    DEV_SKIP_2FA: false,
    DEV_SKIP_PERFIL: true,
    ConstantsService: {
        //ruta : 'https://api.tribunaloaxaca.gob.mx/permisos',
        ruta: 'https://api.tribunaloaxaca.gob.mx/permisos',
        idSistema: 4169

        //ruta : 'https://localhost:7260'
    },
    urlApiEfirma: 'https://api.tribunaloaxaca.gob.mx/efirma/api/efirma',
    urlApiExhortosElectronicos: "https://api.tribunaloaxaca.gob.mx/exhortoselectronicos/api",
    urlApiAmparosPJF: 'https://interconexion.tribunaloaxaca.gob.mx/Api',
    urlApiTerminos: 'https://api.tribunaloaxaca.gob.mx/terminosApi/api',
    //ModuloExhortos:'Exhortos'

    //* api juicio oral
    urlApiJuicioOral: 'http://10.1.10.50:81',

    //* api juicio oral penal
    urlApiJuicioOralPenal:'https://api.tribunaloaxaca.gob.mx/juicioOralApi/api'

};

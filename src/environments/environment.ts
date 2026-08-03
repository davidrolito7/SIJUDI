export const environment = {
    production: true,
    DEV_SKIP_2FA: false,
    ConstantsService: {
        ruta : 'https://api.tribunaloaxaca.gob.mx/permisos',
        //ruta: 'https://pruebas.tribunaloaxaca.gob.mx/permisos',
        idSistema: 1

        //ruta : 'https://localhost:7260'
    },
    urlApiEfirma: 'https://api.tribunaloaxaca.gob.mx/efirma/api/efirma',
    urlApiExhortosElectronicos: "https://api.tribunaloaxaca.gob.mx/exhortoselectronicos/api",
    urlApiAmparosPJF: 'https://interconexion.tribunaloaxaca.gob.mx/Api',
    urlApiTerminos: 'https://api.tribunaloaxaca.gob.mx/terminosApi/api',
    //ModuloExhortos:'Exhortos'

    //* api juicio oral
    urlApiJuicioOral: 'https://oficialiavirtual.tribunaloaxaca.gob.mx/api',

    //* api juicio oral penal 
    urlApiJuicioOralPenal: 'https://api.tribunaloaxaca.gob.mx/juicioOralApi/api',
    //urlApiJuicioOralPenal: 'https://pruebas.tribunaloaxaca.gob.mx/ApiJop/api/PromocionesJuicioOral',

    //* api notificaciones
    urlApiNotificaciones: 'https://api.tribunaloaxaca.gob.mx/notificaciones/api'
};

export const environment = {
    production: true,
    //* false para producción
    //* true para pruebas y si eres abogado para que no solicituar llave/auth
    DEV_SKIP_2FA: false,
    ConstantsService: {
        ruta: 'https://pruebas.tribunaloaxaca.gob.mx/permisos',
        idSistema: 1,
        //ruta : 'https://localhost:5164'
    },

    urlApiEfirma: 'https://pruebas.tribunaloaxaca.gob.mx/efirma/api/efirma', //este siempre debe apuntar a produccion porque no existe ambiente de pruebas para efirma
    urlApiExhortosElectronicos: "https://pruebas.tribunaloaxaca.gob.mx/exhortoselectronicos/api",
    //urlApiAmparosPJF:'https://localhost:44397/Api',
    urlApiAmparosPJF: 'https://pruebas.tribunaloaxaca.gob.mx/amparosApi/api',

    urlApiTerminos: 'https://pruebas.tribunaloaxaca.gob.mx/terminosApi/api',
    //ModuloExhortos:'Exhortos'

    //* api demandas y oficialia primera instancia 0.o
    //urlApiJuicioOral: 'http://10.1.10.50:81',
    //urlApiJuicioOral: 'http://127.0.0.1:8000',
    urlApiJuicioOral: 'https://oficialiavirtual.tribunaloaxaca.gob.mx/api',

    //* api juicio oral penal 0.o
   // urlApiJuicioOralPenal: 'https://pruebas.tribunaloaxaca.gob.mx/ApiJop/api/PromocionesJuicioOral',
    urlApiJuicioOralPenal:'http://localhost:5041/api/PromocionesJuicioOral',

    //* api notificaciones en tiempo real
    // urlApiNotificaciones: 'http://localhost:3000',
    urlApiNotificaciones: 'https://pruebas.tribunaloaxaca.gob.mx/rabbitmq',

    urlApiAgenda: 'http://localhost:5157/api',
};



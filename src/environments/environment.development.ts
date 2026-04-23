export const environment = {
    production: false,
    DEV_SKIP_2FA: true,    // siempre false para producción, true para saltar 2FA y pasar directo a selección de perfil (o login automático si DEV_SKIP_PERFIL también está activo)
    DEV_SKIP_PERFIL: true, // siempre false para producción, true para saltar selección de perfil y completar contexto automáticamente para tipo persona 1 (abogado) al iniciar sesión, solo si DEV_SKIP_2FA también está activo
    ConstantsService: {
        ruta : 'https://pruebas.tribunaloaxaca.gob.mx/permisos',
        idSistema: 4169,
        //ruta : 'https://localhost:7260'
    },

    urlApiEfirma: 'https://api.tribunaloaxaca.gob.mx/efirma/api',
    urlApiExhortosElectronicos: "https://pruebas.tribunaloaxaca.gob.mx/exhortoselectronicos/api",
    //urlApiAmparosPJF:'https://localhost:44397/Api',
    urlApiAmparosPJF: 'https://pruebas.tribunaloaxaca.gob.mx/amparosApi/api',

    urlApiTerminos: 'https://pruebas.tribunaloaxaca.gob.mx/terminosApi/api',
    //ModuloExhortos:'Exhortos'

    //* api demandas y oficialia primera instancia 0.o
    //urlApiJuicioOral: 'http://10.1.10.50:81',
    urlApiJuicioOral:'http://127.0.0.1:8000',

    //* api juicio oral penal
    urlApiJuicioOralPenal:'https://pruebas.tribunaloaxaca.gob.mx/ApiJuicioOral/api/PromocionesJuicioOral'
    //urlApiJuicioOralPenal:'https://localhost:7057/api/PromocionesJuicioOral'

};



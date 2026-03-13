import { PromocionDocumentos } from "../../amparos/interfaces/amparos.models";
import { archivoExhortoEnviado, archivoPromocionExhortoEnviado, archivos } from "../interfaces/exhortos.model";

/**
 * acuerdo de exhortos recibidos
 * Valida si el usuario logueado aparece en los firmantes de cada documento.
 * Si aparece, marca firmado=true (solo una vez).
 * 
 * @param listaDocumentos Lista de documentos
 * @param usrLogueado Id del usuario logueado
 * @returns Nueva lista de documentos con la validación aplicada
 */

export function validarFirmasUsuario(listaDocumentos: archivos[], usrLogueado:number) {

    return listaDocumentos.map(doc => {
      // Verificamos si el usuario está en la lista de firmantes
      const yaFirmo = doc.firmantes.some(f => f.idUsuario === usrLogueado);

      // Si ya firmó, marcamos firmado=true, pero no lo volvemos a marcar si ya estaba
      if (yaFirmo && !doc.firmado) {
        return { ...doc, usrYaFirmo: true };
      }else{
        return { ...doc, usrYaFirmo: false };
      }

      return doc;
    })
  
}
/**
 * exhortos enviados
 * Valida si el usuario logueado aparece en los firmantes de cada documento.
 * Si aparece, marca firmado=true (solo una vez).
 * 
 * @param listaDocumentos Lista de documentos
 * @param usrLogueado Id del usuario logueado
 * @returns Nueva lista de documentos con la validación aplicada
 */

export function validarFirmasUsuarioExEnviado(listaDocumentos: archivoExhortoEnviado[], usrLogueado:number) {

    return listaDocumentos.map(doc => {
      // Verificamos si el usuario está en la lista de firmantes
      const yaFirmo = doc.firmantes.some(f => f.idUsuario === usrLogueado);

      // Si ya firmó, marcamos firmado=true, pero no lo volvemos a marcar si ya estaba
      if (yaFirmo && !doc.firmado) {
        return { ...doc, usrYaFirmo: true };
      }else{
        return { ...doc, usrYaFirmo: false };
      }

      return doc;
    })
  
}
/**
 * promociones enviados
 * Valida si el usuario logueado aparece en los firmantes de cada documento.
 * Si aparece, marca firmado=true (solo una vez).
 * 
 * @param listaDocumentos Lista de documentos
 * @param usrLogueado Id del usuario logueado
 * @returns Nueva lista de documentos con la validación aplicada
 */

export function validarFirmasUsuarioPromEnviado(listaDocumentos: archivoPromocionExhortoEnviado[], usrLogueado:number) {

    return listaDocumentos.map(doc => {
      // Verificamos si el usuario está en la lista de firmantes
      const yaFirmo = doc.firmantes.some(f => f.idUsuario === usrLogueado);

      // Si ya firmó, marcamos firmado=true, pero no lo volvemos a marcar si ya estaba
      if (yaFirmo && !doc.firmado) {
        return { ...doc, usrYaFirmo: true };
      }else{
        return { ...doc, usrYaFirmo: false };
      }

      return doc;
    })
  
}
/**
 * AMPAROS CREAR RESPUESTA
 * Valida si el usuario logueado aparece en los firmantes de cada documento.
 * Si aparece, marca firmado=true (solo una vez).
 * 
 * @param listaDocumentos Lista de documentos
 * @param usrLogueado Id del usuario logueado
 * @returns Nueva lista de documentos con la validación aplicada
 */

export function validarFirmasUsuarioAmparoRespuesta(listaDocumentos: PromocionDocumentos[], usrLogueado:number) {

    return listaDocumentos.map(doc => {
      // Verificamos si el usuario está en la lista de firmantes
      const yaFirmo = doc.firmantes.some(f => f.idUsuario === usrLogueado);

      // Si ya firmó, marcamos firmado=true, pero no lo volvemos a marcar si ya estaba
      if (yaFirmo && !doc.firmado) {
        return { ...doc, usrYaFirmo: true };
      }else{
        return { ...doc, usrYaFirmo: false };
      }
      return doc;
    })
  
}

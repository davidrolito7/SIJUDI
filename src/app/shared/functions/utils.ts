//Esta funcion convierte un base a blob.
export function Base64ToBlob(base64String:string, type: string): Blob{
    const byteCharacters = atob(base64String); // Decodificar la cadena Base64
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      return blob;
}
//funcion Para convertir la fecha de formato dd/MM/yyyyTHH:mm:ssZ a yyyy-MM-ddTHH:mm:ssZ
export function convertDate(inputDate: string): string {
  // Eliminar 'T' para un formato más manejable
  const dateParts = inputDate.split('T');
  
  // Intercambiar día y año usando split y join
  const dateComponent = dateParts[0].split('/').reverse().join('-');
  
  // Volver a unir 'T' y la hora
  const resultDate = `${dateComponent}T${dateParts[1]}`;
  
  return resultDate;
}
//funcion para descargar archivos en base64
export function downloadBase64(data: any, filename:string, extension:string) {
   
  var a = document.createElement("a");

  var contenttype='';
  switch(extension)
    {
      case 'pdf': contenttype='application/pdf'; break;
      case 'doc': contenttype='application/msword'; break;
      case 'docx':contenttype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'; break;
    }
  a.href = `data:${contenttype};base64,${data}`;
  a.download = filename; // Nombre del archivo a descargar
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
}
export function validaPdf(file: File): boolean{
// Verifica la extensión del archivo
    if (!file.name.endsWith('.pdf')) {
        return false;
    }

    // Verifica el tipo MIME del archivo
    if (file.type !== 'application/pdf') {
      return false;
    }

    // Validación adicional: Lee el contenido del archivo para asegurarse de que sea un PDF válido
    const reader = new FileReader();
    reader.onload = (e: any)  => {
      const content = e.target.result;

      // Verifica los primeros bytes del archivo para asegurarse de que sea un PDF válido
      if (!isPdf(content)) {
        return false;
      }else{
        return true;
      }
    };
    //reader.readAsArrayBuffer(file);
    return true;
}
// Función para verificar si el archivo es un PDF válido
export function  isPdf(content: ArrayBuffer): boolean {
    const buffer = new Uint8Array(content);
    const header = new TextDecoder('utf-8').decode(buffer.slice(0, 4)); // Lee los primeros 4 bytes

    // Un archivo PDF válido debe comenzar con '%PDF'
    return header.startsWith('%PDF');
  }
  // funcion para convertir un file a base64
export function  convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
//funcion para descargar File
export function downloadFile(file: File) {
   
  var a = document.createElement("a");

  convertFileToBase64(file).then(base64 =>{
      a.href = base64;
      a.download = file.name; // Nombre del archivo a descargar
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  })
}
export function base64ToFile(base64String: string, fileName: string, mimeType: string): File {
  // Decodificar el Base64
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  // Crear el objeto File
  return new File([byteArray], fileName, { type: mimeType });
}
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result as string); // Devuelve el string Base64 con el prefijo data:...
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}



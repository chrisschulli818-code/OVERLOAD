import pdfParse from 'pdf-parse';

export async function extrairTextoDoPdf(buffer: Buffer): Promise<string> {
  const resultado = await pdfParse(buffer);
  return resultado.text;
}

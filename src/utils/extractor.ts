import fs from "fs";
import * as pdfParseLib from "pdf-parse";

const pdfParse = (pdfParseLib as any).default || pdfParseLib;

export const extractTextFromFile = async (filePath: string) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
};
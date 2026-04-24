import fs from "fs";
import path from "path";
import * as pdfParseLib from "pdf-parse";
import mammoth from "mammoth";

const pdfParse =
  (pdfParseLib as any).default ||
  pdfParseLib;

export const extractTextFromFile =
  async (filePath: string) => {
    const ext = path
      .extname(filePath)
      .toLowerCase();

    // PDF
    if (ext === ".pdf") {
      const buffer =
        fs.readFileSync(filePath);

      const data =
        await pdfParse(buffer);

      return data.text;
    }

    // DOCX
    if (ext === ".docx") {
      const result =
        await mammoth.extractRawText({
          path: filePath,
        });

      return result.value;
    }

    throw new Error(
      `Unsupported file type: ${ext}`
    );
  };
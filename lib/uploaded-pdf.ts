import { PDFArray, PDFDict, PDFDocument, PDFName, PDFPage, rgb } from "pdf-lib";

const HEADER_MASK_X_RATIO = 0.09;
const HEADER_MASK_WIDTH_RATIO = 0.36;
const HEADER_MASK_HEIGHT_RATIO = 0.08;
const HEADER_MASK_TOP_OFFSET_RATIO = 0.05;

const MIN_HEADER_MASK_X = 36;
const MIN_HEADER_MASK_TOP_OFFSET = 28;
const MAX_HEADER_MASK_WIDTH = 240;
const MAX_HEADER_MASK_HEIGHT = 72;

export async function sanitizeUploadedPdf(pdfBuffer: Buffer): Promise<Buffer> {
  const pdfDocument = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: false,
  });
  const firstPage = pdfDocument.getPages()[0];

  if (!firstPage) {
    throw new Error("Uploaded PDF has no pages");
  }

  const pageWidth = firstPage.getWidth();
  const pageHeight = firstPage.getHeight();

  const maskX = Math.max(MIN_HEADER_MASK_X, pageWidth * HEADER_MASK_X_RATIO);
  const maskWidth = Math.min(MAX_HEADER_MASK_WIDTH, pageWidth * HEADER_MASK_WIDTH_RATIO);
  const maskHeight = Math.min(MAX_HEADER_MASK_HEIGHT, pageHeight * HEADER_MASK_HEIGHT_RATIO);
  const maskTopOffset = Math.max(MIN_HEADER_MASK_TOP_OFFSET, pageHeight * HEADER_MASK_TOP_OFFSET_RATIO);
  const maskY = Math.max(0, pageHeight - maskTopOffset - maskHeight);

  removeOverlappingLinkAnnotations(firstPage, {
    x: maskX,
    y: maskY,
    width: maskWidth,
    height: maskHeight,
  });

  firstPage.drawRectangle({
    x: maskX,
    y: maskY,
    width: maskWidth,
    height: maskHeight,
    color: rgb(1, 1, 1),
    borderColor: rgb(1, 1, 1),
    borderWidth: 0,
  });

  pdfDocument.setAuthor("BriefGen");
  pdfDocument.setCreator("BriefGen");
  pdfDocument.setProducer("BriefGen");

  const sanitizedBytes = await pdfDocument.save();
  return Buffer.from(sanitizedBytes);
}

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function removeOverlappingLinkAnnotations(
  page: PDFPage,
  maskRect: Rect,
) {
  const annots = page.node.Annots();
  if (!annots) {
    return;
  }

  for (let index = annots.size() - 1; index >= 0; index -= 1) {
    const annotation = annots.lookupMaybe(index, PDFDict);
    if (!annotation) {
      continue;
    }

    const subtype = annotation.lookupMaybe(PDFName.of("Subtype"), PDFName);
    if (subtype?.toString() !== "/Link") {
      continue;
    }

    const rectArray = annotation.lookupMaybe(PDFName.of("Rect"), PDFArray);
    if (!rectArray || !doesRectOverlap(maskRect, rectArray.asRectangle())) {
      continue;
    }

    annots.remove(index);
  }

  if (annots.size() === 0) {
    page.node.delete(PDFName.of("Annots"));
  }
}

function doesRectOverlap(a: Rect, b: Rect): boolean {
  const aRight = a.x + a.width;
  const bRight = b.x + b.width;
  const aTop = a.y + a.height;
  const bTop = b.y + b.height;

  return a.x < bRight && aRight > b.x && a.y < bTop && aTop > b.y;
}

import { PDFArray, PDFDict, PDFDocument, PDFName, PDFPage, rgb } from "pdf-lib";

const HEADER_MASK_X_RATIO = 0.09;
const HEADER_MASK_WIDTH_RATIO = 0.36;
const HEADER_MASK_HEIGHT_RATIO = 0.08;
const HEADER_MASK_TOP_OFFSET_RATIO = 0.05;

const MIN_HEADER_MASK_X = 36;
const MIN_HEADER_MASK_TOP_OFFSET = 28;
const MAX_HEADER_MASK_WIDTH = 240;
const MAX_HEADER_MASK_HEIGHT = 72;
const CHATGPT_LINK_HOSTNAME = "chatgpt.com";

export async function sanitizeUploadedPdf(pdfBuffer: Buffer): Promise<Buffer> {
  const pdfDocument = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: false,
  });
  const pages = pdfDocument.getPages();
  const firstPage = pages[0];

  if (!firstPage) {
    throw new Error("Uploaded PDF has no pages");
  }

  let didModifyPdf = false;

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    const maskRect = buildHeaderMaskRect(page);
    const removedAnyChatgptLinks = removeOverlappingChatgptLinkAnnotations(page, maskRect);

    // Mask only when we actually removed a ChatGPT link hotspot in the header area.
    // This avoids corrupting arbitrary uploaded PDFs that don't contain ChatGPT artifacts.
    if (removedAnyChatgptLinks) {
      didModifyPdf = true;
      page.drawRectangle({
        x: maskRect.x,
        y: maskRect.y,
        width: maskRect.width,
        height: maskRect.height,
        color: rgb(1, 1, 1),
        borderColor: rgb(1, 1, 1),
        borderWidth: 0,
      });
    }
  }

  if (!didModifyPdf) {
    return pdfBuffer;
  }

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

function buildHeaderMaskRect(page: PDFPage): Rect {
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  const x = Math.max(MIN_HEADER_MASK_X, pageWidth * HEADER_MASK_X_RATIO);
  const width = Math.min(MAX_HEADER_MASK_WIDTH, pageWidth * HEADER_MASK_WIDTH_RATIO);
  const height = Math.min(MAX_HEADER_MASK_HEIGHT, pageHeight * HEADER_MASK_HEIGHT_RATIO);
  const topOffset = Math.max(MIN_HEADER_MASK_TOP_OFFSET, pageHeight * HEADER_MASK_TOP_OFFSET_RATIO);
  const y = Math.max(0, pageHeight - topOffset - height);

  return { x, y, width, height };
}

function removeOverlappingChatgptLinkAnnotations(
  page: PDFPage,
  maskRect: Rect,
): boolean {
  const annots = page.node.Annots();
  if (!annots) {
    return false;
  }

  let removedAny = false;

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

    const action = annotation.lookupMaybe(PDFName.of("A"), PDFDict);
    // Do not use `lookupMaybe` without a type here; it can throw.
    // `URI` is usually a PDFString/PDFHexString and `toString()` includes it.
    const uriObject = action?.get(PDFName.of("URI"));
    const uriString = uriObject?.toString() ?? "";

    if (!uriString.includes(CHATGPT_LINK_HOSTNAME)) {
      continue;
    }

    annots.remove(index);
    removedAny = true;
  }

  if (annots.size() === 0) {
    page.node.delete(PDFName.of("Annots"));
  }

  return removedAny;
}

function doesRectOverlap(a: Rect, b: Rect): boolean {
  const aRight = a.x + a.width;
  const bRight = b.x + b.width;
  const aTop = a.y + a.height;
  const bTop = b.y + b.height;

  return a.x < bRight && aRight > b.x && a.y < bTop && aTop > b.y;
}

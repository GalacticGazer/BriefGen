import { describe, expect, it } from "vitest";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFString } from "pdf-lib";
import { sanitizeUploadedPdf } from "@/lib/uploaded-pdf";

describe("sanitizeUploadedPdf", () => {
  it("removes link annotations from the masked header area only", async () => {
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([612, 792]);

    const headerLink = pdfDocument.context.obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Link"),
      Rect: [60, 700, 220, 750],
      Border: [0, 0, 0],
      A: {
        Type: PDFName.of("Action"),
        S: PDFName.of("URI"),
        URI: PDFString.of("https://chatgpt.com"),
      },
    });
    const bodyLink = pdfDocument.context.obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Link"),
      Rect: [80, 90, 240, 140],
      Border: [0, 0, 0],
      A: {
        Type: PDFName.of("Action"),
        S: PDFName.of("URI"),
        URI: PDFString.of("https://example.com"),
      },
    });

    const headerLinkRef = pdfDocument.context.register(headerLink);
    const bodyLinkRef = pdfDocument.context.register(bodyLink);
    page.node.set(PDFName.of("Annots"), pdfDocument.context.obj([headerLinkRef, bodyLinkRef]));

    const sanitizedBuffer = await sanitizeUploadedPdf(Buffer.from(await pdfDocument.save()));
    const sanitizedPdf = await PDFDocument.load(sanitizedBuffer);
    const sanitizedPage = sanitizedPdf.getPages()[0];
    const annots = sanitizedPage.node.Annots();

    expect(annots).toBeDefined();
    expect(annots?.size()).toBe(1);

    const remainingAnnotation = annots?.lookup(0, PDFDict);
    const remainingRect = remainingAnnotation?.lookup(PDFName.of("Rect"), PDFArray).asRectangle();

    expect(remainingRect).toEqual({
      x: 80,
      y: 90,
      width: 160,
      height: 50,
    });
  });
});

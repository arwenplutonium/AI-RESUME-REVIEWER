/*
  Reads text from a CV file in the browser — nothing is uploaded anywhere.
  Supports .pdf, .docx and .txt. The PDF and Word libraries are loaded
  only when needed, so the site stays fast.
*/
export async function extractText(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) return file.text();

  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Rebuild lines using each text item's vertical position
      let lastY = null;
      let line = "";
      const lines = [];
      for (const item of content.items) {
        if (!("str" in item)) continue;
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 2) { lines.push(line.trim()); line = ""; }
        line += (line && !line.endsWith(" ") && item.str && !item.str.startsWith(" ") ? " " : "") + item.str;
        if (item.hasEOL) { lines.push(line.trim()); line = ""; lastY = null; continue; }
        lastY = y;
      }
      if (line.trim()) lines.push(line.trim());
      pages.push(lines.filter(Boolean).join("\n"));
    }
    const text = pages.join("\n\n").replace(/[ \t]+/g, " ").trim();
    if (!text) throw new Error("This PDF looks like a scanned image, so there is no text to read. Try exporting it again from Word or Google Docs.");
    return text;
  }

  if (name.endsWith(".docx")) {
    const mod = await import("mammoth/mammoth.browser.min.js");
    const mammoth = mod.default || mod;
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value.replace(/\r/g, "").replace(/\n\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  if (name.endsWith(".doc")) {
    throw new Error("Old .doc files can’t be read in the browser. Please save it as .docx or PDF and try again.");
  }
  throw new Error("Please choose a PDF, DOCX or TXT file.");
}

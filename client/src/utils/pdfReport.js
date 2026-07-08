/**
 * Shared PDF report building blocks — used by both the Resume Analysis
 * report and the Interview report so every exported PDF looks consistent
 * and professional (branded header, watermark, footer, score boxes).
 */

export const PDF = {
  primary: [158, 139, 144],     // #9E8B90
  primaryDark: [124, 108, 112], // #7C6C70
  secondary: [173, 111, 111],   // #AD6F6F
  secondaryDark: [143, 90, 90], // #8F5A5A
  dark: [31, 41, 55],           // #1F2937
  gray: [107, 114, 128],        // #6B7280
  lightBg: [248, 250, 252],     // #F8FAFC
  border: [229, 231, 235],      // #E5E7EB
  good: [22, 163, 74],
  warn: [180, 120, 30],
  bad: [190, 40, 40],
};

export const PAGE_W = 210;
export const PAGE_H = 297;
export const MARGIN = 16;
export const CONTENT_W = PAGE_W - MARGIN * 2;
export const CONTENT_BOTTOM = PAGE_H - 24;

/** Faint diagonal brand watermark, repeated on every page. */
export function addWatermark(doc) {
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.05 }));
  doc.setTextColor(...PDF.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(52);
  doc.text('AI RESUME SCREENER', PAGE_W / 2, PAGE_H / 2, {
    align: 'center',
    angle: 35,
  });
  doc.restoreGraphicsState();
}

/** Branded letterhead. Returns the y-coordinate where content should start. */
export function addHeader(doc, title, subtitle) {
  doc.setFillColor(...PDF.primary);
  doc.roundedRect(MARGIN, 14, 10, 10, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('AI', MARGIN + 5, 20.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PDF.dark);
  doc.text('AI Resume Screener', MARGIN + 14, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PDF.gray);
  doc.text('Smart Career Assistant', MARGIN + 14, 23.5);

  doc.setFontSize(8);
  doc.text(
    `Generated ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`,
    PAGE_W - MARGIN,
    19,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...PDF.dark);
  doc.text(title, MARGIN, 39);

  let ruleY = 44;
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...PDF.gray);
    doc.text(subtitle, MARGIN, 46);
    ruleY = 51;
  }

  doc.setDrawColor(...PDF.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, ruleY, PAGE_W - MARGIN, ruleY);

  return ruleY + 9;
}

/** Slim footer with branding + page number. Call once per page. */
export function addFooter(doc, pageNum) {
  doc.setDrawColor(...PDF.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, PAGE_H - 16, PAGE_W - MARGIN, PAGE_H - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PDF.gray);
  doc.text('AI Resume Screener ', MARGIN, PAGE_H - 10);
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
}

/** Starts a fresh page with watermark + footer already applied. */
export function newPage(doc, pageNumRef) {
  doc.addPage();
  pageNumRef.n += 1;
  addWatermark(doc);
  addFooter(doc, pageNumRef.n);
  return MARGIN + 14;
}

/** Ensures there's enough vertical room; adds a new page if not. */
export function ensureSpace(doc, y, needed, pageNumRef) {
  if (y > CONTENT_BOTTOM - needed) {
    return newPage(doc, pageNumRef);
  }
  return y;
}

/** A single rounded score box with a big percentage and a label. */
export function scoreBox(doc, x, y, w, h, label, score, color) {
  doc.setFillColor(...PDF.lightBg);
  doc.setDrawColor(...PDF.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...color);
  doc.text(`${score}%`, x + w / 2, y + h / 2 + 1, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PDF.gray);
  doc.text(label, x + w / 2, y + h - 6, { align: 'center' });
}

export function scoreColor(score) {
  if (score >= 75) return PDF.good;
  if (score >= 50) return PDF.warn;
  return PDF.bad;
}

/** A left accent-bar section heading. Returns the new y. */
export function sectionTitle(doc, title, x, y, color = PDF.primaryDark) {
  doc.setFillColor(...color);
  doc.rect(x, y - 4, 2.5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...PDF.dark);
  doc.text(title, x + 6, y);
  return y + 8;
}

/** Bulleted list with a colored dot marker. Returns the new y. */
export function bulletList(doc, items, x, y, maxWidth) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  if (!items || items.length === 0) {
    doc.setTextColor(...PDF.gray);
    doc.text('None found.', x, y);
    return y + 7;
  }

  items.forEach((item) => {
    doc.setTextColor(...PDF.secondary);
    doc.text('•', x, y);
    doc.setTextColor(...PDF.dark);
    const lines = doc.splitTextToSize(String(item), maxWidth - 6);
    doc.text(lines, x + 5, y);
    y += lines.length * 5 + 2;
  });

  return y + 2;
}

/** Wrapped paragraph text. Returns the new y. */
export function paragraph(doc, text, x, y, maxWidth, opts = {}) {
  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
  doc.setFontSize(opts.size || 10);
  doc.setTextColor(...(opts.color || PDF.dark));
  const lines = doc.splitTextToSize(String(text || ''), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * (opts.lineHeight || 5.2);
}

/** A light shaded callout box (used for the AI summary). Returns the new y. */
export function calloutBox(doc, text, x, y, w) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const lines = doc.splitTextToSize(String(text || ''), w - 12);
  const boxH = lines.length * 5 + 10;

  doc.setFillColor(...PDF.lightBg);
  doc.setDrawColor(...PDF.border);
  doc.roundedRect(x, y, w, boxH, 3, 3, 'FD');

  doc.setTextColor(...PDF.dark);
  doc.text(lines, x + 6, y + 8);

  return y + boxH + 8;
}
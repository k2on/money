import QRCode from "qrcode";

export function QR(value: string): string {
  const qr = QRCode.create(value, {
    errorCorrectionLevel: "L",
    version: 3,
  });

  const m = qr.modules.data;
  const size = qr.modules.size;

  // Use half-block characters to compress vertically
  // Upper half = '▀', lower half = '▄', full = '█', empty = ' '
  let out = "";
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x++) {
      const top = m[y * size + x];
      const bottom = m[(y + 1) * size + x];
      out += top && bottom ? "█" : top ? "▀" : bottom ? "▄" : " ";
    }
    out += "\n";
  }
  return out;
}



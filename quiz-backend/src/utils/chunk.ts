export function chunkText(text: string, chunkSize = 1000, overlap = 100) {
  const chunks = [];
  let start = 0;
  let idx = 1;

  while (start < text.length) {
    let end = start + chunkSize;
    if (end > text.length) end = text.length;

    const chunkText = text.slice(start, end);
    chunks.push({
      id: `chunk-${idx++}`,
      text: chunkText,
    });

    start += chunkSize - overlap;
  }

  return chunks;
}

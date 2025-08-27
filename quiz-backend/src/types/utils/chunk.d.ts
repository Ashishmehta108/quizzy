interface TextChunk {
  text: string;
  start: number;
  end: number;
}

/**
 * Splits text into chunks of specified size with optional overlap
 * @param text The text to be chunked
 * @param chunkSize The maximum size of each chunk
 * @param overlap The number of characters to overlap between chunks
 * @returns Array of text chunks with their positions
 */
export function chunkText(
  text: string, 
  chunkSize: number, 
  overlap: number
): TextChunk[];

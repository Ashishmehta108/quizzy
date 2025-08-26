/**
 * Processes a PDF file and returns its text content
 * @param filePath Path to the PDF file
 * @param userId ID of the user who uploaded the file
 * @param docId Unique document ID
 * @returns Promise that resolves to the extracted text content
 */
export function processPdf(filePath: string, userId: string, docId: string): Promise<string>;

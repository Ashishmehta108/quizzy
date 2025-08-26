interface Chunk {
  text: string;
  metadata: Record<string, any>;
}

export function queryChunks(
  query: string, 
  userId: string, 
  topK: number, 
  docId: string
): Promise<Array<{
  text: string;
  metadata: Record<string, any>;
  score: number;
}>>;

export function upsertChunks(
  userId: string, 
  docId: string, 
  chunks: Array<{ text: string; metadata?: Record<string, any> }>
): Promise<void>;

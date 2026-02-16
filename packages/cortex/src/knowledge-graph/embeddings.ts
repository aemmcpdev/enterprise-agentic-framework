export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  dimensions: number;
}

export class SimpleEmbeddingProvider implements EmbeddingProvider {
  dimensions = 128;

  async embed(text: string): Promise<number[]> {
    return this.hashEmbed(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.hashEmbed(t));
  }

  private hashEmbed(text: string): number[] {
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);
    const embedding = new Array(this.dimensions).fill(0);

    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % this.dimensions;
      embedding[index] += 1;
    }

    const magnitude = Math.sqrt(embedding.reduce((sum: number, v: number) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }
}

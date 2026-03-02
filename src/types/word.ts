export interface Scene {
  meaning: string;
  example: string;
  exampleJa: string;
  scene: string;
}

export interface Word {
  id: number;
  word: string;
  pronunciation: string;
  level: number;
  partOfSpeech: string;
  meaningJa: string;
  meaningEn?: string;
  coreImage: string;
  scenes: Scene[];
}

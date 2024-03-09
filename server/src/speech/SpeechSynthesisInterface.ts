export interface SpeechSynthesisInterface {
  generateAndSaveAudio(text: string, filePath: string): Promise<void>;
}

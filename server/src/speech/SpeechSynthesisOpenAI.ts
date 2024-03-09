import fs from "fs";
import path from "path";
import { SpeechSynthesisInterface } from "./SpeechSynthesisInterface";

import { OpenAI } from "openai";

class SpeechSynthesisOpenAI implements SpeechSynthesisInterface {
  async generateAndSaveAudio(text: string, filePath: string): Promise<void> {
    const openai = new OpenAI();

    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.promises.writeFile(filePath, buffer);
    } catch (error) {
      console.error("Error generating audio for text:", text, error);
      throw error;
    }
  }
}

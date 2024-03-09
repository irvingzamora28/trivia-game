import fs from 'fs';
import fetch from 'node-fetch';
import path from "path";
import dotenv from "dotenv";
import { SpeechSynthesisInterface } from './SpeechSynthesisInterface';

class SpeechSynthesisElevenLabs implements SpeechSynthesisInterface {
  
  async generateAndSaveAudio(text: string, filePath: string): Promise<void> {
    dotenv.config();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const options = {
      method: "POST",
      headers: {
        "xi-api-key": apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_settings: {
          similarity_boost: 0.75,
          stability: 0.5,
          style: 0,
          use_speaker_boost: true,
        },
        model_id: "eleven_multilingual_v2",
        text: text,
      }),
    };

    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/XrExE9yKIg1WjnnlVkGX",
        options
      );

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.promises.writeFile(filePath, buffer);
    } catch (error) {
      console.error("Error generating audio for text:", text, error);
      throw error;
    }
  }
}


export default SpeechSynthesisElevenLabs;
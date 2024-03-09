import express from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { SpeechSynthesisInterface } from "./speech/SpeechSynthesisInterface";
import SpeechSynthesisElevenLabs from "./speech/SpeechSynthesisElevenLabs";

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI();

app.post('/generate-audio', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const speechFile = path.resolve("./speech-alloy.mp3");
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    // Respond with the path or serve the file directly
    res.sendFile(speechFile);
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ message: 'Failed to generate audio' });
  }
});

app.post("/process-questions", async (req, res) => {
  const questionsFilePath = path.resolve(
    __dirname,
    "..",
    "..",
    "src",
    "data",
    "1_squid_game_2.json"
  );
  const outputDir = path.resolve(__dirname, "..", "..", "src", "assets", "audio");

  try {
    const questionsData = await fs.promises.readFile(questionsFilePath);
    const questions = JSON.parse(questionsData.toString());

    for (const question of questions) {
      // Generate and save audio for the question
      const questionAudioPath = path.join(outputDir, question.audio_question);
      await generateAndSaveAudio(question.question, questionAudioPath);

      // Generate and save audio for the answer
      const answerAudioPath = path.join(outputDir, question.audio_answer);
      await generateAndSaveAudio(
        `La respuesta es... ${question.answer}`,
        answerAudioPath
      );
    }

    res.json({ message: "Audio files generated successfully." });
  } catch (error) {
    console.error("Error processing questions:", error);
    res.status(500).json({ message: "Failed to process questions" });
  }
});

async function generateAndSaveAudio(text: string, filePath: string) {
  try {
    // Ensure the directory for the filePath exists
    const dirName = path.dirname(filePath);
    await fs.promises.mkdir(dirName, { recursive: true });
    // Example usage
    const speechSynthesizer: SpeechSynthesisInterface = new SpeechSynthesisElevenLabs();
    await speechSynthesizer.generateAndSaveAudio(text, filePath);
  } catch (error) {
    console.error("Error generating audio for text:", text, error);
    throw error; // Rethrow to handle in the calling function
  }
}

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

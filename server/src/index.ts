import express from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import axios from "axios";
import sharp from "sharp";
import { SpeechSynthesisInterface } from "./speech/SpeechSynthesisInterface";
import SpeechSynthesisElevenLabs from "./speech/SpeechSynthesisElevenLabs";

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI();
const IMAGE_SEARCH_URL = process.env.IMAGE_SEARCH_URL!;
const IMAGE_SEARCH_API_KEY = process.env.IMAGE_SEARCH_API_KEY!;
const IMAGE_SEARCH_CX = process.env.IMAGE_SEARCH_CX!;


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
  const questionsFilePath = path.resolve(__dirname, "..", "..", "src", "data", "trivia.json");
  const outputAudioDir = path.resolve(__dirname, "..", "..", "src", "assets", "audio");
  const outputImageDir = path.resolve(__dirname, "..", "..", "src", "assets", "images");

  try {
    const fileData = await fs.promises.readFile(questionsFilePath);
    const { data, questions } = JSON.parse(fileData.toString());

    for (const question of questions) {
      // Prepend the shared file_path to the question and answer audio files
      const questionAudioPath = path.join(outputAudioDir, data.file_path, question.audio_question);
      await generateAndSaveAudio(question.question, questionAudioPath);

      const correctOption = question.options.find((option: { key: any; }) => option.key === question.answer);
      if (!correctOption) {
        throw new Error(`Correct option not found for question ID ${question.id}`);
      }

      const answerAudioPath = path.join(outputAudioDir, data.file_path, question.audio_answer);
      await generateAndSaveAudio(`La respuesta es... ${correctOption.text}`, answerAudioPath);
    }

    // Process images using the same file_path prefix
    for (const question of questions) {
      if (question.image_search_term) {
        const imageQuestionPath = path.join(outputImageDir, data.file_path, question.image_question);
        await fetchAndSaveImage(question.image_search_term, imageQuestionPath, 5);
      }

      if (question.image_answer) {
        const imageQuestionPath = path.join(outputImageDir, data.file_path, question.image_answer);
        await fetchAndSaveImage(`Pelicula ${question.answer}`, imageQuestionPath, 5);
      }

      for (const option of question.options) {
        if (option.image_search_term) {
          const imageOptionPath = path.join(outputImageDir, data.file_path, option.image);
          await fetchAndSaveImage(option.image_search_term, imageOptionPath, 5);
        }
      }
    }

    res.json({ message: "Audio and image files generated successfully." });
  } catch (error) {
    console.error("Error processing questions:", error);
    res.status(500).json({ message: "Failed to process questions" });
  }
});


async function fetchAndSaveImage(searchTerm: string, baseFilePath: string, imageCount: number = 5) {
  try {
    const response = await axios.get(IMAGE_SEARCH_URL, {
      params: {
        q: searchTerm,
        searchType: "image",
        key: IMAGE_SEARCH_API_KEY,
        cx: IMAGE_SEARCH_CX,
        num: imageCount
      },
    });

    // Ensure the directory for the filePath exists
    const dirName = path.dirname(baseFilePath);
    await fs.promises.mkdir(dirName, { recursive: true });

    const items = response.data.items;
    for (let i = 0; i < Math.min(items.length, imageCount); i++) {
      const imageUrl = items[i].link;
      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const filePath = `${path.dirname(baseFilePath)}/${i+1}_${path.basename(baseFilePath)}.jpg`;
      await sharp(imageResponse.data).toFile(filePath);
    }
  } catch (error) {
    console.error(`Error fetching or saving images for ${searchTerm}:`, error);
  }
}


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

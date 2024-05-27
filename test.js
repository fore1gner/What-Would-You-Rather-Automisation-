const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const { ElevenLabsClient } = require('elevenlabs');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

const ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe'; // Path to the ffmpeg executable

ffmpeg.setFfmpegPath(ffmpegPath);

async function generateChoices() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a creative assistant." },
        { role: "user", content: "Generate a 'Would You Rather' question with two options." }
      ]
    });

    const choicesText = response.choices[0].message.content.trim();
    const choices = choicesText.split(" or ");
    return choices;
  } catch (error) {
    console.error("Error generating choices:", error);
    return null;
  }
}

async function generateImage(prompt) {
  try {
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "512x512"
    });

    const imageUrl = response.data[0].url;
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(imageResponse.data, 'binary');
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

async function getSpeech(text) {
  try {
    const audioStream = await elevenlabs.generate({
      voice: "Rachel",
      text,
      model_id: "eleven_multilingual_v2"
    });

    const writeStream = fs.createWriteStream('speech.mp3');
    audioStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      audioStream.on('end', resolve);
      audioStream.on('error', reject);
    });
  } catch (error) {
    console.error("Error generating speech:", error);
  }
}

async function createClip(choice1, choice2, img1Buffer, img2Buffer, index) {
  const bgImage = await Jimp.read('bg.png');
  const img1 = await Jimp.read(img1Buffer);
  const img2 = await Jimp.read(img2Buffer);

  img1.resize(512, 512);
  img2.resize(512, 512);

  const currentFrame = bgImage.clone();
  currentFrame.blit(img1, 284, 224);
  currentFrame.blit(img2, 284, 1184);

  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  currentFrame.print(font, 0, 736, {
    text: choice1,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, 1080, 200);

  currentFrame.print(font, 0, 1696, {
    text: choice2,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, 1080, 200);

  const framePath = `frame_${uuidv4()}.png`;
  await currentFrame.writeAsync(framePath);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(framePath)
      .loop(10)
      .addInput('speech.mp3')
      .outputOptions('-c:v libx264')
      .outputOptions('-t 10')
      .save(`clip_${index}.mp4`)
      .on('end', resolve)
      .on('error', reject);
  });
}

async function concatenateVideos(totalClips) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    for (let i = 0; i < totalClips; i++) {
      command.input(`clip_${i}.mp4`);
    }

    command
      .on('end', resolve)
      .on('error', reject)
      .mergeToFile(`would_you_rather_${uuidv4()}.mp4`, './temp');
  });
}

async function main() {
  const choices = [];
  const imgBuffers = [];

  for (let i = 0; i < 5; i++) {
    const choicePair = await generateChoices();
    if (!choicePair) {
      console.log("Failed to generate choices. Exiting.");
      return;
    }

    const [choice1, choice2] = choicePair;
    const img1 = await generateImage(choice1);
    const img2 = await generateImage(choice2);

    if (!img1 || !img2) {
      console.log("Failed to generate images. Exiting.");
      return;
    }

    choices.push([choice1, choice2]);
    imgBuffers.push([img1, img2]);
  }

  const speechText = choices.map(([choice1, choice2]) => `What would you rather ${choice1} or ${choice2}?`).join(" ");
  await getSpeech(speechText);

  for (let i = 0; i < choices.length; i++) {
    await createClip(choices[i][0], choices[i][1], imgBuffers[i][0], imgBuffers[i][1], i);
  }

  await concatenateVideos(choices.length);
}

main();

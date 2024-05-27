# Would You Rather Video Generator

This project generates a "Would You Rather" video using OpenAI, ElevenLabs, and ffmpeg. The video consists of five comparisons, each with a question generated by OpenAI, corresponding images, and a synthesized speech reading the questions.

## Requirements

- Node.js
- npm
- OpenAI API key
- ElevenLabs API key
- ffmpeg

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/would-you-rather-video-generator.git
    cd would-you-rather-video-generator
    ```

2. **Install the dependencies**:
    ```bash
    npm install
    ```

3. **Install ffmpeg**:
    Download ffmpeg from [ffmpeg.org](https://ffmpeg.org/download.html) and add it to your system's PATH. Alternatively, you can set the path to the executable in the script.

4. **Set up environment variables**:
    Create a `.env` file in the project directory and add your OpenAI and ElevenLabs API keys:
    ```env
    OPENAI_API_KEY=your_openai_api_key
    ELEVENLABS_API_KEY=your_elevenlabs_api_key
    ```

5. **Place the background image**:
    Ensure `bg.png` is located in the root directory of the project.

## Usage

To generate the "Would You Rather" video, run the script:

``bash
node test.js
The script will:

Generate five "Would You Rather" questions using the OpenAI API.
Generate corresponding images for each question using the OpenAI API.
Generate speech audio using the ElevenLabs API.
Create video clips for each comparison and concatenate them into a single video.
Project Structure
test.js: Main script to generate the video.
.env: Environment variables file containing API keys.
bg.png: Background image used in the video.
output/: Directory where the final video will be saved.
Example
After running the script, you should find the generated video in the output/ directory.

Troubleshooting
Error: Cannot find ffmpeg: Ensure ffmpeg is installed and correctly added to your system's PATH, or update the path in the script.
API Errors: Ensure your API keys are correct and have sufficient quota for the requests.

Contributing
Feel free to submit issues or pull requests to improve the project.

License
This project is licensed under the MIT License.

go
Copy code

This `README.md` file provides an overview of the project, installation instructions, usage guidelin
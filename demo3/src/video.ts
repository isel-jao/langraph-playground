import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import os from "os";
import { v4 as uuidv4 } from "uuid";

interface VideoOutputConfig {
  outputPath?: string; // If not provided, returns Buffer
  width?: number;
  height?: number;
  frameRate?: number;
  duration?: number; // If not provided, uses audio length
  fadeInDuration?: number;
  fadeOutDuration?: number;
  imageFormat?: "jpg" | "png" | "webp" | "bmp";
  audioFormat?: "mp3" | "wav" | "aac" | "m4a";
}

/**
 * Creates a video from image and audio buffers
 * @param imageBuffer - Image data as Buffer
 * @param audioBuffer - Audio data as Buffer
 * @param config - Video output configuration
 * @returns Promise<string | Buffer> - File path if outputPath provided, otherwise Buffer
 */
async function createVideo(
  imageBuffer: Buffer,
  audioBuffer: Buffer,
  config: VideoOutputConfig = {}
): Promise<string | Buffer> {
  const {
    outputPath,
    width = 1920,
    height = 1080,
    frameRate = 30,
    duration,
    fadeInDuration,
    fadeOutDuration,
    imageFormat = "jpg",
    audioFormat = "mp3",
  } = config;

  // Create temporary files
  const tempDir = os.tmpdir();
  const tempImagePath = path.join(tempDir, `${uuidv4()}.${imageFormat}`);
  const tempAudioPath = path.join(tempDir, `${uuidv4()}.${audioFormat}`);
  const tempOutputPath = outputPath || path.join(tempDir, `${uuidv4()}.mp4`);

  try {
    // Write buffers to temporary files
    fs.writeFileSync(tempImagePath, imageBuffer);
    fs.writeFileSync(tempAudioPath, audioBuffer);

    // Ensure output directory exists if outputPath is provided
    if (outputPath) {
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    }

    // Get audio duration if not specified
    const videoDuration = duration || (await getAudioDuration(tempAudioPath));

    // Build FFmpeg command
    let command = ffmpeg()
      .input(tempImagePath)
      .inputOptions(["-loop 1"])
      .input(tempAudioPath)
      .outputOptions([
        "-c:v libx264",
        "-tune stillimage",
        "-c:a aac",
        "-b:a 192k",
        "-pix_fmt yuv420p",
        `-r ${frameRate}`,
        `-t ${videoDuration}`,
      ])
      .output(tempOutputPath);

    // Add scaling and padding
    let videoFilters = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;

    // Add fade effects if specified
    if (fadeInDuration !== undefined || fadeOutDuration !== undefined) {
      const fadeIn = fadeInDuration || 0;
      const fadeOut = fadeOutDuration || 0;

      if (fadeIn > 0) {
        videoFilters += `,fade=t=in:st=0:d=${fadeIn}`;
      }
      if (fadeOut > 0) {
        videoFilters += `,fade=t=out:st=${
          videoDuration - fadeOut
        }:d=${fadeOut}`;
      }
    }

    command = command.outputOptions([`-vf ${videoFilters}`]);

    // Process video
    await new Promise<void>((resolve, reject) => {
      command
        .on("start", (commandLine) => {
          console.log("FFmpeg started:", commandLine);
        })
        .on("progress", (progress) => {
          if (progress.percent) {
            console.log(`Progress: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on("end", () => {
          console.log("Video processing completed");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err.message);
          reject(err);
        })
        .run();
    });

    // Return result
    if (outputPath) {
      // Clean up temp files but keep output
      cleanupFiles([tempImagePath, tempAudioPath]);
      return outputPath;
    } else {
      // Read video buffer and cleanup all temp files
      const videoBuffer = fs.readFileSync(tempOutputPath);
      cleanupFiles([tempImagePath, tempAudioPath, tempOutputPath]);
      return videoBuffer;
    }
  } catch (error) {
    // Cleanup on error
    cleanupFiles([tempImagePath, tempAudioPath, tempOutputPath]);
    throw error;
  }
}

/**
 * Helper function to get audio duration
 */
function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Could not read audio metadata: ${err.message}`));
        return;
      }

      const duration = metadata.format.duration;
      if (duration) {
        resolve(duration);
      } else {
        reject(new Error("Could not determine audio duration"));
      }
    });
  });
}

/**
 * Helper function to cleanup temporary files
 */
function cleanupFiles(filePaths: string[]): void {
  filePaths.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Failed to cleanup file ${filePath}:`, error);
    }
  });
}

// Usage Examples:
async function examples() {
  // Load your image and audio data
  const imageBuffer = fs.readFileSync("./image.jpg");
  const audioBuffer = fs.readFileSync("./audio.mp3");

  try {
    // Basic usage - save to file
    const videoPath = await createVideo(imageBuffer, audioBuffer, {
      outputPath: "./output.mp4",
    });
    console.log("Video saved to:", videoPath);

    // Get video as buffer
    const videoBuffer = await createVideo(imageBuffer, audioBuffer);
    console.log("Video buffer size:", videoBuffer.length, "bytes");

    // Custom settings with fades
    const customVideo = await createVideo(imageBuffer, audioBuffer, {
      outputPath: "./custom.mp4",
      width: 1280,
      height: 720,
      frameRate: 24,
      fadeInDuration: 1.5,
      fadeOutDuration: 2,
    });
    console.log("Custom video created:", customVideo);

    // Specific duration
    const shortVideo = await createVideo(imageBuffer, audioBuffer, {
      outputPath: "./short.mp4",
      duration: 10, // 10 seconds
    });
    console.log("Short video created:", shortVideo);
  } catch (error) {
    console.error("Error creating video:", error);
  }
}

// Uncomment to run examples
// examples();

export { createVideo, VideoOutputConfig };

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function textToSpeech(
  text: string,
  voiceId: string
): Promise<Buffer> {
  const elevenlabs = new ElevenLabsClient();
  const audio = await elevenlabs.textToSpeech.convert(voiceId, {
    text: text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });
  const chunks = [];
  const reader = audio.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  return buffer;
}

// kdmDKE6EkgrWrrykO9Qt - Alexandra: A super realistic, young female voice that likes to chat
// L0Dsvb3SLTyegXwtm47J - Archer: Grounded and friendly young British male with charm
// g6xIsTj2HwM6VR4iXFCw - Jessica Anne Bogart: Empathetic and expressive, great for wellness coaches
// OYTbf65OHHFELVut7v2H - Hope: Bright and uplifting, perfect for positive interactions
// dj3G1R1ilKoFKhBnWOzG - Eryn: Friendly and relatable, ideal for casual interactions
// HDA9tsk27wYi3uq0fPcK - Stuart: Professional & friendly Aussie, ideal for technical assistance
// 1SM7GgM6IMuvQlz2BwM3 - Mark: Relaxed and laid back, suitable for non chalant chats
// PT4nqlKZfc06VW1BuClj - Angela: Raw and relatable, great listener and down to earth
// vBKc2FfBKJfcZNyEt1n6 - Finn: Tenor pitched, excellent for podcasts and light chats
// 56AoDkrOh6qfVPDXZ7Pt - Cassidy: Engaging and energetic, good for entertainment contexts
// NOpBlnGInO9m6vDvFkFC - Grandpa Spuds Oxley: Distinctive character voice for unique agents

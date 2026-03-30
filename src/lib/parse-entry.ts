import Anthropic from "@anthropic-ai/sdk";
import { ParsedEntry } from "@/types";

const client = new Anthropic();

export async function parseEntry(
  rawText: string,
  imageBase64?: string,
  imageMimeType?: string,
): Promise<ParsedEntry> {
  const now = new Date();
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const promptText = `Parse this activity/consumption log entry into structured data. Current time is ${currentTime}.

Entry: "${rawText}"
${imageBase64 ? "\nAn image of the food/activity is also attached. Use it to better identify the items and estimate calories more accurately." : ""}

Respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "category": "food" | "hydration" | "exercise" | "sleep" | "supplement" | "other",
  "item": "short description of the item/activity",
  "time": "HH:MM AM/PM format - use the time mentioned in the entry, or current time if none mentioned",
  "quantity": "amount with unit if mentioned, or null",
  "duration": "duration if mentioned, or null",
  "calories": estimated calories as a number if it's food/drink, or calories burned if exercise, or null
}`;

  const messageContent: Anthropic.MessageCreateParams["messages"][0]["content"] =
    imageBase64 && imageMimeType
      ? [
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: imageMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text" as const, text: promptText },
        ]
      : promptText;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [{ role: "user", content: messageContent }],
  });

  const responseBlock = message.content[0];
  if (responseBlock.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return JSON.parse(responseBlock.text) as ParsedEntry;
}

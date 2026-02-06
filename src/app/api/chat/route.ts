import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, transcript, history } = await request.json();

    if (!message || !transcript) {
      return new Response(
        JSON.stringify({ error: "Missing message or transcript" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build conversation history for Claude
    const messages = [
      // Include recent history (last 10 messages to stay within context limits)
      ...history.slice(-10).map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      // Add the new user message
      { role: "user" as const, content: message },
    ];

    // Stream the response from Claude
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      system: `You are TubeChat, an AI assistant that helps users understand YouTube videos. You have access to the full transcript of the video the user is asking about.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
- Answer the user's questions based on the transcript above.
- Always reference specific timestamps when citing information from the video. Format timestamps like [5:30] or [1:23:45].
- When you mention a timestamp, format it as **[M:SS]** or **[H:MM:SS]** in bold so it stands out.
- If the user asks for a summary, provide a concise overview hitting the key points with timestamps.
- If the transcript doesn't contain information to answer a question, say so honestly.
- Be conversational and helpful, not robotic.
- Keep responses focused and concise — don't repeat the entire transcript back.
- Use markdown formatting for readability (bold, bullet points, etc.) when helpful.`,
      messages,
    });

    // Convert Anthropic SDK stream to a ReadableStream for the browser
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta") {
              const delta = event.delta;
              if ("text" in delta) {
                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify({ text: delta.text })}\n\n`
                  )
                );
              }
            }
          }
          controller.enqueue(
            new TextEncoder().encode("data: [DONE]\n\n")
          );
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: `Chat failed: ${message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

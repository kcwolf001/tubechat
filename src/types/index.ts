/** A single segment of a YouTube transcript */
export interface TranscriptSegment {
  text: string;
  offset: number;   // start time in seconds
  duration: number;  // duration in seconds
}

/** Full transcript data for a video */
export interface VideoTranscript {
  videoId: string;
  title: string;
  segments: TranscriptSegment[];
  fullText: string;  // all segments joined
}

/** A single chat message */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

/** Request body for the /api/chat endpoint */
export interface ChatRequest {
  message: string;
  videoId: string;
  transcript: string;
  history: ChatMessage[];
}

/** Request body for the /api/transcript endpoint */
export interface TranscriptRequest {
  videoId: string;
}

/** A persisted conversation (one per user per video) */
export interface Conversation {
  id: string;
  user_id: string;
  video_id: string;
  video_title: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

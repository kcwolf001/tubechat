import sys
import json

from youtube_transcript_api import YouTubeTranscriptApi

def main():
    video_id = sys.argv[1]
    
    try:
        transcript = YouTubeTranscriptApi().fetch(video_id)
        
        segments = []
        for snippet in transcript.snippets:
            segments.append({
                "text": snippet.text.strip(),
                "offset": round(snippet.start, 2),
                "duration": round(snippet.duration, 2),
            })
        
        print(json.dumps({"segments": segments}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()

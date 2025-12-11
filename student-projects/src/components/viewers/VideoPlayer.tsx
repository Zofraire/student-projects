"use client";

import { useState } from "react";
import ReactPlayer from "react-player";
import { Button } from "@/src/components/ui/button";
import { Maximize2, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  title?: string;
  platform?: string; // youtube, vimeo, local
}

export default function VideoPlayer({ url, title, platform }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);

  // Determine if URL is from a supported platform
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isVimeo = url.includes("vimeo.com");

  return (
    <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{title || "Video"}</h3>
          {(isYouTube || isVimeo) && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {isYouTube ? "YouTube" : "Vimeo"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading video...</p>
            </div>
          </div>
        )}
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls
          playing={false}
          onReady={() => setIsReady(true)}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
              },
            },
            vimeo: {
              playerOptions: {
                byline: false,
                portrait: false,
              },
            },
          }}
        />
      </div>
    </div>
  );
}

import { Play, X, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useRef } from 'react';
import type { IPropertyVideo } from '@/types/booking';

interface PropertyVideoProps {
  video: IPropertyVideo;
  propertyName: string;
}

export function PropertyVideo({ video, propertyName }: PropertyVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
        
            <>
              <video
                ref={videoRef}
                src={video.url}
                autoPlay={true}
                loop
                muted={isMuted}
                className="w-full h-full object-cover"
                poster={video.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
              
              {/* Mute/Unmute Button */}
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>


              <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm">
                Property Tour
              </Badge>
            </>
        </div>
        <div className="p-4">
          <p className="text-sm font-medium text-foreground">
            Virtual Tour: {propertyName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Experience our property before you book
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

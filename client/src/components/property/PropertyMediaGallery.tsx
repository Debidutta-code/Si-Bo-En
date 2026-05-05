import { useState } from "react";
import { Play, ChevronLeft, ChevronRight, Video, Image as ImageIcon, Volume2, VolumeX } from "lucide-react";

interface PropertyMediaGalleryProps {
  propertyVideo?: {
    url: string;
  };
  propertyImages: string[];
  type: "room" | "property";
}

type MediaItem = 
  | { type: 'video'; url: string }
  | { type: 'image'; url: string };

export default function PropertyMediaGallery({ 
  propertyVideo, 
  propertyImages,
  type = "property"

}: PropertyMediaGalleryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const hasVideo = !!propertyVideo?.url;
  const hasImages = propertyImages.length > 0;

  // Combine video and images for both slider and lightbox
  const allMedia: MediaItem[] = [
    ...(hasVideo && propertyVideo ? [{ type: 'video' as const, url: propertyVideo.url }] : []),
    ...propertyImages.map(url => ({ type: 'image' as const, url }))
  ];

  const totalMedia = allMedia.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalMedia);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalMedia) % totalMedia);
  };


  // Empty state
  if (!hasVideo && !hasImages) {
    return (
      <div className="px-6">
        <div className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-16">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-blue-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Video className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Showcase Your Property
            </h3>
            <p className="text-gray-600 max-w-md">
              Upload stunning photos and an engaging video tour to make your property stand out and attract more bookings
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentMedia = allMedia[currentSlide];

  return (
    <>
      <div className="px-6">
        {/* Main Slider */}
        <div className="relative group">
          <div className={`relative ${type === "property" ? "h-[400px]" : "h-[200px]"} rounded-2xl overflow-hidden bg-black shadow-2xl`}>
            {/* Current Slide */}
            <div className="relative w-full h-full">
              {currentMedia.type === 'video' ? (
                <div className="relative h-full w-full">
                  <video
                    autoPlay={type === "property" ? true : false}
                    controls={type === "property" ? false : true}
                    loop
                    muted={type === "property" ? isMuted : true}
                    playsInline
                    src={currentMedia.url}
                    className="w-full h-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video Badge */}
                  {
                    type==="property"&&(

                  <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Play className="h-3.5 w-3.5" fill="currentColor" />
                      <span>Video Tour</span>
                    </div>
                  </div>
                    )
                  }

                  {/* Mute Toggle */}
                  {
                    type==="property"&&(

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute bottom-6 right-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 rounded-full transition-all duration-200 z-10 text-white"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                    )
                  }
                </div>
              ) : (
                <div className="relative h-full w-full">
                  <img
                    src={currentMedia.url}
                    alt={`Property ${currentSlide + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {totalMedia > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>
              </>
            )}

          </div>

          {/* Thumbnail Gallery Below Main Slider */}
          {totalMedia > 1 && (
            <div className="mt-4 relative">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                      currentSlide === index 
                        ? 'ring-4 ring-blue-600 scale-105 shadow-lg' 
                        : 'ring-2 ring-gray-200 opacity-70 hover:opacity-100 hover:ring-gray-300'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                          <Play className="h-4 w-4 text-blue-600 ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    )}
                    {currentSlide === index && (
                      <div className="absolute inset-0 border-2 border-blue-600 rounded-lg"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>



      {/* Add custom scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
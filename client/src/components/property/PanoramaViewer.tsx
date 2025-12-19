import { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

interface PanoramaViewerProps {
  imageUrl: string;
}

// Utility to convert HTTP Cloudinary URLs to HTTPS
const getSecureCloudinaryUrl = (url: string): string => {
  if (!url) return '';
  // Convert HTTP to HTTPS for Cloudinary URLs
  return url.replace(/^http:\/\//i, 'https://');
};

export default function PanoramaViewer({ imageUrl }: PanoramaViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const sphereViewerRef = useRef<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current || !imageUrl) {
      setError('No image URL provided');
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    // Convert to secure URL
    const secureImageUrl = getSecureCloudinaryUrl(imageUrl);
    console.log('Original URL:', imageUrl);
    console.log('Secure URL:', secureImageUrl);

    // Pre-validate image URL by preloading
    const img = new Image();
    
    // Set crossOrigin for external images (like Cloudinary)
    if (secureImageUrl.startsWith('http') && !secureImageUrl.includes(window.location.hostname)) {
      img.crossOrigin = 'anonymous';
    }

    const initializeViewer = () => {
      if (!mounted || !isMountedRef.current || !viewerRef.current) return;

      // Cleanup previous viewer instance
      if (sphereViewerRef.current) {
        try {
          sphereViewerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying previous viewer:', e);
        }
        sphereViewerRef.current = null;
      }

      try {
        sphereViewerRef.current = new Viewer({
          container: viewerRef.current,
          panorama: secureImageUrl, // Use secure URL
          navbar: [
            'zoom',
            'fullscreen',
          ],
          loadingTxt: 'Loading 360° view...',
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: false,
          requestHeaders: secureImageUrl.includes('cloudinary.com') ? {
            // Add headers if needed for Cloudinary
          } : undefined,
        });

        // Handle ready event
        sphereViewerRef.current.addEventListener('ready', () => {
          if (mounted && isMountedRef.current) {
            setIsLoading(false);
            console.log('Panorama viewer ready');
          }
        });

        // Handle panorama loaded event
        sphereViewerRef.current.addEventListener('panorama-loaded', () => {
          if (mounted && isMountedRef.current) {
            setIsLoading(false);
            console.log('Panorama loaded successfully');
          }
        });

        // Handle position updated (first render)
        sphereViewerRef.current.addEventListener('position-updated', () => {
          if (mounted && isMountedRef.current) {
            setIsLoading(false);
          }
        }, { once: true });

      } catch (err) {
        console.error('Error initializing PanoramaViewer:', err);
        if (mounted && isMountedRef.current) {
          setError('Failed to initialize viewer. Please refresh the page.');
          setIsLoading(false);
        }
      }
    };

    img.onload = () => {
      console.log('Image preloaded successfully, dimensions:', img.width, 'x', img.height);
      if (!mounted || !isMountedRef.current) return;
      
      // Validate image dimensions (should be 2:1 ratio for equirectangular)
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 1.8 || aspectRatio > 2.2) {
        console.warn('Image may not be in proper equirectangular format (2:1 ratio). Current ratio:', aspectRatio);
      }
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeViewer();
      }, 100);
    };

    img.onerror = (e) => {
      console.error('Failed to preload image:', secureImageUrl, e);
      if (mounted && isMountedRef.current) {
        setError('Failed to load image. The image may be blocked, corrupted, or the URL is incorrect.');
        setIsLoading(false);
      }
    };

    // Add timeout for loading
    const loadTimeout = setTimeout(() => {
      if (mounted && isMountedRef.current && isLoading) {
        console.error('Image loading timeout');
        setError('Image loading timeout. Please check your connection and try again.');
        setIsLoading(false);
      }
    }, 30000); // 30 second timeout

    // Start preloading the image with secure URL
    img.src = secureImageUrl;

    return () => {
      mounted = false;
      clearTimeout(loadTimeout);
      img.onload = null;
      img.onerror = null;
      if (sphereViewerRef.current) {
        try {
          sphereViewerRef.current.destroy();
        } catch (e) {
          console.warn('Error during cleanup:', e);
        }
        sphereViewerRef.current = null;
      }
    };
  }, [imageUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-6 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-lg font-semibold mb-2">{error}</p>
          <p className="text-sm text-gray-400 mb-4">
            Common issues:
          </p>
          <ul className="text-xs text-gray-400 text-left space-y-1">
            <li>• Image URL using HTTP instead of HTTPS</li>
            <li>• CORS restrictions on the image server</li>
            <li>• Image format not compatible (use equirectangular 360° images)</li>
            <li>• Network connectivity issues</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading 360° view...</p>
            <p className="text-xs text-gray-400 mt-2">Please wait while the image loads</p>
          </div>
        </div>
      )}
      <div ref={viewerRef} className="w-full h-full" />
    </div>
  );
}
import React, { useState, useRef } from 'react';
import { X, Video,  } from 'lucide-react';
import axios from "axios";
import createAxiosInstance from '../axiosInstance';

const uploadToS3 = async (
  file: File,
  onProgress: (p: number) => void
) => {
  const axiosinstance = createAxiosInstance();

  const res = await axiosinstance.post("/upload/generate-url", {
    fileType: file.type,
  });

  const { uploadUrl, fileUrl } = res.data.data;

  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / (e.total || 1));
      onProgress(percent);
    },
  });

  return {
    videoUrl: fileUrl,
    thumbnailUrl: null, // S3 doesn't provide thumbnail
  };
};

/* =========================
   Cloudinary Upload (Dev)
========================= */
const uploadToCloudinary = async (
  file: File,
  cloudName: string,
  uploadPreset: string,
  onProgress: (p: number) => void
): Promise<{ videoUrl: string; thumbnailUrl: string }> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);

        const videoUrl = response.secure_url;

        // ✅ Correct thumbnail
        const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_1/${response.public_id}.jpg`;

        resolve({ videoUrl, thumbnailUrl });
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
    );
    xhr.send(formData);
  });
};

/* =========================
   Component
========================= */

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (videoUrl: string, thumbnailUrl: string) => void;
  title?: string;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  title = "Upload Video",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  /* =========================
     File Select
  ========================= */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Video file size should not exceed 50MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadSuccess(false);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const isDev = import.meta.env.VITE_NODE_ENV === "development";

    try {
      let result;

      if (isDev) {
        result = await uploadToCloudinary(
          selectedFile,
          CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_UPLOAD_PRESET,
          setUploadProgress
        );
      } else {
        result = await uploadToS3(selectedFile, setUploadProgress);
      }

      setUploadSuccess(true);
      setIsUploading(false);

      setTimeout(() => {
        onUploadSuccess(
          result.videoUrl,
          result.thumbnailUrl || ""
        );
        handleClose();
      }, 1200);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /* =========================
     Close
  ========================= */
  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      setUploadProgress(0);
      setUploadSuccess(false);
      onClose();
    }
  };

  /* =========================
     Drag & Drop
  ========================= */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      const event = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    } else {
      setError("Please drop a valid video file");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Video size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your video here or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">

              {previewUrl && (
                <video src={previewUrl} controls className="w-full max-h-96" />
              )}

              {/* Progress */}
              {isUploading && (
                <div>
                  <p>{uploadProgress}%</p>
                  <div className="w-full bg-gray-200 h-2">
                    <div
                      className="bg-blue-600 h-2"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-red-500">{error}</p>}

              {uploadSuccess && (
                <p className="text-green-600">Uploaded successfully</p>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-4">
          <button onClick={handleClose}>Cancel</button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            Upload
          </button>
        </div>

      </div>
    </div>
  );
};

export default VideoUploadModal;
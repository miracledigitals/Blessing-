import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Heart, ChevronLeft, ChevronRight, X, ZoomIn, Plus, Sparkles } from 'lucide-react';
import { PhotoMemory } from '../types';
import { SunflowerIcon } from './SunflowerIcon';

interface PhotoGalleryProps {
  photos: PhotoMemory[];
  title?: string;
  subtitle?: string;
  onAddPhotoClick?: () => void;
  compact?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  title = "Our Favorite Memories 📸",
  subtitle = "Moments that make my heart smile",
  onAddPhotoClick,
  compact = false,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPhotos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-dashed border-amber-200">
        <SunflowerIcon className="w-10 h-10 mx-auto mb-2 text-amber-500 opacity-80" />
        <h4 className="text-sm font-serif font-semibold text-gray-800">No Photo Memories Added Yet</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
          Add special photos of you two in Settings to light up this page with sweet memories!
        </p>
        {onAddPhotoClick && (
          <button
            onClick={onAddPhotoClick}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-full text-xs font-semibold shadow-md flex items-center space-x-1.5 mx-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memories in Settings</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gallery Header */}
      {!compact && (
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
            <SunflowerIcon className="w-3.5 h-3.5" />
            <span>{title}</span>
            <SunflowerIcon className="w-3.5 h-3.5" />
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 font-sans">{subtitle}</p>
          )}
        </div>
      )}

      {/* Grid of Polaroid Cards */}
      <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'} gap-4`}>
        {photos.map((photo, index) => {
          const isLiked = likedPhotos[photo.id];
          return (
            <motion.div
              key={photo.id || index}
              whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 1 : -1 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedPhotoIndex(index)}
              className="bg-white p-3 rounded-2xl shadow-md border border-amber-100/80 cursor-pointer flex flex-col group relative overflow-hidden"
            >
              {/* Polaroid Frame Container */}
              <div className="relative aspect-4/3 w-full bg-slate-100 rounded-xl overflow-hidden mb-2.5">
                <img
                  src={photo.url}
                  alt={photo.caption || `Memory ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback placeholder image if URL fails
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Corner Sunflower Overlay */}
                <div className="absolute top-2 right-2 text-amber-400 drop-shadow-md opacity-80 group-hover:opacity-100 transition-opacity">
                  <SunflowerIcon className="w-5 h-5" />
                </div>

                {/* Hover Zoom Prompt */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="bg-white/30 backdrop-blur-md p-2 rounded-full">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Caption and Heart Reaction */}
              <div className="flex items-center justify-between pt-0.5 px-1 min-h-[32px]">
                <p className="text-xs font-serif italic text-gray-800 line-clamp-2 leading-tight">
                  {photo.caption || "Special moment 🌻"}
                </p>
                <button
                  type="button"
                  onClick={(e) => toggleLike(photo.id, e)}
                  className="p-1 rounded-full text-red-500 hover:scale-110 transition-transform cursor-pointer shrink-0 ml-1"
                  title="Heart memory"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-300 hover:text-red-400'}`} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-3xl max-w-lg w-full p-4 md:p-6 shadow-2xl border border-amber-200 overflow-hidden space-y-4"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full text-slate-700 shadow-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Lightbox Image */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/3 max-h-[60vh] flex items-center justify-center">
                <img
                  src={photos[selectedPhotoIndex].url}
                  alt={photos[selectedPhotoIndex].caption}
                  className="w-full h-full object-contain"
                />

                {/* Left / Right Navigation */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev !== null ? (prev === 0 ? photos.length - 1 : prev - 1) : 0
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev !== null ? (prev === photos.length - 1 ? 0 : prev + 1) : 0
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Photo Caption & Counter */}
              <div className="flex items-center justify-between pt-1 px-2">
                <div className="flex items-center space-x-2">
                  <SunflowerIcon className="w-5 h-5" />
                  <p className="text-sm font-serif font-medium text-gray-900">
                    {photos[selectedPhotoIndex].caption || "Precious Memory"}
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {selectedPhotoIndex + 1} / {photos.length}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

const ImageGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // images는 이미 배열로 전달됨
  const imageList = images;
  const hasMultiple = imageList.length > 1;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') setIsFullscreen(false);
  };

  React.useEffect(() => {
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, currentIndex]);

  return (
    <>
      {/* 갤러리 컨테이너 */}
      <div className="mb-6 -mx-6">
        <div className="relative">
          {/* 메인 이미지 */}
          <div className="relative h-80 bg-gray-100 overflow-hidden">
            <img
              src={imageList[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
              onClick={() => setIsFullscreen(true)}
            />
            
            {/* 이미지 카운터 */}
            {hasMultiple && (
              <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                {currentIndex + 1} / {imageList.length}
              </div>
            )}

            {/* 확대 아이콘 */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* 좌우 화살표 */}
            {hasMultiple && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* 썸네일 리스트 */}
          {hasMultiple && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
              {imageList.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === index
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`썸네일 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 풀스크린 모달 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 이미지 카운터 */}
          {hasMultiple && (
            <div className="absolute top-4 left-4 bg-black/70 text-white text-lg px-4 py-2 rounded-full">
              {currentIndex + 1} / {imageList.length}
            </div>
          )}

          {/* 이미지 */}
          <img
            src={imageList[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={() => setIsFullscreen(false)}
          />

          {/* 좌우 화살표 */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* 썸네일 스트립 */}
          {hasMultiple && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 bg-black/50 p-3 rounded-xl">
              {imageList.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === index
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`썸네일 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
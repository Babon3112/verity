"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export type CarouselMediaItem = {
  url: string;
  type: "image" | "video";
};

type Props = {
  items: CarouselMediaItem[];
  onRemove?: (index: number) => void; // optional (used in preview only)
};

const MediaCarousel = ({ items, onRemove }: Props) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () =>
    setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));

  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  if (!items.length) return null;

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="relative min-w-full aspect-square">
              {onRemove && (
                <button
                  onClick={() => onRemove(index)}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}

              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt="media"
                  fill
                  className="object-contain"
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  className="absolute inset-0 h-full w-full object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xl transition hover:bg-black/60 active:scale-95"
            >
              ‹
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xl transition hover:bg-black/60 active:scale-95"
            >
              ›
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 w-2 rounded-full ${
                current === index ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;

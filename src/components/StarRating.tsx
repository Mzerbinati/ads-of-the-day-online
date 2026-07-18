"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number | null) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  return (
    <div className="flex gap-1.5" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(value === star ? null : star)}
          onMouseEnter={() => !readonly && setHover(star)}
          className={`text-[24px] leading-none transition-all duration-200 ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
          style={{
            color:
              star <= display ? "#e8a020" : "rgba(15, 17, 23, 0.15)",
            filter: star <= display ? "drop-shadow(0 2px 6px rgba(232,160,32,0.35))" : "none",
          }}
          aria-label={`${star} stelle`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: number;
  showValue?: boolean;
  reviews?: number;
}

export function StarRating({ value, size = 14, showValue = true, reviews }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(value) ? "#f59e0b" : "#e5e7eb"}
          stroke="none"
        />
      ))}
      {showValue && (
        <span className="text-amber-500 font-bold ml-0.5" style={{ fontSize: size }}>
          {value}
        </span>
      )}
      {reviews !== undefined && (
        <span className="text-gray-400 ml-0.5" style={{ fontSize: size - 1 }}>
          ({reviews})
        </span>
      )}
    </div>
  );
}

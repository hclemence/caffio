import React from "react";
import { Coffee } from "lucide-react";

interface RatingProps {
  rating: number;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({ rating, className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-1 bg-muted p-2 rounded-full ${className}`}>
      {[...Array(5)].map((_, i) => {
        const fillPercent = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block">
            <Coffee className="w-4 h-4 text-gray-300 fill-gray-300" />
            {fillPercent > 0 && (
              <span
                className="absolute left-0 top-0 h-full overflow-hidden"
                style={{ width: `${fillPercent * 100}%` }}
              >
                <Coffee className="w-4 h-4 text-brand-1 fill-brand-1" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default Rating;

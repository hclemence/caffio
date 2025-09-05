import React from "react";
import { Coffee } from "lucide-react";

interface RatingProps {
  rating: number;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({ rating, className = "" }) => {
  return (
    <div className={`flex gap-1 items-center ${className}`}>
      {[...Array(5)].map((_, i) => {
        const fillPercent = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block">
            <Coffee className="w-5 h-5 text-muted-foreground fill-muted-foreground" />
            {fillPercent > 0 && (
              <span
                className="absolute left-0 top-0 h-full overflow-hidden"
                style={{ width: `${fillPercent * 100}%` }}
              >
                <Coffee className="w-5 h-5 text-orange-500 fill-orange-500" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default Rating;

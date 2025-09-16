import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  showNumber?: boolean;
  className?: string;
}

const StarRating = ({ rating = 4.5, showNumber = false, className = "" }: StarRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-amber-neon text-amber-neon" />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-amber-neon/30" />
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
              <Star className="w-4 h-4 fill-amber-neon text-amber-neon" />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-amber-neon/30" />
        ))}
      </div>
      
      {showNumber && (
        <span className="text-sm font-medium text-foreground ml-1">{rating}</span>
      )}
      
      {/* Screen reader only text */}
      <span className="sr-only">{rating} out of 5 stars</span>
    </div>
  );
};

export default StarRating;
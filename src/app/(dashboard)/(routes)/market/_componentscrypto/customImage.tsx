import Image from "next/image";
import { useState } from "react";

// Define the props for the CustomImage component
interface CustomImageProps {
  imageUrl: string;
  size: number;
}

const CustomImage: React.FC<CustomImageProps> = ({ imageUrl, size }) => {
  const [src, setSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  // Fallback to default image if the original one fails to load
  const handleError = () => {
    setHasError(true);
    setSrc("/assets/Send.svg"); // Use the correct fallback path
  };

  // If there's an error, show a placeholder with the first letter of the symbol
  if (hasError) {
    return (
      <div 
        className="flex items-center justify-center rounded-full bg-gray-600 text-white font-bold"
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>
          {imageUrl.includes('coins') ? 
            imageUrl.split('/').pop()?.charAt(0).toUpperCase() || '?' : 
            '?'
          }
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Crypto Icon"
      width={size}
      height={size}
      onError={handleError}
      className="rounded-full"
    />
  );
};

export default CustomImage;

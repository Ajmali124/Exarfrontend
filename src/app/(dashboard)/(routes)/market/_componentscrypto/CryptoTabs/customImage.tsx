"use client";
import Image from "next/image";

interface CustomImageProps {
  imageUrl: string;
  size?: number;
}

const CustomImage: React.FC<CustomImageProps> = ({ imageUrl, size }) => {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <Image
        src={imageUrl}
        alt="Image"
        width={32}
        height={32}
        quality={100}
        onError={(e) => {
          e.currentTarget.src = "/t6.png";
        }}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
};

export default CustomImage;

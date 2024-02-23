import Image from "next/image";
import React, { useEffect, useState } from "react";

export const SplashModal = () => {
  const images = [
    "/images/Logo_Echo_1.webp",
    "/images/Logo_Echo_2.webp",
    "/images/Logo_Echo_3.webp",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 700);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="splash-modal-container">
      <div className="splash-content">
        <h1>ROMEO</h1>
        <h2>Share and edit 3D models data</h2>
        <Image
          src={images[currentImageIndex]}
          alt="ROMEO"
          width={128}
          height={128}
          priority
        />
        <h3>No expert skills needed</h3>
        <h3>Communicate simply</h3>
        <h3>Control your 3D data</h3>
      </div>
    </div>
  );
};

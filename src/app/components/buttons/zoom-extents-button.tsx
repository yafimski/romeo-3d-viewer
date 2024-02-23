import Image from "next/image";
import React, { FC, MouseEventHandler } from "react";
import { useMainContext } from "../../context-provider";
import { ZoomExtents } from "../../utils/viewer-utils";

type ClickHandler = MouseEventHandler<HTMLButtonElement>;

export const ZoomExtentsButton: FC = () => {
  const { scene, camera, controls } = useMainContext();

  const handleZoomClick: ClickHandler = (event) => {
    if (scene && camera && controls) {
      ZoomExtents({ scene, camera, controls });
    }
  };

  return (
    <button className="generic-button fixed-top-left" onClick={handleZoomClick}>
      <Image src="/icons/fit.webp" alt="Zoom Extents" width={20} height={20} />
    </button>
  );
};

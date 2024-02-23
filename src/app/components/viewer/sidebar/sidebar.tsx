import { AllMeshesInScene } from "@/app/utils/viewer-utils";
import React, { FC, useEffect, useState } from "react";
import { BufferGeometry, Material, Mesh } from "three";
import { useMainContext } from "../../../context-provider";
import { Info } from "../../../types/dotbim-types";
import "../viewer.css";
import { DataHeader } from "./sidebar-data-header";
import { SidebarDataList } from "./sidebar-data-list";

type SidebarProps = {
  loadedFilename: string;
  lastIntersected: Mesh<BufferGeometry, Material | Material[]> | null;
};

export const DataSidebar: FC<SidebarProps> = ({ loadedFilename, lastIntersected }) => {
  const { scene } = useMainContext();

  const [currentData, setCurrentData] = useState<Info | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState("20%");

  useEffect(() => {
    if (lastIntersected) {
      if (scene) {
        const meshes: Mesh[] = AllMeshesInScene(scene);
        const matchingElement =
          meshes.find((mesh: Mesh) => mesh.uuid === lastIntersected.uuid) || null;
        setCurrentData(matchingElement?.userData.metadata.info || null);
      }
    } else {
      setCurrentData(scene?.userData?.metadata?.info || null);
    }
  }, [lastIntersected, scene]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const mouseX = e.clientX;
    const screenWidth = window.innerWidth;
    const sidebarWidthPercent = (mouseX / screenWidth) * 100;
    setSidebarWidth(`${sidebarWidthPercent}%`);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="viewer-sidebar" style={{ width: sidebarWidth }}>
      <div className="sidebar-content">
        <DataHeader label={loadedFilename} />
        <SidebarDataList data={currentData} />
        <div className="drag-handle" onMouseDown={handleMouseDown}></div>
      </div>
    </div>
  );
};

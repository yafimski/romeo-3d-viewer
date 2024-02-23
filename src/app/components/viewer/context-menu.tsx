import { MainContext } from "@/app/context-provider";
import { Tool } from "@/app/types/generic-types";
import { AllMeshesInScene, ZoomExtents } from "@/app/utils/viewer-utils";
import Image from "next/image";
import { CSSProperties, FC, useContext, useEffect, useState } from "react";
import { GetContextMenuTools } from "./context-menu-tools";

interface Position {
  left: number;
  top: number;
}

interface ContextMenuProps {
  position: Position;
  hideContextMenu: boolean;
  onSelection: (hide: boolean) => void;
}

export const ContextMenu: FC<ContextMenuProps> = ({
  position,
  hideContextMenu,
  onSelection,
}) => {
  const { scene, camera, controls, lastIntersected } = useContext(MainContext);
  const [allMeshesVisible, setAllMeshesVisible] = useState(true);

  const { left, top } = position;
  const menuStyle: CSSProperties = {
    position: "absolute",
    height: lastIntersected ? "10rem" : "2.5rem",
    left,
    top,
    display: (!allMeshesVisible && !lastIntersected) || lastIntersected ? "flex" : "none",
  };

  const handleContextSelection = (tool: Tool) => {
    const handlerMap: Record<string, () => void> = {
      "Zoom selected": handleZoomSelected,
      "Isolate selected": handleIsolateSelected,
      "Hide selected": handleHideSelected,
      "Show selected": handleShowSelected,
      "Show All": handleShowAll,
    };

    const handler = handlerMap[tool.name];
    if (handler) {
      handler();
    }

    onSelection(true);
  };

  const handleZoomSelected = () => {
    if (camera && controls && lastIntersected) {
      const mesh = lastIntersected;
      ZoomExtents({ camera, controls, mesh });
    }
  };

  const handleIsolateSelected = () => {
    if (scene) {
      const meshes = AllMeshesInScene(scene);
      meshes?.forEach((mesh) => {
        if (mesh !== lastIntersected) {
          mesh.visible = false;
        }
      });
    }
  };

  const handleHideSelected = () => {
    if (lastIntersected) {
      lastIntersected.visible = false;
    }
  };

  const handleShowSelected = () => {
    if (lastIntersected) {
      lastIntersected.visible = true;
    }
  };

  const handleShowAll = () => {
    if (scene) {
      const meshes = AllMeshesInScene(scene);
      meshes?.forEach((mesh) => (mesh.visible = true));
    }
  };

  const contextMenuTools = GetContextMenuTools();
  const showAll = contextMenuTools.filter((tool) => tool.name === "Show All")[0];
  const selectionTools = contextMenuTools.filter((tool) => tool.name !== "Show All");

  useEffect(() => {
    if (scene) {
      const meshes = AllMeshesInScene(scene);
      if (meshes.some((mesh) => mesh.visible == false)) {
        setAllMeshesVisible(false);
      }
    }
  }, []);

  return (
    !hideContextMenu && (
      <div className="context-menu" style={menuStyle}>
        {!lastIntersected && !allMeshesVisible && (
          <div
            className="context-menu-action data-item-row"
            onClick={() => handleContextSelection(showAll)}
          >
            <Image src={showAll.icon} alt={showAll.name} width={20} height={20} />
            <p>Show All</p>
          </div>
        )}

        {lastIntersected &&
          selectionTools.map((tool) => (
            <div
              key={tool.name}
              className="context-menu-action data-item-row"
              onClick={() => handleContextSelection(tool)}
            >
              <Image src={tool.icon} alt={tool.name} width={20} height={20} />
              <p>{tool.name}</p>
            </div>
          ))}
      </div>
    )
  );
};

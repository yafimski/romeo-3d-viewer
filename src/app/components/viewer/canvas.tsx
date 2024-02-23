import { FC, useCallback, useEffect, useState } from "react";
import { Material, Mesh } from "three";
import { useMainContext } from "../../context-provider";
import { HighlightMesh, UnHighlightMesh } from "../../utils/material-utils";
import { GetFirstVisibleIntersectingObjectWithMouse } from "../../utils/viewer-utils";
import { ContextMenu } from "./context-menu";

export const Canvas: FC = () => {
  const [rightClicked, setRightClicked] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ left: 0, top: 0 });
  const [hideContextMenu, setHideContextMenu] = useState(true);

  const {
    canvasRef,
    scene,
    camera,
    renderer,
    raycaster,
    lastIntersected,
    setLastIntersected,
    setLastMeshId,
    lastMeshMaterial,
    setLastMeshMaterial,
  } = useMainContext();

  const mouseClickOnCanvas = (event: any) => {
    if (!renderer || !scene || !raycaster || !camera) {
      console.error("Aborted. Missing scene/camera/raycaster/renderer");
      return;
    }

    const UpdateMeshContext = (currentMesh: Mesh) => {
      currentMesh.userData.originalMaterial = (currentMesh.material as Material).clone();
      setLastIntersected(currentMesh);
      setLastMeshId(currentMesh.uuid);
      HighlightMesh(currentMesh);
    };

    const ColorMeshWithPicker = (currentMesh: Mesh) => {
      if (lastMeshMaterial) {
        currentMesh.material = lastMeshMaterial;
      }
    };

    const currentMesh = GetFirstVisibleIntersectingObjectWithMouse(
      event,
      scene,
      camera,
      renderer,
      raycaster
    ) as Mesh;

    if (currentMesh) {
      if (!lastIntersected) {
        UpdateMeshContext(currentMesh);
      } else if (currentMesh == lastIntersected) {
        if (currentMesh.material != currentMesh.userData.originalMaterial) {
          UnHighlightMesh(currentMesh);
          ColorMeshWithPicker(currentMesh);
          setLastIntersected(null);
          setLastMeshMaterial(null);
        }
      } else {
        UnHighlightMesh(lastIntersected);
        ColorMeshWithPicker(lastIntersected);
        UpdateMeshContext(currentMesh);
      }
    } else {
      if (lastIntersected) {
        UnHighlightMesh(lastIntersected);
        ColorMeshWithPicker(lastIntersected);
      }
      setLastIntersected(null);
      setLastMeshMaterial(null);
    }

    if (event.button === 0) {
      setRightClicked(false);
      setHideContextMenu(true);
    }
  };

  const handleContextMenu = useCallback((e: any) => {
    e.preventDefault();
    const position = { left: e.clientX, top: e.clientY };
    setRightClicked(true);
    setContextMenuPosition(position);
    setHideContextMenu(false);
  }, []);

  useEffect(() => {
    if (canvasRef) {
      const canvas = canvasRef.current;
      canvas?.addEventListener("contextmenu", handleContextMenu);
      return () => {
        canvas?.removeEventListener("contextmenu", handleContextMenu);
      };
    }
  }, [handleContextMenu]);

  const handleSelection = (hide: boolean) => {
    setHideContextMenu(hide);
  };

  return (
    <>
      <canvas className="online-3d-viewer" onClick={mouseClickOnCanvas} ref={canvasRef} />
      {rightClicked && (
        <ContextMenu
          position={contextMenuPosition}
          hideContextMenu={hideContextMenu}
          onSelection={(hide: boolean) => handleSelection(hide)}
        />
      )}
    </>
  );
};

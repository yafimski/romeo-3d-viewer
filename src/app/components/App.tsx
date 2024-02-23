"use client";
import { FC, useEffect } from "react";
import { LoadFromCloudButton } from "../components/buttons/load-from-cloud-button";
import { LoadLocalButton } from "../components/buttons/load-from-local-button";
import { LogoutButton } from "../components/buttons/logout-button";
import { PublicLinkButton } from "../components/buttons/public-link-button";
import { SaveToCloudButton } from "../components/buttons/save-to-cloud-button";
import { ZoomExtentsButton } from "../components/buttons/zoom-extents-button";
import { Canvas } from "../components/viewer/canvas";
import { DataSidebar } from "../components/viewer/sidebar/sidebar";
import { useMainContext } from "../context-provider";
import {
  EnsureMeshMetadata,
  EnsureDefaultSceneInfo,
} from "../utils/import-utils";
import {
  AllMeshesInScene,
  CreateScene,
  DefineMeshesInScene,
} from "../utils/viewer-utils";
import { GenericModal } from "./viewer/generic-modal";
import { MaterialsPanel } from "./viewer/sidebar/sidebar-materials-panel";

export const App: FC = () => {
  const {
    canvasRef,
    scene,
    camera,
    controls,
    setScene,
    setCamera,
    setControls,
    setRenderer,
    setRaycaster,
    isFileLoaded,
    loadedFile,
    setLoadedFile,
    lastIntersected,
  } = useMainContext();

  useEffect(() => {
    if (!scene) {
      const { scene, camera, renderer, controls, raycaster } =
        CreateScene(canvasRef);

      setScene(scene);
      setCamera(camera);
      setControls(controls);
      setRenderer(renderer);
      setRaycaster(raycaster);
    }
  }, []);

  const handleFileLoad = async (file: File | null) => {
    if (!scene || !camera || !controls) {
      console.error("Invalid scene/camera/controls.");
      return null;
    }

    if (file) {
      setLoadedFile(file);
      await DefineMeshesInScene(file.name, scene, camera, controls);

      if (!scene.userData.metadata) {
        scene.userData.metadata = await EnsureDefaultSceneInfo();
      }

      const allMeshes = AllMeshesInScene(scene);
      await EnsureMeshMetadata(allMeshes);
    }

    return null;
  };

  return (
    <>
      <div className="button-bar">
        <LoadLocalButton onLoad={handleFileLoad} />
        <LoadFromCloudButton onLoad={handleFileLoad} />
        <SaveToCloudButton />
        <ZoomExtentsButton />
        <PublicLinkButton />
        <LogoutButton />
      </div>

      <div className="main-container">
        {isFileLoaded && (
          <DataSidebar
            loadedFilename={
              loadedFile?.name.replace(/\.[^/.]+$/, "") ?? "Unknown Filename"
            }
            lastIntersected={lastIntersected}
          />
        )}
        {isFileLoaded && <MaterialsPanel />}
        {!isFileLoaded && <GenericModal content="No Model Loaded" />}
        <Canvas />
      </div>
    </>
  );
};

export default App;

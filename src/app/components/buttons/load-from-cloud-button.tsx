import Image from "next/image";
import React, { FC, useState } from "react";
import { LoadFilesModal } from "../loader/load-files-modal";
import { DotBimFile, DotBimMesh, DotBimMetadata } from "../../types/dotbim-types";
import { useMainContext } from "../../context-provider";
import { LoadFileProps } from "../../types/generic-types";
import { CreateFileFromJson as CreateFileFromJsonParts } from "../../utils/parse-utils";
import { ImportDotBimJsonFile } from "@/app/utils/import-utils";
import { DisposeScene } from "@/app/utils/viewer-utils";

export const LoadFromCloudButton: FC<LoadFileProps> = ({ onLoad }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    scene,
    setDotBimJson,
    setMeshesJson,
    setMetadataJson,
    setLoadedFile,
    setIsFileLoaded,
  } = useMainContext();

  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleLoaded = async (
    fileName: string,
    compiledDotBimJson: DotBimFile,
    meshesJson: DotBimMesh[],
    metadataJson: DotBimMetadata
  ) => {
    await DisposeScene(scene);

    if (compiledDotBimJson) {
      setIsFileLoaded(true);

      setDotBimJson(compiledDotBimJson);
      setMeshesJson(meshesJson);
      setMetadataJson(metadataJson);

      const file = CreateFileFromJsonParts(compiledDotBimJson, fileName);

      if (scene) {
        await ImportDotBimJsonFile(compiledDotBimJson, scene);
      }

      onLoad(file);
      setLoadedFile(file);
    }
  };

  return (
    <>
      <button className="generic-button" onClick={handleModalOpen}>
        <div className="button-icon" style={{ color: "#000000" }}>
          <Image
            src="/icons/load_from_cloud.webp"
            alt="Load from Cloud"
            width={20}
            height={20}
          />
        </div>
      </button>
      {modalOpen && <LoadFilesModal onClose={handleModalClose} onFile={handleLoaded} />}
    </>
  );
};

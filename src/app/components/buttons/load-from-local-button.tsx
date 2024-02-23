import {
  Import3dsfFile,
  ImportFbxFile,
  ImportGltfFile,
  ImportObjFile,
  ImportRhino3dmFile,
  ImportStlFile,
  ImportDotBimJsonFile,
} from "@/app/utils/import-utils";
import { DisposeScene } from "@/app/utils/viewer-utils";
import Image from "next/image";
import React, { FC, useContext } from "react";
import { AuthContext, useMainContext } from "../../context-provider";
import { DotBimFile } from "../../types/dotbim-types";
import { LoadFileProps } from "../../types/generic-types";
import {
  GetMetadataFromDotBim,
  ParseDotBimJson,
} from "../../utils/parse-utils";

export const LoadLocalButton: FC<LoadFileProps> = ({ onLoad }) => {
  const {
    scene,
    setDotBimJson,
    setMeshesJson,
    setMetadataJson,
    setLoadedFile,
    setIsFileLoaded,
  } = useMainContext();

  const { state } = useContext(AuthContext);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    await DisposeScene(scene);

    const file = event.target.files?.[0];
    if (file) {
      event.target.value = "";

      setLoadedFile(file);
      const fileExtension = file.name.split(".").pop();
      if (scene) {
        switch (fileExtension) {
          case "bim":
            let dotBimJson: DotBimFile | null = null;
            try {
              dotBimJson = await ParseDotBimJson(file);
            } catch (error) {
              console.error({ error });
              return null;
            }

            await setDotBimJsonParsed(dotBimJson);
            await ImportDotBimJsonFile(dotBimJson, scene);

            break;
          case "3dm":
            await ImportRhino3dmFile(file, scene);
            break;
          case "obj":
            await ImportObjFile(file, scene);
            break;
          case "stl":
            await ImportStlFile(file, scene);
            break;
          case "fbx":
            await ImportFbxFile(file, scene);
            break;
          case "gltf":
          case "glb":
            await ImportGltfFile(file, scene);
            break;
          case "3ds":
            await Import3dsfFile(file, scene);
            break;
          default:
            alert(`File format not supported (yet).`);
            break;
        }

        await onLoad(file);

        setIsFileLoaded(true);
      }
    }
  };

  const setDotBimJsonParsed = async (dotBimJson: DotBimFile | null) => {
    if (dotBimJson !== null) {
      setMeshesJson(dotBimJson.meshes);
      setMetadataJson(GetMetadataFromDotBim(dotBimJson));
      setDotBimJson(dotBimJson);
    }
  };

  return (
    <>
      <button className="generic-button">
        <label htmlFor="file-input">
          <div className="button-icon" style={{ color: "#000000" }}>
            <Image
              src="/icons/open.webp"
              alt="Load Local File"
              width={20}
              height={20}
            />
          </div>
        </label>
        <input
          id="file-input"
          type="file"
          accept=".obj, .gltf, .stl, .bim, .sat, .dxf, .3ds, .skp, .3dm, .dae,"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
      </button>
    </>
  );
};

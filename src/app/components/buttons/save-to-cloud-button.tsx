import { DotBimFile } from "@/app/types/dotbim-types";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { FC, useState } from "react";
import { useAuthContext, useMainContext } from "../../context-provider";
import {
  AddFileToUserData,
  CheckIfModelCountAllowed,
  CheckIfModelSizeValid,
} from "../../utils/firebase-utils";
import {
  CompileDotBimFromScene,
  GetMeshesFromDotBim,
  GetMetadataFromDotBim,
  MeshesName,
  MeshesOriginalName,
  MetadataName,
  MetadataOriginalName,
} from "../../utils/parse-utils";
import "../loader/cloud-modal.css";

export const SaveToCloudButton: FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  const { state } = useAuthContext();
  const { user } = state;
  if (!user) throw new Error("User is not logged in");

  const {
    scene,
    camera,
    setDotBimJson,
    setMeshesJson,
    setMetadataJson,
    loadedFile,
  } = useMainContext();

  const handleSaveToCloud = async () => {
    if (!loadedFile) return;

    const fileSizeMB = loadedFile.size / 1048576;
    const { isModelSizeValid, modelSizeLimit } = await CheckIfModelSizeValid(
      state.user,
      fileSizeMB
    );
    if (!isModelSizeValid) {
      alert(
        `Warning!\nModel is too large. The size exceeds your cloud file size limit.\nPlease upload models under ${modelSizeLimit}MB or contact us.`
      );
      return;
    }

    const { isModelCountValid, maxModelsAllowed } =
      await CheckIfModelCountAllowed(state.user);
    if (!isModelCountValid) {
      if (maxModelsAllowed == 1) {
        alert(
          `Warning!\nYou are only allowed to 1 model.\nPlease delete your model to make space or contact us.`
        );
      } else {
        alert(
          `Warning!\nYou are only allowed to upload ${maxModelsAllowed} models.\nPlease delete models to make space or contact us.`
        );
      }
      return;
    }

    const storage = getStorage();
    const fileName = `${loadedFile.name}`;

    if (scene && camera) {
      const dotBimJson: DotBimFile = await CompileDotBimFromScene(
        scene,
        camera
      );

      setDotBimJson(dotBimJson);
      const meshesJson = GetMeshesFromDotBim(dotBimJson);
      const metadataJson = GetMetadataFromDotBim(dotBimJson);

      setMeshesJson(meshesJson);
      setMetadataJson(metadataJson);

      const meshesJsonString = JSON.stringify(meshesJson);
      const metadataJsonString = JSON.stringify(metadataJson);
      const meshesBlob = new Blob([meshesJsonString], {
        type: "application/json",
      });
      const metadataBlob = new Blob([metadataJsonString], {
        type: "application/json",
      });

      const userFilesRef = ref(storage, `users/${user.email}/${fileName}`);
      const meshesRef = ref(userFilesRef, MeshesName(fileName));
      const metadataRef = ref(userFilesRef, MetadataName(fileName));
      const meshesRefOriginal = ref(userFilesRef, MeshesOriginalName(fileName));
      const metadataRefOriginal = ref(
        userFilesRef,
        MetadataOriginalName(fileName)
      );

      try {
        setIsSaving(true);
        getDownloadURL(meshesRefOriginal)
          .then(async () => {
            console.log(
              `Originals exist. uploading current files for ${fileName}.`
            );
          })
          .catch(async (error) => {
            console.log(
              `${fileName} files do not exist yet. Uploading originals.`
            );
            await uploadBytes(meshesRefOriginal, meshesBlob);
            await uploadBytes(metadataRefOriginal, metadataBlob);
          });

        await uploadBytes(meshesRef, meshesBlob);
        await uploadBytes(metadataRef, metadataBlob);

        AddFileToUserData(fileName, meshesRef, metadataRef, user);
        console.log("Files uploaded successfully.");

        setTimeout(() => {
          setIsSaving(false);
        }, 1000);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const spinner = (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );

  return (
    <>
      <button className="generic-button" onClick={handleSaveToCloud}>
        <Image
          src="/icons/save_to_cloud.webp"
          alt="Save to Cloud"
          width={20}
          height={20}
        />
      </button>

      {isSaving && (
        <div className="success-modal-overlay">
          <div className="success-popup-modal">
            {spinner}
            <h2>Uploading...</h2>
          </div>
        </div>
      )}
    </>
  );
};

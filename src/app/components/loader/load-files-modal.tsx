"use client";
import { getStorage, list, ref } from "firebase/storage";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { useAuthContext } from "../../context-provider";
import {
  DotBimFile,
  DotBimMesh,
  DotBimMetadata,
} from "../../types/dotbim-types";
import { FirebaseFileData } from "../../types/generic-types";
import {
  DeleteFileFromFirestoreDatabase,
  DeleteFileFromFirebaseStorage,
  GetUserSubfolderNamesFromStorage,
  GetFileJsonParts,
} from "../../utils/firebase-utils";
import {
  CompileDotBimFromJsonParts,
  MeshesName,
  MetadataName,
  RemovePrefixes,
} from "../../utils/parse-utils";
import "./cloud-modal.css";
import { LoadFilesRow } from "./load-files-modal-row";

interface LoadFilesModalProps {
  onClose: () => void;
  onFile: (
    fileName: string,
    compiledDotBimJson: DotBimFile,
    meshesJson: DotBimMesh[],
    metadataJson: DotBimMetadata
  ) => Promise<void>;
}

export const LoadFilesModal: FC<LoadFilesModalProps> = ({
  onClose,
  onFile,
}) => {
  const { state } = useAuthContext();
  const user = state.user;

  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [actionType, setActionType] = useState<"download" | "delete" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const filesData: FirebaseFileData[] = [];

    const GetFiles = async () => {
      await GetUserSubfolderNamesFromStorage(userFolderRef).then(
        (folderNames) => {
          folderNames.forEach((folderName) => {
            const folderRef = ref(
              storage,
              `users/${user?.email}/${folderName}`
            );

            list(folderRef).then((res) => {
              const folderPath = res.items[0].toString();

              const lastSlashIndex = folderPath.lastIndexOf("/");
              const folderUrl = folderPath.substring(0, lastSlashIndex);

              const name = RemovePrefixes(folderPath);
              filesData.push({
                url: folderUrl,
                name,
              });
              const newRows = Object.entries(filesData).map(([key, value]) => (
                <LoadFilesRow
                  key={`${key}`}
                  url={value.url}
                  fileName={value.name}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ));
              setRows(newRows);
            });
          });
        }
      );
    };

    GetFiles();
  }, []);

  const storage = getStorage();
  const userFolderRef = ref(storage, `users/${user?.email}`);

  const handleClose = () => {
    onClose();
  };

  const handleDelete = (url: string) => {
    setSelectedFileUrl(url);
    setActionType("delete");
  };

  const handleDownload = (url: string) => {
    setSelectedFileUrl(url);
    setActionType("download");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedFileUrl !== "") {
        if (actionType === "delete") {
          const folderName = selectedFileUrl.split("/").pop() || "unknown";
          try {
            await DeleteFileFromFirebaseStorage(user, folderName);
            await DeleteFileFromFirestoreDatabase(user, folderName);
            onClose();
          } catch (error) {
            console.error("Error deleting file:", error);
          }
        } else if (actionType === "download") {
          setIsLoading(true);

          const storageRef = ref(storage, selectedFileUrl);
          const folderName = selectedFileUrl.split("/").pop() || "unknown";

          const meshesJson = await GetFileJsonParts(
            storageRef,
            MeshesName(folderName)
          );
          const metadataJson = await GetFileJsonParts(
            storageRef,
            MetadataName(folderName)
          );

          const compiledDotBimJson = CompileDotBimFromJsonParts(
            meshesJson as DotBimMesh[],
            metadataJson as DotBimMetadata
          );
          onFile(
            folderName,
            compiledDotBimJson,
            meshesJson as DotBimMesh[],
            metadataJson as DotBimMetadata
          );
          setIsLoading(false);
          onClose();
        }
      }
    };

    fetchData();
  }, [selectedFileUrl, actionType]);

  const spinner = (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="load-files-modal-overlay">
      <div className="load-files-modal">
        <div className="load-files-modal-header">
          <p>Available models</p>
          {rows.length === 0 && <p>No models</p>}
          <button className="load-files-modal-button" onClick={handleClose}>
            <Image src="/icons/close.webp" alt="Close" width={20} height={20} />
          </button>
        </div>
        {rows}
        {isLoading && spinner}
      </div>
    </div>
  );
};

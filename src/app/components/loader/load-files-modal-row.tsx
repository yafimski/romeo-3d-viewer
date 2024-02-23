import Image from "next/image";
import React from "react";
import { FC } from "react";

interface LoadFilesRowProps {
  url: string;
  fileName: string;
  onDownload: (fileName: string) => void;
  onDelete: (fileName: string) => void;
}

export const LoadFilesRow: FC<LoadFilesRowProps> = ({
  url,
  fileName,
  onDownload,
  onDelete,
}) => {
  const handleDownload = () => {
    onDownload(url);
  };

  const handleDelete = () => {
    onDelete(url);
  };

  return (
    <div className="load-files-row" tabIndex={0}>
      <span>{fileName}</span>
      <div className="load-files-row-buttons">
        <Image
          src="/icons/load_from_cloud.webp"
          alt="Download"
          width={20}
          height={20}
          onClick={handleDownload}
        />
        <Image
          src="/icons/trash.webp"
          alt="Delete"
          width={20}
          height={20}
          onClick={handleDelete}
        />
      </div>
    </div>
  );
};

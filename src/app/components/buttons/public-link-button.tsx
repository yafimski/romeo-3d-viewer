import Image from "next/image";
import React, { FC, useState } from "react";
import { useAuthContext, useMainContext } from "../../context-provider";
import { FirestoreGuidOfCurrentFile } from "../../utils/firebase-utils";
import { GenericModal } from "../viewer/generic-modal";

export const PublicLinkButton: FC = () => {
  const { state } = useAuthContext();
  const { user } = state;
  if (!user) throw new Error("User is not logged in");

  const { loadedFile } = useMainContext();
  const [isCopying, setIsCopying] = useState(false);
  const [validGuid, setValidGuid] = useState(true);

  const createLink = () => {
    const openModal = async () => {
      if (loadedFile) {
        const publicGuid = await FirestoreGuidOfCurrentFile(
          loadedFile.name,
          user
        );
        const regexGuid = /^[a-z0-9]{8}-([a-z0-9]{4}-){3}[a-z0-9]{12}$/i;
        if (publicGuid && regexGuid.test(publicGuid)) {
          const publicUrl = `https://romeo-e135f.web.app/public/${publicGuid}`;
          copyToClipboard(publicUrl);
          try {
            setIsCopying(true);
            setTimeout(() => {
              setIsCopying(false);
            }, 1500);
          } catch (error) {
            console.error(error);
          }
        } else {
          try {
            setValidGuid(false);
            setTimeout(() => {
              setValidGuid(true);
            }, 1500);
          } catch (error) {
            console.error(error);
          }
        }
      }
    };

    openModal();
  };

  return (
    <>
      <button
        className="generic-button disabled"
        disabled={!Boolean(loadedFile)}
        onClick={createLink}
      >
        <div className="button-icon" style={{ color: "#000000" }}>
          <Image
            src="/icons/open_url.webp"
            alt="Share Link"
            width={20}
            height={20}
          />
        </div>
      </button>
      {isCopying && validGuid && (
        <GenericModal content={"Public URL copied!"} />
      )}
      {!validGuid && (
        <GenericModal content={"Upload model to Cloud first..."} />
      )}
    </>
  );
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy text: ", err);

    try {
      const tempElement = document.createElement("textarea");
      tempElement.value = text;
      document.body.appendChild(tempElement);
      tempElement.select();
      document.execCommand("copy");
      document.body.removeChild(tempElement);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }
}

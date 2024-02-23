import { useMainContext } from "@/app/context-provider";
import Image from "next/image";
import React, { FC, KeyboardEventHandler, useState } from "react";

type DataItemProps = {
  label: string;
  value: string | number;
  onUpdate: (label: string, newValue: string | number) => void;
  onDelete: (label: string) => void;
};

export const DataItem: FC<DataItemProps> = ({ label, value, onUpdate, onDelete }) => {
  const [showStatic, setShowStatic] = useState(true);
  const [newLabel, setNewLabel] = useState(label);
  const [newValue, setNewValue] = useState(value);
  const [originalLabel, setOriginalLabel] = useState(label);
  const [originalValue, setOriginalValue] = useState(value);

  const { scene, lastIntersected } = useMainContext();

  const handleSave = () => {
    let data;
    if (lastIntersected) {
      data = lastIntersected.userData.metadata.info;
    } else if (scene) {
      data = scene.userData.metadata.info;
    }

    if (originalLabel === newLabel && originalValue !== newValue) {
      data[originalLabel] = newValue;
      onUpdate(newLabel, newValue);
    } else if (originalLabel !== newLabel && originalValue === newValue) {
      data[newLabel] = originalValue;
      delete data[originalLabel];
      onUpdate(newLabel, newValue);
    } else if (originalLabel !== newLabel && originalValue !== newValue) {
      data[newLabel] = newValue;
      delete data[originalLabel];
      onUpdate(newLabel, newValue);
    }

    setShowStatic(true);
  };

  const handleDelete = () => {
    let data;
    if (lastIntersected) {
      data = lastIntersected.userData.metadata.info;
    } else if (scene) {
      data = scene.userData.metadata.info;
    }

    delete data[originalLabel];
    onDelete(originalLabel);
  };

  const handleCancel = () => {
    setNewLabel(originalLabel);
    setNewValue(originalValue);
    setShowStatic(true);
  };

  const isUrl = (value: string | number): boolean => {
    if (typeof value !== "string") {
      return false;
    }
    return value.startsWith("http");
  };

  const handleKeyDown: KeyboardEventHandler<HTMLFormElement> = (event) => {
    if (event.key === "Escape") {
      setShowStatic(true);
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="data-item-row">
      {showStatic ? (
        <>
          <div className="data-item-label">{newLabel}</div>
          {isUrl(newValue) ? (
            <div className="data-item-value">
              <a href={newValue?.toString()} target="_blank" rel="noopener noreferrer">
                {newValue}
              </a>
            </div>
          ) : (
            <div className="data-item-value">{newValue}</div>
          )}
          <button className="data-row-button">
            <div
              className="data-row-icon data-row-icon-edit"
              onClick={() => setShowStatic(false)}
            >
              <Image src="/icons/pencil.webp" alt="Edit" width={16} height={16} />
            </div>
          </button>
          <button className="data-row-button">
            <div
              className="data-row-icon data-row-icon-delete"
              onClick={() => handleDelete()}
            >
              <Image src="/icons/trash.webp" alt="Delete" width={16} height={16} />
            </div>
          </button>
        </>
      ) : (
        <>
          <div className="data-row-buttons">
            <form
              id="edit-dataitem-form"
              className="data-item-edit"
              onSubmit={handleSave}
              onKeyDown={handleKeyDown}
            >
              <input
                id="label-input"
                type="text"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
              />
              <input
                id="value-input"
                type="text"
                value={newValue}
                onChange={(event) => setNewValue(event.target.value)}
              />

              <button
                className="data-row-button"
                type="submit"
                form="edit-dataitem-form"
                onClick={(event) => {
                  event.preventDefault();
                  setShowStatic(true);
                  handleSave();
                }}
              >
                <div className="data-row-icon data-row-icon-save">
                  <Image
                    src="/icons/checkmark.webp"
                    alt="Accept"
                    width={16}
                    height={16}
                  />
                </div>
              </button>
              <button className="data-row-button" type="button" onClick={handleCancel}>
                <div
                  className="data-row-icon data-row-icon-cancel"
                  onClick={() => setShowStatic(true)}
                >
                  <Image src="/icons/close.webp" alt="Close" width={16} height={16} />
                </div>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

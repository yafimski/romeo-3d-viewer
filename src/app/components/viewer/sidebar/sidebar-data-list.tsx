import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { useMainContext } from "../../../context-provider";
import { Info } from "../../../types/dotbim-types";
import { DataItem } from "./sidebar-data-item";

interface DataItemProps {
  label: string;
  value: string | number;
}

interface SidebarDataListProps {
  data: Info | null;
}

export const SidebarDataList: FC<SidebarDataListProps> = ({ data }) => {
  const [dataItems, setDataItems] = useState<DataItemProps[]>([]);
  const { scene, lastIntersected } = useMainContext();

  useEffect(() => {
    if (data) {
      setDataItems(
        Object.entries(data).map(([label, value]) => ({
          label,
          value: value as string | number,
        }))
      );
    }
  }, [data]);

  const updateDataItem = () => {
    let data;
    if (lastIntersected) {
      data = lastIntersected.userData.metadata.info;
    } else if (scene) {
      data = scene.userData.metadata.info;
    }

    setDataItems(
      Object.entries(data).map(([label, value]) => ({
        label,
        value: value as string | number,
      }))
    );
  };

  const deleteDataItem = () => {
    let data;
    if (lastIntersected) {
      data = lastIntersected.userData.metadata.info;
    } else if (scene) {
      data = scene.userData.metadata.info;
    }

    setDataItems(
      Object.entries(data).map(([label, value]) => ({
        label,
        value: value as string | number,
      }))
    );
  };

  const addDataItem = () => {
    let updatedData;
    if (lastIntersected) {
      updatedData = { ...lastIntersected.userData.metadata.info };
    } else if (scene) {
      updatedData = { ...scene.userData.metadata.info };
    }

    updatedData["Z Label"] = "New Value";

    setDataItems(
      Object.entries(updatedData).map(([label, value]) => ({
        label,
        value: value as string | number,
      }))
    );
  };

  return (
    <>
      <div
        className="data-rows-container"
        style={{ height: `calc(${dataItems.length} * 2.5rem` }}
      >
        {dataItems.map((item, index) => (
          <DataItem
            key={`${item.label}-${item.value}-${index}`}
            label={item.label}
            value={item.value}
            onUpdate={updateDataItem}
            onDelete={deleteDataItem}
          />
        ))}
      </div>
      <div className="metadata-button-container">
        <button className="add-metadata-button" onClick={addDataItem}>
          <Image src="/icons/plus.webp" alt="Add" width={30} height={30} />
        </button>
      </div>
    </>
  );
};

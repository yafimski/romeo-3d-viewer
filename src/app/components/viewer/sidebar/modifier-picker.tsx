import { AllMeshesInScene } from "@/app/utils/viewer-utils";
import Image from "next/image";
import { FC, useRef, useState } from "react";
import Chrome from "react-color/lib/components/chrome/Chrome";
import { DirectionalLight, Vector3 } from "three";
import { useMainContext } from "../../../context-provider";
import { MaterialSettingsIconProps, RGBA } from "../../../types/generic-types";
import { ToRadians } from "../../../utils/geom-utils";
import { CompilePhongMaterial } from "../../../utils/material-utils";

export const ModifierPicker: FC<MaterialSettingsIconProps> = ({
  title,
  icon,
  onOpen,
  onClose,
  isOpen,
}) => {
  const { scene, lastIntersected, setLastMeshMaterial } = useMainContext();

  const allMeshes = AllMeshesInScene(scene!);
  let selectedMeshColor = { r: 130, g: 130, b: 130, a: 255 } as RGBA;
  if (lastIntersected) {
    const matchingElement = allMeshes.find(
      (element: any) => element.mesh_id === lastIntersected.uuid
    );
    if (matchingElement) {
      selectedMeshColor = matchingElement.userData.metadata.color;
    }
  }

  const [pickerColor, setPickerColor] = useState(selectedMeshColor);
  const [direction, setDirection] = useState(0);
  const [prevRadians, setPrevRadians] = useState(0);
  const [prevDirection, setPrevDirection] = useState(0);
  const [intensity, setIntensity] = useState(1);

  const handleLightChange = (popupEvent: any) => {
    const sliderValue = popupEvent.target.value;
    if (title == "Light Direction") {
      setDirection(sliderValue);
      updateSceneLight("direction", sliderValue);
    } else if (title == "Light Intensity") {
      setIntensity(sliderValue);
      updateSceneLight("intensity", sliderValue);
    }
  };

  const handleMaterialChange = (popupEvent: any) => {
    const rgba = { ...popupEvent.rgb, a: 255 };
    setPickerColor(popupEvent.hex);

    let newMaterial = CompilePhongMaterial(rgba);

    if (lastIntersected) {
      lastIntersected.userData.metadata.color = rgba;
      lastIntersected.material = newMaterial;
      lastIntersected.userData.originalMaterial = newMaterial;
    }

    setLastMeshMaterial(newMaterial);
  };

  const handleClick = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  const updateSceneLight = (type: string, value: number) => {
    if (scene) {
      for (let i = 0; i < scene.children.length; i++) {
        const child = scene.children[i];
        if (child instanceof DirectionalLight) {
          if (type == "direction") {
            const radians = ToRadians(value);
            const rotationDiff = radians - prevRadians;

            const rotationVec = child.position.applyAxisAngle(
              new Vector3(0, 1, 0),
              rotationDiff
            );
            child.position.set(rotationVec.x, rotationVec.y, rotationVec.z);

            if (direction > prevDirection) {
              setPrevDirection(value);
            } else {
              setPrevDirection(-value);
            }

            setPrevRadians(radians);
          } else {
            child.intensity = value;
          }
        }
      }
    }
  };

  const buttonRef = useRef<HTMLButtonElement>(null);

  const DefineSlider = (
    min: number,
    max: number,
    step: number,
    value: number,
    buttonRefCurrent: HTMLButtonElement | null
  ) => {
    if (buttonRefCurrent) {
      return (
        <div
          className="slider-picker"
          style={{
            top: `calc(${
              buttonRefCurrent.getBoundingClientRect().top / 16
            }rem - 2rem)`,
            left: `calc(${
              buttonRefCurrent.getBoundingClientRect().left / 16
            }rem - 2.6rem)`,
          }}
        >
          <label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleLightChange}
            />
          </label>
        </div>
      );
    }
  };

  const meshControl = isOpen && buttonRef.current;
  const isDisabled = !lastIntersected && title === "Color";

  return (
    <>
      {meshControl &&
        title === "Light Intensity" &&
        DefineSlider(0.01, 2.0, 0.05, intensity, buttonRef.current)}
      {meshControl &&
        title === "Light Direction" &&
        DefineSlider(0, 360, 1, direction, buttonRef.current)}
      {meshControl && lastIntersected && title === "Color" && (
        <div
          className="color-picker-popup"
          style={{
            top: `calc(${
              buttonRef.current.getBoundingClientRect().top / 16
            }rem - 13rem)`,
            left: `calc(${
              buttonRef.current.getBoundingClientRect().left / 16
            }rem - 3.8rem)`,
          }}
        >
          <Chrome
            color={pickerColor}
            disableAlpha={true}
            onChange={handleMaterialChange}
          />
        </div>
      )}
      <div className="color-picker">
        <button onClick={handleClick} ref={buttonRef} disabled={isDisabled}>
          <Image src={icon} alt={title} width={26} height={26} />
        </button>
      </div>
    </>
  );
};

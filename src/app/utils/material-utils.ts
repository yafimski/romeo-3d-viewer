import { Color, DoubleSide, Mesh, MeshBasicMaterial, MeshPhongMaterial } from "three";
import { RGBA } from "../types/generic-types";

export function RgbaToHex(color: RGBA): string {
  let { r, g, b, a } = color;
  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);
  a = Math.round(a * 255);
  const alphaHex = a.toString(16).padStart(2, "0");
  const rgbHex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return alphaHex + rgbHex;
}

export const highlightColorSelect = new Color("rgb(0, 100, 100)");
export const highlightColorSelectOpacity = 0.2;

export function RgbaToColor(rgba: RGBA): Color {
  return new Color().setRGB(rgba.r, rgba.g, rgba.b);
}

export function RgbToRgbString(colorObj: any): Color {
  return new Color(`rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`);
}

export function HighlightMesh(mesh: Mesh) {
  const meshMat = mesh.material as MeshBasicMaterial;
  meshMat.color.set(highlightColorSelect);
  meshMat.opacity = highlightColorSelectOpacity;
}

export function UnHighlightMesh(mesh: Mesh) {
  mesh.material = mesh.userData.originalMaterial;
}

export const CompileBasicMaterial = (materialColor: RGBA): MeshBasicMaterial => {
  const newMaterial = new MeshBasicMaterial({
    color: new Color(materialColor.r / 255, materialColor.g / 255, materialColor.b / 255),
    opacity: materialColor.a / 255,
    side: DoubleSide,
  });

  return newMaterial;
};

export const CompilePhongMaterial = (materialColor: RGBA): MeshPhongMaterial => {
  let meshColor = null;
  try {
    meshColor = new Color(
      materialColor.r / 255,
      materialColor.g / 255,
      materialColor.b / 255
    );
  } catch {
    meshColor = new Color(0.5, 0.5, 0.5);
  }

  const newMaterial = new MeshPhongMaterial({
    color: meshColor,
    side: DoubleSide,
    opacity: 1,
  });

  return newMaterial;
};

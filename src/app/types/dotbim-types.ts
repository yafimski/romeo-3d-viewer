import { RGB } from "three";
import { RGBA } from "./generic-types";

export interface DotBimFile {
  schema_version: string;
  meshes: DotBimMesh[];
  elements: DotBimElement[];
  light: {
    intensity: number;
    position: Coordinates;
  };
  camera: { position: Coordinates };
  info: {
    [key: string]: any;
  };
}

export interface DotBimMetadata {
  schema_version: string;
  elements: DotBimElement[];
  light: { intensity: number; position: Coordinates };
  camera: { position: Coordinates };
  info: {
    [key: string]: any;
  };
}

export interface Info {
  info: {
    [key: string]: any;
  };
}

export interface BasicMaterialObject {
  color: {
    r: number;
    g: number;
    b: number;
  };
  opacity?: number;
  transparent?: boolean;
  alphaTest?: number;
}

export interface DotBimMesh {
  mesh_id: string;
  coordinates: number[];
  indices: number[];
}

export interface DotBimElement {
  mesh_id: string;
  type: string;
  color: RGB | RGBA;
  vector: Coordinates;
  rotation: {
    qx: number;
    qy: number;
    qz: number;
    qw: number;
  };
  guid: string;
  info: { [key: string]: string | number };
  face_colors?: number[];
  material: {
    emissive: RGB;
    specular: RGB;
    shininess: number;
  };
}

export interface DotBimSidebarData {
  info: { [key: string]: string | number };
  elements: DotBimElement[];
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

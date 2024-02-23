import { DotBimFile, DotBimMesh, DotBimMetadata } from "../types/dotbim-types";
import { Dispatch, RefObject, SetStateAction } from "react";
import { State } from "../middleware/state";
import {
  BufferGeometry,
  Material,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Action } from "../middleware/actions";

export interface LoadFileProps {
  onLoad: (file: File | null) => Promise<DotBimFile | null>;
}

export interface SceneCreation {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  raycaster: Raycaster;
}

export interface ZoomExtentsButtonProps {
  scene?: Scene;
  camera?: PerspectiveCamera;
  controls?: OrbitControls;
}

export interface AppContextValues {
  canvasRef: RefObject<HTMLCanvasElement> | null;
  scene: Scene | null;
  setScene: Dispatch<SetStateAction<Scene | null>>;
  camera: PerspectiveCamera | null;
  setCamera: Dispatch<SetStateAction<PerspectiveCamera | null>>;
  renderer: WebGLRenderer | null;
  setRenderer: Dispatch<SetStateAction<WebGLRenderer | null>>;
  controls: OrbitControls | null;
  setControls: Dispatch<SetStateAction<OrbitControls | null>>;
  raycaster: Raycaster | null;
  setRaycaster: Dispatch<SetStateAction<Raycaster | null>>;
  dotBimJson: DotBimFile | null;
  setDotBimJson: Dispatch<SetStateAction<DotBimFile | null>>;
  meshesJson: DotBimMesh[] | null;
  setMeshesJson: Dispatch<SetStateAction<DotBimMesh[] | null>>;
  metadataJson: DotBimMetadata | null;
  setMetadataJson: Dispatch<SetStateAction<DotBimMetadata | null>>;
  loadedFile: File | null;
  setLoadedFile: Dispatch<SetStateAction<File | null>>;
  isFileLoaded: boolean | null;
  setIsFileLoaded: Dispatch<SetStateAction<boolean | null>>;
  lastIntersected: Mesh<BufferGeometry, Material | Material[]> | null;
  setLastIntersected: Dispatch<
    SetStateAction<Mesh<BufferGeometry, Material | Material[]> | null>
  >;
  lastMeshId: string | null;
  setLastMeshId: Dispatch<SetStateAction<string | null>>;
  lastMeshMaterial: Material | null;
  setLastMeshMaterial: Dispatch<
    SetStateAction<Material | MeshPhongMaterial | null>
  >;
}

export interface UserContextValues {
  state: State;
  setState: Dispatch<Action>;
  dispatch: (value: Action) => void;
}

export interface FirebaseFileData {
  url: string;
  name: string;
}

export interface MaterialSettingsIconProps {
  title: string;
  icon?: any;
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export interface RGBA extends RGB {
  a: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Tool {
  name: string;
  icon: any;
}

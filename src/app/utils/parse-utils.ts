import {
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
} from "three";
import {
  DotBimElement,
  DotBimFile,
  DotBimMesh,
  DotBimMetadata,
} from "../types/dotbim-types";
import { AllMeshesInScene } from "./viewer-utils";

export const ParseDotBimJson = async (loadedFile: File | null): Promise<DotBimFile> => {
  if (!loadedFile) {
    throw new Error("File load error.");
  }
  const reader = new FileReader();
  const textContent = await new Promise<string>((resolve, reject) => {
    reader.onload = (event: ProgressEvent<FileReader>) => {
      resolve(event.target!.result as string);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsText(loadedFile);
  });
  const dotBimJson = JSON.parse(textContent);

  const dotBimJsonWithMaterials = EnsureMaterialFields(dotBimJson);
  const dotBimJsonWithLights = EnsureLightFields(dotBimJsonWithMaterials);
  const dotBimJsonWithCamera = EnsureCameraFields(dotBimJsonWithLights);

  return dotBimJsonWithCamera;
};

export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const EnsureMaterialFields = (dotBimJson: DotBimFile) => {
  const defaultMaterial = {
    emissive: { r: 0, g: 0, b: 0 },
    specular: { r: 0, g: 0, b: 0 },
    shininess: 20,
  };

  for (const element of dotBimJson.elements) {
    if (!element.hasOwnProperty("material")) {
      element.material = Object.assign({}, defaultMaterial);
    } else {
      if (!element.material.hasOwnProperty("emissive")) {
        element.material.emissive = Object.assign({}, defaultMaterial.emissive);
      }
      if (!element.material.hasOwnProperty("specular")) {
        element.material.specular = Object.assign({}, defaultMaterial.specular);
      }
      if (!element.material.hasOwnProperty("shininess")) {
        element.material.shininess = defaultMaterial.shininess;
      }
    }
  }

  return dotBimJson;
};

const EnsureLightFields = (dotBimJson: DotBimFile) => {
  const defaultLight = {
    position: { x: 0, y: 0, z: 0 },
    intensity: 0.5,
  };

  if (!dotBimJson.hasOwnProperty("light")) {
    dotBimJson.light = Object.assign({}, defaultLight);
  } else {
    if (!dotBimJson.light.hasOwnProperty("position")) {
      dotBimJson.light.position = defaultLight.position;
    }
    if (!dotBimJson.light.hasOwnProperty("intensity")) {
      dotBimJson.light.intensity = defaultLight.intensity;
    }
  }

  return dotBimJson;
};

const EnsureCameraFields = (dotBimJson: DotBimFile) => {
  const defaultCamera = {
    position: { x: 0, y: 0, z: 0 },
  };
  if (!dotBimJson.hasOwnProperty("camera")) {
    dotBimJson.camera = Object.assign({}, defaultCamera);
  }

  return dotBimJson;
};

export const MeshesName = (fileName: string) => {
  return `meshes_${fileName}`;
};

export const MetadataName = (fileName: string) => {
  return `metadata_${fileName}`;
};

export const MeshesOriginalName = (fileName: string) => {
  return `meshes_original_${fileName}`;
};

export const MetadataOriginalName = (fileName: string) => {
  return `metadata_original_${fileName}`;
};

export const GetMetadataFromDotBim = (dotBimFile: DotBimFile) => {
  return {
    schema_version: dotBimFile.schema_version,
    elements: dotBimFile.elements,
    light: dotBimFile.light,
    camera: dotBimFile.camera,
    info: dotBimFile.info,
  } as DotBimMetadata;
};

export const GetMeshesFromDotBim = (dotBimFile: DotBimFile) => {
  return dotBimFile.meshes as DotBimMesh[];
};

export const CreateFileFromJson = (json: object, filename: string): File => {
  const jsonStr = JSON.stringify(json);
  const blob = new Blob([jsonStr], { type: "application/json" });
  return new File([blob], filename);
};

export const RemovePrefixes = (input: string): string => {
  const prefixes = ["meshes_", "meshes_original_", "metadata_", "metadata_original_"];

  let result = input.split("/").pop() || "unknown";
  prefixes.forEach((prefix) => {
    if (result.startsWith(prefix)) {
      result = result.replace(prefix, "").split(".")[0];
    }
  });

  return result;
};

export const CompileDotBimFromJsonParts = (
  meshesJson: DotBimMesh[],
  metadataJson: DotBimMetadata
) => {
  return {
    schema_version: metadataJson.schema_version,
    meshes: meshesJson,
    elements: metadataJson.elements,
    light: metadataJson.light,
    camera: metadataJson.camera,
    info: metadataJson.info,
  } as DotBimFile;
};

export const CompileDotBimFromScene = async (scene: Scene, camera: PerspectiveCamera) => {
  let dotBimJson: DotBimFile = {
    schema_version: "",
    meshes: [],
    elements: [],
    light: {
      intensity: 0,
      position: { x: 0, y: 0, z: 0 },
    },
    camera: { position: { x: 0, y: 0, z: 0 } },
    info: {
      [""]: "",
    },
  };

  dotBimJson.schema_version = "1.0.0";
  dotBimJson.info = scene.userData.metadata.info;

  const allMeshes = AllMeshesInScene(scene);
  dotBimJson.meshes = ConvertMeshesToDotBimMeshes(allMeshes);
  dotBimJson.elements = ConvertMeshesToDotBimElements(allMeshes);

  dotBimJson.camera = ConvertCameraToBotBimCamera(camera);

  const light = scene.children.filter(
    (child) => (child as DirectionalLight).isDirectionalLight
  )[0];
  dotBimJson.light = ConvertLightToBotBimLight(light as DirectionalLight);

  return dotBimJson;
};

export const ConvertMeshesToDotBimMeshes = (meshes: Mesh[]) => {
  let compiledMeshes: DotBimMesh[] = [];
  meshes.forEach((mesh) => {
    compiledMeshes.push({
      mesh_id: mesh.uuid,
      coordinates: Array.from(mesh.geometry.attributes.position.array),
      indices: Array.from(mesh.geometry.index?.array!),
    });
  });

  return compiledMeshes;
};

export const ConvertMeshesToDotBimElements = (meshes: Mesh[]) => {
  let compiledElements: DotBimElement[] = [];
  meshes.forEach((mesh) => {
    const color = { ...(mesh.material as MeshPhongMaterial).color };
    const newColor = { r: color.r * 255, g: color.g * 255, b: color.b * 255, a: 255 };

    compiledElements.push({
      mesh_id: mesh.uuid,
      type: "",
      color: newColor,
      vector: {
        x: 0,
        y: 0,
        z: 0,
      },
      rotation: {
        qx: 0,
        qy: 0,
        qz: 0,
        qw: 0,
      },
      guid: mesh.uuid,
      info: mesh.userData.metadata.info,
      material: {
        emissive: { r: 0, g: 0, b: 0 },
        specular: { r: 0, g: 0, b: 0 },
        shininess: 20,
      },
    });
  });

  return compiledElements;
};

export const ConvertLightToBotBimLight = (light: DirectionalLight) => {
  return {
    intensity: light.intensity,
    position: light.position,
  };
};

export const ConvertCameraToBotBimCamera = (camera: PerspectiveCamera) => {
  return {
    position: camera.position,
  };
};

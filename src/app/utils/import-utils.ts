import {
  BufferGeometry,
  Color,
  Euler,
  Float32BufferAttribute,
  Mesh,
  MeshPhongMaterial,
  Scene,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { v4 as uuidv4 } from "uuid";
import { DotBimFile, DotBimMesh } from "../types/dotbim-types";
import { CompilePhongMaterial } from "./material-utils";

export const createDotBimJson = () => {
  return {
    schema_version: "",
    meshes: [],
    elements: [],
    light: {
      intensity: 0,
      position: { x: 0, y: 0, z: 0 },
    },
    camera: { position: { x: 0, y: 0, z: 0 } },
    info: { [""]: "" },
  };
};

export const convertThreeMeshToDotBimMesh = (mesh: Mesh): DotBimMesh => {
  const geometry = mesh.geometry as BufferGeometry;
  const positionAttribute = geometry.getAttribute("position");
  const indexAttribute = geometry.getIndex();

  const coordinates = Array.from(positionAttribute.array);
  const indices = indexAttribute ? Array.from(indexAttribute.array) : [];

  return { coordinates, indices, mesh_id: mesh.uuid };
};

export const EnsureMeshMetadata = async (meshes: Mesh[]) => {
  meshes.forEach((mesh) => {
    if (!mesh.userData.metadata) {
      mesh.userData.metadata = createDefaultMetadataElement(mesh);
    }
  });
};

export const createDefaultMetadataElement = (mesh: Mesh) => {
  return {
    vector: new Vector3(0, 0, 0),
    rotation: {
      qx: 0,
      qy: 0,
      qz: 0,
      qw: 1,
    },
    guid: uuidv4(),
    type: "type",
    color: mesh.userData.originalMaterial || { r: 190, g: 190, b: 190, a: 255 },
    info: {
      Name: "any field can be deleted",
      Price: "100 USD",
      Link: "www.example.com",
    },
    material: {
      emissive: { r: 0, g: 0, b: 0 },
      specular: { r: 0, g: 0, b: 0 },
      shininess: 20,
    },
  };
};

export const EnsureDefaultSceneInfo = async () => {
  return {
    info: {
      Owner: "Your name",
      Link: "www.example.com",
    },
  };
};

export const ImportDotBimJsonFile = async (
  dotBimJson: DotBimFile,
  scene: Scene
) => {
  scene.userData.metadata = { info: {} };
  scene.userData.metadata.info = dotBimJson.info;

  const meshes = await ConvertDotBimToMeshes(dotBimJson);
  meshes.forEach((mesh) => {
    scene.add(mesh);
  });

  return;
};

export const ConvertDotBimToMeshes = async (
  dotBimJson: DotBimFile | null
): Promise<Mesh[]> => {
  if (!dotBimJson) {
    throw new Error("Error with imported .bim object.");
  }

  const resultObjects: any[] = [];
  dotBimJson.meshes.forEach((mesh: any) => {
    const coordinates = mesh.coordinates;
    const indices = mesh.indices;
    const meshId = mesh.mesh_id;
    const matchingElement = dotBimJson.elements.find(
      (element: any) => element.mesh_id === meshId
    );
    const vector = matchingElement?.vector;

    if (matchingElement) {
      const color = matchingElement.color;
      resultObjects.push({
        matchingElement,
        coordinates,
        indices,
        color,
        meshId,
        vector,
      });
    } else {
      console.log("No matching element found");
    }
  });

  const convertedMeshes: Mesh[] = [];

  resultObjects.forEach((data) => {
    const geometry = new BufferGeometry();
    const positionAttribute = new Float32BufferAttribute(data.coordinates, 3);
    const indexAttribute = new Uint16BufferAttribute(data.indices, 1);

    const material = CompilePhongMaterial(data.color);
    try {
      if (data.color.a < 255) {
        material.opacity = data.color.a / 255;
        material.transparent = true;
      }
    } catch {}

    geometry.setAttribute("position", positionAttribute);
    geometry.setIndex(indexAttribute);
    geometry.computeVertexNormals();

    let newMesh = new Mesh(geometry, material);
    newMesh.rotation.x = -Math.PI / 2;
    newMesh.castShadow = true;
    newMesh.receiveShadow = true;
    newMesh.userData.selectable = true;

    newMesh.userData.metadata = { info: {} };
    newMesh.userData.metadata.info = data.matchingElement.info;

    newMesh.position.set(data.vector.x, data.vector.y, data.vector.z);

    convertedMeshes.push(newMesh);
  });

  return convertedMeshes;
};

export const ImportFbxFile = (file: File, scene: Scene) => {
  return new Promise<void>((resolve) => {
    const loader = new FBXLoader();
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const dataURL = event.target?.result as string;
      loader.load(
        dataURL,
        async (object) => {
          object.children.forEach((child) => {
            if (
              (child as Mesh).isMesh ||
              (child as SkinnedMesh).isSkinnedMesh
            ) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.selectable = true;
            }
          });

          object.scale.set(0.001, 0.001, 0.001);
          scene.add(object);

          resolve();
        },
        function (xhr) {
          if (xhr.total === 0) return;
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.log("An error happened: ", error);
          resolve();
        }
      );
    });

    reader.readAsDataURL(file);
  });
};

export const ImportStlFile = (file: File, scene: Scene) => {
  return new Promise<void>((resolve) => {
    const loader = new STLLoader();
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const dataURL = event.target?.result as string;
      loader.load(
        dataURL,
        async (geometry) => {
          const meshes = await ConvertStlToMeshes(geometry);
          meshes.forEach((mesh) => scene.add(mesh));
          resolve();
        },
        function (xhr) {
          if (xhr.total === 0) return;
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.log("An error happened: ", error);
          resolve();
        }
      );
    });

    reader.readAsDataURL(file);
  });
};

const ConvertStlToMeshes = async (geometry: any): Promise<Mesh[]> => {
  return new Promise((resolve) => {
    const meshes: Mesh[] = [];

    const attr = geometry.attributes;
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(attr.position.array, 3)
    );
    geometry.setAttribute(
      "normal",
      new Float32BufferAttribute(attr.normal.array, 3)
    );

    CompileIndices(geometry);

    const newMesh = ConstructDefaultNewMesh(geometry);
    meshes.push(newMesh);

    resolve(meshes);
  });
};

export const ImportObjFile = (file: File, scene: Scene) => {
  return new Promise<void>((resolve) => {
    const loader = new OBJLoader();
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const dataURL = event.target?.result as string;
      loader.load(
        dataURL,
        async (object) => {
          console.log({ object });
          const meshes = await ConvertObjToMeshes(object);
          meshes.forEach((mesh) => scene.add(mesh));
          resolve();
        },
        function (xhr) {
          if (xhr.total === 0) return;
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.log("An error happened: ", error);
          resolve();
        }
      );
    });

    reader.readAsDataURL(file);
  });
};

const ConvertObjToMeshes = async (object: any): Promise<Mesh[]> => {
  return new Promise((resolve) => {
    const meshes: Mesh[] = [];

    object.traverse((child: any) => {
      if (child.isMesh) {
        const objMesh = child;
        const geometry = new BufferGeometry();
        const attr = objMesh.geometry.attributes;

        geometry.setAttribute(
          "position",
          new Float32BufferAttribute(attr.position.array, 3)
        );
        geometry.setAttribute(
          "normal",
          new Float32BufferAttribute(attr.normal.array, 3)
        );

        CompileIndices(geometry);

        const newMesh = ConstructDefaultNewMesh(geometry);
        newMesh.userData.originalMaterial = newMesh.material;

        meshes.push(newMesh);
      }
    });

    resolve(meshes);
  });
};

export const ImportRhino3dmFile = (file: File, scene: Scene) => {
  return new Promise<void>((resolve) => {
    const loader = new Rhino3dmLoader();
    loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@7.15.0/");
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const dataURL = event.target?.result as string;
      loader.load(
        dataURL,
        async (object) => {
          const meshes = await ConvertRhino3dmToMeshes(object);
          meshes.forEach((mesh) => scene.add(mesh));
          resolve();
        },
        function (xhr) {
          if (xhr.total === 0) return;
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.log("An error happened: ", error);
          resolve();
        }
      );
    });

    reader.readAsDataURL(file);
  });
};

const ConvertRhino3dmToMeshes = async (object: any): Promise<Mesh[]> => {
  return new Promise((resolve) => {
    const meshes: Mesh[] = [];

    object.traverse((child: any) => {
      if (child.isMesh) {
        const rhinoMesh = child;
        const geometry = new BufferGeometry();
        const attr = rhinoMesh.geometry.attributes;

        geometry.setAttribute(
          "position",
          new Float32BufferAttribute(attr.position.array, 3)
        );
        geometry.setAttribute(
          "normal",
          new Float32BufferAttribute(attr.normal.array, 3)
        );
        geometry.setIndex(
          new Uint16BufferAttribute(rhinoMesh.geometry.index.array, 1)
        );

        const colorObj = rhinoMesh.userData.attributes.drawColor;
        const color = new Color(
          colorObj.r / 255,
          colorObj.g / 255,
          colorObj.b / 255
        );
        const material = rhinoMesh.material.clone();
        material.color.set(color);

        material.opacity = colorObj.a;

        if (colorObj.a && colorObj.a < 255) {
          material.transparent = true;
          material.opacity = colorObj.a;
        }

        const newMesh = ConstructDefaultNewMesh(geometry, material);
        newMesh.userData.originalMaterial =
          rhinoMesh.userData.attributes.drawColor;

        meshes.push(newMesh);
      }
    });

    resolve(meshes);
  });
};

export const ImportGltfFile = async (file: File, scene: Scene) => {
  return new Promise<void>((resolve) => {
    const loader = new GLTFLoader();
    const reader = new FileReader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/examples/jsm/libs/draco/");
    loader.setDRACOLoader(dracoLoader);

    reader.addEventListener("load", (event) => {
      const dataURL = event.target?.result as string;
      loader.load(
        dataURL,
        async (gltf: any) => {
          scene.add(gltf.scene);
          resolve();
        },
        function (xhr) {
          if (xhr.total === 0) return;
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.log("An error happened: ", error);
          resolve();
        }
      );
    });

    reader.readAsDataURL(file);
  });
};

export const Import3dsfFile = async (file: File, scene: Scene) => {
  return new Promise<void>((resolve) => {
    const loader = new TDSLoader();
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const dataURL = event.target?.result as string;
      loader.load(
        dataURL,
        async (object: any) => {
          object.children.forEach((child: any) => {
            if ((child as Mesh).isMesh) {
              console.log({ child });
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.selectable = true;
            }
          });

          scene.add(object);
          resolve();
        },
        function (xhr) {
          if (xhr.total === 0) return;
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.log("An error happened: ", error);
          resolve();
        }
      );
    });

    reader.readAsDataURL(file);
  });
};

const ConstructDefaultNewMesh = (geometry: any, material?: any) => {
  const mat = material ? material : new MeshPhongMaterial({ color: 0xbebebe });

  const mesh = new Mesh(geometry, mat);
  mesh.rotation.copy(new Euler(-Math.PI / 2, 0, 0));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.selectable = true;

  return mesh;
};

const CompileIndices = (geometry: any) => {
  BufferGeometryUtils.mergeVertices(geometry);
  geometry.computeVertexNormals();
  if (!geometry.index) {
    const indexCount = geometry.attributes.position.count;
    const indices = [];

    for (let i = 0; i < indexCount; i++) {
      indices.push(i);
    }

    geometry.setIndex(indices);
  }
};

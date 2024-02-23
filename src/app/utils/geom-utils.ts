import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { CompileBasicMaterial } from "./material-utils";

export const FindMeshById = (scene: Scene, id: string | null) => {
  if (id !== null) {
    for (let i = 0; i < scene.children.length; i++) {
      const child = scene.children[i];
      if (child instanceof Group) {
        const group = child as Group;

        for (let i = 0; i < group.children.length; i++) {
          const mesh = group.children[i];
          if (mesh.type === "Mesh" && mesh.name !== "groundPlane") {
            if (mesh.uuid === id) {
              return mesh as Mesh;
            }
          }
        }
      }
    }
  }

  return null;
};

export const ToRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const CreateSimpleBoxGeometry = () => {
  const geometry = new BoxGeometry(1, 1, 1);
  const material = CompileBasicMaterial({ r: 255, g: 0, b: 0, a: 255 });
  const boxMesh = new Mesh(geometry, material);
  boxMesh.position.set(5, 0, 0);
  boxMesh.receiveShadow = true;

  return boxMesh;
};

export const GetMeshGroupSize = (meshesGroup: Group) => {
  const boundingBox = new Box3().setFromObject(meshesGroup);
  const size = new Vector3();
  return boundingBox.getSize(size);
};

export const CreateGroundPlane = (model: Group) => {
  const bbox = new Box3().setFromObject(model);
  const size = bbox.getSize(new Vector3());

  const planeGeometry = new PlaneGeometry(size.x * 10, size.x * 10);
  const groundMaterial = new ShadowMaterial();
  groundMaterial.opacity = 0.3;

  const ground = new Mesh(planeGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = bbox.min.y;

  ground.receiveShadow = true;
  ground.name = "groundPlane";

  return ground;
};

export const CreateGroupFromMeshes = (convertedMeshes: Mesh[], filename: string) => {
  convertedMeshes.forEach((mesh) => {
    mesh.scale.multiplyScalar(0.01);
  });

  const meshesGroup = new Group();
  meshesGroup.castShadow = true;
  meshesGroup.receiveShadow = true;
  meshesGroup.name = filename;

  convertedMeshes.forEach((mesh) => meshesGroup.add(mesh));

  const bbox = new Box3().setFromObject(meshesGroup);
  meshesGroup.position.y = -bbox.min.y;

  return meshesGroup;
};

export const moveModelUp = (scene: Scene, bbox: Box3) => {
  const mainObj = scene.children.filter((child: any) => child.type === "Object3D")[0];

  const bboxHeight = Math.abs(bbox.min.z - bbox.max.z);
  const halfHeight = bboxHeight / 2;
  const currentPosition = mainObj.position.clone();
  const newPosition = new Vector3(
    currentPosition.x,
    currentPosition.y + halfHeight,
    currentPosition.z
  );

  mainObj.position.copy(newPosition);
};

export const ScaleModelToUnit = (meshesGroup: Group) => {
  const scaleVector = new Vector3();
  meshesGroup.traverse((mesh) => {
    if (mesh instanceof Mesh) {
      mesh.geometry.computeBoundingBox();
      const { min, max } = mesh.geometry.boundingBox;
      scaleVector.x = Math.max(scaleVector.x, Math.abs(min.x), Math.abs(max.x));
      scaleVector.y = Math.max(scaleVector.y, Math.abs(min.y), Math.abs(max.y));
      scaleVector.z = Math.max(scaleVector.z, Math.abs(min.z), Math.abs(max.z));
    }
  });

  const maxDimension = Math.max(scaleVector.x, scaleVector.y, scaleVector.z);

  let scaleFactor = 1;
  if (maxDimension >= 1000) {
    scaleFactor = 0.01;
  } else if (maxDimension >= 100) {
    scaleFactor = 0.1;
  } else if (maxDimension < 1) {
    scaleFactor = 1 / maxDimension;
  }

  meshesGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
};

export const MoveModelAboveOrigin = (model: Group) => {
  const bbox = new Box3().setFromObject(model);
  const modelCenter = bbox.getCenter(new Vector3());
  const translationVector = new Vector3().subVectors(new Vector3(), modelCenter);
  model.position.add(translationVector);
  const modelHeight = bbox.getSize(new Vector3()).y;
  model.position.y += modelHeight / 2;
};

export const createSphereAtZero = (scene: Scene) => {
  const sphereGeometry = new SphereGeometry(0.05, 32, 32);
  const sphereMaterial = new MeshBasicMaterial({ color: 0xff0000 });
  const sphere = new Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, 0, 0);
  scene.add(sphere);
};

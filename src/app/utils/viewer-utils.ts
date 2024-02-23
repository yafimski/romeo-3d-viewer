import { RefObject } from "react";
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  ReinhardToneMapping,
  Scene,
  SkinnedMesh,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DotBimFile } from "../types/dotbim-types";
import {
  CreateGroundPlane,
  CreateGroupFromMeshes,
  MoveModelAboveOrigin,
  ScaleModelToUnit,
} from "./geom-utils";

export const DefineMeshesInScene = async (
  filename: string,
  scene: Scene,
  camera: PerspectiveCamera,
  controls: OrbitControls
) => {
  try {
    let convertedMeshes: Mesh[] = [];
    scene.traverse((child: any) => {
      if (child.isMesh) {
        convertedMeshes.push(child);
      }
    });

    const meshesGroup = CreateGroupFromMeshes(convertedMeshes, filename);

    ScaleModelToUnit(meshesGroup);
    MoveModelAboveOrigin(meshesGroup);

    const ground = CreateGroundPlane(meshesGroup);
    const light = CreateDirectionalLight(meshesGroup);

    scene.add(meshesGroup);
    scene.add(ground);
    scene.add(light);
    light.intensity = 0.2;

    ZoomExtents({ scene, camera, controls, meshesGroup });
  } catch (error) {
    console.error({ error });
    return null;
  }
};

export const CreateDirectionalLight = (
  meshesGroup: Group,
  dotBimJson?: DotBimFile
) => {
  const jsonLightIntensity = dotBimJson?.light.intensity || 0.5;
  const jsonLightDirection = 0;

  const boundingBox = new Box3().setFromObject(meshesGroup);
  const bboxSize = new Vector3();
  boundingBox.getSize(bboxSize);

  const light = new DirectionalLight(0xffffff, jsonLightIntensity);

  light.position.set(0, bboxSize.x + 3, bboxSize.x + 1);
  light.position.applyAxisAngle(new Vector3(0, 1, 0), jsonLightDirection);

  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.bias = -0.005;

  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = bboxSize.y + (bboxSize.y < 1 ? 5 : 20);

  const maxDimension = Math.max(bboxSize.x, bboxSize.y, bboxSize.z);
  light.shadow.camera.top = maxDimension * 2;
  light.shadow.camera.bottom = -maxDimension * 2;
  light.shadow.camera.left = -maxDimension * 2;
  light.shadow.camera.right = maxDimension * 2;

  light.shadow.mapSize.width = 1024 * 4;
  light.shadow.mapSize.height = 1024 * 4;

  return light;
};

interface ZoomExtentsProps {
  scene?: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
  meshesGroup?: Group;
  mesh?: Mesh;
}

export const ZoomExtents = ({
  scene,
  camera,
  controls,
  meshesGroup,
  mesh,
}: ZoomExtentsProps) => {
  let bbox = new Box3();

  if (scene) {
    let group: Group = new Group();
    scene.children.forEach((child) => {
      if (child instanceof Group) {
        group = child;
      }
    });
    bbox = new Box3().setFromObject(group);
  } else if (meshesGroup) {
    bbox = new Box3().setFromObject(meshesGroup);
  } else if (mesh) {
    bbox = new Box3().setFromObject(mesh as Mesh);
  }

  const center = bbox.getCenter(new Vector3());
  const size = bbox.getSize(new Vector3());

  camera.position.x = size.x * 1.6;
  camera.position.y = size.y * 1.6;
  camera.position.z = size.z * 1.6;

  camera.lookAt(center);
  controls.target.copy(center);
  controls.update();
};

export const AllMeshesInScene = (scene: Scene) => {
  const meshes: Mesh[] = [];

  if (scene) {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        meshes.push(object);
      }
    });
  }

  return meshes;
};

export const DisposeScene = async (scene: any): Promise<void> => {
  const disposalTasks = scene.children.map(async (child: any) => {
    if (child.isMesh || child.isSkinnedMesh) {
      let mesh = child as Mesh;
      if (child.isSkinnedMesh) {
        mesh = child as SkinnedMesh;
      }

      mesh.geometry.dispose();

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => {
          material.dispose();
        });
      } else {
        mesh.material.dispose();
      }
      scene.remove(mesh);
    }

    if (child.isDirectionalLight) {
      child.dispose();
      scene.remove(child);
    }

    if (child.isGroup) {
      scene.remove(child);
    }

    if (child.children) {
      await DisposeScene(child);
    }
  });

  await Promise.all(disposalTasks);
  return;
};

export const GetFirstVisibleIntersectingObjectWithMouse = (
  event: MouseEvent,
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  raycaster: Raycaster
) => {
  const canvas = renderer.domElement;
  const rect = canvas.getBoundingClientRect();

  const mouse = {
    x: ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1,
    y: -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1,
  };
  const mouseVector = new Vector2(mouse.x, mouse.y);

  raycaster.setFromCamera(mouseVector, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const visibleIntersects = intersects.filter(
    (intersect) => intersect.object.visible
  );
  const firstIntersect = visibleIntersects.length
    ? visibleIntersects[0].object
    : null;

  if (firstIntersect) {
    return firstIntersect.name !== "groundPlane" ? firstIntersect : null;
  }

  return null;
};

export const ActivateShadowsOnObjects = (meshes: Mesh[]) => {
  for (const mesh of meshes) {
    try {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    } catch (e) {
      console.log({ e });
      continue;
    }
  }
};

export const calculateCanvasOffset = (element: any) => {
  let left = 0;
  let top = 0;

  if (element.offsetParent) {
    do {
      left += element.offsetLeft;
      top += element.offsetTop;
      element = element.offsetParent;
    } while (element);
  }

  return { left, top };
};

export const CreateScene = (canvasRef: RefObject<HTMLCanvasElement> | null) => {
  const scene = new Scene();
  const renderer = new WebGLRenderer({
    canvas: canvasRef?.current!,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ReinhardToneMapping;
  renderer.toneMappingExposure = 2.3;

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    100000
  );
  camera.position.set(2, 3, 4);

  const ambientLight = new AmbientLight(0xffffff, 0.01);
  scene.add(ambientLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.zoomSpeed = 0.5;

  const raycaster = new Raycaster();

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();

  return { scene, camera, renderer, controls, raycaster };
};

"use client";
import React, { ReactNode, useContext, useReducer, useRef } from "react";
import { DotBimFile, DotBimMesh, DotBimMetadata } from "./types/dotbim-types";
import { AppContextValues, UserContextValues } from "./types/generic-types";
import { createContext, useState } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Raycaster,
  Mesh,
  Material,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { reducer } from "./middleware/state-handler";
import { initialState } from "./middleware/state";
import { Action } from "./middleware/actions";
import { ExecuteCore } from "./middleware/core-handler";
import { Authenticator } from "./middleware/authenticator";

export const MainContext = createContext<AppContextValues>({
  canvasRef: null,
  scene: null,
  setScene: () => {},
  camera: null,
  setCamera: () => {},
  renderer: null,
  setRenderer: () => {},
  controls: null,
  setControls: () => {},
  raycaster: null,
  setRaycaster: () => {},
  dotBimJson: null,
  setDotBimJson: () => {},
  meshesJson: null,
  setMeshesJson: () => {},
  metadataJson: null,
  setMetadataJson: () => {},
  loadedFile: null,
  setLoadedFile: () => {},
  isFileLoaded: false,
  setIsFileLoaded: () => {},
  lastIntersected: null,
  setLastIntersected: () => {},
  lastMeshId: null,
  setLastMeshId: () => {},
  lastMeshMaterial: null,
  setLastMeshMaterial: () => {},
});

export const AppContext = ({ children }: { children: ReactNode }) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [camera, setCamera] = useState<PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<WebGLRenderer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);
  const [raycaster, setRaycaster] = useState<Raycaster | null>(null);
  const [dotBimJson, setDotBimJson] = useState<DotBimFile | null>(null);
  const [meshesJson, setMeshesJson] = useState<DotBimMesh[] | null>(null);
  const [metadataJson, setMetadataJson] = useState<DotBimMetadata | null>(null);
  const [loadedFile, setLoadedFile] = useState<File | null>(null);
  const [isFileLoaded, setIsFileLoaded] = useState<boolean | null>(false);
  const [lastIntersected, setLastIntersected] = useState<Mesh | null>(null);
  const [lastMeshId, setLastMeshId] = useState<string | null>(null);
  const [lastMeshMaterial, setLastMeshMaterial] = useState<Material | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <MainContext.Provider
      value={{
        canvasRef,
        scene,
        setScene,
        camera,
        setCamera,
        renderer,
        setRenderer,
        controls,
        setControls,
        raycaster,
        setRaycaster,
        dotBimJson,
        setDotBimJson,
        meshesJson,
        setMeshesJson,
        metadataJson,
        setMetadataJson,
        loadedFile,
        setLoadedFile,
        isFileLoaded,
        setIsFileLoaded,
        lastIntersected,
        setLastIntersected,
        lastMeshId,
        setLastMeshId,
        lastMeshMaterial,
        setLastMeshMaterial,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const AuthContext = createContext<UserContextValues>({
  state: initialState,
  setState: () => {},
  dispatch: () => {},
});

export const UserContext = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useReducer(reducer, initialState);

  const dispatch = (value: Action) => {
    setState(value);
    ExecuteCore(value);
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        setState,
        dispatch,
      }}
    >
      <Authenticator />
      {children}
    </AuthContext.Provider>
  );
};

export const useMainContext = () => {
  return useContext(MainContext);
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};

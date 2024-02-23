import { initializeApp } from "firebase/app";
import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  StorageReference,
  deleteObject,
  getDownloadURL,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { CompileDotBimFromJsonParts } from "./parse-utils";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

export const app = initializeApp(firebaseConfig);

export const SetupNewUserFields = (user: User) => {
  return {
    userId: user.uid,
    userEmail: user.email,
    maxModelsAllowed: 1,
    maxMbPerModel: 50,
    blocked: false,
    modelsCount: 0,
    mbInStorage: 0,
    totalMbUploaded: 0,
    services: {},
  };
};

const GetUserDocument = async (user: User | null) => {
  if (!user) {
    return false;
  }

  const dbInstance = getFirestore(app);
  const userCollectionRef = collection(dbInstance, "users");
  const userDocRef = doc(userCollectionRef, user.email as string);

  const docSnapshot = await getDoc(userDocRef);
  if (docSnapshot.exists()) {
    return docSnapshot.data();
  }
};

export const CheckIfUserBlocked = async (user: User | null) => {
  const userData = await GetUserDocument(user);
  if (userData && userData.blocked) {
    return true;
  }

  return false;
};

export const CheckIfModelCountAllowed = async (user: User | null) => {
  const userData = await GetUserDocument(user);
  if (userData) {
    if (userData.modelsCount < userData.maxModelsAllowed) {
      return {
        isModelCountValid: true,
        maxModelsAllowed: userData.maxModelsAllowed,
      };
    }
    return {
      isModelCountValid: false,
      maxModelsAllowed: userData.maxModelsAllowed,
    };
  }

  return { isModelCountValid: false, maxModelsAllowed: 1 };
};

export const CheckIfModelSizeValid = async (
  user: User | null,
  modelSize: number
) => {
  const userData = await GetUserDocument(user);
  if (userData) {
    if (modelSize < userData.maxMbPerModel) {
      return { isModelSizeValid: true, modelSizeLimit: userData.maxMbPerModel };
    }
    return { isModelSizeValid: false, modelSizeLimit: userData.maxMbPerModel };
  }

  return { isModelSizeValid: false, modelSizeLimit: 20 };
};

export const CreateFirestoreUserData = async (user: User | null) => {
  const dbInstance = getFirestore(app);

  const onCreateUserData = async () => {
    if (!user) {
      return;
    }

    const userCollectionRef = collection(dbInstance, "users");
    const userDocRef = doc(userCollectionRef, user.email as string);
    const newUserData = SetupNewUserFields(user);

    const docSnapshot = await getDoc(userDocRef);
    if (!docSnapshot.exists()) {
      await setDoc(userDocRef, newUserData, { merge: true });

      const filesCollectionRef = collection(userDocRef, "files");
      await addDoc(filesCollectionRef, {});
    }
  };

  onCreateUserData();
};

export const AddFileToUserData = async (
  fileName: string,
  meshesRef: StorageReference,
  metadataRef: StorageReference,
  user: User
) => {
  const onCreateFileData = async () => {
    const guid = uuidv4();

    const filesCollectionRef = GetUserFilesCollectionRef(user);
    const newFileDocRef = doc(filesCollectionRef, guid);

    const meshesStorageUrl = await getDownloadURL(meshesRef);
    const metadataStorageUrl = await getDownloadURL(metadataRef);

    const querySnapshot = await getDocs(
      query(filesCollectionRef, where("name", "==", fileName))
    );
    if (!querySnapshot.empty) {
      console.log(
        `File with name ${fileName} already exists in Firestore for user ${user.email}`
      );
      const existingFileDoc = querySnapshot.docs[0];
      const updatedData = {
        meshesStorageUrl,
        metadataStorageUrl,
      };

      await updateDoc(existingFileDoc.ref, updatedData);

      return;
    }

    await setDoc(newFileDocRef, {
      name: fileName,
      meshesName: `meshes_${fileName}`,
      meshesStorageUrl,
      metadataName: `metadata_${fileName}`,
      metadataStorageUrl,
    });

    console.log(`Added file ${fileName} to Firestore for user ${user.email}`);
  };

  await onCreateFileData();
};

export const FirestoreGuidOfCurrentFile = async (
  filename: string,
  user: User
) => {
  const onQueryFileData = async () => {
    const filesCollectionRef = GetUserFilesCollectionRef(user);

    const filesSnapshot = await getDocs(filesCollectionRef);
    const filesDocs = filesSnapshot.docs;

    for (const fileDoc of filesDocs) {
      const name = fileDoc.get("name");
      if (name === filename) {
        return fileDoc.id;
      }
    }

    return null;
  };

  return onQueryFileData();
};

export const DownloadFileFromStorageByGuid = async (
  guid: string | undefined
): Promise<File | null | undefined> => {
  if (!guid) throw new Error("No file GUID found");

  const onDownloadFileByGuid = async () => {
    const dbInstance = getFirestore(app);
    const filesCollectionRef = collectionGroup(dbInstance, "files");
    const filesSnapshot = await getDocs(filesCollectionRef);
    const fileDocs = filesSnapshot.docs;

    for (const fileDoc of fileDocs) {
      if (fileDoc.id === guid) {
        const fileName = fileDoc.get("name");

        const meshesJson = await FetchJsonPartByFirebaseUrl(
          fileDoc.get("meshesStorageUrl")
        );
        const metadataJson = await FetchJsonPartByFirebaseUrl(
          fileDoc.get("metadataStorageUrl")
        );
        const compiledDotBimJson = CompileDotBimFromJsonParts(
          meshesJson,
          metadataJson
        );
        const jsonString = JSON.stringify(compiledDotBimJson);

        const blob = new Blob([jsonString], { type: "application/json" });
        const file = new File([blob], fileName);

        return file;
      }
    }
  };

  return onDownloadFileByGuid();
};

export const DeleteFileFromFirebaseStorage = async (
  user: User | null,
  folderName: string
): Promise<void> => {
  if (!folderName) throw new Error("Folder name not found");
  if (!user) return;

  const storageInstance = getStorage();
  const folderRef = ref(storageInstance, `users/${user.email}/${folderName}`);

  console.log({ folderRef });

  try {
    const fileList = await listAll(folderRef);
    const deletePromises = fileList.items.map((file) => deleteObject(file));

    await Promise.all(deletePromises);

    console.log(
      `All files in folder '${folderName}' deleted successfully from Firebase Storage`
    );
  } catch (error) {
    console.error("Error deleting files from Firebase Storage:", error);
    throw new Error("Failed to delete files from Firebase Storage");
  }
};

export const DeleteFileFromFirestoreDatabase = async (
  user: User | null,
  fileName: string
): Promise<void> => {
  if (!fileName) throw new Error("File name not found");
  if (!user) return;

  const dbInstance = getFirestore(app);
  const userCollectionRef = collection(dbInstance, "users");
  const userDocRef = doc(userCollectionRef, user.email as string);
  const filesCollectionRef = collection(userDocRef, "files");

  const querySnapshot = await getDocs(
    query(filesCollectionRef, where("name", "==", fileName))
  );

  console.log({ fileName });
  try {
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref);
      console.log(`Document '${fileName}' deleted successfully from Firestore`);
    });
  } catch (error) {
    console.error("Error deleting document from Firestore:", error);
    throw new Error("Failed to delete document from Firestore");
  }
};

const FetchJsonPartByFirebaseUrl = async (url: string) => {
  const response = await fetch(url);
  return await response.json();
};

const GetUserFilesCollectionRef = (user: User) => {
  const dbInstance = getFirestore(app);
  const userCollectionRef = collection(dbInstance, "users");
  const userDocRef = doc(userCollectionRef, user.email as string);

  return collection(userDocRef, "files");
};

export const GetUserSubfolderNamesFromStorage = async (
  folderRef: StorageReference
): Promise<string[]> => {
  const subfolderList: string[] = [];

  const listResult = await listAll(folderRef);
  listResult.prefixes.forEach((subfolderRef) => {
    const fullPath = subfolderRef.fullPath;
    const subfolderName = fullPath.split("/").pop() || "unknown";
    subfolderList.push(subfolderName);
  });

  return subfolderList;
};

export const GetFileJsonParts = async (
  storageRef: StorageReference,
  name: string
): Promise<object> => {
  const elementRef = ref(storageRef, name);
  const url = await getDownloadURL(elementRef);

  const result = await getJsonFromDownloadUrl(url);
  return result;
};

export async function getJsonFromDownloadUrl(url: string) {
  try {
    const res = await fetch(url);
    const jsonData = await res.json();
    return jsonData;
  } catch (error) {
    console.error("Error in getJsonFromDownloadUrl:", error);
    throw new Error("Internal Server Error");
  }
}

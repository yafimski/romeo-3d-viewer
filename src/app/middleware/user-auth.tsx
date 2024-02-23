import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { CheckIfUserBlocked, CreateFirestoreUserData } from "../utils/firebase-utils";

export const UserAuth = {
  login: () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async () => {
        const user = auth.currentUser;
        const isBlocked = await CheckIfUserBlocked(user);
        if (isBlocked) {
          await signOut(auth).then(() =>
            alert("User is BLOCKED or does not exist. Contact us if required.")
          );
        } else {
          CreateFirestoreUserData(user);
        }
      })
      .catch((error) => {
        window.alert(error);
      });
  },
  logout: () => {
    const auth = getAuth();
    signOut(auth);
  },
  register: async (email: string, password: string) => {
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await CreateFirestoreUserData(userCredential.user);
    } catch (error) {
      window.alert(error);
    }
  },
};

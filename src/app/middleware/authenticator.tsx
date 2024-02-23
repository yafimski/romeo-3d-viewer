import React from "react";
import { FC, useEffect } from "react";
import { useAuthContext } from "../context-provider";
import { getAuth, onAuthStateChanged } from "firebase/auth";

let authInitialized = false;

export const Authenticator: FC = () => {
  const auth = getAuth();
  const { dispatch } = useAuthContext();

  const listenToAuthChanges = () => {
    onAuthStateChanged(auth, (foundUser) => {
      const user = foundUser ? { ...foundUser } : null;
      dispatch({ type: "UPDATE_USER", payload: user });
    });
  };

  useEffect(() => {
    if (!authInitialized) {
      listenToAuthChanges();
      authInitialized = true;
    }
  }, []);

  return <></>;
};

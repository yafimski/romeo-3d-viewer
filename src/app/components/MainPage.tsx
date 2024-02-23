"use client";
import React, { useContext } from "react";
import { AppContext, AuthContext } from "../context-provider";
import { Header } from "../components/viewer/header";
import { App } from "./App";
import { SplashModal } from "./viewer/splash-modal";
import { EmailLogin } from "./auth/email-auth";

export const MainPage = () => {
  const { state } = useContext(AuthContext);

  return (
    <>
      {state.user ? (
        <>
          <AppContext>
            <Header />
            <App />
          </AppContext>
        </>
      ) : (
        <div className="lobby-screen">
          <SplashModal />
          <EmailLogin />
        </div>
      )}
    </>
  );
};

import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FC } from "react";
import { useAuthContext } from "../context-provider";

export const GoogleAuth: FC = () => {
  const { dispatch } = useAuthContext();

  const handleLogin = () => {
    dispatch({ type: "LOGIN" });
  };

  return (
    <div className="login-button-container">
      <FontAwesomeIcon
        icon={faGoogle}
        className="button-icon"
        style={{ color: "#0088dd" }}
      />
      <button className="login-button" onClick={handleLogin}>
        Log In
      </button>
    </div>
  );
};

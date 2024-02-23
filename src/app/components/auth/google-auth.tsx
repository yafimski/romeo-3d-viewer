import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FC } from "react";
import { useAuthContext } from "../../context-provider";

export const GoogleAuth: FC = () => {
  const { dispatch } = useAuthContext();

  const handleLogin = () => {
    dispatch({ type: "LOGIN" });
  };

  return (
    <div className="login-button-container">
      <button className="login-button" onClick={handleLogin}>
        Log in with
        <FontAwesomeIcon
          icon={faGoogle}
          className="button-icon"
          style={{ color: "#ffffff" }}
        />
      </button>
    </div>
  );
};

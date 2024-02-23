import React, { FC, useContext, useEffect } from "react";
import { AuthContext } from "../../context-provider";
import { GoogleAuth } from "./google-auth";

export const Login: FC = () => {
  const { state } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!state.user) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="login-wrapper">
      <div>
        <GoogleAuth />
      </div>
    </div>
  );
};

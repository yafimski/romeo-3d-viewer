import React, { FC, useContext } from "react";
import { AuthContext, useAuthContext } from "../../context-provider";
import Image from "next/image";

export const LogoutButton: FC = () => {
  const { dispatch } = useAuthContext();
  const { state } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <>
      <div className="fixed-top-right">
        <h3>{state.user?.email}</h3>
        <button className="generic-button" onClick={handleLogout}>
          <div className="button-icon" style={{ color: "#000000" }}>
            <Image
              src="/icons/arrow_right.webp"
              alt="Logout"
              width={20}
              height={20}
            />
          </div>
        </button>
      </div>
    </>
  );
};

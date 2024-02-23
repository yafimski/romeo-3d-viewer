import Image from "next/image";
import React, { FC, FormEvent, useState } from "react";
import { useAuthContext } from "@/app/context-provider";
import { isValidEmail } from "@/app/utils/parse-utils";

type SignUpModalProps = {
  onClose: () => void;
};

export const SignUpModal: FC<SignUpModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { dispatch } = useAuthContext();

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must at least 6 characters long");
      return;
    }

    dispatch({ type: "REGISTER", payload: { email, password } });
  };

  return (
    <div className="side-modal-container">
      <div className="register-sign-in side-modal-content">
        <button className="register-close-button" onClick={onClose}>
          <Image src="/icons/close.webp" alt="Close" width={16} height={16} />
        </button>
        <h4>Create a new user</h4>
        <form onSubmit={handleRegister} className="email-sign-in">
          <label className="sign-in-label">
            <input
              type="text"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="sign-in-label">
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="side-modal-button" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

import { FC, FormEvent, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { SignUpModal } from "./sign-up-modal";
import { Login } from "./login";

export const EmailLogin: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleSignUpClick = () => {
    setShowSignUpModal(true);
  };

  const handleCloseSignUpModal = () => {
    setShowSignUpModal(false);
  };

  const auth = getAuth();

  const onLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (password.length < 6) {
      window.alert("Password must at least 6 characters long");
    }

    signInWithEmailAndPassword(auth, email, password).catch((error) => {
      window.alert(error);
    });
  };

  return !showSignUpModal ? (
    <>
      <div className="side-modal-container">
        <div className="side-modal-content">
          <form onSubmit={onLogin} className="email-sign-in">
            <label className="sign-in-label">
              <input
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              ></input>
            </label>
            <label className="sign-in-label">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></input>
            </label>
            <button className="side-modal-button" type="submit">
              Log In
            </button>
            <div className="register">
              <p>Not a user?</p>
              <span onClick={handleSignUpClick}>Sign Up</span>
            </div>
            <h4>OR</h4>
          </form>
          <Login />
        </div>
      </div>
    </>
  ) : (
    <div className="side-modal-container">
      <div className="side-content">
        <SignUpModal onClose={handleCloseSignUpModal} />
      </div>
    </div>
  );
};

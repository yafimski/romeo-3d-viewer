import Image from "next/image";

export const SubscribeModal = () => {
  return (
    <div className="side-modal-container">
      <div className="side-modal-content">
        <button className="side-modal-button subscribe-button">
          SUBSCRIBE
        </button>
        <h3>Host up to 10 models</h3>
        <h2 className="price">10 USD / month</h2>
        <h4>OR</h4>
        <span>Sign in and work with</span>
        <div className="flex-subscribe">
          <span>1 model for free</span>
        </div>
      </div>
    </div>
  );
};

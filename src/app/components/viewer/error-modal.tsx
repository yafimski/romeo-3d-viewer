import React from "react";

interface Props {
  content: string;
}

export const ErrorModal = (props: Props) => {
  return (
    <div className="error-modal-wrapper">
      <div className="error-modal-content">
        <h2>{props.content}</h2>
      </div>
    </div>
  );
};

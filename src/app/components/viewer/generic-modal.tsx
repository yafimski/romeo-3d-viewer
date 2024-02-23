import React from "react";

interface Props {
  content: string;
}

export const GenericModal = (props: Props) => {
  return (
    <div className="generic-modal-wrapper">
      <div className="generic-modal-content">
        <h2>{props.content}</h2>
      </div>
    </div>
  );
};

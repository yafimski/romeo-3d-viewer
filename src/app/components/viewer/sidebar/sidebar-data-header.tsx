import React, { FC } from "react";

type DataHeaderProps = {
  label: string;
};

export const DataHeader: FC<DataHeaderProps> = ({ label }) => {
  return (
    <div className="data-header-row">
      <div className="data-header-label">{label}</div>
    </div>
  );
};

import Image from "next/image";
import React, { FC } from "react";

export const Header: FC = () => {
  return (
    <div className="header-style">
      <header>
        <Image
          src="/images/Logo_Echo_3.webp"
          alt="ECHO"
          width={128}
          height={128}
          onClick={() => window.open("https://echoviewer.com", "_blank")}
        />
        <h1 onClick={() => window.open("https://echoviewer.com", "_blank")}>
          romeo
        </h1>
      </header>
      <span>contactechoviewer@gmail.com</span>
    </div>
  );
};

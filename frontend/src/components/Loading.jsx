import React from "react";
import { css } from "@emotion/react";
import RingLoader from "react-spinners/RingLoader";

const spinnerColor = "#123abc";
const spinnerSize = 150;

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

function Loading({ loadingText = "Loading..." }) {
  return (
    <div className="loading-container">
      <RingLoader
        color={spinnerColor}
        loading={true}
        css={override}
        size={spinnerSize}
      />
      <p className="loading-text">{loadingText}</p>
    </div>
  );
}

export default Loading;

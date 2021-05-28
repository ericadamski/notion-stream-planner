import React from "react";

export function GlobalStyles() {
  return (
    <style global jsx>{`
      :root {
        --bg: #004643;
        --fg: #abd1c6;
        --header: #fffffe;
        --action: #f9bc60;
        --action-text: #001e1d;
        --extra: #e16162;
        --black: #272343;
        --white: #ffffff;
      }

      * {
        font-family: Poppins, sans-serif;
      }
    `}</style>
  );
}

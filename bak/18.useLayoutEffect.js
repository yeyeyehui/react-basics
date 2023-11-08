import React, { useEffect, useLayoutEffect, useRef } from "./react";

import ReactDOM from "./react-dom/client";

function Animation() {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.style.transform = `translate(500px)`;
    ref.current.style.transition = `all 500ms`;
  }, []);

  const styleObj = {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "red",
  };

  return <div style={styleObj} ref={ref}></div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Animation />);

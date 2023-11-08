import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
} from "./react";

import ReactDOM from "./react-dom/client";

function Child(props, forwardRef) {
  const inputRef = useRef(null);
  const [name, setName] = useState("yh");
  useImperativeHandle(forwardRef, () => ({
    myFocus() {
      inputRef.current.focus();
    },
  }));
  return (
    <input
      type="text"
      value={name}
      ref={inputRef}
      onChange={(event) => setName(event.target.value)}
    />
  );
}

const ForwardChild = React.forwardRef(Child);

function Parent() {
  const [number, setNumber] = useState(0);
  const inputRef = useRef(null);
  const getFocus = () => {
    inputRef.current.myFocus();
    // inputRef.current.remove();
  };
  return (
    <div>
      <ForwardChild ref={inputRef} />
      <button onClick={getFocus}>获得焦点</button>
      <p>{number}</p>
      <button
        onClick={() => {
          setNumber(number + 1);
        }}
      >
        +
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Parent />);

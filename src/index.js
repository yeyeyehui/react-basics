import React, {
  useState,
  // useEffect,
  // useLayoutEffect,
  useRef,
  useImperativeHandle,
} from "./react";

import ReactDOM from "./react-dom/client";

const DOMRoot = ReactDOM.createRoot(document.getElementById("root"));

function Child(props, forwardRef) {
  const inputRef = useRef(null); //3
  const [count, setCount] = useState(0); //4
  useImperativeHandle(forwardRef, () => ({
    myFocus() {
      inputRef.current.focus();
    },
  }));
  return (
    <div>
      <input type="text" ref={inputRef} />
      <p>Child:{count}</p>
      <button
        onClick={() => {
          debugger;
          setCount(count + 1);
        }}
      >
        +
      </button>
    </div>
  );
}

const ForwardChild = React.forwardRef(Child);

function Parent() {
  const [number, setNumber] = useState(0); //0=>1
  const inputRef = useRef(null); //1=>2
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

DOMRoot.render(<Parent />);


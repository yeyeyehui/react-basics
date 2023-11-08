import React from "./react";

import ReactDOM from "./react-dom/client";

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  getFocus = () => {
    this.ref.current.focus();
  };

  render() {
    return <input ref={this.ref} />;
  }
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }
  getFocus = () => {
    this.ref.current.getFocus();
  };
  render() {
    return (
      <div>x
        <TextInput ref={this.ref} />
        <button onClick={this.getFocus}>获得焦点</button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<Form />);

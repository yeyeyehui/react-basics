import React from "./react";

import ReactDOM from "./react-dom/client";

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "button" };
  }

  render() {
    return <button name={this.state.name}>{this.props.title}</button>;
  }
}

function wrapper(OldComponent) {
  return class extends React.Component {
    render() {
      const state = {
        title: "123",
      };
      return <OldComponent {...this.props} {...state} />;
    }
  };
}

const NewButton = wrapper(Button);

ReactDOM.createRoot(document.getElementById("root")).render(<NewButton />);

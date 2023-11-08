import React from "./react";

import ReactDOM from "./react-dom/client";

class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0 };
  }
  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY,
    });
  };
  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

function FunctionComponent(props) {
  return props.render({ x: 100, y: 100 });
}

let element = (
  <FunctionComponent
    render={(value) => (
      <div>
        <h1>请移动鼠标</h1>
        <p>
          当前的鼠标位置是{value.x}:{value.y}
        </p>
      </div>
    )}
  />
);

ReactDOM.createRoot(document.getElementById("root")).render(element);
// HOC也就是高阶组件和render props是可以相互改写的

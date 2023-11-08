import React from "./react";

import ReactDOM from "./react-dom/client";

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "button" };
  }

  componentDidMount() {
    console.log(`Button componentDidMount`);
  }

  render() {
    return <button name={this.state.name}>{this.props.title}</button>;
  }
}

function wrapper(OldComponent) {
  return class NewComponent extends OldComponent {
    constructor(props) {
      super(props);
      this.state = { number: 0 };
    }

    componentDidMount() {
      console.log(`NewComponent componentDidMount`);

      // 调用OldComponent组件的componentDidMount
      super.componentDidMount();
    }

    handleClick = () => {
      this.setState({ number: this.state.number + 1 });
    };

    render() {
      // 新的props
      let newProps = {
        ...this.state,
        onClick: this.handleClick, // 添加点击事件属性
      };

      return React.cloneElement(super.render(), newProps, this.state.number);
    }
  };
}

const NewButton = wrapper(Button);

ReactDOM.createRoot(document.getElementById("root")).render(
  <NewButton title="按钮" />
);

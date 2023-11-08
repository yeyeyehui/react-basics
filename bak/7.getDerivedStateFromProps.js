import React from "./react";

import ReactDOM from "./react-dom/client";

class Counter extends React.Component {
  //定义的默认属性
  static defaultProps = {
    name: "yh",
  };

  constructor(props) {
    super(props); //setup props 设置属性
    this.state = { number: 0 }; //设置状态
    console.log("父constructor");
  }

  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
  };

  // 更新后执行
  componentDidUpdate() {
    console.log(`父componentDidUpdate`);
  }

  render() {
    console.log("父render");
    return (
      <div id={`counter${this.state.number}`}>
        <p>{this.state.number}</p>
        <ChildCounter count={this.state.number} />
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }

  // 组件挂载后（插入 DOM 树中）立即调用
  componentDidMount() {
    console.log("父componentDidMount");
  }
}

class ChildCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }

  //通过新的属性派生出状态
  static getDerivedStateFromProps(nextProps, prevState) {
    const { count } = nextProps;
    if (count % 2 === 0) {
      return { number: count * 2 };
    } else {
      return { number: count * 3 };
    }
  }

  render() {
    console.log("子render");
    return <div>{this.state.number}</div>;
  }

  // 组件挂载后（插入 DOM 树中）立即调用
  componentDidMount() {
    console.log("子componentDidMount");
  }

  // 件卸载及销毁
  componentWillUnmount() {
    console.log("子componentWillUnmount");
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);

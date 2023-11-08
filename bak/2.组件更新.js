import React from "./react";

import ReactDOM from "./react-dom/client";

class ClassComponent extends React.Component {
  constructor(props) {
    super(props); //this.props = props;

    //设置默认状态，在构造函数中是唯一一个可以设置默认值的地方
    this.state = { number: 0, age: 16 };
  }

  handleClick = () => {
    //只能构造函数直接修改this.state,其他函数需要通过setState来修改状态
    //因为setState有一个副作用，就是修改完状态后会让组件重新刷新
    this.setState(
      (state) => ({ number: state.number + 1 }),
      () => {
        console.log("newState", this.state);
      }
    );

    console.log("oldState", this.state);

    //  因为是异步更新，所以oldState会比newState先打印，并且oldState是旧值
    //  并且setState第一个参数给函数可以拿到最新的state，不会导致和oldState一样拿到旧state
    //  oldState {number: 0, age: 16}
    //  newState {number: 1, age: 16}
    //  oldState {number: 1, age: 16}
    //  newState {number: 2, age: 16}
    //  oldState {number: 2, age: 16}
    //  newState {number: 3, age: 16}
  };

  render() {
    return (
      <div id="counter">
        <p>number:{this.state.number}</p>
        <p>age:{this.state.age}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}

const DOMRoot = ReactDOM.createRoot(document.getElementById("root"));

let element = <ClassComponent title="world" />;

DOMRoot.render(element);

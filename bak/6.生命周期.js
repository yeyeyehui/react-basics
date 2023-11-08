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

    console.log("Counter 1.constructor", '父组件constructor初始化');
  }

  UNSAFE_componentWillMount() {
    console.log("Counter 2.componentWillMount", '父组件生命周期函数，将要挂载，一生只执行一次');
  }

  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
  };

  render() {
    console.log("Counter 3.render", '父组件render渲染');

    return (
      <div id={`counter${this.state.number}`}>
        <p>{this.state.number}</p>
        {this.state.number === 4 ? null : (
          <ChildCounter count={this.state.number} />
        )}
        <FunctionCounter count={this.state.number} />
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }

  componentDidMount() {
    console.log("Counter 4.componentDidMount", '父组件在组件挂载后（插入 DOM 树中）立即调用');
  }

  // 方法会返回一个布尔值，指定 React 是否应该继续渲染，默认值是 true， 即 state 每次发生变化组件都会重新渲染
  // number=1为基数，不更新
  shouldComponentUpdate(nextProps, nextState) {
    console.log(`Counter 5.shouldComponentUpdate`, '父组件state发生变化的时候执行');
    return nextState.number % 2 === 0; //如果是偶数就为true,就更新，如果为奇数就不更新
  }

  UNSAFE_componentWillUpdate() {
    //组件将要更新
    console.log(`Counter 6.componentWillUpdate`, '父组件接收到新的 props 或状态值之前对其进行操作的控件');
  }

  // 在组建更新后会被立即调用
  componentDidUpdate() {
    console.log(`Counter 7.componentDidUpdate`, '父组件更新后执行');
  }
}

function FunctionCounter(props) {
  return <div>{props.count}</div>;
}

class ChildCounter extends React.Component {
  // 类组件生命周期函数，将要挂载，一生只执行一次
  UNSAFE_componentWillMount() {
    console.log("ChildCounter 1.componentWillMount", 'ChildCounter子组件生命周期函数，将要挂载，一生只执行一次');
  }

  render() {
    console.log("ChildCounter 2.render", 'ChildCounter子组件render渲染');
    return <div>{this.props.count}</div>;
  }

  componentDidMount() {
    console.log("ChildCounter 3.componentDidMount", 'ChildCounter子组件在组件挂载后（插入 DOM 树中）立即调用');
  }

  // 方法会返回一个布尔值，指定 React 是否应该继续渲染，默认值是 true， 即 state 每次发生变化组件都会重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    console.log(`ChildCounter 5.shouldComponentUpdate`, 'ChildCounter子组件state发生变化的时候执行');
    return nextProps.count % 3 === 0; //如果父组件传过来的count值是3的倍数就更新，否则不更新
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    console.log("ChildCounter 4.componentWillReceiveProps", 'ChildCounter子组件复用老的类组件的实例');
  }

  componentWillUnmount() {
    console.log("ChildCounter 6.componentWillUnmount", 'ChildCounter子组件卸载及销毁之前直接调用');
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Counter age={16} />
);

/**

初始化
Counter 1.constructor 父组件constructor初始化
Counter 2.componentWillMount 父组件生命周期函数，将要挂载，一生只执行一次
Counter 3.render 父组件render渲染
ChildCounter 1.componentWillMount ChildCounter子组件生命周期函数，将要挂载，一生只执行一次
ChildCounter 2.render ChildCounter子组件render渲染
ChildCounter 3.componentDidMount ChildCounter子组件在组件挂载后（插入 DOM 树中）立即调用
onclick eventName
Counter 4.componentDidMount 父组件在组件挂载后（插入 DOM 树中）立即调用

更新
number=1
Counter 5.shouldComponentUpdate 父组件state发生变化的时候执行

number=2
Counter 5.shouldComponentUpdate 父组件state发生变化的时候执行
Counter 6.componentWillUpdate 父组件接收到新的 props 或状态值之前对其进行操作的控件
Counter 3.render 父组件render渲染
ChildCounter 4.componentWillReceiveProps ChildCounter子组件复用老的类组件的实例
ChildCounter 5.shouldComponentUpdate ChildCounter子组件state发生变化的时候执行
Counter 7.componentDidUpdate 父组件更新后执行

number=3
Counter 5.shouldComponentUpdate 父组件state发生变化的时候执行

number=4
Counter 5.shouldComponentUpdate 父组件state发生变化的时候执行
Counter 6.componentWillUpdate 父组件接收到新的 props 或状态值之前对其进行操作的控件
Counter 3.render 父组件render渲染
ChildCounter 6.componentWillUnmount ChildCounter子组件卸载及销毁之前直接调用
Counter 7.componentDidUpdate 父组件更新后执行
 */

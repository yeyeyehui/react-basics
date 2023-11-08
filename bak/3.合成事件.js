import React from "./react";

import ReactDOM from "./react-dom/client";

// 在React18以前m在函数里的更新都是异步，都是批量的,在setTimeout里都是同步的，非批量的
// React18以后,不管在事件函数里，还是在setTimeout里都是批量的

// handleClick 中的update.Queue.isBatchingUpdate = true
// 只要是事件函数，一定就是true

// handleClick触发后会改updateQueue.isBatchingUpdate = true;为批量更新，多个 setState() 调用合并成一个调用
// setTimeout因为是异步，所以会有event loop更新队列，批量更新更新完毕后updateQueue.isBatchingUpdate = false，不会走批量更
// 这个时候setTimeout的内容才进行执行，就不会个 setState() 调用合并
class ClassComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }

  //其实一下以来在react类组件中的this一直就是个问题  bind 匿名
  handleClick = () => {
    //在进入事件回调之前先把批量更新打开
    //因为我这里的callback也是箭头函数，所以说它的this永远也指向类组件的实例
    this.setState({ number: this.state.number + 1 }, () => {
      console.log("setState1");
    });
    console.log(this.state.number); // 0 因为这里更新是异步，所以拿到的是旧值

    this.setState({ number: this.state.number + 1 }, () => {
      console.log("setState2");
    });
    console.log(this.state.number); // 0 因为这里更新是异步，所以拿到的是旧值

    // 上面两次更新因为批量处理，所以只执行了一次

    // 这里就变成同步更新
    setTimeout(() => {
      console.log(this.state.number); // 1

      this.setState({ number: this.state.number + 1 });
      console.log(this.state.number); // 2

      this.setState({ number: this.state.number + 1 });
      console.log(this.state.number); // 3
    }, 1000);
  };

  clickButtonCapture = (event) => {
    console.log("clickButtonCapture");
  };

  clickDivCapture = (event) => {
    console.log("clickDivCapture");
  };

  clickButton = (event) => {
    console.log("clickButtonBubble");

    // stopPropagation()方法阻止事件的向上传播
    // event.stopPropagation();

    this.handleClick();
  };

  clickDiv = (event) => {
    console.log("clickDivBubble");
  };

  clickMyPCapture = () => {
    console.log("clickMyPCapture");
  };

  render() {
    return (
      <div
        id="counter"
        onClick={this.clickDiv}
        onClickCapture={this.clickDivCapture}
      >
        <div id="myp" onClickCapture={this.clickMyPCapture}>
          <p>number:{this.state.number}</p>
          <button
            onClick={this.clickButton}
            onclick={() => {console.log('00000000')}}
            onClickCapture={this.clickButtonCapture}
          >
            +
          </button>
        </div>
      </div>
    );
  }
}

setTimeout(() => {
  document
    .getElementById("myp")
    .addEventListener("click", () => console.log("myp capture"), true);
}, 1000);

// clickDivCapture
// clickMyPCapture
// clickButtonCapture
// myp capture
// 00000000
// clickButtonBubble
// 0
// 0
// clickDivBubble
// 1
// 2
// 3

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClassComponent title="world" />
);

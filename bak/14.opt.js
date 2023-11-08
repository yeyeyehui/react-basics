import React from "./react";

import ReactDOM from "./react-dom/client";

//如果类组件继承自PureComponent，当意味着当属性不变的时候，不重新渲染，跳过更新的逻辑
class ClassCounter extends React.PureComponent {
  render() {
    console.log("ClassCounter render");
    return <div>{this.props.count}</div>;
  }
}

function FunctionCounter(props) {
  console.log("FunctionCounter render");
  return <div>{props.count}</div>;
}

//{$$typeof:REACT_MEMO,type,compare}
const MemoFunctionCounter = React.memo(FunctionCounter);

class App extends React.Component {
  state = { number: 0 };

  amountRef = React.createRef();

  handleClick = (event) => {
    let newNumber =
      this.state.number + parseFloat(this.amountRef.current.value);
    this.setState({ number: newNumber });
  };

  render() {
    console.log("App render");
    return (
      <div>
        <p>number:{this.state.number}</p>

        ClassCounter:
        <ClassCounter count={this.state.number} />

        FunctionCounter:
        <MemoFunctionCounter count={this.state.number} />

        <input ref={this.amountRef} />
        
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

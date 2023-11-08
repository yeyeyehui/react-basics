import React from "./react";

import ReactDOM from "./react-dom/client";

/**
 * 1.函数组件接收一个属性对象并返回一个React元素
 * 2.函数必须以大写字母开头，因为在内部是通过大小写判断是自定义组件还是默认组件div span
 * 3.函数组件在使用前必须先定义
 * 4.函数组件能且只能返回一个根元素
 * @returns
 */
function FunctionComponent(props) {
  return (
    <div className="title" style={{ color: "red" }}>
      <span>{props.title}</span>
    </div>
  );
}

const DOMRoot = ReactDOM.createRoot(document.getElementById("root"));

//就是把虚拟DOM对象变成真实DOM元素的过程，并且自动插入到页面
let element = <FunctionComponent title="world" />;

//let element = React.createElement(FunctionComponent,{title:'world'});
DOMRoot.render(element);

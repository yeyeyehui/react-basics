import {
  REACT_FORWARD_REF_TYPE,
  REACT_TEXT,
  REACT_PROVIDER,
  REACT_CONTEXT,
  REACT_MEMO,
} from "../constant";

import { addEvent } from "../event";

let hookStates = []; //[0,{myFocus},{current:input},0] 4个元素

let hookIndex = 0;

let scheduleUpdate;

/**
 * 把虚拟DOM变成真实的DOM
 * @param {*} vdom 虚拟DOM
 */
function createDOM(vdom) {
  const { type, props, ref } = vdom;

  let dom;

  if (type && type.$$typeof === REACT_MEMO) {
    return mountMemoComponent(vdom); // memo
  } else if (type && type.$$typeof === REACT_CONTEXT) {
    return mountConsumerComponent(vdom); // context
  } else if (type && type.$$typeof === REACT_PROVIDER) {
    return mountProviderComponent(vdom); // provider
  } else if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
    return mountForwardComponent(vdom); // ref
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props); // 文本
  } else if (typeof type == "function") {
    if (type.isReactComponent) {
      return mountClassComponent(vdom); // 类组件
    } else {
      return mountFunctionComponent(vdom); // 函数组件
    }
  } else {
    dom = document.createElement(type); // 原生组件
  }

  //判断属性的类型，因为对于元素的话，props是对象，对于文本节点而言，它的props就是文本本身
  if (typeof props === "object") {
    // 更新DOM属性
    updateProps(dom, {}, props);

    if (props.children) {
      //如果是独生子的话，把独生子的虚拟DOM转换真实DOM插入到DOM节点上
      if (typeof props.children === "object" && props.children.type) {
        // 记录当前节点的index
        props.children.mountIndex = 0;

        // 虚拟DOM转换为真实的DOM
        mount(props.children, dom);
      } else if (Array.isArray(props.children)) {
        // 多个子节点
        reconcileChildren(props.children, dom);
      }
    }
  }

  //在根据虚拟DOM创建真实DOM成功后，就可以建立关系
  vdom.dom = dom;

  //如果此虚拟DOM上有ref属性，则把ref.current的值赋成真实DOM
  if (ref) ref.current = dom;

  //   返回真实的DOM
  return dom;
}

/**
 * memo组件
 * @param {*} vdom 虚拟DOM
 */
function mountMemoComponent(vdom) {
  const {
    type: { type: functionComponent },
    props,
  } = vdom;

  const renderVdom = functionComponent(props);

  if (!renderVdom) return null;

  vdom.oldRenderVdom = renderVdom;

  return createDOM(renderVdom);
}

/**
 * context组件
 * @param {*} vdom 虚拟DOM
 */
function mountConsumerComponent(vdom) {
  const { type, props } = vdom;

  const context = type._context;

  // 把_currentValue共享属性传递给子组件
  const renderVdom = props.children(context._currentValue);

  if (!renderVdom) return null;

  vdom.oldRenderVdom = renderVdom;

  return createDOM(renderVdom);
}

/**
 * provider组件
 * @param {*} vdom 虚拟DOM
 */
function mountProviderComponent(vdom) {
  const { type, props } = vdom;

  const context = type._context;

  // 获取provider组件的value组件，挂载到_currentValue共享属性中
  context._currentValue = props.value;

  let renderVdom = props.children;

  if (!renderVdom) return null;

  vdom.oldRenderVdom = renderVdom;

  return createDOM(renderVdom);
}

/**
 * ref组件
 * @param {*} vdom 虚拟DOM
 */
function mountForwardComponent(vdom) {
  const { type, props, ref } = vdom;

  //type.render=就是TextInput
  const renderVdom = type.render(props, ref);

  if (!renderVdom) return null;

  vdom.oldRenderVdom = renderVdom;

  return createDOM(renderVdom);
}

/**
 * class组件
 * @param {*} vdom 虚拟DOM
 */
function mountClassComponent(vdom) {
  // type: 类组件本身
  const { type: ClassComponent, props, ref } = vdom;

  // class组件默认的props属性
  var defaultProps = ClassComponent.defaultProps;

  // 合并
  var resolvedProps = { ...defaultProps, ...props };

  // class组件实例
  const classInstance = new ClassComponent(resolvedProps);

  // 如果有Context上下文，用来进行数据传递
  if (ClassComponent.contextType) {
    classInstance.context = ClassComponent.contextType._currentValue;
  }

  //让虚拟DOM的classInstance属性指向此类的实例
  vdom.classInstance = classInstance;

  // 当前ref指向当前类组件的实例
  if (ref) ref.current = classInstance;

  // 类组件生命周期函数，将要挂载，一生只执行一次
  if (classInstance.UNSAFE_componentWillMount) {
    classInstance.UNSAFE_componentWillMount();
  }

  // 获取类组件return的子组件
  const renderVdom = classInstance.render();

  if (!renderVdom) return null;

  //在获取render的渲染结果后把此结果放到classInstance.oldRenderVdom进行暂存
  classInstance.oldRenderVdom = renderVdom;

  // 继续转换虚拟DOM为真实DOM
  const dom = createDOM(renderVdom);

  // 在组件挂载后（插入 DOM 树中）立即调用
  if (classInstance.componentDidMount) {
    //把componentDidMount方法暂存到dom对象上
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
  }

  return dom;
}

/**
 * 函数组件
 * @param {*} vdom 虚拟DOM
 */
function mountFunctionComponent(vdom) {
  // FunctionComponent  {title:'world'}
  const { type, props } = vdom;

  // 其实就是createElement方法返回的节点对象里面的属性，type为函数自身，调用后获取return的内容
  const renderVdom = type(props);

  // 如果函数没返回，直接结束
  if (!renderVdom) return null;

  // 当前需要渲染的虚拟DOM，也可以理解为即将为旧的虚拟DOM
  vdom.oldRenderVdom = renderVdom;

  // 对函数返回的子组件进行虚拟DOM转真实DOM
  return createDOM(renderVdom);
}

/**
 * 多个子虚拟DOM，循环执行mount方法转换为真实DOM
 * @param {*} childrenVdom 数组子节点虚拟DOM
 * @param {*} parentDOM 父节点容器
 */
function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    // 记录当前虚拟DOM是第几个子节点
    childrenVdom[i].mountIndex = i;

    // 转换虚拟DOM为真实的DOM
    mount(childrenVdom[i], parentDOM);
  }
}

/**
 * 更新DOM元素的属性
 * 1.把新的属性全部赋上去
 * 2.把老的属性在新的属性对象没有删除掉
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
  for (let key in newProps) {
    // children属性会在后面单独处理
    if (key === "children") {
      continue;
    } else if (key === "style") {
      // 把样式对象上的所有属性都赋给真实DOM
      let styleObject = newProps[key];
      for (const attr in styleObject) {
        dom.style[attr] = styleObject[attr];
      }
    } else if (/^on[A-Z].*/.test(key)) {
      // 事件添加
      // dom[key.toLowerCase()]=newProps[key];
      addEvent(dom, key, newProps[key]);
    } else {
      // 如果是其它属性，则直接赋值
      dom[key] = newProps[key];
    }
  }

  // 删除无用的属性
  for (let key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      dom[key] = null;
    }
  }
}

/**
 * DOM挂载
 * @param {*} vdom 虚拟DOM,其实就是元素对象套元素对象
 * @param {*} container 根节点容器
 */
function mount(vdom, container) {
  //传进去虚拟DOM，返回真实DOM
  const newDOM = createDOM(vdom);

  // 有新的真实DOM，进行挂载
  if (newDOM) {
    container.appendChild(newDOM);

    // 执行生命周期函数componentDidMount
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount();
    }
  }
}

//class>function>class>function
/**
 * 获取到此组件对应的老的真实DOM
 */
export function findDOM(vdom) {
  //Class Counter虚拟DOM {type:Counter,classInstance:CounterInstance}
  if (!vdom) return null;

  //如果vdom对应原生组件的的话肯定有dom属性指向真实DOM
  if (vdom.dom) {
    return vdom.dom;
  } else {
    //否则 可能是类组件或者说函数组件 oldRenderVdom {type:div}
    const renderVdom = vdom.classInstance
      ? vdom.classInstance.oldRenderVdom
      : vdom.oldRenderVdom;
    return findDOM(renderVdom);
  }
}

/**
 * render或让组件强制更新触发，比较新的和老的虚拟DOM
 * @param {*} parentDOM 老的父真实DOM
 * @param {*} oldVdom   老的虚拟DOm
 * @param {*} newVdom   新的虚拟DOM
 * @param {*} nextDOM   newVdom的离它最近的下一个真实DOM元素
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  //如果老的虚拟DOM和新的虚拟DOM都是null或undefined
  if (!oldVdom && !newVdom) return;
  else if (oldVdom && !newVdom)
    unMountVdom(oldVdom); // 如果老的虚拟DOM有值，并且新的虚拟DOM为null，
  else if (!oldVdom && newVdom) {
    //创建新的虚拟DOM对应的真实DOM
    let newDOM = createDOM(newVdom);

    if (nextDOM)
      parentDOM.insertBefore(newDOM, nextDOM); // 在现有子节点之前插入子节点
    else parentDOM.appendChild(newDOM); // 向节点添加最后一个子节点

    // 在组件挂载后（插入 DOM 树中）立即调用
    if (newDOM.componentDidMount) newDOM.componentDidMount();
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    //如果虽然说老的有，新的也有，但是类型不同，则也不能复用老的真实DOM节点
    unMountVdom(oldVdom);

    // 把虚拟DOM变成真实的DOM
    let newDOM = createDOM(newVdom);

    if (nextDOM)
      parentDOM.insertBefore(newDOM, nextDOM); // 在现有子节点之前插入子节点
    else parentDOM.appendChild(newDOM); // 向节点添加最后一个子节点

    // 在组件挂载后（插入 DOM 树中）立即调用
    if (newDOM.componentDidMount) newDOM.componentDidMount();
  } else {
    //如果有老的虚拟DOM，也有新的虚拟DOM，并且类型是一样的，就可以复用老的真实DOM
    updateElement(oldVdom, newVdom);
  }
}

/**
 * 卸载dom
 * @param {*} vdom   老的虚拟DOm
 */
function unMountVdom(vdom) {
  const { props, ref } = vdom;

  // 获取此虚拟DOM对应的真实DOM
  let currentDOM = findDOM(vdom);

  // 如果类的实例上componentWillUnmount方法则执行它
  if (vdom.classInstance && vdom.classInstance.componentWillUnmount) {
    vdom.classInstance.componentWillUnmount();
  }

  // 释放ref内存
  if (ref) {
    ref.current = null;
  }

  // 子组件执行卸载
  if (props.children) {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children];
    children.forEach(unMountVdom);
  }

  //如果此虚拟DOM对应了真实DOM，则把此真实DOM进行删除
  if (currentDOM) currentDOM.remove();
}

/**
 * 更新元素,复用元素，实现DOM-DIFF
 * @param {*} oldVdom 老的虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateElement(oldVdom, newVdom) {
  //如果新老的虚拟DOM都是文本节点的话
  if (oldVdom.type.$$typeof === REACT_FORWARD_REF_TYPE) {
    updateForwardComponent(oldVdom, newVdom); // 函数组件类型
  } else if (oldVdom.type.$$typeof === REACT_MEMO) {
    updateMemoComponent(oldVdom, newVdom); // memo
  } else if (oldVdom.type.$$typeof === REACT_PROVIDER) {
    updateProviderComponent(oldVdom, newVdom); // provider
  } else if (oldVdom.type.$$typeof === REACT_CONTEXT) {
    updateContextComponent(oldVdom, newVdom); // context
  } else if (oldVdom.type === REACT_TEXT) {
    // 文本节点，替换文本内容
    // 复用老的真实DOM节点
    let currentDOM = (newVdom.dom = findDOM(oldVdom));

    if (oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props;
    }

    return;
  } else if (typeof oldVdom.type === "string") {
    //如果是原生组件的话，就是指span div p
    let currentDOM = (newVdom.dom = findDOM(oldVdom));

    // 用新的虚拟DOM属性更新老的真实DOM
    updateProps(currentDOM, oldVdom.props, newVdom.props);

    // 更新子节点
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === "function") {
    //如果类型是一个函数的话，说明肯定是一个组件
    if (oldVdom.type.isReactComponent) {
      //如果是类组件的话
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom); //如果是函数组件的话
    }
  }
}

/**
 * 函数组件类型
 * @param {*} oldVdom 老的虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateForwardComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom);

  if (!currentDOM) return;

  let parentDOM = currentDOM.parentNode;

  const { type, props, ref } = newVdom;

  const newRenderVdom = type.render(props, ref);

  // 比较新旧虚拟DOM
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom);

  // 还要把newRenderVdom保存起来
  newVdom.oldRenderVdom = newRenderVdom;
}

/**
 * memo
 * @param {*} oldVdom 老的虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateMemoComponent(oldVdom, newVdom) {
  let {
    type: { compare, type: functionComponent },
  } = oldVdom;

  //比较新的和老的属性对象，如果是一样的，就不render
  if (compare(oldVdom.props, newVdom.props)) {
    //则不重新渲染，直接复用老的渲染的虚拟DOM
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
  } else {
    const oldDOM = findDOM(oldVdom);

    const parentDOM = oldDOM.parentNode;

    const renderVdom = functionComponent(newVdom.props);

    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);

    newVdom.oldRenderVdom = renderVdom;
  }
}

/**
 * provider
 * @param {*} oldVdom 老的虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateProviderComponent(oldVdom, newVdom) {
  //先获取父DOM节点
  let parentDOM = findDOM(oldVdom).parentNode;

  let { type, props } = newVdom;

  let context = type._context;

  context._currentValue = props.value;

  let renderVdom = props.children;

  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);

  newVdom.oldRenderVdom = renderVdom;
}

/**
 * context
 * @param {*} oldVdom 老的虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateContextComponent(oldVdom, newVdom) {
  //先获取父DOM节点
  let parentDOM = findDOM(oldVdom).parentNode;

  let { type, props } = newVdom;

  let context = type._context;

  let renderVdom = props.children(context._currentValue);

  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);

  newVdom.oldRenderVdom = renderVdom;
}

/**
 * 原生组件的函数组件
 * @param {*} oldVdom 老的虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateFunctionComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom);

  if (!currentDOM) return;

  //获取当前的真实DOM的父节点
  let parentDOM = currentDOM.parentNode;

  //重新执行函数获取新的虚拟DOM
  const { type, props } = newVdom; //FunctionComponent  {title:'world'}

  const newRenderVdom = type(props);

  //比较新旧虚拟DOM
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom);

  //还要把newRenderVdom保存起来
  newVdom.oldRenderVdom = newRenderVdom;
}

/**
 * 原生组件的类组件
 * @param {*} oldVdom 老的虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateClassComponent(oldVdom, newVdom) {
  // 复用老的类组件的实例
  let classInstance = (newVdom.classInstance = oldVdom.classInstance);

  if (classInstance.UNSAFE_componentWillReceiveProps) {
    classInstance.UNSAFE_componentWillReceiveProps(newVdom.props);
  }

  classInstance.updater.emitUpdate(newVdom.props);
}

/**
 * 更新它的子节点，这里实现节点复用
 * @param {*} parentDOM 父真实DOM
 * @param {*} oldVChildren 老的子虚拟DOM
 * @param {*} newVChildren 新的子虚拟DOM
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  // 旧的子节点
  oldVChildren = Array.isArray(oldVChildren)
    ? oldVChildren
    : oldVChildren
    ? [oldVChildren]
    : [];

  // 新的子节点
  newVChildren = Array.isArray(newVChildren)
    ? newVChildren
    : newVChildren
    ? [newVChildren]
    : [];

  //存放老节点的map
  const keyedOldMap = {};

  //上一个放置好的，不需要移动元素的索引
  let lastPlacedIndex = -1;

  // 判断使用索引的内容
  oldVChildren.forEach((oldVChild, index) => {
    //如果用户提供了key就用用户提供的key,否则就使用index索引
    let oldKey = oldVChild.key ? oldVChild.key : index;

    keyedOldMap[oldKey] = oldVChild;
  });

  //创建一个补丁包，存放将要进行的操作
  let patch = [];

  //遍历新的虚拟DOM数组
  newVChildren.forEach((newVChild, index) => {
    if(!newVChild) return

    newVChild.mountIndex = index;

    let newKey = newVChild.key ? newVChild.key : index;

    //用新的key去老的map中找找有没有可复用的虚拟DOM
    let oldVChild = keyedOldMap[newKey];

    //如果找到了就可以进行复用了
    if (oldVChild) {
      //如果找到了就直接进行更新
      updateElement(oldVChild, newVChild);

      //再判断此节点是否需要移动
      //如果此可复用的老节点的挂载索引比上一个不需要移动的节点的索引要小的话，那就需要移动
      if (oldVChild.mountIndex < lastPlacedIndex) {
        // 1 < 4
        patch.push({
          type: "MOVE",
          oldVChild, //移动老B 1
          newVChild,
          mountIndex: index, //3
        });
      }

      //把可以复用的老的虚拟DOM节点从map中删除
      delete keyedOldMap[newKey];

      //更新lastPlacedIndex为老的lastPlacedIndex和oldVChild.mountIndex中的较大值
      lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex);
    } else {
      // 没有找到，追加子节点
      patch.push({
        type: "PLACEMENT",
        newVChild,
        mountIndex: index,
      });
    }
  });

  //执行patch中的操作
  //获取所有需要移动的元素 ['B']
  const moveVChildren = patch
    .filter((action) => action.type === "MOVE")
    .map((action) => action.oldVChild);

  //获取所有留在map中的老的虚拟DOM加上移动的老的虚拟DOM
  //直接从老的真实DOM中删除 D F B
  Object.values(keyedOldMap)
    .concat(moveVChildren)
    .forEach((oldVChild) => {
      let currentDOM = findDOM(oldVChild);
      parentDOM.removeChild(currentDOM);
    });

  //patch =[{type:'MOVE',B},{type:'PLACEMENT',G}]
  patch.forEach((action) => {
    const { type, oldVChild, newVChild, mountIndex } = action;
    let oldTrueDOMs = parentDOM.childNodes; //获取老的真实DOM的集合[A,C,E]
    if (type === "PLACEMENT") {
      //先根据新的虚拟DOM创建新的真实DOM
      let newDOM = createDOM(newVChild);

      const oldTrueDOM = oldTrueDOMs[mountIndex];
      if (oldTrueDOM) {
        //如果要挂载的索引处有真实DOM，就是插到它的前面
        parentDOM.insertBefore(newDOM, oldTrueDOM);
      } else {
        parentDOM.appendChild(newDOM);
      }
    } else if (type === "MOVE") {
      let oldDOM = findDOM(oldVChild); //B真实DOM
      let oldTrueDOM = oldTrueDOMs[mountIndex]; //获取挂载索引处现在的真实DOM
      if (oldTrueDOM) {
        //如果要挂载的索引处有真实DOM，就是插到它的前面
        parentDOM.insertBefore(oldDOM, oldTrueDOM);
      } else {
        parentDOM.appendChild(oldDOM);
      }
    }
  });
}

/**
 * 因为可能有多个根节点，所以给class，可以创建多个实例
 * @param {*} container 容器id
 * @return {*} render 开始元素渲染方法
 */
class DOMRoot {
  constructor(container) {
    this.container = container;
  }

  render(vdom) {
    // 初始化，把虚拟DOM转换为真实的DOM
    mount(vdom, this.container);

    // 更新事件的触发
    scheduleUpdate = () => {
      hookIndex = 0;
      compareTwoVdom(this.container, vdom, vdom);
    };
  }
}

/**
 * 创建根节点
 * @param {*} container 容器id
 */
function createRoot(container) {
  return new DOMRoot(container);
}

const ReactDOM = {
  createRoot,
  createPortal: function (vdom, container) {
    mount(vdom, container);
  },
};

export function useState(initialState) {
  return useReducer(null, initialState);
  /*  const oldState = hookStates[hookIndex]=hookStates[hookIndex]||initialState;

    const currentIndex = hookIndex;

    function setState(action){
        let newState = typeof action === 'function'?action(oldState):action;

        hookStates[currentIndex]=newState;

        scheduleUpdate();
    }

    return [hookStates[hookIndex++],setState]; */
}

export function useReducer(reducer, initialState) {
  const oldState = (hookStates[hookIndex] =
    hookStates[hookIndex] || initialState);

  const currentIndex = hookIndex;

  function dispatch(action) {
    let newState = reducer
      ? reducer(oldState, action)
      : typeof action === "function"
      ? action(oldState)
      : action;

    hookStates[currentIndex] = newState;

    scheduleUpdate();
  }

  return [hookStates[hookIndex++], dispatch];
}

export function useCallback(callback, deps) {
  //第一次挂载的时候，肯定值是空的
  if (hookStates[hookIndex]) {
    let [lastCallback, lastDeps] = hookStates[hookIndex];

    // 判断第一次的依赖和最新的依赖是否相等
    let same = deps.every((item, index) => item === lastDeps[index]);

    if (same) {
      //新的依赖数组和老的依赖数组完全 相等
      hookIndex++;

      return lastCallback;
    } else {
      // 不想等
      hookStates[hookIndex++] = [callback, deps];

      return callback;
    }
  } else {
    hookStates[hookIndex++] = [callback, deps];
    return callback;
  }
}

export function useMemo(factory, deps) {
  //第一次挂载的时候，肯定值是空的
  if (hookStates[hookIndex]) {
    let [lastMemo, lastDeps] = hookStates[hookIndex];

    let same = deps.every((item, index) => item === lastDeps[index]);

    if (same) {
      //新的依赖数组和老的依赖数组完全 相等
      hookIndex++;

      return lastMemo;
    } else {
      const newMemo = factory();

      hookStates[hookIndex++] = [newMemo, deps];

      return newMemo;
    }
  } else {
    const newMemo = factory();

    hookStates[hookIndex++] = [newMemo, deps];

    return newMemo;
  }
}

export function useImperativeHandle(ref, handler) {
  ref.current = handler();
}

export function useRef(initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || { current: initialState };
  return hookStates[hookIndex++];
}

export function useLayoutEffect(callback, deps) {
  const currentIndex = hookIndex;

  if (hookStates[currentIndex]) {
    let [destroy, lastDeps] = hookStates[hookIndex];

    // 判断依赖是否有变化
    let same = deps && deps.every((item, index) => item === lastDeps[index]);

    if (same) {
      hookIndex++;
    } else {
      // 有变化，重新执行方法
      destroy?.();

      queueMicrotask(() => {
        //queue宏任务 setTimeout模拟
        //执行callback,保存返回的destroy销毁函数
        hookStates[currentIndex] = [callback(), deps];
      });
      
      hookIndex++;
    }
  } else {
    queueMicrotask(() => {
      //执行callback,保存返回的destroy销毁函数
      hookStates[currentIndex] = [callback(), deps];
    });
    hookIndex++;
  }
}

export function useEffect(callback, deps) {
  const currentIndex = hookIndex;

  if (hookStates[currentIndex]) {
    let [destroy, lastDeps] = hookStates[hookIndex];

    let same = deps && deps.every((item, index) => item === lastDeps[index]);

    if (same) {
      hookIndex++;
    } else {
      destroy?.();

      setTimeout(() => {
        //执行callback,保存返回的destroy销毁函数
        hookStates[currentIndex] = [callback(), deps];
      });

      hookIndex++;
    }
  } else {
    setTimeout(() => {
      //执行callback,保存返回的destroy销毁函数
      hookStates[currentIndex] = [callback(), deps];
    });

    hookIndex++;
  }
}

export function useContext(context) {
  return context._currentValue;
}

export default ReactDOM;

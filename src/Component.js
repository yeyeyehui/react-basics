import { findDOM, compareTwoVdom } from "./react-dom/client";

/**
 * 这是一个更新队列
 * @param {*} props
 * @param {*} state
 * @param {*} updater 每个类会有一个更新器的实例
 */
export let updateQueue = {
  isBatchingUpdate: false, //这是一个是否是批量更新的标识,默认是非批量的，是同步的

  updaters: new Set(), //更新的集合

  /**
   * 触发批量更新
   */
  batchUpdate() {
    updateQueue.isBatchingUpdate = false;

    // 有待更新的事件队列
    for (const updater of updateQueue.updaters) {
      // 根据等待生效的状态数组组计算新的状态
      // 更新props和state前的AOP
      updater.updateComponent();
    }

    // updaters执行完毕，删除所有的键/值对，没有返回值。
    updateQueue.updaters.clear();
  },
};

/**
 * class的state更新事件
 * @param {*} props
 * @param {*} state
 * @param {*} updater 每个类会有一个更新器的实例
 */
export class Component {
  //给类Component添加了一个静态属性 isReactComponent=true，告诉这个是类组件
  static isReactComponent = true;

  // 可以和props合并的静态默认属性
  static defaultProps = {
    name: "default",
  };

  constructor(props) {
    this.props = props;

    this.state = {};

    this.updater = new Updater(this);
  }

  setState(partialState, callback) {
    this.updater.addState(partialState, callback);
  }

  /**
   * 让组件强制更新
   */
  forceUpdate() {
    //先获取老的虚拟DOM，再计算新的虚拟DOM，找到新老虚拟DOM的差异，把这些差异更新到真实DOM上
    //获取老的虚拟DOM div#counter
    let oldRenderVdom = this.oldRenderVdom;

    // 获取到此组件对应的老的真实DOM，才的DIV
    const oldDOM = findDOM(oldRenderVdom);

    if (this.constructor.contextType) {
      this.context = this.constructor.contextType._currentValue;
    }

    // 会在调用 render 方法之前调用，即在渲染 DOM 元素之前会调用，并且在初始挂载及后续更新时都会被调用。
    const { getDerivedStateFromProps } = this.constructor;

    if (getDerivedStateFromProps) {
      //可以替代掉以前componentWillReceiveProps，获取最新的state
      let newState = getDerivedStateFromProps(this.props, this.state);

      if (newState) {
        this.state = { ...this.state, ...newState };
      }
    }

    // 根据新的状态计算新的虚拟DOM
    let newRenderVdom = this.render();

    // 方法在最近一次渲染输出（提交到 DOM 节点）之前调用
    let snapshot =
      this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate();

    // 比较新旧虚拟DOM的差异，把更新后的结果放在真实DOM上
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);

    // 在更新后需要把oldRenderVdom更新为新的newRenderVdom
    // 第一次挂载 老的div#counter
    // 第一次更新的时候 新的div#counter
    // replaceChild  div#root>新的div#counter
    // 它永远指向当前父DOM节点当前的子DOM节点
    this.oldRenderVdom = newRenderVdom;

    // 更新完毕，调用state回调
    this.updater.flushCallbacks();

    // 法在组建更新后会被立即调用
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, snapshot);
    }
  }
}

/*
 * class的state更新事件
 * @param {*} classInstance class组件的上下文
 * @param {*} partialState 新的state事件或者state对象
 * @param {*} callback state替换后的回调事件c
 */
class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;

    // 用来存放更新状态，新的数据或者事件
    this.pendingStates = [];

    // 回调数组
    this.callbacks = [];
  }

  /**
   * 存储state事件或者state对象
   * @param {*} partialState 新的state事件或者state对象
   * @param {*} callback state替换后的回调事件
   */
  addState(partialState, callback) {
    // 追加更新状态事件或者对象
    this.pendingStates.push(partialState);

    // 追加状态更新后的回调函数
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }

    // 发射更新有两种，一种是更新属性，一种是更新状态
    this.emitUpdate();
  }

  /**
   * 判断批量更新还是同步更新
   * @param {*} nextProps 新的props数据
   */
  emitUpdate(nextProps) {
    // 保存传过来的新属性
    this.nextProps = nextProps;

    // 如果需要批量更新，放到更新队列上面去
    if (updateQueue.isBatchingUpdate) {
      // 则不要直接更新组件，而是先把更新器添加到updaters里去进行暂存
      updateQueue.updaters.add(this);
    } else {
      // 这里是同步更新
      this.updateComponent();
    }
  }

  /**
   * 根据等待生效的状态数组组计算新的状态
   * 更新props和state前的AOP
   */
  updateComponent() {
    //获取等生效的状态数组和类的实例
    const { pendingStates, nextProps, classInstance } = this;

    // 如果有正在等待生效的状态
    if (nextProps || pendingStates.length > 0) {
      shouldUpdate(classInstance, nextProps, this.getState());
    }
  }

  /**
   * state更新完执行callbacks
   */
  flushCallbacks() {
    if (this.callbacks.length > 0) {
      //如果没有使用箭头函数，那这里的
      this.callbacks.forEach((callback) => callback());
      this.callbacks.length = 0;
    }
  }

  /**
   * 执行state集合可能为函数也可能为对象数据，获取最新的state对象数据
   */
  getState() {
    // pendingStates：待处理的state集合，可能为函数也可能为对象数据
    // classInstance： 当前更新事件的上下文
    const { pendingStates, classInstance } = this;

    // 先获取类的实例上的老state
    let { state } = classInstance;

    // 循环执行state集合
    pendingStates.forEach((partialState) => {
      // 如果是函数，先调用并且吧最新的state传递进去
      if (typeof partialState === "function") {
        partialState = partialState(state);
      }

      // 更新state
      state = { ...state, ...partialState };
    });

    // 清空state集合，所有state更新完毕
    pendingStates.length = 0;

    return state;
  }
}

/**
 * 替换当前更新事件实例的props和state并且触发生命周期钩子
 * @param {*} classInstance 当前更新事件实例的上下文
 * @param {*} nextProps 新的props数据
 * @param {*} nextState 新的state数据
 */
function shouldUpdate(classInstance, nextProps, nextState) {
  //是否要更新
  let willUpdate = true;

  //如果有shouldComponentUpdate方法，并且返回值为false的话
  // shouldComponentUpdate() 方法会返回一个布尔值，指定 React 是否应该继续渲染，默认值是 true， 即 state 每次发生变化组件都会重新渲染
  if (
    classInstance.shouldComponentUpdate &&
    !classInstance.shouldComponentUpdate(nextProps, nextState)
  ) {
    willUpdate = false;
  }

  // 如果要更新，并且存在组件将要更新的方法
  // UNSAFE_componentWillUpdate： 在 React 组件接收到新的 props 或状态值之前对其进行操作的控件
  if (willUpdate && classInstance.UNSAFE_componentWillUpdate) {
    classInstance.UNSAFE_componentWillUpdate();
  }

  //不管最终要不要更新页面上的组件，都会把新的状态传送给classInstance.state
  classInstance.state = nextState;

  // 如果有新的props，就替换
  if (nextProps) {
    classInstance.props = nextProps;
  }

  // 让组件强制更新
  if (willUpdate) classInstance.forceUpdate();
}

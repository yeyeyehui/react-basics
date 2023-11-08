花儿要打败熊猫当国宝 对我说  (私聊)
这个方法为啥 handleClick(){}这么写？老师
黑子
以后只用类里面箭头函数就可以，箭头函数中的this永远指向类的实例
上节课的 最后this问题有疑问, 

this.setState({number.this.state.number+1},
function(){this.state  // 

这个this报错,是因为flushCallbacks执行时,遍历callbacks ,执行callback()
 是直接调用的 this === undefined?改为箭头函数之后this就对了,
 箭头函数this指向外层函数this,外层函数应该是flushCallbacks,
 flushCallbacks的this应该是Updater吧,怎么变成了ClassComponent })
而是类组件的实例

18以后  jsx 最后会转换成 React.createElement()么?
17以前jsx 转成React.createElement()
17以事jsx会转成 import {jsx} from 'react/runtime'; jsx('span')

那18以后和18以前生成虚拟Dom的方法一样么?
生成虚拟DOm的方法不一样，
但是生成的虚拟DOm结果是一样

函数组件里面直接写一个console.log,这个组件还有显示到页面的时候这个console.log就执行了,
是不是就是因为要先调用 FC 拿到VDom
王同学
箭头函数你要看在在哪里定义的
箭头函数的话你在哪里定义，它里的this就是当时父作用域中的this
小鱼
1
花儿要打败熊猫当国宝 对我说  (私聊)
这个方法为啥 handleClick(){}不这么写？
可以
石丽丽
听得见


我以为箭头函数是执行时确认this
不是

无名
为什么箭头函数里面的this是类的实例
超人不会飞
电流麦有时候
杨澜
显示undeind是因为开严格模式了吗？
杨澜
callback改成普通函数。this会为unfined吧。是因为设置了严格模式吗
刘源
为啥会想到把 Updater 设计出去成为一个单独的类呢，，是有这么一个设计模式么？Vue的响应式好像也是这样。



参数args需要写成...args吧？
无名
不是传参的时候，是声明args参数的时候
王同学
面试前也可以看看哈哈



向仕林
绑定了两次吗
郭江林
是不是addEventListen两次
杨澜
是因为事件委托吗？
黑子
绑定了两次? 是的
悟空
17  18
在路上
每次都查找捕获和冒泡，应该捕获只找捕获，冒泡只找冒泡
王同学
老师按之前写的if (!document[eventType])是不是有多个点击on click只会给document绑一次
无名
应该是addEvent调用有问题
张峰
捕获和冒泡是我们自己用栈模拟的，所以监听 document 应该只监听一次冒泡阶段就好
石丽丽
今天咱们上到几点呢
无名
如果事件名有capture，再绑定捕获事件，不能冒泡和捕获事件，无条件就直接绑定
无名
20，21行有问题
花

几点都行 多学点东西 挺好
王同学
老师按之前写的if (!document[eventType])是不是有多个点击on click只会给document绑一次，就是父元素子元素都有同类型的事件只会给document加一次
黑子
加两次是因为 捕获和冒泡  跟元素没关系

<ForwardTextInput ref={this.ref}/>
React.createElement(ForwardTextInput,{ref:this.ref});
{
        $$typeof:REACT_ELEMENT,//默认是元素类型
        type: {
            $$typeof:REACT_FORWARD_REF_TYPE,
            render// 其实就是原来的函数组件那个函数
        },
        props:{},//属性
        ref:this.ref,
}


<div>{this.props.name}</div> 中{this.props.name} 是在什么时候解析的
在打包的时候，babel转译的时候会进行解析


花儿要打败熊猫当国宝
合并props为啥不放在react.component父类中呢？
花儿要打败熊猫当国宝
babel


在路上
事件函数中改数据是批量更新，生命周期函数中改数据也是批量更新？
其实是的
21:08
Ace
子组件卸载的时候，为什么没有先执getDerivedStateFromProps生命周期
我们还没讲到






删除所有可复用的，剩下的是不可复用的节点，然后删除所有剩下的 这是针对老的oldKkeyMap说的把
是的
花儿要打败熊猫当国宝
ACE
小白
append
杯影含珊
为啥要删掉可移动的，后面又找到它跟keymap连在一起又删掉
小白
可移动的应该重新加入
是的
韦林
可移动的，是不是分两种，一种是要删掉的，在创建，一直是可以直接复用的?
只有一种
小白
我理解的是 可移动的应该都是要删除的。因为位置变了
是的
韦林
小于lastPlacedIndex 的移动节点是应该要被删除的。重新创建的
是被 删除，然后重新插入，不需要创建新的真实DOM节点
奈斯啊小刘超奈斯
怎么能做到298行呀,什么情况能走到
花儿要打败熊猫当国宝
什么情况下有真实的DOM？为的理解都是插入操作 哈哈
奈斯啊小刘超奈斯
这两个判断真实dom不知道什么时候能走到
花儿要打败熊猫当国宝
我的理解都是插入 哈哈


新的生命周期 组件中的props 都会映射到state中吗 使用getDerivedStateFromProps

为啥要this.constructor. 直接this 不行么。哈哈。。。


韦林
contextType 的值不是数组把，只能满足一个context 的场景把
不是数组

Context是可以嵌套的
<Provider value={{color:'red'}}>
    <Provider value={{fontSize:'16px'}}>

    </Provider>
</Provider>
<Consumer1>
{
    (val1)=>(
        <Consumer2>
        {
            (val2)=>{

            }
        }
        </Consumer2>
    )
}
</Consumer1>
奈斯啊小刘超奈斯
张老师,这个结束,休息一下
16:32
韦林撤回了一条消息

老师 context赋值的那块在详细一点说一下吧 哈哈
contextType 如果支持数组是不是比Consumer 嵌套的写法更好，针对多个Context的场景


和componentWillReceiveProps 产生效果是一样的吗只是一个是static吗  执行后 return {新的state}吗
王建星
1
韦林
getSnapshotBeforeUpdate 的使用场景，在 老生命周期用哪个生命周期函数解决



16:57
韦林撤回了一条消息
韦林
以前类的组件的高阶组件，使用场景很多。
韦林
现在用函数+ hooks 逻辑封装使用hooks了高阶组件用的较少了
李
好的
17:04
小白
是 函数组件基本不用高阶了
花儿要打败熊猫当国宝
1
17:12
李
反向继承主要用来做什么
覆盖老的组件


17:18
刘源
插槽？
奈斯啊小刘超奈斯
函数组件可以使用renderProps么?

老师，刚刚那个变红变绿的动态图用什么工具做的啊
录屏

花儿要打败熊猫当国宝
1.1-1.14 没讲啊 哈哈




老师有个问题
花儿要打败熊猫当国宝
你说不就完了么？
emmmmm
今天调试周日的源码的时候有个地方没明白
花儿要打败熊猫当国宝
直接说那里有问题， 利利索索的
花儿要打败熊猫当国宝
哈哈
emmmmm
字有点多，哈哈
花儿要打败熊猫当国宝
截图
emmmmm
就是周日讲的反向继承那里，15行，运行进去的时候this为啥指向的是Newcomponet
花儿要打败熊猫当国宝
图
emmmmm
那个render通过super调用的
emmmmm
 
emmmmm
就这个
花儿要打败熊猫当国宝
就是Newcomponet
emmmmm
国宝知道为啥吗
花儿要打败熊猫当国宝
这个Newcompone类调用的，谁调用this就是谁啊
emmmmm
不是super.render()调用的吗
花儿要打败熊猫当国宝
我叫 花儿  谢谢
emmmmm
不好意思花儿
花儿要打败熊猫当国宝
super 就是子类调用父类的构造方法，this指向子类啊
emmmmm
原来是这样吗
emmmmm
我之前理解以为他是父类



props是babel放进去的,函数组件为什么要给props参数

1.属性是用户通过jsx指定的
2.babel在编译的时候会进行jsx转换
React.createElement(FunctionCounter,{count:0});
3.在浏览器执行此方法React.createElement,返回虚拟DOM
{type:FunctionCounter,props:{count:0}}
4.返回的虚拟DOM再传递给react-dom
const { type, props } = vdom;//FunctionComponent {count:0}
const renderVdom = type(props);

在原始代码中，如果组类件或者说函数组件的的父组件更新的时候，一定会重新渲染。跟属性变还是不变没有关系


我怎么确定这个type是什么?从哪里赋值的?


老师 那儿 为啥type.type.  第一个type为啥不先调用一下在.type？
type是一个函数，需要动态执行
张仁阳


杨澜
失去焦点
奈斯啊小刘超奈斯
callback 这个在组件中多用缓存也是有好处的,为什么说不建议多用呢
杨澜
oninput在输入框中输入时就会触发  onchange输入框失焦后触发，面试题背过



22:28
杨澜
这里不加加吗？
需要的
韦林
useLayoutEffect 是不是不用setTimeout 了
useEffect 开启了一个宏任务，因为它要等到DOM渲染到页面之后，也就是页面绘制之后执行
useLayoutEffect是相当于一个微任务，会在页面绘制前执行
奈斯啊小刘超奈斯
也要用吧,要不拿不到dom的
韦林
没传每次都执行
hooks 刷新dom 在说下怎么实现呗
韦林
scheduleUpdate

组件动态销毁再加载，hookIndex会乱吗

其实在源码里，每个函数组件都有自己的独立的hookIndex 和hookStates

花儿要打败熊猫当国宝
性能差， 不知道react的优势在哪里 哈哈
韦林
hooks 别写在if 语句中
if while for 都不行因为可能会把索引乱掉
韦林
保证索引每次都是正确的就行

第二个参数为什么设计成函数呢,为啥不是对象呢
1.可以传参
2.可以动态执行，获取最新的外界参数
3.可以实现闭包的变量



老师试试在ForwardChild转化之后
在child组件中里面使用useState更新会生效吗，


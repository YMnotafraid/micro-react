function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
} //createElement函数在reat中作用是生成vnode

//simple code than performant code
//当子节点为文本时，当作一个TEXT_ELEMENT标签去处理
function createTextElement(text) {
  return {
    type: "text",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
export default createElement;

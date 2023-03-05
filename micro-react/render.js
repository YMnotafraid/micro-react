function createDom(fiber) {
  //递归结束条件
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  //添加节点属性
  Object.keys(fiber.props)
    .filter((key) => key !== "children")
    .forEach((name) => (dom[name] = fiber.props[name]));
  return dom;
}

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

let nextUnitOfWork = null;
//核心就是调用了window.requestIdleCallback(callback),浏览器会在空闲的时候调用callback
//deadline为当前任务队列执行的时间
function workloop(deadline) {
  //不用停止
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    //执行当前js任务并返回下一个任务
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    //如果超时了就停止
    shouldYield = deadline.timeRemaining() < 1;
  }
  //继续询问浏览器
  requestIdleCallback(workloop);
}
//第一次询问浏览器
requestIdleCallback(workloop);
//执行任务队列函数
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
export default render;

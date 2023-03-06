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
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const parentDom = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    parentDom.removeChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
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
  if (!nextUnitOfWork && wipRoot) {
    commitRoot(); //渲染dom的入口
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
  //render生成vnode 和 commit渲染真实dom 两个阶段需要分开
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  const elements = fiber.props.children;
  //原来是很僵硬的把孩子节点直接生成newFiber，现在我们弹性处理孩子
  reconcileChildren(fiber, elements);

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

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;
  while (index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber = null;
    const sameType = oldFiber && element && element.type === oldFiber.type;
    if (sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber.dom, //关键，说明当前的dom不用修改可以直接复用，这样效率高
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

export default render;

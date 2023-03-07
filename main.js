import { createElement, render, useState } from "./micro-react";

function Counter() {
  const [state, setState] = useState(1);
  return createElement("h1", { onclick: () => setState((c) => c + 1) }, state);
}

const element = createElement(Counter);
const root = document.querySelector("#root");

render(element, root);

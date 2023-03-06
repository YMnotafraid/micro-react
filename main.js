import { createElement, render } from "./micro-react";

const App = (props) => {
  return createElement("h1", null, "Hi ", props.name);
};

const element = createElement(App, { name: "ym" });
const root = document.querySelector("#root");

render(element, root);

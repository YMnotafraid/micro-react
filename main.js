import { createElement } from "./micro-react";

const element = createElement(
  "div",
  { id: "title" },
  "hello world",
  createElement("h1")
);
console.log(element);

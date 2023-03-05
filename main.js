import { createElement, render } from "./micro-react";

const element = createElement(
  "h1",
  { id: "title", style: "background: orange" },
  "hello world",
  createElement(
    "a",
    { style: "color:white", href: "https://bilibili.com" },
    "bilibili"
  )
);
const root = document.querySelector("#root");
render(element, root);

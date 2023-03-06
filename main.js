import { createElement, render } from "./micro-react";

const element = createElement(
  "h1",
  { id: "title", style: "background: orange" },
  "hulu",
  createElement(
    "a",
    { style: "color:white", href: "https://bilibili.com" },
    "bilibili"
  ),
  createElement("span", { style: "color:red" }, "youtube")
);
const root = document.querySelector("#root");
render(element, root);

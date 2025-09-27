import "./modules/route.js";

export const config = {
  pageInit: "/home",
};

export const routes = [
  { path: /^\/home$/, page: "/pages/home" },
  { path: /^\/about$/, page: "/pages/about" },
];

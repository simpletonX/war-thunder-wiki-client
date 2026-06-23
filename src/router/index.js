import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/rp-calculator",
  },
  {
    path: "/rp-calculator",
    name: "rp-calculator",
    component: () => import("@/views/rp-calculator.vue"),
  },
  {
    path: "/doc",
    name: "doc",
    component: () => import("@/views/doc/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

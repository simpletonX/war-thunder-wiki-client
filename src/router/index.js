import { createRouter, createWebHashHistory } from "vue-router";

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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

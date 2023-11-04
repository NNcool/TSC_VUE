import Vue from "vue";
import VueRouter from "vue-router";
import Router from "vue-router";
import TimeScale from "../views/TimeScale.vue";
import lithology from "../views/lithology.vue";
import relative from "../views/relative.vue";

Vue.use(VueRouter);

export default new Router({
  routes: [
    {
      path: "/",
      name: "timesvale",
      component: TimeScale
    },
    {
      path: "/lithology",
      name: "lithology",
      component: lithology
    },
    {
      path: "/relative",
      name: "relative",
      component: relative
    }
  ]
});

/**
 * 用户角色菜单、权限及路由
 */
import { getUserMenuTree } from "@/api/system/menu";
import { traverseTree } from "@/utils/TreeUtils";
import { defineAsyncComponent } from "vue";

const state = () => ({
  routes: [],
  menuTree: [],
  //获取view下system所有的vue文件 https://cn.vitejs.dev/guide/features#glob-import
  systemModules: import.meta.glob("@/views/system/**/**/*.vue", {
    eager: true,
    import: "default",
  }),
});

// mutations
const mutations = {
  routesSet(state, routes) {
    state.routes = routes;
  },
  menuTreeSet(state, menus) {
    state.menuTree = menus;
  },
};

// getters
const getters = {};

// actions
const actions = {
  routerGenerate({ state, commit }) {
    return new Promise((resolve, reject) => {
      //获取用户角色菜单树
      getUserMenuTree()
        .then((res) => {
          let menuTree = res.data;
          commit("menuTreeSet", menuTree);
          console.log("menuTreeSet", menuTree);
          let addRoutes = [];
          traverseTree(menuTree, (node) => {
            //遍历树生成配置，把动态路由默认加载到home下
            if (node.menuType === "m" && node.path !== "/index") {
              //生成路由列表
              let route = {
                path: node.path,
                name: node.menuName,
                component: state.systemModules[
                      `/src/views${node.component}/index.vue`
                    ],
              };
              addRoutes.push(route);
            }
          });
          commit("routesSet", addRoutes);
          resolve(addRoutes);
        })
        .catch(() => {
          reject();
        });
    });
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

import Vue from "vue";
import Vuex from "vuex";
import progress from "nprogress";
import req from "reqjs";
import {
  loadBabel,
  loadPug,
  loadMarkdown,
  loadReason,
  loadCoffeeScript2,
  loadCssnext,
  loadLess,
  loadSass,
  loadRust,
  loadTypescript,
  loadStylus,
  loadSvelte,
} from "@/utils/transformer";
import api from "@/utils/github-api";
import Event from "@/utils/event";
import { getUrlParams, createUrlBase, createUrlParams } from "../utils";

Vue.use(Vuex);

const pans = ["html", "css", "js", "console", "output"];
const sortPans = (ps) => {
  return ps.sort((a, b) => {
    return pans.indexOf(a) > pans.indexOf(b);
  });
};

const emptyPans = () => ({
  js: {
    code: "",
    transformer: "js",
  },
  css: {
    code: "",
    transformer: "css",
  },
  html: {
    code: "",
    transformer: "html",
  },
});

const getFileNameByLang = {
  html: "index.html",
  js: "script.js",
  css: "style.css",
};

// Load entries of all boilerplates
export const boilerplates = {
  empty: async () => ({
    ...emptyPans(),
    showPans: ["js", "output"],
  }),
};

function importAll(r) {
  r.keys().forEach((key) => {
    const name = /^\.\/(.+)\//.exec(key)[1];
    boilerplates[name] = r(key).default;
  });
}

importAll(require.context("@/boilerplates", true, /index.js$/));

const urlParams = () =>
  Object.assign(
    {
      pans: "js,output",
      layout: "column",
      headless: "false",
    },
    getUrlParams()
  );

const params = urlParams();
const visiblePans = params.pans.split(",");
const activePan = visiblePans[0];

const store = new Vuex.Store({
  state: {
    ...emptyPans(),
    logs: [],
    urlParams: params,
    visiblePans,
    activePan,
    autoRun: false,
    githubToken: localStorage.getItem("codepan:gh-token") || "",
    gistMeta: {},
    userMeta: JSON.parse(localStorage.getItem("codepan:user-meta")) || {},
    editorStatus: "saved",
    iframeStatus: null,
    transforming: false,
  },
  mutations: {
    REFRESH_FROM_URL(state) {
      state.urlParams = urlParams();
      state.visiblePans = state.urlParams.pans.split(",");
      state.activePan = state.visiblePans[0];
    },
    UPDATE_CODE(state, { type, code }) {
      state[type].code = typeof code === "string" ? code : code.default;
    },
    UPDATE_TRANSFORMER(state, { type, transformer }) {
      state[type].transformer = transformer;
    },
    ADD_LOG(state, log) {
      state.logs.push(log);
    },
    CLEAR_LOGS(state) {
      state.logs = [];
    },
    TOGGLE_PAN(state, pan) {
      const pans = state.visiblePans;
      const idx = pans.indexOf(pan);
      if (idx === -1) {
        pans.push(pan);
      } else {
        pans.splice(idx, 1);
      }

      state.visiblePans = sortPans(pans);

      history.replaceState(
        null,
        document.title,
        createUrlBase() + "?" + createUrlParams(urlParams, state)
      );
    },
    SHOW_PANS(state, pans) {
      state.visiblePans = sortPans(pans);
    },
    ACTIVE_PAN(state, pan) {
      state.activePan = pan;
    },
    SET_GIST_META(state, meta) {
      state.gistMeta = meta;
    },
    SET_USER_META(state, meta) {
      state.userMeta = meta;
    },
    SET_GITHUB_TOKEN(state, token) {
      state.githubToken = token;
    },
    SET_EDITOR_STATUS(state, status) {
      state.editorStatus = status;
    },
    SET_AUTO_RUN(state, status) {
      state.autoRun = status;
    },
    SET_IFRAME_STATUS(state, status) {
      state.iframeStatus = status;
    },
    SET_TRANSFORM(state, status) {
      state.transforming = status;
    },
  },
  actions: {
    updateCode({ commit }, payload) {
      commit("UPDATE_CODE", payload);
    },
    updateError({ commit }, payload) {
      commit("UPDATE_ERROR", payload);
    },
    addLog({ commit }, payload) {
      commit("ADD_LOG", payload);
    },
    clearLogs({ commit }) {
      commit("CLEAR_LOGS");
    },
    setActivePan({ commit }, pan) {
      commit("ACTIVE_PAN", pan);
    },
    togglePan({ commit }, payload) {
      commit("TOGGLE_PAN", payload);
    },
    showPans({ commit }, pans) {
      commit("SHOW_PANS", pans);
    },
    async updateTransformer({ commit }, { type, transformer }) {
      if (
        transformer === "babel" ||
        transformer === "jsx" || // @deprecated, use "babel"
        transformer === "vue-jsx"
      ) {
        await loadBabel();
      } else if (transformer === "pug") {
        await loadPug();
      } else if (transformer === "markdown") {
        await loadMarkdown();
      } else if (transformer === "svelte") {
        await loadSvelte();
      } else if (transformer === "reason") {
        await loadReason();
      } else if (transformer === "coffeescript-2") {
        await loadCoffeeScript2();
      } else if (transformer === "cssnext") {
        await loadCssnext();
      } else if (transformer === "less") {
        await loadLess();
      } else if (transformer === "sass" || transformer === "scss") {
        await loadSass();
      } else if (transformer === "rust") {
        await loadRust();
      } else if (transformer === "typescript") {
        await loadTypescript();
      } else if (transformer === "stylus") {
        await loadStylus();
      }

      commit("UPDATE_TRANSFORMER", { type, transformer });
    },
    transform({ commit }, status) {
      commit("SET_TRANSFORM", status);
    },
    // todo: simplify this action
    async setBoilerplate({ state, dispatch }, boilerplateOrName) {
      if (!boilerplateOrName) return;

      const boilerplate =
        typeof boilerplateOrName === "string"
          ? await boilerplates[boilerplateOrName]()
          : boilerplateOrName;

      progress.start();

      const pans = `?pans=${boilerplate.showPans.join(",")}`;
      const hash = `#/boilerplate/${boilerplateOrName}${pans}`;
      if (location.hash !== hash) {
        location.hash = hash;
      }

      const ps = [];

      for (const type of ["html", "js", "css"]) {
        const base = state[type];
        const { code, transformer } = {
          code: "",
          transformer: base.transformer,
          ...boilerplate[type],
        };
        ps.push(
          dispatch("updateCode", { type, code }),
          dispatch("updateTransformer", {
            type,
            transformer,
          })
        );
      }

      const { activePan = boilerplate.showPans[0] || "js" } = boilerplate;
      ps.push(dispatch("setActivePan", activePan));
      ps.push(dispatch("clearLogs"));

      await Promise.all(ps);

      setTimeout(() => {
        dispatch("editorSaved");
        Event.$emit("focus-editor", activePan);
      });

      progress.done();
    },
    async setGist({ commit, dispatch, state }, id) {
      if (!id) return;

      const data = await api(`gists/${id}`, state.githubToken, progress.done);
      const { files } = data;

      if (!files) return;

      const main = {
        html: {},
        css: {},
        js: {},
        ...(files["index.js"] ? req(files["index.js"].content) : {}),
        ...(files["codepan.js"] ? req(files["codepan.js"].content) : {}),
        ...(files["codepan.json"]
          ? JSON.parse(files["codepan.json"].content)
          : {}),
      };
      for (const type of ["html", "js", "css"]) {
        if (!main[type].code) {
          const filename = main[type].filename || getFileNameByLang[type];
          if (files[filename]) {
            main[type].code = files[filename].content;
          }
        }
      }

      await dispatch("setBoilerplate", main);

      delete data.files;
      commit("SET_GIST_META", data);
    },
    async setGitHubToken({ commit }, token) {
      commit("SET_GITHUB_TOKEN", token);
      let userMeta = {};
      if (token) {
        localStorage.setItem("codepan:gh-token", token);
        userMeta = await api("user", token);
      } else {
        localStorage.removeItem("codepan:gh-token");
      }

      commit("SET_USER_META", userMeta);
      if (Object.keys(userMeta).length > 0) {
        localStorage.setItem("codepan:user-meta", JSON.stringify(userMeta));
      } else {
        localStorage.removeItem("codepan:user-meta");
      }
    },
    editorSaved({ commit }) {
      commit("SET_EDITOR_STATUS", "saved");
    },
    editorChanged({ commit }) {
      commit("SET_EDITOR_STATUS", "changed");
    },
    editorSaving({ commit }) {
      commit("SET_EDITOR_STATUS", "saving");
    },
    editorSavingError({ commit }) {
      commit("SET_EDITOR_STATUS", "error");
    },
    setAutoRun({ commit }, status) {
      commit("SET_AUTO_RUN", status);
    },
    setIframeStatus({ commit }, status) {
      commit("SET_IFRAME_STATUS", status);
    },
    refreshFromUrl({ commit }) {
      commit("REFRESH_FROM_URL");
    },
  },
  getters: {
    isLoggedIn({ githubToken }) {
      return Boolean(githubToken);
    },
    canUpdateGist({ gistMeta, userMeta }) {
      return (
        gistMeta &&
        userMeta &&
        gistMeta.owner &&
        gistMeta.owner.id === userMeta.id
      );
    },
  },
});

export default store;

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style src="nprogress/nprogress.css"></style>
<style src="vue-slim-modal/themes/default.css"></style>
<style src="v-tippy/dist/tippy.css"></style>
<style src="notie/dist/notie.min.css"></style>

<style lang="stylus">
html, body, #app, .page {
  height: 100%;
}

.pan > *:not(.pan-head) {
  overflow-y: auto;
  height: 100% !important;
  background: transparent !important;
}

body {
  background-color: #f9f9f9;
  margin: 0;
  font-family: Arial;
}

body, .pan-head, .pan-head * {
  font-size: 10px;
}

* {
  box-sizing: border-box;
}

pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}

pre > code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  background: transparent;
  border: 0;
}

.el-dropdown-link {
  cursor: pointer;
  user-select: none;
}

#nprogress {
  z-index: 9999;
  position: relative;
}

.el-dropdown-menu {
  .fake-anchor {
    color: #333;
    text-decoration: none;
    align-items: center;
    display: flex;
    width: 100%;

    svg {
      margin-right: 10px;
      width: 16px;
      height: @width;
      color: #666;
    }
  }
}

.el-badge {
  z-index: 1000;
}

.notie-container {
  z-index: 9999;
}

#HW_frame_cont.HW_visible {
  z-index: 9999;
}

.update-notifier {
  .el-notification__content {
    text-align: left;
  }
}

.notie-overlay {
  z-index: 9900;
}

header, header .el-button, header .el-checkbox {
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0;
  height: 100%;
  margin: 0;
  border-radius: 0;
}

header > *, header .el-dropdown, header .checkbox__inner {
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
}

pre {
  word-break: break-all !important;
}

.pans[class*=row] {
  #cf, .codefund-container {
    display: none !important;
  }
}

.codefund-container, .codefund-placeholder, #cf > span {
  display: block !important;
  position: static !important;
}

.codefund-placeholder, #cf > span {
  line-height: 1.25em;
  box-sizing: border-box;
}

.codefund-placeholder {
  padding: 12px 0 13px 0 !important;
  text-align: center;
  border-top: 1px solid #bfbfbf;
  background: #eeeeee;
}

header {
  .el-button, .el-checkbox {
    border: 0 !important;
    border-radius: 0 !important;
    padding: 0;
    font-variant: small-caps;
    color: #409EFF !important;
    background: none !important;

    i, .el-checkbox__inner {
      margin: 0 10px 0 0 !important;
    }
  }

  .el-button > *, .el-checkbox span {
    margin: 0;
    padding: 0;
    display: block;
  }

  .el-checkbox:hover, .el-button:hover {
    color: black !important;
  }

  .el-checkbox:focus, .el-button:focus, .el-checkbox:active, .el-button:active {
    background: lightblue !important;
    color: white !important;
  }

  span.el-checkbox__inner {
    margin: 0 !important;
  }

  span.el-checkbox__inner, i[class^='el-icon'] {
    transform: scale(1.5);
  }
}

.pan-head {
  padding: 12px;

  .el-button {
    right: 10px;
    line-height: 14px;
    padding: 5px;
    position: absolute;

    &>* {
      margin: 0 !important;
      display: inline-block;
    }
  }

  .el-dropdown {
    display: block;

    i {
      margin: 0 !important;
    }
  }
}

.pan-head svg {
  top: 7px;
  right: 7px;
  cursor: pointer;
  position: absolute;
  transform: scale(0.5);
}

.CodeMirror-wrap {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.CodeMirror-gutters {
  border: 0 !important;
  background: inherit !important;
}

.CodeMirror-lines {
  padding: 0 !important;
}

.console-pan .pan-head button {
  vertical-align: top;
  margin-top: -2px;
  float: right;
}

.compiled-code-dialog {
  width: calc(100% - 20px) !important;
  max-width: 800px !important;
}

.page {
  display: flex;
  flex-direction: column;
}

span:empty {
  display: none;
}

.el-dropdown .el-icon--right {
  position: absolute;
  top: 0;
}

.el-message-box {
  width: calc(100% - 20px) !important;
  max-width: 420px;
}

#output-iframe {
  display: flex;
  flex: 1;
  justify-content: stretch;

  iframe {
    border: 0 !important;
    height: 100%;
    position: absolute;
  }
}

.pan-head {
  position: relative;
}

.pans.headless .pan-head {
  display: none;
}

.pans[class*=column] {
  .pan {
    width: 100% !important;

    &:not(:first-child) {
      border-top: 1px dashed lightblue;
    }
  }
}

.pan {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: static;
  resize: both;
  background-color: #f9f9f9;

  &:last-child {
    flex-grow: 1;
  }

  &.active-pan {
    background-color: white;
  }
}

.pans:not(.headless) {
  height: calc(100% - 64px);
}

.pans.headless {
  height: 100%;
}

.pans[class*=row] {
  .pan {
    height: 100% !important;

    &:not(:first-child) {
      border-left: 1px dashed lightblue;
    }
  }
}

header > * {
  height: 100%;
}

@media (orientation: landscape) {
  header {
    overflow-y: auto;
    flex: 0 0 auto;
    border-bottom: 0 !important;
    border-right: 1px solid silver;
    flex-direction: column !important;

    .el-button, .el-checkbox {
      padding: 10px;
      flex-direction: column !important;

      i, .el-checkbox__inner {
        margin: 0 0 10px 0 !important;
      }
    }
  }

  header > * {
    height: auto !important;
  }

  .el-popper {
    max-height: 100%;
  }

  .el-dropdown-menu.el-popper {
    overflow-y: auto;
  }

  .page {
    flex-direction: row;
  }

  .el-button > *, .el-checkbox > span, i {
    margin: 10px 0 !important;
  }

  .pans:not(.headless) {
    height: 100%;
    width: calc(100% - 64px);
  }

  .pans.headless {
    height: 100%;
    width: 100%;
  }
}

@media (max-width: 800px), (max-height: 600px) {
  #cf {
    display: none;
  }

  .pan-head {
    padding: 6px;
  }

  .compiled-code-dialog {
    max-height: calc(100% - 20px);
    top: 10px !important;
  }

  header {
    min-width: 64px;

    .el-button, .el-checkbox {
      i, .el-checkbox__inner {
        margin: 0 !important;
      }

      span:not(.el-checkbox__input):not(.el-checkbox__inner) {
        display: none !important;
      }
    }
  }

  *:not(input):not(textarea) {
    -webkit-user-select: none; /* disable selection/Copy of UIWebView */
    -webkit-touch-callout: none; /* disable the IOS popup when long-press on a link */
  }
}
</style>

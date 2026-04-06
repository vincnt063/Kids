<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 儿童编程学习网站主应用
</script>

<style>
:root {
  --app-bg: #f3f6fb;
  --app-card: rgba(255, 255, 255, 0.94);
  --app-line: rgba(35, 50, 76, 0.08);
  --app-text: #23324c;
  --app-text-soft: #6f7d94;
  --app-primary: #4a7fc8;
  --app-warm: #fff4de;
  --app-shadow: 0 12px 28px rgba(35, 50, 76, 0.06);
  color: var(--app-text);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  font-family: "Trebuchet MS", "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: var(--app-bg);
  color: var(--app-text);
}

body {
  line-height: 1.5;
}

#app {
  width: 100%;
  min-height: 100vh;
}

a {
  color: var(--app-primary);
  text-decoration: none;
}

.el-button,
.el-input__wrapper,
.el-textarea__wrapper,
.el-select__wrapper,
.el-card,
.el-dialog,
.el-menu {
  border-radius: 14px;
}

.el-card {
  border-color: var(--app-line);
  box-shadow: var(--app-shadow);
}

.el-dialog {
  overflow: hidden;
}

.el-table {
  --el-table-border-color: var(--app-line);
  --el-table-header-bg-color: #f7f9fc;
  --el-table-row-hover-bg-color: #f7faff;
}
</style>

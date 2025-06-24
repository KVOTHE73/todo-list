<template>
  <main class="app-container">
    <h1 class="app-title">{{ t("title") }}</h1>
    <TodoList />
  </main>
</template>

<script setup lang="ts">
import TodoList from "./components/TodoList.vue";
import { useI18n } from "vue-i18n";

// 🌐 i18n
const { t } = useI18n();
</script>

<style scoped>
.app-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
.app-title {
  font-size: 2.75rem;
  font-weight: bold;
  margin-bottom: 2rem;
  font-family: "Georgia", serif;
  color: var(--accent, #f39c12);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}
</style>

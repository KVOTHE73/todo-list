import { createApp } from "vue";
import App from "./App.vue";
import { i18nPlugin } from "./i18n/messages";

createApp(App).use(i18nPlugin).mount("#app");

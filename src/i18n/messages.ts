import type { Plugin } from "vue";
import { createI18n } from "vue-i18n";

const messages = {
  en: {
    title: "To-Do List",
    placeholders: { newTask: "New task…" },
    buttons: {
      add: "Add",
      clearCompleted: "Clear completed",
      toggleTheme: "Toggle theme",
      edit: "Edit",
      remove: "Remove",
      cancel: "Cancel",
      save: "Save",
    },
    lang: {
      es: "Spanish",
      en: "English",
    },
    reorder: "Reorder",
    "fecha de creacion": "Creation date",
    "fecha de edicion": "Edit date",
    filters: { all: "All", active: "Active", completed: "Completed" },
  },
  es: {
    title: "Lista de Tareas",
    placeholders: { newTask: "Nueva tarea…" },
    buttons: {
      add: "Añadir",
      clearCompleted: "Borrar completadas",
      toggleTheme: "Cambiar tema",
      edit: "Editar",
      remove: "Eliminar",
      cancel: "Cancelar",
      save: "Guardar",
    },
    lang: {
      es: "Español",
      en: "Inglés",
    },
    reorder: "Reordenar",
    "fecha de creacion": "Fecha de creación",
    "fecha de edicion": "Fecha de edición",
    filters: { all: "Todas", active: "Activas", completed: "Completadas" },
  },
};

// ✅ Creamos instancia con Composition API habilitada
const i18n = createI18n({
  legacy: false,
  locale: navigator.language.startsWith("es") ? "es" : "en",
  fallbackLocale: "en",
  messages,
});

export const i18nPlugin = i18n as unknown as Plugin;

// 🟩 Exportamos la instancia (para app.use())
export default i18n;

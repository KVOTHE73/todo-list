import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/vue";
import TodoList from "../components/TodoList.vue";
import { createI18n } from "vue-i18n";

import { vi } from "vitest";

// Mock de assets para que no fallen los imports de imágenes
vi.mock("../assets/flags/es.png", () => ({ default: "" }));
vi.mock("../assets/flags/en.png", () => ({ default: "" }));

// Mensajes para i18n en tests
function defaultMessages() {
  return {
    en: {
      placeholders: { newTask: "New task..." },
      buttons: {
        add: "Add",
        clearCompleted: "Clear completed",
        toggleTheme: "Toggle theme",
        edit: "Edit",
        remove: "Remove",
        save: "Save",
        cancel: "Cancel",
      },
      filters: { all: "All", active: "Active", completed: "Completed" },
      lang: { es: "Español", en: "English" },
      reorder: "Reorder",
    },
    es: {
      placeholders: { newTask: "Nueva tarea..." },
      buttons: {
        add: "Añadir",
        clearCompleted: "Borrar completadas",
        toggleTheme: "Cambiar tema",
        edit: "Editar",
        remove: "Eliminar",
        save: "Guardar",
        cancel: "Cancelar",
      },
      filters: { all: "Todas", active: "Activas", completed: "Completadas" },
      lang: { es: "Español", en: "Inglés" },
      reorder: "Reordenar",
    },
  };
}

function renderComponent() {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: defaultMessages(),
  });
  return render(TodoList, { global: { plugins: [i18n] } });
}

describe("TodoList.vue", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a new task when clicking add", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText("New task...");
    await fireEvent.update(input, "Test Task");
    await fireEvent.click(screen.getByText("➕"));
    expect(screen.getByText("Test Task")).toBeTruthy();
  });

  it("filters active tasks correctly", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText("New task...");
    await fireEvent.update(input, "Task 1");
    await fireEvent.click(screen.getByText("➕"));
    await fireEvent.update(input, "Task 2");
    await fireEvent.click(screen.getByText("➕"));
    // marcar la primera como completada
    const checkboxes = screen.getAllByRole("checkbox");
    await fireEvent.click(checkboxes[0]);
    // aplica filtro "Active"
    await fireEvent.click(screen.getByText("Active"));
    expect(screen.queryByText("Task 1")).toBeNull();
    expect(screen.getByText("Task 2")).toBeTruthy();
  });
});

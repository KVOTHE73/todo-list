import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/vue";
import TodoList from "../components/TodoList.vue";
import { createI18n } from "vue-i18n";

// Setup i18n for tests
defaultMessages();
function defaultMessages() {
  return {
    en: {
      placeholders: { newTask: "New task..." },
      buttons: {
        add: "Add",
        clearCompleted: "Clear completed",
        toggleTheme: "Toggle theme",
      },
      filters: { all: "All", active: "Active", completed: "Completed" },
    },
    es: {
      placeholders: { newTask: "Nueva tarea..." },
      buttons: {
        add: "Añadir",
        clearCompleted: "Borrar completadas",
        toggleTheme: "Cambiar tema",
      },
      filters: { all: "Todas", active: "Activas", completed: "Completadas" },
    },
  };
}

function renderComponent() {
  const i18n = createI18n({
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
    // mark first task completed
    const checkbox = screen.getAllByRole("checkbox")[0];
    await fireEvent.click(checkbox);
    // switch to Active filter
    await fireEvent.click(screen.getByText("Active"));
    expect(screen.queryByText("Task 1")).toBeNull();
    expect(screen.getByText("Task 2")).toBeTruthy();
  });
});

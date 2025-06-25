import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/vue";
import TodoList from "../components/TodoList.vue";
import { createI18n } from "vue-i18n";

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
        remove: "Remove",
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        clearCompleted: "Clear completed",
        toggleTheme: "Toggle theme",
      },
      filters: { all: "All", active: "Active", completed: "Completed" },
      lang: { es: "Español", en: "English" },
      reorder: "Reorder",
    },
    es: {
      placeholders: { newTask: "Nueva tarea..." },
      buttons: {
        add: "Añadir",
        remove: "Eliminar",
        edit: "Editar",
        save: "Guardar",
        cancel: "Cancelar",
        clearCompleted: "Borrar completadas",
        toggleTheme: "Cambiar tema",
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
    await fireEvent.click(screen.getByTitle("Add"));
    expect(screen.getByText("Test Task")).toBeTruthy();
  });

  it("filters active tasks correctly", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText("New task...");
    await fireEvent.update(input, "Task 1");
    await fireEvent.click(screen.getByTitle("Add"));
    await fireEvent.update(input, "Task 2");
    await fireEvent.click(screen.getByTitle("Add"));

    const checkboxes = screen.getAllByRole("checkbox");
    await fireEvent.click(checkboxes[0]);
    await fireEvent.click(screen.getByText("Active"));
    expect(screen.queryByText("Task 1")).toBeNull();
    expect(screen.getByText("Task 2")).toBeTruthy();
  });

  it("edits a task when clicking edit and save", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText("New task...");
    await fireEvent.update(input, "Original");
    await fireEvent.click(screen.getByTitle("Add"));

    await fireEvent.click(screen.getByTitle("Edit"));
    const editInput = screen.getByDisplayValue("Original");
    await fireEvent.update(editInput, "Edited");
    await fireEvent.click(screen.getByTitle("Save"));

    expect(screen.getByText("Edited")).toBeTruthy();
    expect(screen.queryByText("Original")).toBeNull();
  });

  it("cancels edit when clicking cancel", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText("New task...");
    await fireEvent.update(input, "ToCancel");
    await fireEvent.click(screen.getByTitle("Add"));

    await fireEvent.click(screen.getByTitle("Edit"));
    const editInput = screen.getByDisplayValue("ToCancel");
    await fireEvent.update(editInput, "Changed");
    await fireEvent.click(screen.getByTitle("Cancel"));

    expect(screen.getByText("ToCancel")).toBeTruthy();
    expect(screen.queryByText("Changed")).toBeNull();
  });

  it("removes a task when clicking remove", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText("New task...");
    await fireEvent.update(input, "ToRemove");
    await fireEvent.click(screen.getByTitle("Add"));

    await fireEvent.click(screen.getByTitle("Remove"));
    expect(screen.queryByText("ToRemove")).toBeNull();
  });

  it("clears completed tasks when clicking clear completed", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText("New task...");
    await fireEvent.update(input, "A");
    await fireEvent.click(screen.getByTitle("Add"));
    await fireEvent.update(input, "B");
    await fireEvent.click(screen.getByTitle("Add"));

    const checkboxes = screen.getAllByRole("checkbox");
    await fireEvent.click(checkboxes[0]);
    await fireEvent.click(screen.getByText("Clear completed"));

    expect(screen.queryByText("A")).toBeNull();
    expect(screen.getByText("B")).toBeTruthy();
  });

  it("toggles theme when clicking toggle theme", async () => {
    renderComponent();
    const toggleButton = screen.getByTitle("Toggle theme");

    // Por defecto el tema es oscuro
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    // Al hacer click, cambie a claro
    await fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    // Y al volver a click, regrese a oscuro
    await fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("changes language when clicking language button", async () => {
    renderComponent();
    const langButton = screen.getByTitle("Español");
    await fireEvent.click(langButton);

    expect(screen.getByPlaceholderText("Nueva tarea...")).toBeTruthy();
    expect(screen.getByTitle("Añadir")).toBeTruthy();
  });
});

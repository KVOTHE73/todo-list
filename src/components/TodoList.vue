<template>
  <!--
  ========================================================================
  📜 TODO LIST APP
     💡 Aplicación con aspecto de bloc de notas con soporte multilenguaje,
        modo oscuro/claro, filtros, drag & drop, y almacenamiento local.
  ========================================================================
  -->
  <div class="todo-app">
    <!-- 📌 Toolbar principal -->
    <div class="toolbar">
      <input
        v-model="newTask"
        @keyup.enter="addTask"
        :placeholder="t('placeholders.newTask')"
        class="task-input"
      />
      <button
        @click="addTask"
        :title="t('buttons.add')"
        :aria-label="t('buttons.add')"
        :disabled="!newTask.trim()"
      >
        ➕
      </button>

      <!-- 🌐 Selector de idioma + tema -->
      <div class="lang-theme-switch">
        <button
          @click="toggleTheme"
          :title="t('buttons.toggleTheme')"
          class="btn-theme-switch"
        >
          {{ theme === "light" ? "🌙" : "☀️" }}
        </button>
        <button
          @click="setLang('es')"
          :aria-label="t('lang.es')"
          :title="t('lang.es')"
          :class="{ active: isLangEs }"
        >
          <img :src="flagEs" alt="Español" class="flag" />
        </button>
        <button
          @click="setLang('en')"
          :aria-label="t('lang.en')"
          :title="t('lang.en')"
          :class="{ active: isLangEn }"
        >
          <img :src="flagEn" alt="English" class="flag" />
        </button>
      </div>
    </div>

    <!-- 🔘 Filtros -->
    <div class="tabs">
      <button
        v-for="f in filters"
        :key="f"
        @click="filter = f"
        :class="{ active: filter === f }"
      >
        {{ t("filters." + f) }}
      </button>
    </div>

    <!-- ✅ Lista de tareas -->
    <ul class="task-list">
      <li
        v-for="(task, index) in filteredTasks"
        :key="task.id"
        class="task-item"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @drop="onDrop(index)"
      >
        <!-- ⠿ Drag handle al lateral -->
        <span class="drag-handle" :title="t('reorder')">⠿</span>
        <!-- Contenedor principal en columna -->
        <div class="task-main">
          <!-- ✅ Modo visual o edición -->
          <template v-if="editingId !== task.id">
            <label class="task-label">
              <input type="checkbox" v-model="task.completed" />
              <span :class="{ done: task.completed }">{{ task.text }}</span>
            </label>
          </template>

          <template v-else>
            <input
              :class="'edit-input-' + task.id"
              v-model="editingText"
              @keyup.enter="saveEdit(task)"
              @keyup.esc="cancelEdit"
              class="task-input w-full mr-2"
            />
          </template>

          <div class="task-meta">
            <!-- ⏳ Fecha de creación o edición -->
            <small class="created-at">
              <span v-if="task.editedAt">
                ✏️ {{ new Date(task.editedAt).toLocaleString() }}
              </span>
              <span v-else>
                🕓 {{ new Date(task.createdAt).toLocaleString() }}
              </span>
            </small>

            <!-- 🎯 Botones -->
            <div class="flex gap-1 items-center ml-2 action-buttons">
              <template v-if="editingId !== task.id">
                <button
                  @click="startEditing(task)"
                  class="delete"
                  :aria-label="t('buttons.edit')"
                  :title="t('buttons.edit')"
                  :disabled="task.completed"
                >
                  ✏️
                </button>
                <button
                  @click="removeTask(task.id)"
                  class="delete"
                  :aria-label="t('buttons.remove')"
                  :title="t('buttons.remove')"
                >
                  ✕
                </button>
              </template>

              <template v-else>
                <button
                  @click="saveEdit(task)"
                  class="delete"
                  :aria-label="t('buttons.save')"
                  :title="t('buttons.save')"
                  :disabled="
                    !editingText.trim() || editingText === originalText
                  "
                >
                  ✅
                </button>
                <button
                  @click="cancelEdit"
                  class="delete"
                  :aria-label="t('buttons.cancel')"
                  :title="t('buttons.cancel')"
                >
                  ❌
                </button>
              </template>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!-- 🧹 Limpiar completadas -->
    <div class="clear-section">
      <button
        @click="clearCompleted"
        :aria-label="t('buttons.clearCompleted')"
        :title="t('buttons.clearCompleted')"
      >
        {{ t("buttons.clearCompleted") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ✨ App de tareas con modo oscuro, localStorage, filtros y edición.
 * ✅ Soporta drag & drop, multilenguaje y tareas reactivas.
 */
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import flagEs from "../assets/flags/es.png";
import flagEn from "../assets/flags/en.png";

// 🌐 i18n
const { t, locale } = useI18n();
function setLang(l: string) {
  locale.value = l;
}
const isLangEs = computed(() => locale.value === "es");
const isLangEn = computed(() => locale.value === "en");

// 🎨 Tema
const theme = ref<"light" | "dark">(
  (localStorage.getItem("theme") as any) || "dark"
);
function applyTheme() {
  document.documentElement.classList.toggle("dark", theme.value === "dark");
}
function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("theme", theme.value);
  applyTheme();
}

// ✅ Modelo de tarea
interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  editedAt?: number;
}

const tasks = reactive<Task[]>([]);
const newTask = ref("");
let nextId = 1;

// 🔄 Carga de tareas desde localStorage
onMounted(() => {
  const saved = localStorage.getItem("todo-tasks");
  if (saved) {
    const parsed: Task[] = JSON.parse(saved);
    parsed.forEach((t) => tasks.push(t));
    nextId = parsed.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }
  applyTheme();
});

// 📁 Guarda tareas cuando cambian
watch(
  tasks,
  (val) => {
    localStorage.setItem("todo-tasks", JSON.stringify(val));
  },
  { deep: true }
);

/**
 * Agrega una nueva tarea a la lista
 */
function addTask() {
  const text = newTask.value.trim();
  if (!text) return;
  tasks.push({
    id: nextId++,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  });
  newTask.value = "";
  nextTick(() => {
    const input = document.querySelector(".task-input") as HTMLInputElement;
    input?.focus();
  });
}

// ✏️ Edición de tareas
const editingId = ref<number | null>(null);
const editingText = ref("");
const originalText = ref("");

function startEditing(task: Task) {
  editingId.value = task.id;
  editingText.value = task.text;
  originalText.value = task.text;
  nextTick(() => {
    const input = document.querySelector<HTMLInputElement>(
      `.edit-input-${task.id}`
    );
    input?.focus();
  });
}
function saveEdit(task: Task) {
  const trimmed = editingText.value.trim();
  if (!trimmed || trimmed === originalText.value) return;
  task.text = trimmed;
  task.editedAt = Date.now();
  editingId.value = null;
}
function cancelEdit() {
  editingText.value = "";
  originalText.value = "";
  editingId.value = null;
}

/**
 * Elimina una tarea por su ID
 */
function removeTask(id: number) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) tasks.splice(idx, 1);
}

/**
 * Limpia todas las tareas completadas
 */
function clearCompleted() {
  for (let i = tasks.length - 1; i >= 0; --i) {
    if (tasks[i].completed) tasks.splice(i, 1);
  }
}

// 🔀 Filtros de tareas
const filters = ["all", "active", "completed"] as const;
type Filter = (typeof filters)[number];
const filter = ref<Filter>("all");
const filteredTasks = computed(() => {
  if (filter.value === "active") return tasks.filter((t) => !t.completed);
  if (filter.value === "completed") return tasks.filter((t) => t.completed);
  return tasks;
});

// 🧬 Drag & Drop
let dragIndex = -1;
function onDragStart(idx: number) {
  dragIndex = idx;
  setTimeout(() => {
    document.querySelectorAll(".task-item")[idx]?.classList.add("dragging");
  });
}
function onDrop(idx: number) {
  const moved = tasks.splice(dragIndex, 1)[0];
  tasks.splice(idx, 0, moved);
  document
    .querySelectorAll(".task-item")
    .forEach((el) => el.classList.remove("dragging"));
}
</script>

<style>
/* 
===============================================================================
🎨 PALETA DE COLORES (modo claro y oscuro)
===============================================================================
*/
:root {
  --bg: #e9e9d9;
  --fg: #2c3e50;
  --paper: #fffdf5;
  --border: #ddd;
  --accent: #f39c12;
}
html.dark {
  --bg: #1e1e1e;
  --fg: #f4f4f4;
  --paper: #2b2b2b;
  --border: #444;
  --accent: #f39c12;
}

/* 
===============================================================================
📦 CONTENEDOR PRINCIPAL
===============================================================================
*/
.todo-app {
  background: var(--bg);
  color: var(--fg);
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  font-family: "Segoe UI", sans-serif;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  border: 1px solid var(--border);
  background-size: 100% 28px;
}

/* 
===============================================================================
🔧 TOOLBAR SUPERIOR (input + botones + idiomas + tema)
===============================================================================
*/
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: center;
}
.task-input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--paper);
  color: var(--fg);
}
.toolbar button {
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.toolbar button:hover {
  background: var(--accent);
  color: #fff;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 
===============================================================================
🌐 SWITCH DE IDIOMA Y TEMA
===============================================================================
*/
.lang-theme-switch {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.lang-theme-switch button {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
}
.lang-theme-switch button.active {
  box-shadow: 0 0 0 2px var(--border);
  transform: scale(1.1);
}
.lang-theme-switch button:first-child {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  font-size: 1rem;
  transition: background 0.2s;
}

/* 
===============================================================================
🌍 BANDERAS DE IDIOMA
===============================================================================
*/
.flag {
  width: 24px;
  height: 16px;
  border-radius: 2px;
  margin-top: 0.2rem;
  object-fit: cover;
  transition: transform 0.2s ease;
}

/* 
===============================================================================
🗂️ TABS DE FILTROS
===============================================================================
*/
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.2rem;
  justify-content: center;
}
.tabs button {
  background: none;
  border: none;
  color: var(--fg);
  cursor: pointer;
  padding-bottom: 0.3rem;
  border-bottom: 2px solid transparent;
  font-weight: bold;
}
.tabs button.active {
  border-color: var(--accent);
}

/* 
===============================================================================
📋 LISTADO DE TAREAS
===============================================================================
*/
.task-list {
  list-style: none;
  padding: 0;
}
.task-item {
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.8rem;
  margin-bottom: 0.6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.1s ease;
}
.task-item:active {
  transform: scale(1.01);
}
.task-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.task-item input[type="checkbox"] {
  transform: scale(1.2);
}
.task-item input[type="text"] {
  font-size: 1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.4rem;
  background: var(--paper);
  color: var(--fg);
}
.task-item .done {
  text-decoration: line-through;
  opacity: 0.6;
  text-decoration-color: red; /* 🔴 Tachado rojo */
}

/* 
===============================================================================
🕒 FECHA DE CREACIÓN / EDICIÓN
===============================================================================
*/
.created-at {
  font-size: 0.75rem;
  color: var(--fg);
  opacity: 0.6;
  margin-right: 0.5rem;
  white-space: nowrap;
}

/* 
===============================================================================
🛠️ BOTONES DE ACCIÓN
===============================================================================
*/
.delete {
  background: transparent;
  border: none;
  color: var(--fg);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0 0.4rem;
  transition: transform 0.1s ease;
}
.delete:hover {
  transform: scale(1.2);
}

/* 
===============================================================================
⠿ DRAG & DROP
===============================================================================
*/
.drag-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  cursor: grab;
  font-size: 1.2rem;
  user-select: none;
  background: transparent;
  padding: 0.3rem;
  opacity: 0.4;
}
.task-item {
  position: relative;
  padding-left: 2.5rem;
}
.drag-handle:hover {
  opacity: 1;
  transform: scale(1.1);
}
.task-item.dragging {
  opacity: 0.4;
  transform: rotate(1deg);
}
/* 
===============================================================================
🧹 SECCIÓN LIMPIAR COMPLETADAS
===============================================================================
*/
.clear-section {
  text-align: right;
  margin-top: 1.2rem;
}
.clear-section button {
  background: var(--paper);
  border: 1px solid var(--border);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--fg);
}
.clear-section button:hover {
  background: var(--accent);
  color: #fff;
}

/* 
===============================================================================
📱 RESPONSIVE FLEXIBLE
===============================================================================
*/
.task-main {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.task-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  word-break: break-word;
  flex: 1;
}
.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.3rem;
  gap: 0.5rem;
}
.action-buttons {
  display: flex;
  gap: 0.4rem;
}
</style>

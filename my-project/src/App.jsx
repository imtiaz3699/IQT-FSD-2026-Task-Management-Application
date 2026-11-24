import { useEffect, useMemo, useState } from "react";
import { Plus, Search, ClipboardList } from "lucide-react";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./AuthContext";
import Sidebar from "./components/Sidebar";
import TaskItem from "./components/TaskItem";
import TaskModal from "./components/TaskModal";
import { getTasks, createTask, updateTask, deleteTask } from "./api";
import { STATUS, STATUS_KEYS } from "./constants";
import GithubPage from "./components/GithubPage";
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [view, setView] = useState("tasks");
  const { user, ready, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const loadTasks = () =>
    getTasks()
      .then((list) => {
        setTasks(list);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    loadTasks();
  }, [ready, user?.id]);
  const counts = useMemo(() => {
    const c = { all: tasks.length };
    STATUS_KEYS.forEach((k) => {
      c[k] = tasks.filter((t) => t.status === k).length;
    });
    return c;
  }, [tasks]);

  const visible = tasks.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      ((t.title || "") + (t.description || ""))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const save = (data) => {
    const request = data.id ? updateTask(data.id, data) : createTask(data);
    request
      .then(() => {
        setModal(null);
        return loadTasks();
      })
      .catch((err) => setError(err.message));
  };

  const remove = (id) =>
    deleteTask(id)
      .then(loadTasks)
      .catch((err) => setError(err.message));

  const setStatus = (id, status) => {
    const task = tasks.find((t) => t.id === id);
    updateTask(id, { ...task, status })
      .then(loadTasks)
      .catch((err) => setError(err.message));
  };

  const stats = [
    { label: "Total", count: counts.all, color: "text-ink" },
    ...STATUS_KEYS.map((k) => ({
      label: STATUS[k].label,
      count: counts[k],
      color: STATUS[k].stat,
    })),
  ];
  if (view === "github") {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar
          view={view}
          setView={setView}
          filter={filter}
          setFilter={setFilter}
          counts={counts}
        />
        <main className="min-w-0 flex-1 p-5 md:p-8">
          <GithubPage />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        view={view}
        setView={setView}
        filter={filter}
        setFilter={setFilter}
        counts={counts}
      />
      <main className="flex-1 p-5 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {user?.role === "MANAGER" ? "My team's tasks" : "My tasks"}
            </h1>
            <p className="mt-1 text-sm text-ink-2">
              {counts.COMPLETED} of {counts.all} tasks completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-right text-sm sm:block">
                  <span className="block font-semibold">{user.name}</span>
                  <span className="text-xs text-muted">
                    {user.role === "MANAGER" ? "Manager" : "Team member"}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="rounded-lg border border-input bg-white px-4 py-2.5 text-sm font-semibold hover:bg-hover-bg"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-lg border border-input bg-white px-4 py-2.5 text-sm font-semibold hover:bg-hover-bg"
              >
                Log in
              </button>
            )}
            <button
              onClick={() => setModal("new")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Plus size={16} /> New task
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger"
          >
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, count, color }) => (
            <div
              key={label}
              className="rounded-xl border border-line bg-card p-4"
            >
              <p className="text-sm font-medium text-ink-2">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{count}</p>
            </div>
          ))}
        </section>

        <div className="relative mt-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            className="w-full rounded-lg border border-input bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-muted hover:border-input-hover focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-ink-2">Loading tasks…</p>
        ) : visible.length ? (
          <ul className="mt-4 space-y-3">
            {visible.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onEdit={setModal}
                onDelete={remove}
                onStatus={setStatus}
              />
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-input bg-card px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <ClipboardList size={22} />
            </span>
            <h3 className="mt-4 font-semibold">No tasks here</h3>
            <p className="mt-1 text-sm text-ink-2">
              Add a task or change your filter to see more.
            </p>
          </div>
        )}
      </main>

      {modal && (
        <TaskModal
          task={modal === "new" ? null : modal}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
      {showAuth && !user && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

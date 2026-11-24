import { Pencil, Trash2, CalendarDays } from "lucide-react";

import { STATUS, STATUS_KEYS, todayISO } from "../constants";
export default function TaskItem({ task, onEdit, onDelete, onStatus }) {
  const s = STATUS[task.status];
  const done = task.status === "COMPLETED";
  const overdue = task.due && !done && task.due < todayISO();

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <h3
          className={`truncate text-[15px] font-semibold ${done ? "text-muted line-through" : ""}`}
        >
          {task.title}
        </h3>
        {task.owner && <span>By {task.owner}</span>}
        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-ink-2">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${s.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
          <span>{task.priority} priority</span>
          {task.due && (
            <span
              className={`inline-flex items-center gap-1 ${overdue ? "font-medium text-danger" : ""}`}
            >
              <CalendarDays size={13} /> {overdue ? "Overdue · " : ""}
              {task.due}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!done && (
          <select
            aria-label="Change status"
            value={task.status}
            onChange={(e) => onStatus(task.id, e.target.value)}
            className="rounded-lg border border-input bg-white px-2.5 py-1.5 text-sm hover:border-input-hover focus:border-primary focus:outline-none"
          >
            {STATUS_KEYS.map((k) => (
              <option key={k} value={k}>
                {STATUS[k].label}
              </option>
            ))}
          </select>
        )}
        {!done && (
          <button
            aria-label="Edit task"
            onClick={() => onEdit(task)}
            className="rounded-lg p-2 text-nav hover:bg-hover-bg"
          >
            <Pencil size={16} />
          </button>
        )}
        {!done && (
          <button
            aria-label="Delete task"
            onClick={() => onDelete(task.id)}
            className="rounded-lg p-2 text-danger hover:bg-danger-bg"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </li>
  );
}

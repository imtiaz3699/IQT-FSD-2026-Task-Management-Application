import { LayoutList, Clock, Loader, CheckCircle2, CheckSquare, Users } from 'lucide-react'
import { STATUS, STATUS_KEYS } from '../constants'

const ICONS = { PENDING: Clock, IN_PROGRESS: Loader, COMPLETED: CheckCircle2 }

const taskItems = [
  { id: 'all', label: 'All tasks', icon: LayoutList },
  ...STATUS_KEYS.map((key) => ({ id: key, label: STATUS[key].label, icon: ICONS[key] })),
]

const navButton = (active) =>
  `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
    active ? 'bg-primary-light text-primary' : 'text-nav hover:bg-hover-bg'
  }`

export default function Sidebar({ view, setView, filter, setFilter, counts }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line bg-card md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
          <CheckSquare size={20} />
        </span>
        <span className="text-lg font-bold">TaskFlow</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
        {taskItems.map(({ id, label, icon: Icon }) => {
          const active = view === 'tasks' && filter === id
          return (
            <button key={id} onClick={() => { setView('tasks'); setFilter(id) }} className={navButton(active)}>
              <Icon size={18} className={active ? 'text-primary' : 'text-nav'} />
              <span className="flex-1 text-left">{label}</span>
              <span className={`text-xs ${active ? 'text-primary' : 'text-muted'}`}>{counts[id]}</span>
            </button>
          )
        })}
        <div className="hidden md:my-2 md:block md:border-t md:border-line" />
        <button onClick={() => setView('github')} className={navButton(view === 'github')}>
          <Users size={18} className={view === 'github' ? 'text-primary' : 'text-nav'} />
          <span className="flex-1 text-left">Developers</span>
        </button>
      </nav>
    </aside>
  )
}
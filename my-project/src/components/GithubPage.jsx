import { useRef, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { searchUsers, hasCriteria, PER_PAGE, MAX_PAGES } from '../githubApi'
import UserDetail from './UserDetail'

const EMPTY = {
  text: '', searchIn: 'all', language: '', location: '',
  type: 'user', minFollowers: '', minRepos: '', sort: 'best',
}
const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'C#', 'C++', 'Ruby', 'Swift', 'Kotlin']

const field = 'w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-ink placeholder:text-muted hover:border-input-hover focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

function Field({ label, children }) {
  return <label className="block text-sm font-medium">{label}<div className="mt-1.5">{children}</div></label>
}

export default function GithubPage() {
  const [filters, setFilters] = useState(EMPTY)
  const [result, setResult] = useState(null) // { items, total }
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const topRef = useRef(null)

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value })

  const run = (f, p = 1) => {
    if (!hasCriteria(f)) {
      setError('Enter a name, language, location or another filter to search.')
      return
    }
    setLoading(true)
    setError('')
    setPage(p)
    searchUsers(f, p)
      .then((data) => { setResult(data); topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) })
      .catch((err) => { setError(err.message); setResult(null) })
      .finally(() => setLoading(false))
  }

  const submit = (e) => { e.preventDefault(); run(filters, 1) }
  const clear = () => { setFilters(EMPTY); setResult(null); setError('') }

  const pickLanguage = (language) => {
    const next = { ...filters, language }
    setFilters(next)
    setSelected(null)
    run(next, 1)
  }

  const lastPage = result ? Math.min(Math.ceil(result.total / PER_PAGE), MAX_PAGES) : 1

  return (
    <div ref={topRef} className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Find developers</h1>
        <p className="mt-1 text-sm text-ink-2">Search GitHub users by name, language, location and more.</p>
      </header>

      <form onSubmit={submit} className="mt-6 rounded-xl border border-line bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={filters.text}
              onChange={set('text')}
              placeholder="Name, username or email"
              className={`${field} py-2.5 pl-9`}
            />
          </div>
          <button type="submit" disabled={loading} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled">
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button type="button" onClick={clear} className="rounded-lg border border-input bg-white px-4 py-2.5 text-sm font-semibold hover:bg-hover-bg">
            Clear
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Search in">
            <select className={field} value={filters.searchIn} onChange={set('searchIn')}>
              <option value="all">Username, name and email</option>
              <option value="login">Username only</option>
              <option value="name">Full name only</option>
              <option value="email">Email only</option>
            </select>
          </Field>
          <Field label="Language">
            <input className={field} list="gh-languages" value={filters.language} onChange={set('language')} placeholder="e.g. JavaScript" />
            <datalist id="gh-languages">{LANGUAGES.map((l) => <option key={l} value={l} />)}</datalist>
          </Field>
          <Field label="Location">
            <input className={field} value={filters.location} onChange={set('location')} placeholder="e.g. Pakistan" />
          </Field>
          <Field label="Account type">
            <select className={field} value={filters.type} onChange={set('type')}>
              <option value="user">People</option>
              <option value="org">Organizations</option>
              <option value="any">Both</option>
            </select>
          </Field>
          <Field label="Minimum followers">
            <input type="number" min="0" className={field} value={filters.minFollowers} onChange={set('minFollowers')} placeholder="0" />
          </Field>
          <Field label="Minimum repositories">
            <input type="number" min="0" className={field} value={filters.minRepos} onChange={set('minRepos')} placeholder="0" />
          </Field>
          <Field label="Sort by">
            <select className={field} value={filters.sort} onChange={set('sort')}>
              <option value="best">Best match</option>
              <option value="followers">Most followers</option>
              <option value="repositories">Most repositories</option>
              <option value="joined">Recently joined</option>
            </select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {LANGUAGES.slice(0, 8).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => pickLanguage(l)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filters.language === l ? 'border-primary bg-primary-light text-primary' : 'border-line text-ink-2 hover:bg-hover-bg'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>
      )}

      {loading && (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex animate-pulse items-center gap-4 rounded-xl border border-line bg-card p-4">
              <div className="h-14 w-14 rounded-full bg-hover-bg" />
              <div className="flex-1 space-y-2"><div className="h-3 w-2/3 rounded bg-hover-bg" /><div className="h-3 w-1/3 rounded bg-hover-bg" /></div>
            </li>
          ))}
        </ul>
      )}

      {!loading && result && (
        result.items.length ? (
          <>
            <p className="mt-6 text-sm text-ink-2">
              {result.total.toLocaleString()} {result.total === 1 ? 'result' : 'results'} · page {page} of {lastPage}
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => setSelected(u.login)}
                    className="flex w-full items-center gap-4 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <img src={u.avatar_url} alt="" loading="lazy" className="h-14 w-14 rounded-full bg-hover-bg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{u.login}</span>
                      <span className="mt-1 inline-block rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">{u.type}</span>
                    </span>
                    <a
                      href={u.html_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Open ${u.login} on GitHub`}
                      className="rounded-lg p-2 text-nav hover:bg-hover-bg"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => run(filters, page - 1)} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-lg border border-input bg-white px-3 py-2 text-sm font-semibold hover:bg-hover-bg disabled:cursor-not-allowed disabled:text-muted">
                <ChevronLeft size={16} /> Previous
              </button>
              <button onClick={() => run(filters, page + 1)} disabled={page >= lastPage} className="inline-flex items-center gap-1 rounded-lg border border-input bg-white px-3 py-2 text-sm font-semibold hover:bg-hover-bg disabled:cursor-not-allowed disabled:text-muted">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-input bg-card px-6 py-14 text-center">
            <h3 className="font-semibold">No users found</h3>
            <p className="mt-1 text-sm text-ink-2">Try fewer filters or a different spelling.</p>
          </div>
        )
      )}

      {!loading && !result && !error && (
        <div className="mt-6 rounded-xl border border-dashed border-input bg-card px-6 py-14 text-center">
          <h3 className="font-semibold">Start with a name or pick a language</h3>
          <p className="mt-1 text-sm text-ink-2">Select a result to see the full profile and top repositories.</p>
        </div>
      )}

      {selected && <UserDetail login={selected} onClose={() => setSelected(null)} onPickLanguage={pickLanguage} />}
    </div>
  )
}
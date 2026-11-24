import { useEffect, useState } from 'react'
import { X, ExternalLink, MapPin, Building2, Link2, Mail, Star, GitFork, CalendarDays } from 'lucide-react'
import { getUser, getUserRepos } from '../githubApi'

const withProtocol = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`)
const fmt = (n) => Intl.NumberFormat(undefined, { notation: 'compact' }).format(n)

export default function UserDetail({ login, onClose, onPickLanguage }) {
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    let cancelled = false
    setState({ loading: true })
    Promise.all([getUser(login), getUserRepos(login)])
      .then(([user, repos]) => { if (!cancelled) setState({ user, repos }) })
      .catch((err) => { if (!cancelled) setState({ error: err.message }) })
    return () => { cancelled = true }
  }, [login])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const { user, repos = [], loading, error } = state

  const languages = Object.entries(
    repos.reduce((acc, r) => (r.language ? { ...acc, [r.language]: (acc[r.language] || 0) + 1 } : acc), {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const stats = user && [
    ['Followers', user.followers],
    ['Following', user.following],
    ['Repos', user.public_repos],
    ['Gists', user.public_gists],
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-secondary/50" onClick={onClose}>
      <aside
        role="dialog"
        aria-label={`${login} profile`}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-xl overflow-y-auto bg-card p-5 shadow-xl sm:p-6"
      >
        <div className="mb-4 flex justify-end">
          <button aria-label="Close" onClick={onClose} className="rounded-lg p-1.5 text-nav hover:bg-hover-bg"><X size={18} /></button>
        </div>

        {loading && <p className="text-sm text-ink-2">Loading profile…</p>}
        {error && <div role="alert" className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>}

        {user && (
          <>
            <div className="flex items-center gap-4">
              <img src={user.avatar_url} alt="" className="h-20 w-20 rounded-full bg-hover-bg" />
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold">{user.name || user.login}</h2>
                <p className="truncate text-sm text-ink-2">@{user.login}</p>
                <a href={user.html_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
                  View on GitHub <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {user.bio && <p className="mt-4 text-sm text-ink-2">{user.bio}</p>}

            <ul className="mt-4 space-y-2 text-sm text-ink-2">
              {user.location && <li className="flex items-center gap-2"><MapPin size={15} className="text-muted" />{user.location}</li>}
              {user.company && <li className="flex items-center gap-2"><Building2 size={15} className="text-muted" />{user.company}</li>}
              {user.blog && (
                <li className="flex items-center gap-2"><Link2 size={15} className="text-muted" />
                  <a href={withProtocol(user.blog)} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">{user.blog}</a>
                </li>
              )}
              {user.email && <li className="flex items-center gap-2"><Mail size={15} className="text-muted" />{user.email}</li>}
              <li className="flex items-center gap-2"><CalendarDays size={15} className="text-muted" />
                Joined {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
              </li>
              {user.hireable && <li><span className="rounded-full bg-done-bg px-2.5 py-1 text-xs font-medium text-done-text">Open to work</span></li>}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(([label, n]) => (
                <div key={label} className="rounded-lg border border-line p-3 text-center">
                  <p className="text-lg font-bold">{fmt(n)}</p>
                  <p className="text-xs text-ink-2">{label}</p>
                </div>
              ))}
            </div>

            {languages.length > 0 && (
              <section className="mt-6">
                <h3 className="text-sm font-semibold">Top languages</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {languages.map(([lang, n]) => (
                    <button
                      key={lang}
                      onClick={() => onPickLanguage(lang)}
                      title={`Find more ${lang} developers`}
                      className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-primary hover:bg-primary-light hover:text-primary"
                    >
                      {lang} · {n}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6">
              <h3 className="text-sm font-semibold">Recently updated repositories</h3>
              {repos.length ? (
                <ul className="mt-2 space-y-3">
                  {repos.slice(0, 8).map((r) => (
                    <li key={r.id} className="rounded-lg border border-line p-3">
                      <a href={r.html_url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">{r.name}</a>
                      {r.description && <p className="mt-1 line-clamp-2 text-sm text-ink-2">{r.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted">
                        {r.language && <span>{r.language}</span>}
                        <span className="inline-flex items-center gap-1"><Star size={13} />{fmt(r.stargazers_count)}</span>
                        <span className="inline-flex items-center gap-1"><GitFork size={13} />{fmt(r.forks_count)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-2">No public repositories.</p>
              )}
            </section>
          </>
        )}
      </aside>
    </div>
  )
}
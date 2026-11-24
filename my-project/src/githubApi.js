const API = 'https://api.github.com'
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN 
export const PER_PAGE = 10
export const MAX_PAGES = 100 
console.log(TOKEN,'fasdlfkjhalsdkjfsd')
function gh(path) {
  const headers = { Accept: 'application/vnd.github+json' }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  return fetch(`${API}${path}`, { headers }).then((res) => {
    if (res.ok) return res.json()
    return res
      .json()
      .catch(() => ({}))
      .then((body) => {
        if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
          const reset = new Date(Number(res.headers.get('x-ratelimit-reset')) * 1000)
          throw new Error(`GitHub rate limit reached. Try again at ${reset.toLocaleTimeString()}.`)
        }
        if (res.status === 404) throw new Error('User not found.')
        if (res.status === 422) throw new Error('GitHub could not understand that search. Try a simpler query.')
        throw new Error(body.message || `GitHub request failed (${res.status})`)
      })
  })
}

const quote = (v) => (/\s/.test(v) ? `"${v}"` : v)

export const hasCriteria = (f) =>
  Boolean(f.text.trim() || f.language.trim() || f.location.trim() || f.minFollowers || f.minRepos)

export function buildQuery(f) {
  const parts = []
  const text = f.text.trim()
  if (text) {
    parts.push(text)
    if (f.searchIn !== 'all') parts.push(`in:${f.searchIn}`)
  }
  if (f.language.trim()) parts.push(`language:${quote(f.language.trim())}`)
  if (f.location.trim()) parts.push(`location:${quote(f.location.trim())}`)
  if (f.type !== 'any') parts.push(`type:${f.type}`)
  if (f.minFollowers) parts.push(`followers:>=${f.minFollowers}`)
  if (f.minRepos) parts.push(`repos:>=${f.minRepos}`)
    console.log(parts,'QueryParts')
  return parts.join(' ')
}

export function searchUsers(filters, page = 1) {
  const params = new URLSearchParams({ q: buildQuery(filters), per_page: PER_PAGE, page })
  if (filters.sort !== 'best') {
    params.set('sort', filters.sort)
    params.set('order', 'desc')
  }
  return gh(`/search/users?${params}`).then((data) => ({ total: data.total_count, items: data.items }))
}

export const getUser = (login) => gh(`/users/${encodeURIComponent(login)}`)

export const getUserRepos = (login) =>
  gh(`/users/${encodeURIComponent(login)}/repos?sort=updated&per_page=30`)
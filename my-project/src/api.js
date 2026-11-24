import { normalizeStatus } from './constants'

const BASE_URL = import.meta.env.baseUrl
const TOKEN_KEY = 'taskflow.token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY)

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

function request(path, options = {}, auth = true) {
  const token = auth ? getToken() : null
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }).then((res) =>
    res.json().then((json) => {
      if (!res.ok) {
        if (res.status === 401 && token) onUnauthorized() // expired session -> log out
        throw new Error(json.message || `Request failed (${res.status})`)
      }
      return json
    })
  )
}

// ---------- tasks ----------
const fromApi = (t) => ({
  id: t._id,
  title: t.title,
  description: t.description,
  status: normalizeStatus(t.status),
  priority: t.priority,
  due: t.due ? t.due.slice(0, 10) : '',
  owner: t.owner?.name ?? '',
})

const toApi = ({ title, description, status, priority, due }) => ({
  title,
  description,
  status: normalizeStatus(status),
  priority,
  due: due || null,
})

export const getTasks = () =>
  request('/api/tasks').then((json) => json.data.map(fromApi))

export const getTask = (id) =>
  request(`/api/tasks/${id}`).then((json) => fromApi(json.data))

export const createTask = (task) =>
  request('/api/tasks', { method: 'POST', body: JSON.stringify(toApi(task)) })

export const updateTask = (id, task) =>
  request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(toApi(task)) })

export const deleteTask = (id) =>
  request(`/api/tasks/${id}`, { method: 'DELETE' })

// ---------- auth ----------
export const signup = (data) =>
  request('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }, false).then((j) => j.data)

export const login = (data) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }, false).then((j) => j.data)

export const getMe = () => request('/api/auth/me').then((j) => j.data.user)

export const getManagers = () =>
  request('/api/auth/managers', {}, false).then((j) => j.data)
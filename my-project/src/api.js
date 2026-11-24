import { normalizeStatus } from './constants'

const BASE_URL = 'http://localhost:5000'

function request(path, options = {}) {
  return fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }).then((res) =>
    res.json().then((json) => {
      if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`)
      return json
    })
  )
}

const fromApi = (t) => ({
  id: t._id,
  title: t.title,
  description: t.description,
  status: normalizeStatus(t.status),
  priority: t.priority,
  due: t.due ? t.due.slice(0, 10) : '',
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
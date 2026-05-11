import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ql_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ql_token')
      localStorage.removeItem('ql_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (data)       => api.post('/auth/register', data)
export const login    = (data)       => api.post('/auth/login',    data)

// Tasks
export const getTasks              = ()         => api.get('/tasks')
export const getLeaderboard        = ()         => api.get('/tasks/leaderboard')

// Habits
export const createHabit           = (data)     => api.post('/tasks/habits', data)
export const clickHabit            = (id, dir)  => api.post(`/tasks/habits/${id}/click`, { direction: dir })
export const deleteHabit           = (id)       => api.delete(`/tasks/habits/${id}`)

// Dailies
export const createDaily           = (data)     => api.post('/tasks/dailies', data)
export const completeDaily         = (id)       => api.post(`/tasks/dailies/${id}/complete`)
export const deleteDaily           = (id)       => api.delete(`/tasks/dailies/${id}`)

// Todos
export const createTodo            = (data)     => api.post('/tasks/todos', data)
export const completeTodo          = (id)       => api.post(`/tasks/todos/${id}/complete`)
export const deleteTodo            = (id)       => api.delete(`/tasks/todos/${id}`)

// Rewards
export const createReward          = (data)     => api.post('/tasks/rewards', data)
export const redeemReward          = (id)       => api.post(`/tasks/rewards/${id}/redeem`)
export const deleteReward          = (id)       => api.delete(`/tasks/rewards/${id}`)

export default api

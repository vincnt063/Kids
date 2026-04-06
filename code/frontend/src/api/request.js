import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

const clearLoginState = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    if (typeof res?.code !== 'undefined' && res.code !== 200) {
      const hasToken = !!localStorage.getItem('token')

      if (res.code === 401 && hasToken) {
        clearLoginState()
        ElMessage.error(res.message || '登录状态已失效，请重新登录')

        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      const businessError = new Error(res.message || '请求失败')
      businessError.handled = res.code === 401 && hasToken
      return Promise.reject(businessError)
    }

    return res
  },
  error => {
    console.error('请求错误:', error)
    const status = error.response?.status
    let message = error.message || '网络错误，请稍后重试'

    if (status === 401) {
      message = '登录状态已失效，请重新登录'
      clearLoginState()

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      message = '没有权限访问该资源'
    } else if (status >= 500) {
      message = '服务器开小差了，请稍后重试'
    }

    ElMessage.error(message)
    error.handled = true
    return Promise.reject(error)
  }
)

export default request

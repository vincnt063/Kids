import request from './request'

// 用户登录
export const login = (data) => {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 用户注册
export const register = (data) => {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// 发送注册邮箱验证码
export const sendRegisterEmailCode = (data) => {
  return request({
    url: '/user/register/email-code',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = (userId) => {
  return request({
    url: '/user/info',
    method: 'get',
    params: { userId }
  })
}

// 家长绑定学生账号
export const bindStudentAccount = (data) => {
  return request({
    url: '/user/parent/bind',
    method: 'post',
    data
  })
}

// 获取家长已绑定学生
export const getBoundStudents = (parentId) => {
  return request({
    url: `/user/parent/${parentId}/children`,
    method: 'get'
  })
}

// 家长冻结或启用学生账号
export const updateBoundStudentStatus = (parentId, studentId, data) => {
  return request({
    url: `/user/parent/${parentId}/children/${studentId}/status`,
    method: 'put',
    data
  })
}

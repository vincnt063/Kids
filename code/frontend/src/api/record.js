import request from './request'

export const getUserRecords = (userId) => {
  return request({
    url: `/record/user/${userId}`,
    method: 'get'
  })
}

export const saveLearningRecord = (data) => {
  return request({
    url: '/record/save',
    method: 'post',
    data
  })
}

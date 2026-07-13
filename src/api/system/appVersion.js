import request from '@/utils/request'

// 查询App版本列表
export function listAppVersion(query) {
  return request({
    url: '/app-version/list',
    method: 'get',
    params: query
  })
}

// 新增App版本
export function addAppVersion(data) {
  return request({
    url: '/app-version',
    method: 'post',
    data: data
  })
}

// 修改App版本
export function updateAppVersion(data) {
  return request({
    url: '/app-version',
    method: 'put',
    data: data
  })
}

// 删除App版本
export function delAppVersion(ids) {
  return request({
    url: '/app-version/' + ids,
    method: 'delete'
  })
}

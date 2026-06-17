import request from '@/utils/request'

// 查询硬件版本枚举列表
export function listHwVersionDict(query) {
  return request({
    url: '/hw-version-dict/list',
    method: 'get',
    params: query
  })
}

// 查询硬件版本枚举详情
export function getHwVersionDict(id) {
  return request({
    url: '/hw-version-dict/' + id,
    method: 'get'
  })
}

// 新增硬件版本枚举
export function addHwVersionDict(data) {
  return request({
    url: '/hw-version-dict',
    method: 'post',
    data
  })
}

// 修改硬件版本枚举
export function updateHwVersionDict(data) {
  return request({
    url: '/hw-version-dict',
    method: 'put',
    data
  })
}

// 删除硬件版本枚举
export function delHwVersionDict(ids) {
  return request({
    url: '/hw-version-dict/' + ids,
    method: 'delete'
  })
}

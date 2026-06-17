import request from '@/utils/request'

// 查询设备功能模块列表
export function listDeviceModule(query) {
  return request({
    url: '/device/module/list',
    method: 'get',
    params: query
  })
}

// 查询设备功能模块详情
export function getDeviceModule(id) {
  return request({
    url: '/device/module/' + id,
    method: 'get'
  })
}

// 新增设备功能模块
export function addDeviceModule(data) {
  return request({
    url: '/device/module',
    method: 'post',
    data
  })
}

// 修改设备功能模块
export function updateDeviceModule(data) {
  return request({
    url: '/device/module',
    method: 'put',
    data
  })
}

// 删除设备功能模块
export function delDeviceModule(ids) {
  return request({
    url: '/device/module/' + ids,
    method: 'delete'
  })
}

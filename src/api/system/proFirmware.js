import request from '@/utils/request'

// 上传地址
export const uploadUrl = import.meta.env.VITE_APP_BASE_API + '/firmware/upload'

// 查询固件列表
export function listProFirmware(query) {
  return request({
    url: '/firmware/list',
    method: 'get',
    params: query
  })
}

// 查询固件详细
export function getProFirmware(id) {
  return request({
    url: '/firmware/' + id,
    method: 'get'
  })
}

// 新增固件
export function addProFirmware(data) {
  return request({
    url: '/firmware',
    method: 'post',
    data: data
  })
}

// 修改固件
export function updateProFirmware(data) {
  return request({
    url: '/firmware',
    method: 'put',
    data: data
  })
}

// 删除固件
export function delProFirmware(ids) {
  return request({
    url: '/firmware/' + ids,
    method: 'delete'
  })
}

// 获取下拉选项
export function getFirmwareOptions(params) {
  return request({
    url: '/firmware/options',
    method: 'get',
    params: params
  })
}

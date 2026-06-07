import request from '@/utils/request'

// 查询设备故障列表
export function listDeviceFault(query) {
  return request({
    url: '/system/fault/list',
    method: 'get',
    params: query
  })
}

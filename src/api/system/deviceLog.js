import request from '@/utils/request'

// 查询设备日志列表
export function listDeviceLog(query) {
  return request({
    url: '/device/log/list',
    method: 'get',
    params: query
  })
}

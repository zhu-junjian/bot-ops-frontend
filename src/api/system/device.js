import request from '@/utils/request'

// 查询设备列表
export function listDevice(query) {
  return request({
    url: '/device/list',
    method: 'get',
    params: query
  })
}

// 下发日志拉取命令
export function pullDeviceLog(data) {
  return request({
    url: '/device/log-pull',
    method: 'post',
    data
  })
}

// 查询日志拉取状态
export function getLogPullStatus(serialNum) {
  return request({
    url: '/device/log-pull-status/' + serialNum,
    method: 'get'
  })
}

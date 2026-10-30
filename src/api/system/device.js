import request from '@/utils/request'

// 查询设备列表
export function listDevice(query) {
  return request({
    url: '/device/list',
    method: 'get',
    params: query
  })
}

// 查询设备 OpenClaw Web UI 登录令牌（HMAC-SHA256(secret, SN) 派生）
export function getOpenclawToken(sn) {
  return request({
    url: '/device/openclaw-token',
    method: 'get',
    params: { sn }
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

// 修改设备时区/国家编码
export function updateDeviceConfig(data) {
  return request({
    url: '/device/config',
    method: 'put',
    data
  })
}

// 查询设备OTA全量配置
export function getDeviceOtaConfig(sn) {
  return request({
    url: '/device/ota-config',
    method: 'get',
    params: { sn }
  })
}

// 修改设备OTA属性
export function updateDeviceOtaConfig(data) {
  return request({
    url: '/device/ota-config',
    method: 'put',
    data
  })
}

// SSH 开关下发（一次性命令，仅在线设备可下发）
export function updateDeviceSsh(data) {
  return request({
    url: '/device/ssh-config',
    method: 'put',
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

// 修改设备备注
export function updateDeviceNotes(data) {
  return request({
    url: '/device/notes',
    method: 'put',
    data
  })
}

// 查询设备在线周期记录
export function listOnlineSessions(serialNum, pageParams) {
  return request({
    url: '/device/online-sessions/' + serialNum,
    method: 'get',
    params: pageParams
  })
}

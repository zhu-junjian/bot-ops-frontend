import request from '@/utils/request'

// 查询设备 IP 变更历史
export function listIpHistory(serialNum, pageParams) {
  return request({
    url: '/device/ipHistory/list',
    method: 'get',
    params: { serialNum, ...pageParams }
  })
}

import request from '@/utils/request'

// 查询设备关节SN变更历史
export function listJointSnHistory(serialNum, pageParams) {
  return request({
    url: '/device/jointSnHistory/list',
    method: 'get',
    params: { serialNum, ...pageParams }
  })
}

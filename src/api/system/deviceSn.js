import request from '@/utils/request'

// 查询下一段流水号（预览用）
export function getNextSeq(params) {
  return request({
    url: '/device-sn/next-seq',
    method: 'get',
    params
  })
}

// 批量生成SN并入库
export function batchGenerateSn(data) {
  return request({
    url: '/device-sn/batch',
    method: 'post',
    data
  })
}

// 查询SN列表
export function listDeviceSn(query) {
  return request({
    url: '/device-sn/list',
    method: 'get',
    params: query
  })
}

// 打印设备SN标签
export function printDeviceSn(data) {
  return request({
    url: '/device-sn/print',
    method: 'post',
    data
  })
}

// 查询打印机状态
export function getPrinterStatus() {
  return request({
    url: '/device-sn/printer-status',
    method: 'get'
  })
}

// 扫码枪入库 — 设备SN
export function scanDeviceSn(sn) {
  return request({
    url: '/device/scan',
    method: 'post',
    data: { sn }
  })
}

// 删除SN
export function delDeviceSn(ids) {
  return request({
    url: '/device-sn/' + ids,
    method: 'delete'
  })
}

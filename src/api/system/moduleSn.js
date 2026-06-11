import request from '@/utils/request'

// 查询模组SN列表
export function listModuleSn(query) {
  return request({
    url: '/module-sn/list',
    method: 'get',
    params: query
  })
}

// 查询下一段流水号（预览用）
export function getNextSeq(params) {
  return request({
    url: '/module-sn/next-seq',
    method: 'get',
    params
  })
}

// 批量生成模组SN
export function batchGenerateSn(data) {
  return request({
    url: '/module-sn/batch',
    method: 'post',
    data
  })
}

// 打印模组SN标签
export function printModuleSn(data) {
  return request({
    url: '/module-sn/print',
    method: 'post',
    data
  })
}

// 查询打印机状态
export function getPrinterStatus() {
  return request({
    url: '/module-sn/printer-status',
    method: 'get'
  })
}

// 扫码枪入库 — 模组SN
export function scanModuleSn(sn) {
  return request({
    url: '/module-inventory/scan',
    method: 'post',
    data: { sn }
  })
}

// 删除模组SN
export function delModuleSn(ids) {
  return request({
    url: '/module-sn/' + ids,
    method: 'delete'
  })
}

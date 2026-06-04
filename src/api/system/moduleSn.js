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

// 删除模组SN
export function delModuleSn(ids) {
  return request({
    url: '/module-sn/' + ids,
    method: 'delete'
  })
}

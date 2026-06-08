import request from '@/utils/request'

// 查询模组库存列表
export function listModuleInventory(query) {
  return request({
    url: '/module-inventory/list',
    method: 'get',
    params: query
  })
}

// 查询模组库存详情
export function getModuleInventory(id) {
  return request({
    url: '/module-inventory/' + id,
    method: 'get'
  })
}

// 修改模组库存（状态变更：出库/报废）
export function updateModuleInventory(data) {
  return request({
    url: '/module-inventory',
    method: 'put',
    data
  })
}

// 删除模组库存
export function delModuleInventory(ids) {
  return request({
    url: '/module-inventory/' + ids,
    method: 'delete'
  })
}

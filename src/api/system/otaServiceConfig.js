import request from '@/utils/request'

// 获取OTA型号/区域下拉选项，otaModel可选，指定后只返回该型号下的区域
export function getOtaServiceConfigOptions(otaModel) {
  return request({
    url: '/ota-service-config/options',
    method: 'get',
    params: otaModel ? { otaModel } : {}
  })
}

// 查询OTA服务配置列表
export function listOtaServiceConfig(query) {
  return request({
    url: '/ota-service-config/list',
    method: 'get',
    params: query
  })
}

// 根据设备SN反查OTA服务配置
export function getOtaServiceConfigByDeviceSn(sn) {
  return request({
    url: '/ota-service-config/by-device-sn',
    method: 'get',
    params: { sn }
  })
}

// 查询OTA服务配置详细
export function getOtaServiceConfig(id) {
  return request({
    url: '/ota-service-config/' + id,
    method: 'get'
  })
}

// 新增OTA服务配置
export function addOtaServiceConfig(data) {
  return request({
    url: '/ota-service-config',
    method: 'post',
    data: data
  })
}

// 修改OTA服务配置
export function updateOtaServiceConfig(data) {
  return request({
    url: '/ota-service-config',
    method: 'put',
    data: data
  })
}

// 删除OTA服务配置
export function delOtaServiceConfig(ids) {
  return request({
    url: '/ota-service-config/' + ids,
    method: 'delete'
  })
}

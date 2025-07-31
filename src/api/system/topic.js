import request from '@/utils/request'

// 查询话题列表
export function listRole(query) {
  return request({
    url: '/topic/list',
    method: 'get',
    params: query
  })
}

// 查询模板大类列表
export function getCategoryList() {
  return request({
    url: '/category/listMap',
    method: 'get',
    params: ''
  })
}

// 查询模板大类列表
export function getCategoryListByTypeId(typeId) {
  return request({
    url: '/category/listMap/'+typeId,
    method: 'get',
    params: ''
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: '/topic/' + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/topic',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/topic',
    method: 'put',
    data: data
  })
}

// 角色数据权限
export function dataScope(data) {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data: data
  })
}

// 角色状态修改
export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status
  }
  return request({
    url: '/system/role/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(id) {
  return request({
    url: '/topic/' + id,
    method: 'delete'
  })
}

// 查询角色已授权用户列表
export function allocatedUserList(query) {
  return request({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params: query
  })
}

// 查询角色未授权用户列表
export function unallocatedUserList(query) {
  return request({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params: query
  })
}

// 取消用户授权角色
export function authUserCancel(data) {
  return request({
    url: '/system/role/authUser/cancel',
    method: 'put',
    data: data
  })
}

// 批量取消用户授权角色
export function authUserCancelAll(data) {
  return request({
    url: '/system/role/authUser/cancelAll',
    method: 'put',
    params: data
  })
}

// 授权用户选择
export function authUserSelectAll(data) {
  return request({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    params: data
  })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId) {
  return request({
    url: '/system/role/deptTree/' + roleId,
    method: 'get'
  })
}

export function clearFileList(){
  this.fileList = [];
}

export function handleRemove(file, fileList) {
  // 当文件被移除时，更新fileList，这里可以不手动操作，因为Element UI会自动更新
  // 但如果你想手动控制，可以再次调用 clearFileList()
  this.clearFileList();
}

import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    //url: '/system/role/list',
    url: '/ota/list',
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

// 查询启用状态下的内容大类
export function getActiveCategoryList() {
  return request({
    url: '/flCategory/listMap',
    method: 'get',
    params: ''
  })
}

/**
 * 查询后端话题列表信息
 * @returns {*}
 */
export function getTopicList() {
  return request({
    url: '/topic/listMap',
    method: 'get',
    params: ''
  })
}

export function getUserList(){
  return request({
    url: '/corm/user/listMap',
    method: 'get',
    params: ''
  })
}

/**
 * 查询后端可选活动列表
 * @returns {*}
 */
export function getActivityList() {
  return request({
    url: '/activity/listMap',
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
    url: '/ota/' + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/ota',
    method: 'post',
    data: data
  })
}

// 新增角色
export function addPost(data) {
  return request({
    url: '/ota',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/ota',
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

// 内容精选
export function changeFeaturedStatus(id, isFeatured) {
  const data = {
    id,
    isFeatured
  }
  return request({
    url: '/post/isFeatured',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(id) {
  return request({
    url: '/ota/' + id,
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

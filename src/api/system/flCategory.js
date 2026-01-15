import request from '@/utils/request'

// 社区大类调整
// 查询分类列表（树形结构）
export function listCategory(query) {
  return request({
    url: '/categoryTree/categoryTreeMap', // 替换为你真实的后端路径
    method: 'get',
    params: query
  })
}

//查询完整分类树
export function getCategoryTree() {
  return request({
    url: '/categoryTree/categoryTreeMap/',
    method: 'get'
  })
}

// 查询分类详细
export function getCategory(id) {
  return request({
    url: '/categoryTree/category/' + id,
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/categoryTree',
    method: 'post',
    data: data
  })
}

// 修改分类
export function updateCategory(data) {
  return request({
    url: '/categoryTree',
    method: 'put',
    data: data
  })
}

// 删除分类
export function delCategory(id) {
  return request({
    url: '/categoryTree/' + id,
    method: 'delete'
  })
}





// 查询角色列表
export function listRole(query) {
  return request({
    //url: '/system/role/list',
    url: '/flCategory/list',
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
    url: '/categoryTree/' + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  console.log("111");
  return request({
    url: '/post',
    method: 'post',
    data: data
  })
}

// 新增角色
export function addPost(data) {
  return request({
    url: '/flCategory',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/template',
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
export function changeFeaturedStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: '/flCategory/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(id) {
  return request({
    url: '/flCategory/' + id,
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

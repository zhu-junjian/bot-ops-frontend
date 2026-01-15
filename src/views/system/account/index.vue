<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
      <el-form-item label="用户名称" prop="username">
        <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"

        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button type="danger"
                   plain
                   icon="Delete"
                   :disabled="multiple"
                   @click="handleDelete"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- 表格数据 -->
    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!--       <el-table-column label="模板编号" prop="id" width="80" />-->
      <el-table-column label="编号" align="center" prop="id"  width="120"/>
      <el-table-column label="用户名" align="center" prop="username"  width="200"/>
      <el-table-column label="昵称" align="center" prop="nickName"  width="200"/>
      <el-table-column label="所属组织" align="center" prop="orgName"  width="200"/>
      <el-table-column label="创建时间" align="center" prop="createTime"  >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" >
        <template #default="scope">
          <el-tooltip content="修改" placement="top" >
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" >
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" ></el-button>
          </el-tooltip>
          <el-button
              link
              type="primary"
              icon="Share"
              @click="handleOrgPrivilege(scope.row)"
          >机构绑定</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 权限下发 -->
    <el-dialog title="权限下发至机构" v-model="openOrgDialog" width="450px" append-to-body>
      <div style="max-height: 400px; overflow-y: auto;">
        <el-tree
            ref="deptTreeRef"
            :data="orgOptions"
            show-checkbox
            node-key="id"
            default-expand-all
            :check-strictly="true"
            :props="{ label: 'orgName' }"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <el-icon style="margin-right: 5px; vertical-align: middle;"><OfficeBuilding /></el-icon>
              <span>{{ data.orgName }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitOrgPrivilege">确 定</el-button>
          <el-button @click="openOrgDialog = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username"> <!-- 此处的name负责校验提示-->
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
      </el-form>
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="密码" prop="password"> <!-- 此处的name负责校验提示-->
          <el-input v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="昵称" prop="nickName"> <!-- 此处的name负责校验提示-->
          <el-input v-model="form.nickName" placeholder="请输入昵称" />
        </el-form-item>
      </el-form>
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="简介" prop="bio"> <!-- 此处的name负责校验提示-->
          <el-input v-model="form.bio" placeholder="请输入用户简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Role">
import {
  addRole,
  dataScope,
  delRole,
  getRole,
  listRole,
  updateRole,
  deptTreeSelect,
  changeStatus, orgTreeSelect, updateUserOrg
} from "@/api/system/account";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "@/api/system/menu";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

import { ref, reactive, onMounted } from 'vue'
import { getCategoryTypeList } from '@/api/system/category'
import {OfficeBuilding} from "@element-plus/icons-vue";
import request from "@/utils/request.js"; // 假设这是你的API接口

// 下拉选项数据
const categoryOptions = ref([])

// 生命周期：组件挂载时加载数据
onMounted(async () => {
  await loadCategoryType()
})

// 加载分类数据方法
const loadCategoryType = async () => {
  try {
    loading.value = true
    const res = await getCategoryTypeList() // 调用后端接口
    categoryOptions.value = res.data.map(item => ({
      id: item.typeId,
      name: item.typeName // 根据实际接口字段调整
    }))
  } catch (error) {
    console.error('加载分类数据失败:', error)
    ElMessage.error('分类数据加载失败')
  } finally {
    loading.value = false
  }
}

// 如果是编辑页面，需要处理初始值
// 假设从父组件接收编辑数据（示例）
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  }
})

// 监听初始数据变化
/*watch(() => props.initialData, (newVal) => {
  console.log("newVal"+newVal.id);
  if (newVal.categoryId) {
    // 确保选项加载完成后再设置值
    nextTick(() => {
      form.categoryId = newVal.categoryId
    })
  }
}, { immediate: true })*/


const categoryTypeOptions = ref([])
const topicOptions = ref([])
const activityOptions = ref([])
const userOptions = ref([])
const currentPostId = ref(null);
const currentUserId = ref(null);
const deptTreeRef = ref(null);
const openOrgDialog = ref(false);
const orgOptions = ref([]);
const roleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const menuOptions = ref([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const deptExpand = ref(true);
const deptNodeAll = ref(false);
const deptOptions = ref([]);
const openDataScope = ref(false);
const menuRef = ref(null);
const deptRef = ref(null);

/** 数据范围选项*/
const dataScopeOptions = ref([
  { value: "1", label: "全部数据权限" },
  { value: "2", label: "自定数据权限" },
  { value: "3", label: "本部门数据权限" },
  { value: "4", label: "本部门及以下数据权限" },
  { value: "5", label: "仅本人数据权限" }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    username: undefined
    /*status: undefined*/
  },
  rules: {
    username: [{ required: true, message: "用户名称不能为空", trigger: "blur" }],
    password: [{ required: true, message: "密码不能为空", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 提交组织权限关联 */
function submitOrgPrivilege() {
  // 1. 获取 el-tree 中所有被勾选的节点 ID 数组
  // 因为是单层，getCheckedKeys 获取的就是你看到的所有勾选 ID
  const orgIds = deptTreeRef.value.getCheckedKeys();

  // 2. 构造提交数据
  // currentPostId 在打开弹窗时已记录（ handleOrgPrivilege 赋值）
  const postData = {
    userId: currentUserId.value,
    orgId: orgIds[0] // 这是一个 Long 类型的数组 [1, 2, 3]
  };

  // 3. 提交前的二次确认（可选，防止误操作清空权限）
  if (orgIds.length === 0) {
    proxy.$modal.confirm('确定要取消该内容对所有机构的授权吗？').then(() => {
      doSave(postData);
    });
  } else {
    doSave(postData);
  }
}

/** 实际调用 API 保存 */
function doSave(data) {
  proxy.$modal.loading("正在保存，请稍候...");
  // savePostOrgPrivileges 是你 api/post.js 中定义的接口
  updateUserOrg(data).then(response => {
    proxy.$modal.closeLoading();
    proxy.$modal.msgSuccess("授权成功");
    openOrgDialog.value = false; // 关闭弹窗
    getList();
  }).catch(() => {
    proxy.$modal.closeLoading();
  });
}

/** 处理权限下发按钮点击 */
function handleOrgPrivilege(row) {
  currentUserId.value = row.id;
  openOrgDialog.value = true;
  // 调用后端新增的接口：传当前内容 ID
  orgTreeSelect(row.id).then(response => {
    // 1. 加载全量机构列表
    orgOptions.value = response.rows;
    // 2. 提取已经赋权的 ID 数组
    const checkedIds = response.rows
        .filter(item => item.isAssigned === 1)
        .map(item => item.id);

    // 3. 在下一个 DOM 更新周期设置勾选状态
    nextTick(() => {
      if (deptTreeRef.value) {
        deptTreeRef.value.setCheckedKeys(checkedIds);
      }
    });
  });
}

/** 查询角色列表 */
function getList() {
  loading.value = true;
  listRole(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    roleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 精选状态修改 */
function handleFeaturedChange(row) {
  // --- 新增：如果处于加载状态，说明是初始化赋值，直接返回 ---
  if (loading.value) {
    return;
  }
  let text = row.isFeatured === 1 ? "精选" : "非精选";
  proxy.$modal.confirm('确认要将"' +row.id + '"设置为' +text +'吗？').then(function () {
    return changeFeaturedStatus(row.id, row.isFeatured);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.isFeatured = row.isFeatured === 0 ? 1 : 0;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除角色编号为"' + id + '"的数据项?').then(function () {
    return delRole(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/role/export", {
    ...queryParams.value,
  }, `role_${new Date().getTime()}.xlsx`);
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 角色状态修改 */
function handleStatusChange(row) {
  let text = row.status === "1" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.orgName + '"机构吗?').then(function () {
    return changeStatus(row.id, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}

/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case "handleDataScope":
      handleDataScope(row);
      break;
    case "handleAuthUser":
      handleAuthUser(row);
      break;
    default:
      break;
  }
}

/** 分配用户 */
function handleAuthUser(row) {
  router.push("/system/role-auth/user/" + row.roleId);
}

/** 查询菜单树结构 */
function getMenuTreeselect() {
  menuTreeselect().then(response => {
    menuOptions.value = response.data;
  });
}

/** 所有部门节点数据 */
function getDeptAllCheckedKeys() {
  // 目前被选中的部门节点
  let checkedKeys = deptRef.value.getCheckedKeys();
  // 半选中的部门节点
  let halfCheckedKeys = deptRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}

/** 重置新增的表单以及其他数据  */
function reset() {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  deptExpand.value = true;
  deptNodeAll.value = false;
  form.value = {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    officialWeight: 0,
    status: "0",
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined
  };
  proxy.resetForm("roleRef");
}

/** 添加角色 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加用户";
}

/** 修改角色 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  //const roleMenu = getRoleMenuTreeselect(id);
  getRole(id).then(response => {
    form.value = response.data;
    form.value.roleSort = Number(form.value.roleSort);
    open.value = true;
    nextTick(() => {
      roleMenu.then((res) => {
        let checkedKeys = res.checkedKeys;
        checkedKeys.forEach((v) => {
          nextTick(() => {
            menuRef.value.setChecked(v, true, false);
          });
        });
      });
    });
  });
  title.value = "修改大类";
}

/** 根据角色ID查询菜单树结构 */
function getRoleMenuTreeselect(roleId) {
  return roleMenuTreeselect(roleId).then(response => {
    menuOptions.value = response.menus;
    return response;
  });
}

/** 根据角色ID查询部门树结构 */
function getDeptTree(roleId) {
  return deptTreeSelect(roleId).then(response => {
    deptOptions.value = response.depts;
    return response;
  });
}

/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value, type) {
  if (type == "menu") {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  } else if (type == "dept") {
    let treeList = deptOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
}

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value, type) {
  if (type == "menu") {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
  } else if (type == "dept") {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : []);
  }
}

/** 树权限（父子联动） */
function handleCheckedTreeConnect(value, type) {
  if (type == "menu") {
    form.value.menuCheckStrictly = value ? true : false;
  } else if (type == "dept") {
    form.value.deptCheckStrictly = value ? true : false;
  }
}

/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["roleRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateRole(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRole(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 选择角色权限范围触发 */
function dataScopeSelectChange(value) {
  if (value !== "2") {
    deptRef.value.setCheckedKeys([]);
  }
}

/** 分配数据权限操作 */
function handleDataScope(row) {
  reset();
  const deptTreeSelect = getDeptTree(row.roleId);
  getRole(row.roleId).then(response => {
    form.value = response.data;
    openDataScope.value = true;
    nextTick(() => {
      deptTreeSelect.then(res => {
        nextTick(() => {
          if (deptRef.value) {
            deptRef.value.setCheckedKeys(res.checkedKeys);
          }
        });
      });
    });
  });
  title.value = "分配数据权限";
}

/** 提交按钮（数据权限） */
function submitDataScope() {
  if (form.value.roleId != undefined) {
    form.value.deptIds = getDeptAllCheckedKeys();
    dataScope(form.value).then(response => {
      proxy.$modal.msgSuccess("修改成功");
      openDataScope.value = false;
      getList();
    });
  }
}

/** 取消按钮（数据权限）*/
function cancelDataScope() {
  openDataScope.value = false;
  reset();
}

getList();
</script>

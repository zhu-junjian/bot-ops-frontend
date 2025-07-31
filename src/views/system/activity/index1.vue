<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
         <el-form-item label="活动名称" prop="name">
            <el-input
               v-model="queryParams.name"
               placeholder="请输作者名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
            ></el-date-picker>
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
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"

            >删除</el-button>
         </el-col>
<!--         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:role:export']"
            >导出</el-button>
         </el-col>-->
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- 表格数据 -->
     <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
       <el-table-column type="selection" width="55" align="center" />
       <el-table-column label="编号" align="center" prop="id" width="60" />
       <el-table-column label="活动名称" align="center" prop="name" width="240"/>
       <el-table-column label="主标题" align="center" prop="heading" width="240"/>
       <el-table-column label="副标题" align="center" prop="subheading" width="240" />
       <el-table-column label="背景图片" align="center" prop="backgroundUrl" :show-overflow-tooltip="true" width="240" />
       <el-table-column label="创建时间" align="center" prop="publishTime" width="180" >
         <template #default="scope">
           <span>{{ parseTime(scope.row.publishTime) }}</span>
         </template>
       </el-table-column>
       <el-table-column label="操作" align="center" class-name="small-padding fixed-width" >
         <template #default="scope">
           <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1">
             <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" ></el-button>
           </el-tooltip>
           <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1">
             <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
           </el-tooltip>
         </template>
       </el-table-column>
     </el-table>

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
           <el-form-item label="活动名称" prop="content">
             <el-input v-model="form.name" placeholder="请输入名称" />
           </el-form-item>
           <el-form-item label="主标题" prop="content">
             <el-input v-model="form.heading" placeholder="请输入名称" />
           </el-form-item>
           <el-form-item label="副标题" prop="content">
             <el-input v-model="form.subheading" placeholder="请输入名称" />
           </el-form-item>
            <el-form-item label="官方排序" prop="officialWeight">
               <el-input-number v-model="form.officialWeight" controls-position="right" :min="0" />
            </el-form-item>
           <!-- 活动背景图片 -->
<!--           <el-form-item label="背景图片" prop="backgroundUrl">
             <el-upload
                 v-model:file-list="form.backgroundUrl"
                 action="/dev-api/template/upload"
                 :on-success="(res) => handleSuccess(res, 'backgroundUrl')"
                 :before-upload="(file) => beforeUpload(file, ['png', 'jpg','jpeg'], 500)"
                 :accept="'.jpg,.png,.jpeg'">
               <el-button type="primary">点击上传</el-button>
               <div class="el-upload__tip">支持.jpg/.jpg/.jpeg</div>
             </el-upload>
           </el-form-item>-->
           <!-- 音频文件 -->
           <el-form-item label="音频文件" prop="backgroundUrl">
             <el-upload
                 v-model:file-list="form.backgroundUrl"
                 action="/dev-api/template/upload"
                 :on-success="(res) => handleSuccess(res, 'backgroundUrl')"
                 :before-upload="(file) => beforeUpload(file, ['png', 'jpg','jpeg'], 500)"
                 :accept="'.jpg,.png,.jpeg'">
               <el-button type="primary">点击上传</el-button>
               <div class="el-upload__tip">支持'.jpg,.png,.jpeg'</div>
             </el-upload>
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
  changeRoleStatus,
  dataScope,
  delRole,
  addActivity,
  getRole,
  listActivity,
  updateRole,
  getActiveCategoryList,
  deptTreeSelect, changeFeaturedStatus, getTopicList
  //getCategoryListByTypeId
} from "@/api/system/activity";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "@/api/system/menu";
import { ref, reactive, onMounted } from 'vue'
//import { getCategoryList } from '@/api/system/template'
//import { getActiveCategoryTypeList } from '@/api/system/postRecord'

// 如果是编辑页面，需要处理初始值
// 假设从父组件接收编辑数据（示例）
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_post_featured } = proxy.useDict("sys_post_featured");

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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    type:null,
    categoryId:null,
    categoryName: undefined,
    templateName: undefined,
    status: undefined
  },
  rules: {
    name: [{ required: true, message: "模板名称不能为空", trigger: "blur" }],
    type: [{ required: true, message: "请选择大类类型", trigger: "blur" }],
    categoryId: [{ required: true, message: "请选择所属大类", trigger: "blur" }],
    officialWeight: [{ required: true, message: "模板顺序不能为空", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询角色列表 */
function getList() {
  loading.value = true;
  listActivity(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    roleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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

// 统一上传成功处理
function handleSuccess(res, field) {
  if (res.code === 200) {
    this.form[field] = res.msg
    /*console.log("this.message:"+this.form["fileList"]);*/
    //this.$message.success(`${field}上传成功`)
  }
}

// 统一上传前校验
function beforeUpload(file, allowedTypes, maxSizeMB) {
  const fileType = file.name.split('.').pop().toLowerCase()
  const isValidType = allowedTypes.includes(fileType)
  const isValidSize = file.size / 1024 / 1024 < maxSizeMB

  if (!isValidType) {
    this.$message.error(`仅支持 ${allowedTypes.join('/')} 格式`)
    return false
  }
  if (!isValidSize) {
    this.$message.error(`文件大小不能超过${maxSizeMB}MB`)
    return false
  }
  return true
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/role/export", {
    ...queryParams.value,
  }, `role_${new Date().getTime()}.xlsx`);
}

/*function handleRemove(file, fileList) {
  // 当文件被移除时，更新fileList，这里可以不手动操作，因为Element UI会自动更新
  // 但如果你想手动控制，可以再次调用 clearFileList()
  this.clearFileList();
}*/

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 精选状态修改 */
function handleStatusChange(row) {
  let text = row.isFeatured === 1 ? "精选" : "非精选";
  proxy.$modal.confirm('确认要将"' +row.id + '"设置为' +text +'吗？').then(function () {
    return changeFeaturedStatus(row.id, row.isFeatured);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.isFeatured = row.isFeatured === "0" ? "1" : "0";
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
    id: undefined,
    name: undefined,
    roleKey: undefined,
    officialWeight: 0,
    actionUrl:undefined,
    status: "0",
    actionFiles:[],
    videoFiles:[],
    audioFiles:[],
    coverUrlFiles:[],
    coverContentFiles:[],
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined
  };
  proxy.resetForm("roleRef");
}

/** 添加模板 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "发布内容";
}

/** 修改模板 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  getRole(id).then(response => {
    form.value = response.data;
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
  title.value = "修改发布内容";
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
        addActivity(form.value).then(response => {
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

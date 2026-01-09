<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
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
       <el-table-column label="版本号" align="center" prop="version"  width="180"/>
       <el-table-column label="哈希值" align="center" prop="packHash" :show-overflow-tooltip="true" width="580"/>
       <el-table-column label="包大小（MB）" align="center" prop="packSize"/>
       <el-table-column label="升级包地址" align="center" prop="packUrl" :show-overflow-tooltip="true" width="180"/>
       <el-table-column label="说明" align="center" prop="summary"/>
       <el-table-column label="创建时间" align="center" prop="publishTime" width="180" >
         <template #default="scope">
           <span>{{ parseTime(scope.row.createTime) }}</span>
         </template>
       </el-table-column>
       <el-table-column label="操作" align="center" class-name="small-padding fixed-width" >
         <template #default="scope">
           <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1">
             <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
           </el-tooltip>
           <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1">
             <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']"></el-button>
           </el-tooltip>
<!--           <el-tooltip content="数据权限" placement="top" v-if="scope.row.roleId !== 1">
             <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
           </el-tooltip>
           <el-tooltip content="分配用户" placement="top" v-if="scope.row.roleId !== 1">
             <el-button link type="primary" icon="User" @click="handleAuthUser(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
           </el-tooltip>-->
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
           <!-- TODO 列表多选 -->

           <el-form-item label="版本号" prop="content">
             <el-input v-model="form.version" placeholder="请输入版本号" />
           </el-form-item>
           <el-form-item label="说明">
             <el-input v-model="form.summary" type="textarea" placeholder="请输入内容"/>
           </el-form-item>
           <el-form-item label="升级包" prop="packUrl">
             <el-upload
                 v-model:file-list="form.audioFiles"
                 action="/dev-api/template/upload"
                 :on-success="(res) => handleSuccess(res, 'packUrl', 'packHash','packSize')"
                 :before-upload="(file) => beforeUpload(file, ['mp3'], 500)"
                 :accept="'.mp3'">
               <el-button type="primary">点击上传</el-button>
               <div class="el-upload__tip">支持.mp3格式，不超过500MB</div>
             </el-upload>
             <!-- 新增的文件链接展示区域 -->
             <div class="file-links-container" >
               <!--               <div class="link-title">已上传文件：</div>-->
               <div class="link-list">
                 <el-input
                     v-model="form.packUrl"
                     readonly
                     placeholder="地址"
                     class="link-input">
                 </el-input>
                 <el-input
                     v-model="form.packHash"
                     readonly
                     placeholder="文件整包哈希"
                     class="link-input">
                 </el-input>
                 <el-input
                     v-model="form.packSize"
                     readonly
                     placeholder="文件大小（单位：MB）"
                     class="link-input">
                 </el-input>
               </div>
             </div>
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
  addPost,
  getRole,
  listRole,
  updateRole,
  getActiveCategoryList,
  deptTreeSelect, changeFeaturedStatus, getTopicList, getActivityList, getUserList
  //getCategoryListByTypeId
} from "@/api/system/ota";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "@/api/system/menu";
import { ref, reactive, onMounted } from 'vue'
//import { getCategoryList } from '@/api/system/template'
//import { getActiveCategoryTypeList } from '@/api/system/postRecord'

// 当一级选择变化时
const handleTypeChange = async (typeId) => {
  // 1. 立即清空二级分类的值和选项
  form.value.categoryId = null;     // 清空选中值
    // 清空旧选项（注意使用.value）
  if (!typeId) {
    return
  }
  try {
    const res = await getCategoryListByTypeId(typeId) // 根据大类类型Id获取其下大类
    categoryOptions.value = res.data.map(item => ({
      id: item.id,
      name: item.name // 根据实际接口字段调整
    }))
  } finally {
    // 出错时也保持清空
  }
}

/**
 * 下拉框数据
 * 内容一级大类
 * 话题列表多选
 * 活动列表
 * @type {Ref<UnwrapRef<*[]>>}
 */
const categoryTypeOptions = ref([])
const topicOptions = ref([])
const activityOptions = ref([])
const userOptions = ref([])

// 生命周期：组件挂载时加载数据
onMounted(async () => {
  await loadCategoryType()
  await loadTopic()
  await loadActivity()
  await loadUserList()
})

/**
 * 加载大类类型数据方法
 * @returns {Promise<void>}
 */
const loadCategoryType = async () => {
  try {
    loading.value = true
    const res = await getActiveCategoryList() // 调用后端接口
    categoryTypeOptions.value = res.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  } catch (error) {
    console.error('加载分类数据失败:', error)
    ElMessage.error('分类数据加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载话题列表
 * @returns {Promise<void>}
 */
const loadTopic = async () => {
  try {
    loading.value = true
    const res = await getTopicList() // 调用后端接口
    topicOptions.value = res.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  } catch (error) {
    console.error('加载分类数据失败:', error)
    ElMessage.error('分类数据加载失败')
  } finally {
    loading.value = false
  }
}

const loadUserList = async () =>{
  try {
    loading.value = true
    const res = await getUserList()
    userOptions.value = res.data.map(item =>({
      id: item.id,
      name: item.username
    }))
  }catch (error){
    ElMessage.error('加载发布者列表失败')
  }finally {
    loading.value = false
  }
}

/**
 * 加载活动列表
 * @returns {Promise<void>}
 */
const loadActivity = async () =>{
  try {
    loading.value = true
    const res = await getActivityList()
    activityOptions.value = res.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  }catch (error){
    ElMessage.error('加载可选活动列表失败')
  }finally {
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
  listRole(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
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
  proxy.$modal.confirm('是否确认删除编号为"' + id + '"的数据项?').then(function () {
    return delRole(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

// 统一上传成功处理
function handleSuccess(res, field,filed1,field2) {
  if (res.code === 200) {
    debugger
    this.form[field] = res.data.url;
    this.form[filed1] = res.data.hash;
    this.form[field2] = res.data.size;
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
    packFiles:[],
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
  const actionUrl = row.actionUrl;
  const imageUrl = row.imageUrl;
  const audioUrl = row.audioUrl;
  const coverUrl = row.coverUrl;
  const coverContent = row.coverContent;
  getRole(id).then(response => {
    debugger
    form.value = response.data;
    form.actionUrl = actionUrl;
    form.imageUrl = imageUrl;
    form.coverUrl = coverUrl;
    form.coverContent = coverContent;
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
        addPost(form.value).then(response => {
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

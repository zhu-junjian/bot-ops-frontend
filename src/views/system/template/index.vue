<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="108px">
         <el-form-item label="所属大类" prop="categoryName">
            <el-input
               v-model="queryParams.categoryName"
               placeholder="请输入大类名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
        <el-form-item label="模板名" prop="templateName">
          <el-input
              v-model="queryParams.templateName"
              placeholder="请输入模板名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
          />
        </el-form-item>
<!--         <el-form-item label="状态" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="角色状态"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>-->
<!--         <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
            ></el-date-picker>
         </el-form-item>-->
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
       <el-table-column label="编号" prop="id" width="60" />
       <el-table-column label="所属大类" prop="categoryName"  width="90"/>
       <el-table-column label="模板名" prop="name"  width="90" />
       <el-table-column label="视频链接" prop="videoUrl" :show-overflow-tooltip="true" width="240" />
       <el-table-column label="音频链接" prop="audioUrl" :show-overflow-tooltip="true" width="240"/>
<!--       <el-table-column label="音频作者" prop="audioAuthor" width="80" />-->
       <el-table-column label="动作链接" prop="actionUrl" :show-overflow-tooltip="true" width="240" />
       <el-table-column label="封面" prop="coverUrl" :show-overflow-tooltip="true" width="240" />
       <el-table-column label="封面内容" prop="coverContentUrl" :show-overflow-tooltip="true" width="240" />
<!--       <el-table-column label="状态" align="center" width="100">
         <template #default="scope">
           <el-switch
               v-model="scope.row.status"
               active-value="0"
               inactive-value="1"
               @change="handleStatusChange(scope.row)"
           ></el-switch>
         </template>
       </el-table-column>-->
       <el-table-column label="创建时间" align="center" prop="createTime"  >
         <template #default="scope">
           <span>{{ parseTime(scope.row.createTime) }}</span>
         </template>
       </el-table-column>
       <el-table-column label="操作" align="center" class-name="small-padding fixed-width" >
         <template #default="scope">
<!--           <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1">
             <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" ></el-button>
           </el-tooltip>-->
           <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1">
             <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
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
           <el-form-item label="所属大类" prop="categoryId" ><!-- 此处的prop属性和提示有关-->
             <el-input v-model="form.categoryId" placeholder="请输入所属大类Id" />
           </el-form-item>
            <el-form-item label="模板名称" prop="name"><!-- 此处的prop属性和提示有关-->
               <el-input v-model="form.name" placeholder="请输入模板名称" />
            </el-form-item>
            <el-form-item label="模板顺序" prop="officialWeight">
               <el-input-number v-model="form.officialWeight" controls-position="right" :min="0" />
            </el-form-item>
           <!-- 新增文件上传表单项 -->
<!--           <el-form-item label="文件上传" prop="fileList">
             <el-upload
                 v-model:file-list="form.fileList"
                 class="upload-demo"
                 action="/api/upload"
             :on-success="handleSuccess"
             :before-upload="beforeUpload"
             :limit="3"
             :on-exceed="handleExceed"
             :accept="'.png,.jpg'"
             >
             <el-button type="primary">点击上传</el-button>
             <template #tip>
               <div class="el-upload__tip">
                 支持扩展名：.pdf/.doc/.docx，单个文件不超过10MB
               </div>
             </template>
             </el-upload>
           </el-form-item>-->

           <!-- 动作文件 -->
           <el-form-item label="动作文件" prop="actionUrl">
             <el-upload
                 action="/dev-api/template/upload"
                 :on-success="(res) => handleSuccess(res, 'actionUrl')"
                 :before-upload="(file) => beforeUpload(file, ['png', 'jpg'], 50)"
                 :accept="'.png,.jpg,.csv'"
             >
               <el-button type="primary">点击上传</el-button>
               <div class="el-upload__tip">支持.png,.jpg,.csv格式，不超过50MB</div>
<!--               <div v-if="form.actionUrl" class="upload-success">
                 已上传：{{ form.actionUrl}}
               </div>-->
             </el-upload>
           </el-form-item>

           <!-- 视频文件 -->
           <el-form-item label="视频文件" prop="videoUrl">
             <el-upload
                 action="/dev-api/template/upload"
                 :on-success="(res) => handleSuccess(res, 'videoUrl')"
                 :before-upload="(file) => beforeUpload(file, ['mp4', 'mov'], 500)"
                 :accept="'.mp4,.mov'"
             >
               <el-button type="primary">点击上传</el-button>
               <div class="el-upload__tip">支持.mp4/.mov格式，不超过500MB</div>
<!--               <div v-if="form.videoUrl" class="upload-success">
                 已上传：{{ form.videoUrl }}
               </div>-->
             </el-upload>
           </el-form-item>
           <!-- 视频文件 -->
           <el-form-item label="音频文件" prop="audioUrl">
             <el-upload
                 action="/dev-api/template/upload"
                 :on-success="(res) => handleSuccess(res, 'audioUrl')"
                 :before-upload="(file) => beforeUpload(file, ['mp3'], 500)"
                 :accept="'.mp3'"
             >
               <el-button type="primary">点击上传</el-button>
               <div class="el-upload__tip">支持.mp3</div>
               <!--               <div v-if="form.videoUrl" class="upload-success">
                                已上传：{{ form.videoUrl }}
                              </div>-->
             </el-upload>
           </el-form-item>
           <!-- 视频文件 -->
           <el-form-item label="封面图片" prop="coverUrl">
             <el-upload
                 action="/dev-api/template/upload"
                 :on-success="(res) => handleSuccess(res, 'coverUrl')"
                 :before-upload="(file) => beforeUpload(file, ['png', 'jpg'], 500)"
                 :accept="'.jpg,.png'"
             >
               <el-button type="primary">点击上传</el-button>
               <div class="el-upload__tip">支持.jpg/.jpg</div>
               <!--               <div v-if="form.videoUrl" class="upload-success">
                                已上传：{{ form.videoUrl }}
                              </div>-->
             </el-upload>
           </el-form-item>
           <!-- 视频文件 -->
           <el-form-item label="封面内容" prop="coverContentUrl">
             <el-upload
                 action="/dev-api/template/upload"
                 :on-success="(res) => handleSuccess(res, 'coverContentUrl')"
                 :before-upload="(file) => beforeUpload(file, ['mp4', 'mov'], 500)"
                 :accept="'.mp4,.mov'"
             >
               <el-button type="primary">点击上传</el-button>
               <div class="el-upload__tip">支持.mp4/.mov格式，不超过500MB</div>
               <!--               <div v-if="form.videoUrl" class="upload-success">
                                已上传：{{ form.videoUrl }}
                              </div>-->
             </el-upload>
           </el-form-item>
<!--            <el-form-item label="状态">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_normal_disable"
                     :key="dict.value"
                     :value="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="备注">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>-->
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 分配角色数据权限对话框 -->
      <el-dialog :title="title" v-model="openDataScope" width="500px" append-to-body>
         <el-form :model="form" label-width="80px">
            <el-form-item label="角色名称">
               <el-input v-model="form.roleName" :disabled="true" />
            </el-form-item>
            <el-form-item label="权限字符">
               <el-input v-model="form.roleKey" :disabled="true" />
            </el-form-item>
            <el-form-item label="权限范围">
               <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
                  <el-option
                     v-for="item in dataScopeOptions"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
                  ></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="数据权限" v-show="form.dataScope == 2">
               <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
               <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
               <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
               <el-tree
                  class="tree-border"
                  :data="deptOptions"
                  show-checkbox
                  default-expand-all
                  ref="deptRef"
                  node-key="id"
                  :check-strictly="!form.deptCheckStrictly"
                  empty-text="加载中，请稍候"
                  :props="{ label: 'label', children: 'children' }"
               ></el-tree>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitDataScope">确 定</el-button>
               <el-button @click="cancelDataScope">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Role">
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from "@/api/system/template";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "@/api/system/menu";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

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
    categoryName: undefined,
    templateName: undefined,
    status: undefined
  },
  rules: {
    name: [{ required: true, message: "模板名称不能为空", trigger: "blur" }],
    categoryId: [{ required: true, message: "大类Id不能为空", trigger: "blur" }],
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
  proxy.$modal.confirm('是否确认删除角色编号为"' + id + '"的数据项?').then(function () {
    return delRole(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

// 统一上传成功处理
function handleSuccess(res, field) {
  console.log(res);
  if (res.code === 200) {
    this.form[field] = res.msg
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

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 角色状态修改 */
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.roleName + '"角色吗?').then(function () {
    return changeRoleStatus(row.roleId, row.status);
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
    id: undefined,
    name: undefined,
    roleKey: undefined,
    officialWeight: 0,
    actionUrl:undefined,
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
  title.value = "添加角色";
}

/** 修改角色 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
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
  title.value = "修改角色";
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

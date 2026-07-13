<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="100px">
         <el-form-item label="平台类型" prop="platformType">
            <el-select v-model="queryParams.platformType" placeholder="请选择平台" clearable @change="handleQuery" style="width: 140px">
               <el-option label="全部" :value="undefined" />
               <el-option label="Android" :value="0" />
               <el-option label="iOS" :value="1" />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="versionList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="编号" align="center" prop="id" width="70" />
         <el-table-column label="平台" align="center" prop="platformType" width="100">
            <template #default="scope">
               <el-tag :type="scope.row.platformType === 0 ? 'success' : 'warning'">
                  {{ scope.row.platformType === 0 ? 'Android' : 'iOS' }}
               </el-tag>
            </template>
         </el-table-column>
         <el-table-column label="版本号" align="center" prop="version" min-width="100" />
         <el-table-column label="构建号" align="center" prop="buildCode" width="110" />
         <el-table-column label="下载地址" align="center" prop="downloadUrl" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="更新日志" align="center" prop="releaseNotes" min-width="160" :show-overflow-tooltip="true" />
         <el-table-column label="状态" align="center" prop="enabled" width="80">
            <template #default="scope">
               <el-tag :type="scope.row.enabled === 1 ? 'success' : 'info'">
                  {{ scope.row.enabled === 1 ? '上架' : '下架' }}
               </el-tag>
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="170">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="120" fixed="right">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
               <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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

      <!-- 新增/编辑对话框 -->
      <el-dialog :title="title" v-model="open" width="550px" append-to-body @close="cancel">
         <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="平台类型" prop="platformType">
               <el-select v-model="form.platformType" placeholder="请选择平台" style="width: 100%">
                  <el-option label="Android" :value="0" />
                  <el-option label="iOS" :value="1" />
               </el-select>
            </el-form-item>
            <el-form-item label="版本号" prop="version">
               <el-input v-model="form.version" placeholder="如 1.3.0" />
            </el-form-item>
            <el-form-item label="构建号" prop="buildCode">
               <el-input-number v-model="form.buildCode" :min="1" placeholder="如 26070901" style="width: 100%" controls-position="right" />
            </el-form-item>
            <el-form-item label="下载地址" prop="downloadUrl">
               <el-input v-model="form.downloadUrl" placeholder="请输入下载地址（选填）" />
            </el-form-item>
            <el-form-item label="更新日志" prop="releaseNotes">
               <el-input v-model="form.releaseNotes" type="textarea" placeholder="请输入更新日志（选填）" />
            </el-form-item>
            <el-form-item label="状态" prop="enabled">
               <el-radio-group v-model="form.enabled">
                  <el-radio :value="1">上架</el-radio>
                  <el-radio :value="0">下架</el-radio>
               </el-radio-group>
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

<script setup name="AppVersion">
import { listAppVersion, addAppVersion, updateAppVersion, delAppVersion } from "@/api/system/appVersion";
import { getCurrentInstance, ref, reactive, toRefs, onMounted } from 'vue'

const { proxy } = getCurrentInstance();

const versionList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    platformType: undefined
  },
  rules: {
    platformType: [{ required: true, message: "平台类型不能为空", trigger: "change" }],
    version: [{ required: true, message: "版本号不能为空", trigger: "blur" }],
    buildCode: [{ required: true, message: "构建号不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询列表 */
function getList() {
  loading.value = true;
  listAppVersion(queryParams.value).then(response => {
    versionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "新增版本";
}

/** 修改 */
function handleUpdate(row) {
  reset();
  form.value = {
    id: row.id,
    platformType: row.platformType,
    version: row.version,
    buildCode: row.buildCode,
    downloadUrl: row.downloadUrl,
    releaseNotes: row.releaseNotes,
    enabled: row.enabled
  };
  open.value = true;
  title.value = "修改版本";
}

/** 提交 */
function submitForm() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateAppVersion(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAppVersion(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除 */
function handleDelete(row) {
  const targetIds = row.id ? [row.id] : ids.value;
  proxy.$modal.confirm('确认删除所选的版本记录吗？').then(function () {
    return delAppVersion(targetIds.join(","));
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 取消 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    platformType: undefined,
    version: undefined,
    buildCode: undefined,
    downloadUrl: undefined,
    releaseNotes: undefined,
    enabled: 1
  };
  proxy.resetForm("formRef");
}

onMounted(() => {
  getList();
});
</script>

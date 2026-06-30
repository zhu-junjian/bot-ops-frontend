<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="80px">
         <el-form-item label="加工厂" prop="factory">
            <el-input v-model="queryParams.factory" placeholder="请输入加工厂" clearable @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="产品型号" prop="productModel">
            <el-input v-model="queryParams.productModel" placeholder="请输入产品型号" clearable @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="系统模块" prop="systemModule">
            <el-input v-model="queryParams.systemModule" placeholder="请输入系统模块" clearable @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="芯片平台" prop="chipPlatform">
            <el-input v-model="queryParams.chipPlatform" placeholder="请输入芯片平台" clearable @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="版本号" prop="version">
            <el-input v-model="queryParams.version" placeholder="请输入版本号" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="firmwareList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="编号" align="center" prop="id" width="70" />
         <el-table-column label="加工厂" align="center" prop="factory" min-width="85" :show-overflow-tooltip="true" />
         <el-table-column label="产品型号" align="center" prop="productModel" min-width="70" />
         <el-table-column label="系统模块" align="center" prop="systemModule" min-width="70" />
         <el-table-column label="芯片平台" align="center" prop="chipPlatform" min-width="85" />
         <el-table-column label="版本号" align="center" prop="version" min-width="85" />
         <el-table-column label="文件名" align="center" prop="fileName" min-width="105" :show-overflow-tooltip="true" />
         <el-table-column label="OSS地址" align="center" prop="ossUrl" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="文件大小" align="center" prop="fileSize" width="100">
            <template #default="scope">
               <span>{{ formatFileSize(scope.row.fileSize) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="SHA256" align="center" prop="fileHash" width="120">
            <template #default="scope">
               <el-tooltip :content="scope.row.fileHash" placement="top">
                  <span>{{ scope.row.fileHash ? scope.row.fileHash.substring(0, 8) + '…' : '' }}</span>
               </el-tooltip>
            </template>
         </el-table-column>
         <el-table-column label="状态" align="center" prop="status" width="80">
            <template #default="scope">
               <el-tag :type="scope.row.status === 0 ? 'success' : 'info'">{{ scope.row.status === 0 ? '正常' : '停用' }}</el-tag>
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
            <el-form-item label="加工厂" prop="factory">
               <el-select v-model="form.factory" placeholder="请选择或输入" clearable filterable allow-create style="width: 100%">
                  <el-option v-for="item in factoryOptions" :key="item" :label="item" :value="item" />
               </el-select>
            </el-form-item>
            <el-form-item label="产品型号" prop="productModel">
               <el-select v-model="form.productModel" placeholder="请选择或输入" clearable filterable allow-create style="width: 100%">
                  <el-option v-for="item in productModelOptions" :key="item" :label="item" :value="item" />
               </el-select>
            </el-form-item>
            <el-form-item label="系统模块" prop="systemModule">
               <el-select v-model="form.systemModule" placeholder="请选择或输入" clearable filterable allow-create style="width: 100%">
                  <el-option v-for="item in systemModuleOptions" :key="item" :label="item" :value="item" />
               </el-select>
            </el-form-item>
            <el-form-item label="芯片平台" prop="chipPlatform">
               <el-select v-model="form.chipPlatform" placeholder="请选择或输入" clearable filterable allow-create style="width: 100%">
                  <el-option v-for="item in chipPlatformOptions" :key="item" :label="item" :value="item" />
               </el-select>
            </el-form-item>
            <el-form-item label="版本号" prop="version">
               <el-input v-model="form.version" placeholder="请输入固件版本号" />
            </el-form-item>
            <el-form-item label="固件文件" prop="ossUrl">
               <el-upload
                  v-model:file-list="form.fileList"
                  :action="uploadUrl"
                  :on-success="handleUploadSuccess"
                  :before-upload="beforeUpload"
                  :limit="1"
               >
                  <el-button type="primary">点击上传</el-button>
                  <div class="el-upload__tip">上传固件文件，支持任意格式</div>
               </el-upload>
            </el-form-item>
            <el-form-item label="OSS地址">
               <el-input v-model="form.ossUrl" readonly placeholder="上传后自动填充" />
            </el-form-item>
            <el-form-item label="SHA256">
               <el-input v-model="form.fileHash" readonly placeholder="上传后自动填充" />
            </el-form-item>
            <el-form-item label="文件大小">
               <el-input :model-value="form.fileSize ? formatFileSize(form.fileSize) : ''" readonly placeholder="上传后自动填充" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
            <el-form-item label="状态" prop="status" v-if="form.id">
               <el-radio-group v-model="form.status">
                  <el-radio :value="0">正常</el-radio>
                  <el-radio :value="1">停用</el-radio>
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

<script setup name="ProFirmware">
import { listProFirmware, getProFirmware, addProFirmware, updateProFirmware, delProFirmware, getFirmwareOptions, uploadUrl } from "@/api/system/proFirmware";
import { getCurrentInstance, ref, reactive, toRefs, onMounted } from 'vue'

const { proxy } = getCurrentInstance();

const firmwareList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const factoryOptions = ref([]);
const productModelOptions = ref([]);
const systemModuleOptions = ref([]);
const chipPlatformOptions = ref([]);

const data = reactive({
  form: {
    fileList: []
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    factory: undefined,
    productModel: undefined,
    systemModule: undefined,
    chipPlatform: undefined,
    version: undefined
  },
  rules: {
    factory: [{ required: true, message: "加工厂不能为空", trigger: "blur" }],
    productModel: [{ required: true, message: "产品型号不能为空", trigger: "blur" }],
    systemModule: [{ required: true, message: "系统模块不能为空", trigger: "blur" }],
    chipPlatform: [{ required: true, message: "芯片平台不能为空", trigger: "blur" }],
    version: [{ required: true, message: "版本号不能为空", trigger: "blur" }],
    ossUrl: [{ required: true, message: "请上传固件文件", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 加载下拉选项 */
function loadOptions() {
  getFirmwareOptions().then(res => {
    factoryOptions.value = res.data.factories || [];
    productModelOptions.value = res.data.productModels || [];
    systemModuleOptions.value = res.data.systemModules || [];
    chipPlatformOptions.value = res.data.chipPlatforms || [];
  }).catch(() => {});
}

/** 查询列表 */
function getList() {
  loading.value = true;
  listProFirmware(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    firmwareList.value = response.rows;
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
  dateRange.value = [];
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
  title.value = "新增固件";
}

/** 修改 */
function handleUpdate(row) {
  reset();
  getProFirmware(row.id).then(res => {
    form.value = res.data;
    form.value.fileList = [];
    open.value = true;
    title.value = "修改固件";
  });
}

/** 提交 */
function submitForm() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateProFirmware(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
          loadOptions();
        });
      } else {
        addProFirmware(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
          loadOptions();
        });
      }
    }
  });
}

/** 删除 */
function handleDelete(row) {
  const targetIds = row.id ? [row.id] : ids.value;
  proxy.$modal.confirm('确认删除所选的固件记录吗？').then(function () {
    return delProFirmware(targetIds.join(","));
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
    factory: undefined,
    productModel: undefined,
    systemModule: undefined,
    chipPlatform: undefined,
    version: undefined,
    ossUrl: undefined,
    fileHash: undefined,
    fileSize: undefined,
    fileName: undefined,
    status: 0,
    remark: undefined,
    fileList: []
  };
  proxy.resetForm("formRef");
}

/** 上传成功回调 */
function handleUploadSuccess(res, file) {
  if (res.code === 200 && res.data) {
    form.value.ossUrl = res.data.url;
    form.value.fileHash = res.data.hash;
    form.value.fileSize = res.data.size;
    form.value.fileName = file.name;
    proxy.$refs["formRef"].clearValidate("ossUrl");
    proxy.$modal.msgSuccess("上传成功");
  } else {
    proxy.$modal.msgError(res.msg || "上传失败");
  }
}

/** 上传前校验 */
function beforeUpload(file) {
  return true;
}

/** 格式化文件大小 */
function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

onMounted(() => {
  loadOptions();
  getList();
});
</script>

<style scoped>
.oss-url-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}
.oss-url-text {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
  display: inline-block;
}
.copy-btn {
  font-size: 12px;
  padding: 0 4px;
  flex-shrink: 0;
}
</style>

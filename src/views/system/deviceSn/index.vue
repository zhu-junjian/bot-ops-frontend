<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="设备SN" prop="sn">
            <el-input
               v-model="queryParams.sn"
               placeholder="请输入设备SN"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="产品型号" prop="productModel">
            <el-select
               v-model="queryParams.productModel"
               placeholder="请选择产品型号"
               clearable
               style="width: 200px"
            >
               <el-option label="C1" value="C1" />
               <el-option label="C2" value="C2" />
            </el-select>
         </el-form-item>
         <el-form-item label="工厂代号" prop="factoryCode">
            <el-select
               v-model="queryParams.factoryCode"
               placeholder="请选择工厂代号"
               clearable
               style="width: 200px"
            >
               <el-option label="赣锋 GF" value="GF" />
               <el-option label="众邦 ZB" value="ZB" />
               <el-option label="镜识 JS" value="JS" />
            </el-select>
         </el-form-item>
         <el-form-item label="生产日期" prop="productionDate">
            <el-input
               v-model="queryParams.productionDate"
               placeholder="请输入生产日期，如250702"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="WiFi名称" prop="wifiName">
            <el-input
               v-model="queryParams.wifiName"
               placeholder="请输入WiFi名称"
               clearable
               style="width: 200px"
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
               @click="handleGenerate"
            >生成SN</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               :disabled="ids.length === 0"
               @click="handleExport"
            >导出Excel</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="ids.length === 0"
               @click="handleDelete"
            >删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="snList" @selection-change="handleSelectionChange" style="width: 100%">
         <el-table-column type="selection" width="50" align="center" />
         <el-table-column label="序号" width="55" type="index" align="center">
            <template #default="scope">
               <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column label="设备SN" align="center" prop="sn" min-width="200" :show-overflow-tooltip="true" />
         <el-table-column label="产品型号" align="center" prop="productModel" min-width="90" />
         <el-table-column label="硬件版本" align="center" prop="hardwareVersion" min-width="90" />
         <el-table-column label="工厂代号" align="center" prop="factoryCode" min-width="90" />
         <el-table-column label="生产日期" align="center" prop="productionDate" min-width="100" />
         <el-table-column label="颜色" align="center" prop="colorCode" min-width="70" />
         <el-table-column label="WiFi名称" align="center" prop="wifiName" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="流水号" align="center" prop="serialSeq" min-width="80" />
         <el-table-column label="创建时间" align="center" prop="createTime" min-width="160" show-overflow-tooltip="true" />
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 生成SN弹窗 -->
      <el-dialog title="生成设备SN" v-model="generateDialog.visible" width="600px" @close="resetGenerateForm">
         <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="110px">
            <el-row :gutter="20">
               <el-col :span="12">
                  <el-form-item label="产品型号" prop="productModel">
                     <el-select v-model="generateForm.productModel" placeholder="请选择" style="width: 100%">
                        <el-option label="C1" value="C1" />
                        <el-option label="C2" value="C2" />
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="硬件版本" prop="hardwareVersion">
                     <el-input v-model="generateForm.hardwareVersion" placeholder="01-99" maxlength="2" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row :gutter="20">
               <el-col :span="12">
                  <el-form-item label="工厂代号" prop="factoryCode">
                     <el-select v-model="generateForm.factoryCode" placeholder="请选择" style="width: 100%">
                        <el-option label="赣锋 GF" value="GF" />
                        <el-option label="众邦 ZB" value="ZB" />
                        <el-option label="镜识 JS" value="JS" />
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="生产日期" prop="productionDate">
                     <el-input v-model="generateForm.productionDate" placeholder="250702" maxlength="6" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row :gutter="20">
               <el-col :span="12">
                  <el-form-item label="颜色代号" prop="colorCode">
                     <el-select v-model="generateForm.colorCode" placeholder="请选择" style="width: 100%">
                        <el-option label="银色 S" value="S" />
                        <el-option label="缇芙丽蓝 B" value="B" />
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="数量" prop="quantity">
                     <el-input-number v-model="generateForm.quantity" :min="1" :max="99999" style="width: 100%" controls-position="right" />
                  </el-form-item>
               </el-col>
            </el-row>

            <!-- 自动流水号预览区 -->
            <el-divider v-if="nextSeqInfo.nextSeq" />
            <div v-if="nextSeqInfo.nextSeq" class="sn-preview">
               <el-alert type="info" :closable="false" show-icon>
                  <template #title>
                     <span>流水号由系统自动计算，无需手动输入</span>
                  </template>
               </el-alert>
               <el-descriptions :column="1" border size="small" style="margin-top: 12px">
                  <el-descriptions-item label="当前最大流水号">
                     {{ padSeq(nextSeqInfo.currentMaxSeq) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="将要生成的流水号范围">
                     {{ padSeq(nextSeqInfo.nextSeq) }} ~ {{ padSeq(nextSeqInfo.nextSeq + generateForm.quantity - 1) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="首条SN预览">
                     {{ nextSeqInfo.previewSn }}
                  </el-descriptions-item>
                  <el-descriptions-item label="首条WiFi名称">
                     {{ nextSeqInfo.previewWifi }}
                  </el-descriptions-item>
               </el-descriptions>
               <el-alert
                  v-if="nextSeqInfo.nextSeq + generateForm.quantity - 1 > 99999"
                  type="error"
                  :closable="false"
                  show-icon
                  style="margin-top: 12px"
               >
                  <template #title>
                     <span>流水号超出范围（最大 99999），请减少数量</span>
                  </template>
               </el-alert>
            </div>
            <div v-else-if="generateForm.productModel && generateForm.hardwareVersion && generateForm.factoryCode && generateForm.productionDate && generateForm.colorCode" class="sn-preview">
               <el-alert type="warning" :closable="false" show-icon>
                  <template #title>
                     <span>正在查询流水号...</span>
                  </template>
               </el-alert>
            </div>
         </el-form>

         <template #footer>
            <el-button @click="generateDialog.visible = false">取消</el-button>
            <el-button type="primary" :loading="generateDialog.submitting" @click="submitGenerate">确认生成并入库</el-button>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="DeviceSn">
import { listDeviceSn, getNextSeq, batchGenerateSn, delDeviceSn } from "@/api/system/deviceSn";

const { proxy } = getCurrentInstance();

const snList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const ids = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sn: undefined,
    productModel: undefined,
    factoryCode: undefined,
    productionDate: undefined,
    wifiName: undefined
  }
});

const { queryParams } = toRefs(data);

// ============ 生成弹窗 ============

const generateFormDefault = {
  productModel: undefined,
  hardwareVersion: undefined,
  factoryCode: undefined,
  productionDate: undefined,
  colorCode: undefined,
  quantity: 1
};

const generateForm = reactive({ ...generateFormDefault });

const generateRules = {
  productModel: [
    { required: true, message: '请选择产品型号', trigger: 'change' }
  ],
  hardwareVersion: [
    { required: true, message: '请输入硬件版本', trigger: 'blur' },
    { pattern: /^\d{2}$/, message: '硬件版本为2位数字，如 01', trigger: 'blur' }
  ],
  factoryCode: [
    { required: true, message: '请选择工厂代号', trigger: 'change' }
  ],
  productionDate: [
    { required: true, message: '请输入生产日期', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '生产日期为6位数字YYMMDD，如 250702', trigger: 'blur' }
  ],
  colorCode: [
    { required: true, message: '请选择颜色代号', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' }
  ]
};

const generateDialog = reactive({
  visible: false,
  submitting: false
});

const nextSeqInfo = ref({});

let seqQueryTimer = null;

/** 监听参数变化，自动查询下一段流水号 */
watch(
  () => [generateForm.productModel, generateForm.hardwareVersion,
         generateForm.factoryCode, generateForm.productionDate,
         generateForm.colorCode],
  ([model, hw, factory, date, color]) => {
    if (!model || !hw || !factory || !date || !color) {
      nextSeqInfo.value = {};
      return;
    }
    // 防抖
    if (seqQueryTimer) clearTimeout(seqQueryTimer);
    seqQueryTimer = setTimeout(() => {
      getNextSeq({
        productModel: model,
        hardwareVersion: hw,
        factoryCode: factory,
        productionDate: date,
        colorCode: color
      }).then(res => {
        nextSeqInfo.value = res.data || {};
      }).catch(() => {
        nextSeqInfo.value = {};
      });
    }, 300);
  },
);

function padSeq(n) {
  if (n == null) return '-----';
  return String(n).padStart(5, '0');
}

// ============ 列表查询 ============

function getList() {
  loading.value = true;
  listDeviceSn(queryParams.value).then(response => {
    snList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// ============ 表格选择 ============

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
}

// ============ 生成SN ============

function handleGenerate() {
  resetGenerateForm();
  generateDialog.visible = true;
}

function resetGenerateForm() {
  Object.assign(generateForm, generateFormDefault);
  nextSeqInfo.value = {};
  if (seqQueryTimer) clearTimeout(seqQueryTimer);
  proxy.resetForm("generateFormRef");
}

function submitGenerate() {
  proxy.$refs.generateFormRef.validate(async (valid) => {
    if (!valid) return;
    // 流水号范围校验
    if (nextSeqInfo.value.nextSeq && nextSeqInfo.value.nextSeq + generateForm.quantity - 1 > 99999) {
      proxy.$modal.msgWarning('流水号超出范围（最大99999），请减少数量');
      return;
    }
    generateDialog.submitting = true;
    try {
      await batchGenerateSn({
        productModel: generateForm.productModel,
        hardwareVersion: generateForm.hardwareVersion,
        factoryCode: generateForm.factoryCode,
        productionDate: generateForm.productionDate,
        colorCode: generateForm.colorCode,
        quantity: generateForm.quantity
      });
      proxy.$modal.msgSuccess(`成功生成 ${generateForm.quantity} 条SN`);
      generateDialog.visible = false;
      getList();
    } catch (e) {
      // 错误由 request 拦截器统一处理
    } finally {
      generateDialog.submitting = false;
    }
  });
}

// ============ 导出Excel ============

function handleExport() {
  proxy.$modal.confirm('确认导出选中的 ' + ids.value.length + ' 条SN记录吗？').then(function() {
    proxy.download('/device-sn/export', { ids: ids.value.join(',') }, `设备SN_${new Date().getTime()}.xlsx`);
  }).catch(() => {});
}

// ============ 删除 ============

function handleDelete() {
  proxy.$modal.confirm('确认删除选中的 ' + ids.value.length + ' 条SN记录吗？').then(function() {
    return delDeviceSn(ids.value.join(','));
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess('删除成功');
  }).catch(() => {});
}

getList();
</script>

<style scoped>
.sn-preview {
  margin-top: 8px;
}
</style>

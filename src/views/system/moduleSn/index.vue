<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="模组SN" prop="sn">
            <el-input
               v-model="queryParams.sn"
               placeholder="请输入模组SN"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="归属项目" prop="projectCode">
            <el-select
               v-model="queryParams.projectCode"
               placeholder="请选择归属项目"
               clearable
               style="width: 200px"
            >
               <el-option label="C1" value="C1" />
               <el-option label="C2" value="C2" />
               <el-option label="A2" value="A2" />
            </el-select>
         </el-form-item>
         <el-form-item label="物料分类" prop="materialCategory">
            <el-select
               v-model="queryParams.materialCategory"
               placeholder="请选择物料分类"
               clearable
               style="width: 200px"
            >
               <el-option
                  v-for="item in materialCategoryOptions"
                  :key="item.code"
                  :label="item.code + ' - ' + item.name"
                  :value="item.code"
               />
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
               v-hasPermi="['system:moduleSn:add']"
            >生成SN</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               :disabled="ids.length === 0"
               @click="handleExport"
               v-hasPermi="['system:moduleSn:export']"
            >导出Excel</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="ids.length === 0"
               @click="handleDelete"
               v-hasPermi="['system:moduleSn:remove']"
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
         <el-table-column label="模组SN" align="center" prop="sn" min-width="240" :show-overflow-tooltip="true" />
         <el-table-column label="归属项目" align="center" prop="projectCode" min-width="90" />
         <el-table-column label="物料分类" align="center" prop="materialCategory" min-width="100" />
         <el-table-column label="物料子分类" align="center" prop="materialSubCategory" min-width="120" />
         <el-table-column label="工厂代号" align="center" prop="factoryCode" min-width="90" />
         <el-table-column label="硬件版本" align="center" prop="hardwareVersion" min-width="90" />
         <el-table-column label="生产日期" align="center" prop="productionDate" min-width="100" />
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
      <el-dialog title="生成模组SN" v-model="generateDialog.visible" width="650px" @close="resetGenerateForm">
         <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="110px">
            <el-row :gutter="20">
               <el-col :span="12">
                  <el-form-item label="归属项目" prop="projectCode">
                     <el-select v-model="generateForm.projectCode" placeholder="请选择" style="width: 100%">
                        <el-option label="C1" value="C1" />
                        <el-option label="C2" value="C2" />
                        <el-option label="A2" value="A2" />
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="工厂代号" prop="factoryCode">
                     <el-select v-model="generateForm.factoryCode" placeholder="请选择" style="width: 100%">
                        <el-option label="赣锋 GF" value="GF" />
                        <el-option label="众邦 ZB" value="ZB" />
                        <el-option label="镜识 JS" value="JS" />
                     </el-select>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row :gutter="20">
               <el-col :span="12">
                  <el-form-item label="物料分类" prop="materialCategory">
                     <el-select v-model="generateForm.materialCategory" placeholder="请选择" style="width: 100%" @change="onCategoryChange">
                        <el-option
                           v-for="item in materialCategoryOptions"
                           :key="item.code"
                           :label="item.code + ' - ' + item.name"
                           :value="item.code"
                        />
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="物料子分类" prop="materialSubCategory">
                     <el-select v-model="generateForm.materialSubCategory" placeholder="请选择" style="width: 100%" :disabled="!generateForm.materialCategory">
                        <el-option
                           v-for="item in currentSubCategories"
                           :key="item"
                           :label="item"
                           :value="item"
                        />
                     </el-select>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row :gutter="20">
               <el-col :span="12">
                  <el-form-item label="硬件版本" prop="hardwareVersion">
                     <el-input v-model="generateForm.hardwareVersion" placeholder="01-99" maxlength="2" />
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
                  <el-form-item label="数量" prop="quantity">
                     <el-input-number v-model="generateForm.quantity" :min="1" :max="9999" style="width: 100%" controls-position="right" />
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
               </el-descriptions>
               <el-alert
                  v-if="nextSeqInfo.nextSeq + generateForm.quantity - 1 > 9999"
                  type="error"
                  :closable="false"
                  show-icon
                  style="margin-top: 12px"
               >
                  <template #title>
                     <span>流水号超出范围（最大 9999），请减少数量</span>
                  </template>
               </el-alert>
            </div>
            <div v-else-if="generateForm.projectCode && generateForm.materialCategory && generateForm.materialSubCategory && generateForm.factoryCode && generateForm.hardwareVersion && generateForm.productionDate" class="sn-preview">
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

<script setup name="ModuleSn">
import { listModuleSn, getNextSeq, batchGenerateSn, delModuleSn } from "@/api/system/moduleSn";

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
    projectCode: undefined,
    materialCategory: undefined,
    factoryCode: undefined,
    productionDate: undefined
  }
});

const { queryParams } = toRefs(data);

// ============ 模组分类数据 ============

const materialCategoryOptions = [
  { code: 'HIPX', name: '侧摆关节', subs: ['LFRR', 'LRRF'] },
  { code: 'HIPY', name: '髋关节',   subs: ['LFXX', 'RFXX', 'LRXX', 'RRXX'] },
  { code: 'KNEE', name: '膝关节',   subs: ['6512', '6525'] },
  { code: 'MAIN', name: '主控盒',   subs: ['A733'] },
  { code: 'BATY', name: '动力电池', subs: ['8S2P', '8S5P'] }
];

const currentSubCategories = ref([]);

function onCategoryChange(val) {
  generateForm.materialSubCategory = undefined;
  nextSeqInfo.value = {};
  if (val) {
    const cat = materialCategoryOptions.find(c => c.code === val);
    currentSubCategories.value = cat ? cat.subs : [];
  } else {
    currentSubCategories.value = [];
  }
}

// ============ 生成弹窗 ============

const generateFormDefault = {
  projectCode: undefined,
  materialCategory: undefined,
  materialSubCategory: undefined,
  factoryCode: undefined,
  hardwareVersion: undefined,
  productionDate: undefined,
  quantity: 1
};

const generateForm = reactive({ ...generateFormDefault });

const generateRules = {
  projectCode: [
    { required: true, message: '请选择归属项目', trigger: 'change' }
  ],
  materialCategory: [
    { required: true, message: '请选择物料分类', trigger: 'change' }
  ],
  materialSubCategory: [
    { required: true, message: '请选择物料子分类', trigger: 'change' }
  ],
  factoryCode: [
    { required: true, message: '请选择工厂代号', trigger: 'change' }
  ],
  hardwareVersion: [
    { required: true, message: '请输入硬件版本', trigger: 'blur' },
    { pattern: /^\d{2}$/, message: '硬件版本为2位数字，如 01', trigger: 'blur' }
  ],
  productionDate: [
    { required: true, message: '请输入生产日期', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '生产日期为6位数字YYMMDD，如 250702', trigger: 'blur' }
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
  () => [generateForm.projectCode, generateForm.materialCategory,
         generateForm.materialSubCategory, generateForm.factoryCode,
         generateForm.hardwareVersion, generateForm.productionDate],
  ([project, cat, sub, factory, hw, date]) => {
    if (!project || !cat || !sub || !factory || !hw || !date) {
      nextSeqInfo.value = {};
      return;
    }
    // 防抖
    if (seqQueryTimer) clearTimeout(seqQueryTimer);
    seqQueryTimer = setTimeout(() => {
      getNextSeq({
        projectCode: project,
        materialCategory: cat,
        materialSubCategory: sub,
        factoryCode: factory,
        hardwareVersion: hw,
        productionDate: date
      }).then(res => {
        nextSeqInfo.value = res.data || {};
      }).catch(() => {
        nextSeqInfo.value = {};
      });
    }, 300);
  },
);

function padSeq(n) {
  if (n == null) return '----';
  return String(n).padStart(4, '0');
}

// ============ 列表查询 ============

function getList() {
  loading.value = true;
  listModuleSn(queryParams.value).then(response => {
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
  currentSubCategories.value = [];
  if (seqQueryTimer) clearTimeout(seqQueryTimer);
  proxy.resetForm("generateFormRef");
}

function submitGenerate() {
  proxy.$refs.generateFormRef.validate(async (valid) => {
    if (!valid) return;
    // 流水号范围校验
    if (nextSeqInfo.value.nextSeq && nextSeqInfo.value.nextSeq + generateForm.quantity - 1 > 9999) {
      proxy.$modal.msgWarning('流水号超出范围（最大9999），请减少数量');
      return;
    }
    generateDialog.submitting = true;
    try {
      await batchGenerateSn({
        projectCode: generateForm.projectCode,
        materialCategory: generateForm.materialCategory,
        materialSubCategory: generateForm.materialSubCategory,
        factoryCode: generateForm.factoryCode,
        hardwareVersion: generateForm.hardwareVersion,
        productionDate: generateForm.productionDate,
        quantity: generateForm.quantity
      });
      proxy.$modal.msgSuccess(`成功生成 ${generateForm.quantity} 条模组SN`);
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
  proxy.$modal.confirm('确认导出选中的 ' + ids.value.length + ' 条模组SN记录吗？').then(function() {
    proxy.download('/module-sn/export', { ids: ids.value.join(',') }, `模组SN_${new Date().getTime()}.xlsx`);
  }).catch(() => {});
}

// ============ 删除 ============

function handleDelete() {
  proxy.$modal.confirm('确认删除选中的 ' + ids.value.length + ' 条模组SN记录吗？').then(function() {
    return delModuleSn(ids.value.join(','));
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

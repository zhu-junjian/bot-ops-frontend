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
               type="primary"
               plain
               icon="Scan"
               @click="handleScan"
            >扫码录入</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Printer"
               :disabled="ids.length === 0"
               @click="handlePrint"
            >打印标签</el-button>
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

      <!-- 打印标签弹窗 -->
      <el-dialog title="打印标签" v-model="printDialog.visible" width="480px" @close="resetPrintDialog">
         <div style="margin-bottom: 16px;">
            <el-alert type="info" :closable="false" show-icon>
               <template #title>
                  已选择 <strong>{{ ids.length }}</strong> 条记录，将生成对应数量的标签并发送到打印机
               </template>
            </el-alert>
         </div>

         <el-form label-width="90px">
            <el-form-item label="打印份数">
               <el-input-number v-model="printDialog.copies" :min="1" :max="10" style="width: 160px" controls-position="right" />
               <span style="color:#999; font-size:12px; margin-left:8px;">每张标签打印几份</span>
            </el-form-item>
            <el-form-item label="打印机状态">
               <el-tag v-if="printDialog.printerOnline" type="success" effect="dark">
                  <el-icon style="margin-right:4px"><CircleCheck /></el-icon> 在线
               </el-tag>
               <el-tag v-else-if="printDialog.checking" type="warning" effect="dark">
                  <el-icon style="margin-right:4px"><Loading /></el-icon> 检测中...
               </el-tag>
               <el-tag v-else type="danger" effect="dark">
                  <el-icon style="margin-right:4px"><CircleClose /></el-icon> 离线
               </el-tag>
               <span v-if="printDialog.printerHost" style="color:#999;font-size:12px;margin-left:8px;">
                  {{ printDialog.printerHost }}:{{ printDialog.printerPort }}
               </span>
            </el-form-item>
            <el-form-item label="标签尺寸">
               <span style="color:#333;font-size:13px;">
                  {{ printDialog.labelWidth }}mm × {{ printDialog.labelHeight }}mm
               </span>
            </el-form-item>
         </el-form>

         <template #footer>
            <el-button @click="printDialog.visible = false">取消</el-button>
            <el-button type="primary" :loading="printDialog.submitting" @click="submitPrint">
               确认打印
            </el-button>
         </template>
      </el-dialog>

      <!-- 扫码录入弹窗 -->
      <el-dialog title="扫码入库" v-model="scanDialog.visible" width="500px" @close="resetScanDialog" @opened="focusScanInput">
         <div style="margin-bottom: 12px;">
            <el-alert type="info" :closable="false" show-icon>
               <template #title>请使用扫码枪扫描设备SN标签条形码</template>
            </el-alert>
         </div>
         <el-input
            ref="scanInputRef"
            v-model="scanDialog.inputSn"
            placeholder="光标在此，扫码后自动提交..."
            size="large"
            clearable
            @keyup.enter="submitScan"
            @keydown.enter="submitScan"
         />
         <div v-if="scanDialog.list.length > 0" style="margin-top:16px;max-height:200px;overflow-y:auto;">
            <el-tag v-for="(item, idx) in scanDialog.list" :key="idx"
                    :type="item.ok ? 'success' : 'danger'"
                    style="display:block;margin-bottom:4px;text-align:left;">
               {{ item.sn }} — {{ item.msg }}
               <span style="float:right;font-size:11px;color:#999">{{ item.time }}</span>
            </el-tag>
         </div>
         <template #footer>
            <el-button @click="scanDialog.visible = false">关闭</el-button>
            <span v-if="scanDialog.okCount > 0" style="color:#67c23a;margin-right:12px;">✅ 本次入库：{{ scanDialog.okCount }} 条</span>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="DeviceSn">
import { listDeviceSn, getNextSeq, batchGenerateSn, scanDeviceSn, delDeviceSn } from "@/api/system/deviceSn";

const { proxy } = getCurrentInstance();

const snList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const ids = ref([]);
const selectedRows = ref([]); // 选中的完整行数据（用于打印）

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

// ============ 打印标签 ============

const printDialog = reactive({
  visible: false,
  submitting: false,
  checking: false,
  printerOnline: false,
  printerHost: '',
  printerPort: '',
  labelWidth: 40,
  labelHeight: 15,
  copies: 1
});

function handlePrint() {
  resetPrintDialog();
  printDialog.visible = true;
  checkPrinterStatus();
}

function resetPrintDialog() {
  printDialog.submitting = false;
  printDialog.checking = false;
  printDialog.printerOnline = false;
  printDialog.printerHost = '';
  printDialog.printerPort = '';
  printDialog.labelWidth = 40;
  printDialog.labelHeight = 15;
  printDialog.copies = 1;
}

/** 查询打印机状态 */
function checkPrinterStatus() {
  printDialog.checking = true;
  printDialog.printerOnline = false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000); // 5秒超时
  fetch('http://localhost:9876/api/status', { signal: controller.signal })
    .then(r => r.json())
    .then(res => {
      clearTimeout(timer);
      const d = res.data || {};
      printDialog.printerOnline = d.online || d.found || false;
      printDialog.printerHost = d.printerName || '';
      printDialog.labelWidth = d.labelWidth || 40;
      printDialog.labelHeight = d.labelHeight || 15;
      printDialog.checking = false;
    }).catch(() => {
      clearTimeout(timer);
      printDialog.printerOnline = false;
      printDialog.checking = false;
    });
}

/** 确认打印 — 直接调本地 Node.js 服务 */
async function submitPrint() {
  if (!printDialog.printerOnline) {
    proxy.$modal.msgWarning('打印机离线，请检查打印机连接后重试');
    return;
  }
  printDialog.submitting = true;
  try {
    const items = selectedRows.value.map(row => ({
      sn: row.sn,
      wifiName: row.wifiName
    }));

    const resp = await fetch('http://localhost:9876/api/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const result = await resp.json();

    if (result.success) {
      proxy.$modal.msgSuccess(`已发送 ${result.data.success} 条标签到打印机`);
    } else {
      proxy.$modal.msgError('打印失败');
    }
    printDialog.visible = false;
  } catch {
    proxy.$modal.msgError('无法连接本地打印服务 (http://localhost:9876)，请确认 tsc-print-service 已启动');
  } finally {
    printDialog.submitting = false;
  }
}

// ============ 扫码入库 ============

const scanInputRef = ref(null);
const scanDialog = reactive({
  visible: false,
  inputSn: '',
  list: [],
  okCount: 0
});

function handleScan() {
  scanDialog.visible = true;
  scanDialog.inputSn = '';
  scanDialog.list = [];
  scanDialog.okCount = 0;
}

function resetScanDialog() {
  scanDialog.inputSn = '';
}

function focusScanInput() {
  scanDialog.inputSn = '';
  scanDialog.list = [];
  scanDialog.okCount = 0;
  nextTick(() => {
    if (scanInputRef.value) scanInputRef.value.focus();
  });
}

// 设备SN格式：C1/C2 + 硬件2位 + 工厂(GF/ZB/JS) + 日期6位 + 颜色(S/B) + 流水5位 = 18位
const DEVICE_SN_RE = /^C[12]\d{2}(GF|ZB|JS)\d{6}[SB]\d{5}$/;

function submitScan() {
  if (scanTimer) clearTimeout(scanTimer);
  const sn = scanDialog.inputSn.trim();
  if (!sn) return;
  const now = new Date().toLocaleTimeString();
  if (!DEVICE_SN_RE.test(sn)) {
    scanDialog.list.unshift({ sn, ok: false, msg: '格式错误（应为18位设备SN）', time: now });
    scanDialog.inputSn = '';
    nextTick(() => { if (scanInputRef.value) scanInputRef.value.focus(); });
    return;
  }
  scanDeviceSn(sn).then(res => {
    scanDialog.list.unshift({ sn, ok: true, msg: res.msg || '入库成功', time: now });
    scanDialog.okCount++;
  }).catch(() => {
    scanDialog.list.unshift({ sn, ok: false, msg: '入库失败（重复或不存在）', time: now });
  });
  scanDialog.inputSn = '';
  nextTick(() => {
    if (scanInputRef.value) scanInputRef.value.focus();
  });
}

// 扫码枪停顿检测：输入变化后 150ms 无新字符 → 自动提交（兜底不发Enter的扫码枪）
let scanTimer = null;
watch(() => scanDialog.inputSn, (val) => {
  if (!val || !scanDialog.visible) return;
  if (scanTimer) clearTimeout(scanTimer);
  scanTimer = setTimeout(() => {
    submitScan();
  }, 150);
});

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
  selectedRows.value = selection;
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

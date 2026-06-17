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
         <el-form-item label="产品型号" prop="model">
            <el-select
               v-model="queryParams.model"
               placeholder="请选择产品型号"
               clearable
               style="width: 150px"
            >
               <el-option label="C2" value="C2" />
            </el-select>
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="请选择状态"
               clearable
               style="width: 150px"
            >
               <el-option label="已入库" :value="1" />
               <el-option label="已出库" :value="2" />
               <el-option label="报废" :value="3" />
            </el-select>
         </el-form-item>
         <el-form-item label="SN类型" prop="snType">
            <el-select
               v-model="queryParams.snType"
               placeholder="请选择SN类型"
               clearable
               style="width: 150px"
            >
               <el-option label="测试" value="TEST" />
               <el-option label="量产" value="MASS" />
            </el-select>
         </el-form-item>
         <el-form-item label="入库时间">
            <el-date-picker
               v-model="dateRange"
               type="daterange"
               range-separator="-"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
               value-format="yyyy-MM-dd"
               style="width: 240px"
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
               type="success"
               plain
               icon="Upload"
               :disabled="ids.length === 0"
               @click="handleOutbound"
               v-hasPermi="['system:moduleInventory:edit']"
            >出库</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Warning"
               :disabled="ids.length === 0"
               @click="handleScrap"
               v-hasPermi="['system:moduleInventory:edit']"
            >报废</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="ids.length === 0"
               @click="handleDelete"
               v-hasPermi="['system:moduleInventory:remove']"
            >删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="inventoryList" @selection-change="handleSelectionChange" style="width: 100%">
         <el-table-column type="selection" width="50" align="center" />
         <el-table-column label="序号" width="55" type="index" align="center">
            <template #default="scope">
               <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column label="模组SN" align="center" prop="sn" min-width="240" :show-overflow-tooltip="true" />
         <el-table-column label="产品型号" align="center" prop="model" min-width="90" />
         <el-table-column label="状态" align="center" prop="status" min-width="90">
            <template #default="scope">
               <el-tag v-if="scope.row.status === 1" type="success">已入库</el-tag>
               <el-tag v-else-if="scope.row.status === 2" type="primary">已出库</el-tag>
               <el-tag v-else-if="scope.row.status === 3" type="danger">报废</el-tag>
               <el-tag v-else type="info">未知</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="SN类型" align="center" prop="snType" min-width="90">
            <template #default="scope">
               <el-tag v-if="scope.row.snType === 'TEST'" type="info">测试</el-tag>
               <el-tag v-else-if="scope.row.snType === 'MASS'" type="">量产</el-tag>
               <span v-else>{{ scope.row.snType }}</span>
            </template>
         </el-table-column>
         <el-table-column label="扫码枪ID" align="center" prop="scannerId" min-width="110" />
         <el-table-column label="操作员工号" align="center" prop="firstStaffId" min-width="110" />
         <el-table-column label="固件版本" align="center" prop="firmwareVer" min-width="100" />
         <el-table-column label="硬件版本" align="center" prop="hardwareVer" min-width="100" />
         <el-table-column label="软件版本" align="center" prop="softwareVer" min-width="100" />
         <el-table-column label="报废原因" align="center" prop="scrapReason" min-width="150" :show-overflow-tooltip="true" />
         <el-table-column label="入库时间" align="center" prop="createTime" min-width="160" show-overflow-tooltip="true" />
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 报废原因弹窗 -->
      <el-dialog title="模组报废" v-model="scrapDialog.visible" width="480px" @close="resetScrapDialog">
         <el-form :model="scrapDialog" :rules="scrapRules" ref="scrapFormRef" label-width="90px">
            <el-form-item label="报废原因" prop="scrapReason">
               <el-input
                  v-model="scrapDialog.scrapReason"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入报废原因"
                  maxlength="255"
                  show-word-limit
               />
            </el-form-item>
            <el-alert type="info" :closable="false" show-icon>
               <template #title>
                  已选择 <strong>{{ ids.length }}</strong> 条模组，确认后将全部标记为报废
               </template>
            </el-alert>
         </el-form>
         <template #footer>
            <el-button @click="scrapDialog.visible = false">取消</el-button>
            <el-button type="primary" :loading="scrapDialog.submitting" @click="submitScrap">确认报废</el-button>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="ModuleInventory">
import { listModuleInventory, updateModuleInventory, delModuleInventory } from "@/api/system/moduleInventory";

const { proxy } = getCurrentInstance();

const inventoryList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const ids = ref([]);
const dateRange = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sn: undefined,
    model: undefined,
    status: undefined,
    snType: undefined
  }
});

const { queryParams } = toRefs(data);

// ============ 报废弹窗 ============

const scrapDialog = reactive({
  visible: false,
  submitting: false,
  scrapReason: ''
});

const scrapRules = {
  scrapReason: [
    { required: true, message: '请输入报废原因', trigger: 'blur' }
  ]
};

function resetScrapDialog() {
  scrapDialog.scrapReason = '';
  scrapDialog.submitting = false;
  proxy.resetForm("scrapFormRef");
}

// ============ 列表查询 ============

function getList() {
  loading.value = true;
  const params = { ...queryParams.value };
  if (dateRange.value && dateRange.value.length === 2) {
    params.params = {
      beginTime: dateRange.value[0],
      endTime: dateRange.value[1]
    };
  }
  listModuleInventory(params).then(response => {
    inventoryList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// ============ 表格选择 ============

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
}

// ============ 出库 ============

function handleOutbound() {
  const rows = inventoryList.value.filter(r => ids.value.includes(r.id));
  const alreadyOut = rows.filter(r => r.status === 2);
  if (alreadyOut.length > 0) {
    proxy.$modal.msgWarning(`有 ${alreadyOut.length} 条已出库，请重新选择`);
    return;
  }
  const scrapped = rows.filter(r => r.status === 3);
  if (scrapped.length > 0) {
    proxy.$modal.msgWarning(`有 ${scrapped.length} 条已报废，不能出库`);
    return;
  }

  proxy.$modal.confirm(`确认将选中的 ${ids.value.length} 条模组出库吗？`).then(function() {
    // 逐条更新为出库状态
    const promises = ids.value.map(id => updateModuleInventory({ id, status: 2 }));
    return Promise.all(promises);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess('出库成功');
  }).catch(() => {});
}

// ============ 报废 ============

function handleScrap() {
  const rows = inventoryList.value.filter(r => ids.value.includes(r.id));
  const alreadyScrapped = rows.filter(r => r.status === 3);
  if (alreadyScrapped.length > 0) {
    proxy.$modal.msgWarning(`有 ${alreadyScrapped.length} 条已报废，请重新选择`);
    return;
  }

  resetScrapDialog();
  scrapDialog.visible = true;
}

function submitScrap() {
  proxy.$refs.scrapFormRef.validate(async (valid) => {
    if (!valid) return;
    scrapDialog.submitting = true;
    try {
      const promises = ids.value.map(id => updateModuleInventory({
        id,
        status: 3,
        scrapReason: scrapDialog.scrapReason
      }));
      await Promise.all(promises);
      proxy.$modal.msgSuccess(`成功报废 ${ids.value.length} 条模组`);
      scrapDialog.visible = false;
      getList();
    } catch (e) {
      // 错误由 request 拦截器统一处理
    } finally {
      scrapDialog.submitting = false;
    }
  });
}

// ============ 删除 ============

function handleDelete() {
  proxy.$modal.confirm('确认删除选中的 ' + ids.value.length + ' 条模组库存记录吗？此操作不可恢复！').then(function() {
    return delModuleInventory(ids.value.join(','));
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess('删除成功');
  }).catch(() => {});
}

getList();
</script>

<style scoped>
</style>

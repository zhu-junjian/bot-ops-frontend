<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="设备SN" prop="serialNum">
            <el-input
               v-model="queryParams.serialNum"
               placeholder="请输入设备序列号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="故障状态" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="请选择故障状态"
               clearable
               style="width: 200px"
            >
               <el-option label="故障中" value="0" />
               <el-option label="已解除" value="1" />
            </el-select>
         </el-form-item>
         <el-form-item label="故障描述" prop="faultDesc">
            <el-input
               v-model="queryParams.faultDesc"
               placeholder="请输入故障描述"
               clearable
               style="width: 200px"
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
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="faultList" style="width: 100%">
         <el-table-column label="序号" width="80" type="index" align="center">
            <template #default="scope">
               <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column label="设备SN" align="center" prop="serialNum" width="180" :show-overflow-tooltip="true" />
         <el-table-column label="故障描述" align="center" prop="faultDesc" min-width="120" :show-overflow-tooltip="true" />
         <el-table-column label="额外描述" align="center" prop="extraDesc" min-width="120" :show-overflow-tooltip="true" />
         <el-table-column label="补充说明" align="center" min-width="160">
            <template #default="scope">
               <template v-if="scope.row.customFields">
                  <el-popover placement="left" :width="320" trigger="hover">
                     <template #reference>
                        <el-tag size="small" type="info">{{ parseCustomFields(scope.row.customFields).length }} 项</el-tag>
                     </template>
                     <div style="font-size:12px; line-height:1.8; max-height:300px; overflow-y:auto;">
                        <div v-for="(item, idx) in parseCustomFields(scope.row.customFields)" :key="idx">
                           <strong>{{ item.key }}</strong>: {{ getFieldValue(item) }}
                        </div>
                     </div>
                  </el-popover>
               </template>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="严重等级" align="center" prop="severity" width="80" />
         <el-table-column label="故障码" align="center" prop="faultCode" width="180">
            <template #default="scope">
               <span>{{ scope.row.faultCodeHex }}</span>
            </template>
         </el-table-column>
         <el-table-column label="发生时间" align="center" prop="occurredTMs" width="170">
            <template #default="scope">
               <span>{{ scope.row.occurredTMs > 0 ? parseTime(scope.row.occurredTMs) : '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="解除时间" align="center" prop="clearedTMs" width="170">
            <template #default="scope">
               <span>{{ scope.row.clearedTMs > 0 ? parseTime(scope.row.clearedTMs) : '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="状态" align="center" prop="status" width="90">
            <template #default="scope">
               <el-tag :type="scope.row.status === 0 ? 'danger' : 'success'">
                  {{ scope.row.status === 0 ? '故障中' : '已解除' }}
               </el-tag>
            </template>
         </el-table-column>
         <el-table-column label="录入时间" align="center" prop="createTime" width="170">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
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
   </div>
</template>

<script setup name="DeviceFault">
import { listDeviceFault } from "@/api/system/deviceFault";

const { proxy } = getCurrentInstance();

const faultList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    serialNum: undefined,
    status: undefined,
    faultDesc: undefined
  }
});

const { queryParams } = toRefs(data);

/** 解析 custom_fields JSON 字符串为数组 */
function parseCustomFields(json) {
  try {
    return JSON.parse(json) || [];
  } catch {
    return [];
  }
}

/** 从 item 中取第一个非 key 字段的值 */
function getFieldValue(item) {
  for (const k of Object.keys(item)) {
    if (k !== 'key') return item[k];
  }
  return '';
}

/** 查询故障列表 */
function getList() {
  loading.value = true;
  listDeviceFault(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    faultList.value = response.rows;
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

getList();
</script>

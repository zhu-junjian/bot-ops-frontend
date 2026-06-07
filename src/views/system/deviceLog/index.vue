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
         <el-form-item label="批次号" prop="batchNo">
            <el-input
               v-model="queryParams.batchNo"
               placeholder="请输入批次号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="入库时间" style="width: 308px">
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

      <el-table v-loading="loading" :data="logList" style="width: 100%">
         <el-table-column label="序号" width="50" type="index" align="center">
            <template #default="scope">
               <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column label="设备SN" align="center" prop="serialNum" min-width="140" :show-overflow-tooltip="true" />
         <el-table-column label="事件ID" align="center" prop="eventId" min-width="100" :show-overflow-tooltip="true" />
         <el-table-column label="批次号" align="center" prop="batchNo" width="80" />
         <el-table-column label="文件数" align="center" prop="fileCount" width="80" />
         <el-table-column label="加密类型" align="center" prop="encryptType" width="90" />
         <el-table-column label="上传状态" align="center" prop="isComplete" width="90">
            <template #default="scope">
               <el-tag :type="scope.row.isComplete === 1 ? 'success' : 'warning'" size="small">
                  {{ scope.row.isComplete === 1 ? '已完成' : '未完成' }}
               </el-tag>
            </template>
         </el-table-column>
         <el-table-column label="日志文件" align="center" min-width="220">
            <template #default="scope">
               <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  <a
                     v-for="(file, idx) in parseFiles(scope.row.logFiles)"
                     :key="idx"
                     :href="file.url"
                     target="_blank"
                     style="display: block; font-size: 12px;"
                  >{{ file.name }}</a>
                  <span v-if="parseFiles(scope.row.logFiles).length === 0" style="color: #999;">-</span>
               </div>
            </template>
         </el-table-column>
         <el-table-column label="上报时间" align="center" prop="uploadTime" width="170">
            <template #default="scope">
               <span>{{ scope.row.uploadTime > 0 ? parseTime(scope.row.uploadTime) : '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="入库时间" align="center" prop="createTime" width="170">
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

<script setup name="DeviceLog">
import { listDeviceLog } from "@/api/system/deviceLog";

const { proxy } = getCurrentInstance();

const logList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    serialNum: undefined,
    batchNo: undefined
  }
});

const { queryParams } = toRefs(data);

/** 解析日志文件 JSON，返回 { name, url } 数组 */
function parseFiles(logFiles) {
  if (!logFiles) return [];
  try {
    const files = JSON.parse(logFiles);
    return files.map(path => ({
      name: path.substring(path.lastIndexOf('/') + 1),
      url: path
    }));
  } catch {
    return [];
  }
}

/** 查询日志列表 */
function getList() {
  loading.value = true;
  listDeviceLog(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    logList.value = response.rows;
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

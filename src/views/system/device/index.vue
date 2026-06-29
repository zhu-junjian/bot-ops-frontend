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
         <el-form-item label="设备型号" prop="deviceModel">
            <el-select
               v-model="queryParams.deviceModel"
               placeholder="请选择设备型号"
               clearable
               style="width: 200px"
            >
               <el-option label="C1" value="C1" />
               <el-option label="C2" value="C2" />
            </el-select>
         </el-form-item>
         <el-form-item label="在线状态" prop="currentStatus">
            <el-select
               v-model="queryParams.currentStatus"
               placeholder="请选择状态"
               clearable
               style="width: 200px"
            >
               <el-option label="在线" value="online" />
               <el-option label="离线" value="offline" />
               <el-option label="疑似" value="suspect" />
               <el-option label="维护中" value="maintenance" />
               <el-option label="故障" value="fault" />
               <el-option label="报废" value="scrapped" />
            </el-select>
         </el-form-item>
         <el-form-item label="设备名称" prop="name">
            <el-input
               v-model="queryParams.name"
               placeholder="请输入设备名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="最后心跳" style="width: 308px">
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

      <el-table v-loading="loading" :data="deviceList" style="width: 100%">
         <el-table-column label="序号" width="50" type="index" align="center">
            <template #default="scope">
               <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column label="设备SN" align="center" prop="serialNum" width="180" :show-overflow-tooltip="true" />
         <el-table-column label="设备型号" align="center" prop="deviceModel" width="90" />
         <el-table-column label="设备名称" align="center" prop="name" width="140" :show-overflow-tooltip="true" />
         <el-table-column label="IP地址" align="center" prop="deviceIp" width="140" />
         <el-table-column label="IP属地" align="center" prop="ipLocation" width="140" :show-overflow-tooltip="true">
            <template #default="scope">
               <span>{{ scope.row.ipLocation || '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="BMS" align="center" width="90">
            <template #default="scope">
               <el-tooltip v-if="scope.row.hardwareVersion || scope.row.bmsSoftwareVersion" placement="left" effect="light">
                  <template #content>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">硬件版本</span>: {{ scope.row.hardwareVersion || '-' }}
                     </div>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">软件版本</span>: {{ scope.row.bmsSoftwareVersion || '-' }}
                     </div>
                  </template>
                  <el-tag type="success">{{ scope.row.hardwareVersion || '-' }}</el-tag>
               </el-tooltip>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="组件版本" align="center" width="140">
            <template #default="scope">
               <el-tooltip v-if="scope.row.softwareVersions" placement="left" effect="light">
                  <template #content>
                     <div v-for="(sw, i) in parseSoftwareVersions(scope.row.softwareVersions)" :key="i"
                          style="line-height: 1.8;">
                        <span style="font-weight: 600;">{{ sw.name }}</span>: {{ sw.version || '-' }}
                     </div>
                  </template>
                  <el-tag type="primary">{{ parseSoftwareVersions(scope.row.softwareVersions).length }} 个组件</el-tag>
               </el-tooltip>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="MCU固件" align="center" width="100">
            <template #default="scope">
               <span v-if="scope.row.mcuSoftwareVersion">
                  {{ scope.row.mcuSoftwareVersionHex || scope.row.mcuSoftwareVersion }}
               </span>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="系统信息" align="center" width="100">
            <template #default="scope">
               <el-tooltip v-if="scope.row.systemKernel || scope.row.systemFilesystem || scope.row.systemBuildTime" placement="left" effect="light">
                  <template #content>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">内核</span>: {{ scope.row.systemKernel || '-' }}
                     </div>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">文件系统</span>: {{ scope.row.systemFilesystem || '-' }}
                     </div>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">构建时间</span>: {{ scope.row.systemBuildTime || '-' }}
                     </div>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">构建主机</span>: {{ scope.row.systemBuildHost || '-' }}
                     </div>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">构建用户</span>: {{ scope.row.systemBuildUser || '-' }}
                     </div>
                  </template>
                  <el-tag type="info">{{ scope.row.systemKernel || '-' }}</el-tag>
               </el-tooltip>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="关节驱动" align="center" width="100">
            <template #default="scope">
               <el-tooltip v-if="scope.row.jointDrivers" placement="left" effect="light">
                  <template #content>
                     <div v-for="(jd, i) in parseSoftwareVersions(scope.row.jointDrivers)" :key="i"
                          style="line-height: 1.8;">
                        <span style="font-weight: 600;">#{{ jd.index }}</span>: {{ jd.software_version || '-' }}
                     </div>
                  </template>
                  <el-tag type="warning">{{ parseSoftwareVersions(scope.row.jointDrivers).length }} 个关节</el-tag>
               </el-tooltip>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="电量" align="center" prop="batteryLevel" width="80">
            <template #default="scope">
               <span v-if="scope.row.batteryLevel != null">{{ scope.row.batteryLevel }}%</span>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="在线状态" align="center" prop="currentStatus" width="100">
            <template #default="scope">
               <el-tag :type="statusTagType(scope.row.currentStatus)">
                  {{ statusLabel(scope.row.currentStatus) }}
               </el-tag>
            </template>
         </el-table-column>
         <el-table-column label="最后心跳" align="center" prop="lastHeartbeat" width="170">
            <template #default="scope">
               <span>{{ scope.row.lastHeartbeat ? parseTime(scope.row.lastHeartbeat) : '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="日志拉取" align="center" width="220">
            <template #default="scope">
               <el-tag v-if="scope.row.logPullStatus === 'SENT'" type="info">已发送</el-tag>
               <el-tag v-else-if="scope.row.logPullStatus === 'ACKED'" type="warning">
                  已接受{{ scope.row.logPullBatch != null ? ' 批次#' + scope.row.logPullBatch : '' }}
               </el-tag>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="位置" align="center" prop="location" min-width="120" :show-overflow-tooltip="true" />
         <el-table-column label="时区" align="center" width="130">
            <template #default="scope">
               <span>{{ scope.row.timezoneId || '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="国家" align="center" prop="countryCode" width="70">
            <template #default="scope">
               <span>{{ scope.row.countryCode || '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="备注" align="center" prop="notes" min-width="140" :show-overflow-tooltip="true" />
         <el-table-column label="操作" align="center" width="180" fixed="right">
            <template #default="scope">
               <el-button
                  type="primary"
                  link
                  size="small"
                  @click="openIpHistoryDialog(scope.row)"
               >IP历史</el-button>
               <el-button
                  type="primary"
                  link
                  size="small"
                  @click="openTzDialog(scope.row)"
               >时区</el-button>
               <el-button
                  type="primary"
                  link
                  size="small"
                  :disabled="scope.row.currentStatus !== 'online'"
                  @click="openPullDialog(scope.row)"
               >日志拉取</el-button>
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

      <!-- 日志拉取对话框 -->
      <el-dialog title="日志拉取" v-model="pullDialog.visible" width="550px" @close="closePullDialog">
         <el-form :model="pullForm" label-width="100px">
            <el-form-item label="设备SN">
               <span>{{ pullDialog.deviceSn }}</span>
            </el-form-item>
            <el-form-item label="时间范围" prop="timeRange" required>
               <el-date-picker
                  v-model="pullForm.timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="x"
                  style="width: 100%"
               />
            </el-form-item>
            <el-form-item label="组件" prop="componentIds">
               <el-checkbox-group v-model="pullForm.componentIds">
                  <el-checkbox :label="0">运动控制</el-checkbox>
                  <el-checkbox :label="1">App客户端</el-checkbox>
                  <el-checkbox :label="2">控制路由</el-checkbox>
                  <el-checkbox :label="3">固件升级</el-checkbox>
                  <el-checkbox :label="4">系统监控</el-checkbox>
                  <el-checkbox :label="5">日志管理</el-checkbox>
                  <el-checkbox :label="6">JOURNAL</el-checkbox>
               </el-checkbox-group>
               <div style="color: #999; font-size: 12px;">留空表示拉取全部组件日志</div>
            </el-form-item>
         </el-form>

         <!-- 状态提示 -->
         <div v-if="pullDialog.status" style="text-align: center; padding: 12px 0;">
            <el-alert
               :title="pullDialog.status"
               :type="pullDialog.statusType"
               :closable="false"
               show-icon
            />
         </div>

         <template #footer>
            <el-button @click="closePullDialog">取消</el-button>
            <el-button type="primary" @click="submitPull" :loading="pullDialog.submitting" :disabled="pullDialog.polling">
               确认下发
            </el-button>
         </template>
      </el-dialog>

      <!-- 时区/国家编码编辑对话框 -->
      <el-dialog title="修改时区/国家编码" v-model="tzDialog.visible" width="480px" @close="closeTzDialog">
         <el-form label-width="90px">
            <el-form-item label="设备SN">
               <span>{{ tzDialog.sn }}</span>
            </el-form-item>
            <el-form-item label="时区">
               <el-select v-model="tzDialog.timezoneId" placeholder="请选择时区" clearable style="width: 100%">
                  <el-option v-for="tz in TIMEZONE_OPTIONS" :key="tz.value"
                     :label="tz.label" :value="tz.value" />
               </el-select>
            </el-form-item>
            <el-form-item label="国家编码">
               <el-select v-model="tzDialog.countryCode" placeholder="请选择国家" clearable style="width: 100%">
                  <el-option v-for="c in COUNTRY_OPTIONS" :key="c.value"
                     :label="c.label" :value="c.value" />
               </el-select>
            </el-form-item>
         </el-form>
         <template #footer>
            <el-button @click="closeTzDialog">取消</el-button>
            <el-button type="primary" @click="submitTz" :loading="tzDialog.submitting">确定</el-button>
         </template>
      </el-dialog>

      <!-- IP变更历史对话框 -->
      <el-dialog title="IP变更历史" v-model="ipHistoryDialog.visible" width="650px" @close="ipHistoryDialog.history = []">
         <div style="margin-bottom: 10px;">设备SN：<b>{{ ipHistoryDialog.sn }}</b></div>
         <el-table :data="ipHistoryDialog.history" v-loading="ipHistoryDialog.loading" max-height="400">
            <el-table-column label="变更时间" align="center" width="160">
               <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
               </template>
            </el-table-column>
            <el-table-column label="IP地址" align="center" prop="deviceIp" width="160" />
            <el-table-column label="IP属地" align="center" prop="ipLocation" min-width="200" :show-overflow-tooltip="true">
               <template #default="scope">
                  <span>{{ scope.row.ipLocation || '-' }}</span>
               </template>
            </el-table-column>
         </el-table>
         <pagination
            v-show="ipHistoryDialog.total > 0"
            :total="ipHistoryDialog.total"
            v-model:page="ipHistoryDialog.pageNum"
            v-model:limit="ipHistoryDialog.pageSize"
            @pagination="getIpHistory"
         />
      </el-dialog>
   </div>
</template>

<script setup name="Device">
import { listDevice, pullDeviceLog, getLogPullStatus, updateDeviceConfig } from "@/api/system/device";
import { listIpHistory } from "@/api/system/deviceIpHistory";

const { proxy } = getCurrentInstance();

const deviceList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref([]);

const statusMap = {
  online:      { label: '在线',   type: 'success' },
  offline:     { label: '离线',   type: 'info' },
  suspect:     { label: '疑似',   type: 'warning' },
  maintenance: { label: '维护中', type: '' },
  fault:       { label: '故障',   type: 'danger' },
  scrapped:    { label: '报废',   type: 'info' }
};

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    serialNum: undefined,
    deviceModel: undefined,
    currentStatus: undefined,
    name: undefined
  }
});

const { queryParams } = toRefs(data);

// IP变更历史
const ipHistoryDialog = reactive({
  visible: false,
  sn: '',
  loading: false,
  history: [],
  total: 0,
  pageNum: 1,
  pageSize: 10
});

function openIpHistoryDialog(row) {
  ipHistoryDialog.sn = row.serialNum;
  ipHistoryDialog.visible = true;
  ipHistoryDialog.pageNum = 1;
  getIpHistory();
}

function getIpHistory() {
  ipHistoryDialog.loading = true;
  listIpHistory(ipHistoryDialog.sn, {
    pageNum: ipHistoryDialog.pageNum,
    pageSize: ipHistoryDialog.pageSize
  }).then(response => {
    ipHistoryDialog.history = response.rows;
    ipHistoryDialog.total = response.total;
  }).finally(() => {
    ipHistoryDialog.loading = false;
  });
}

// ============ 时区编辑 ============

const TIMEZONE_OPTIONS = [
  { label: 'UTC+8    上海 Asia/Shanghai',       value: 'Asia/Shanghai' },
  { label: 'UTC+8    新加坡 Asia/Singapore',     value: 'Asia/Singapore' },
  { label: 'UTC+9    东京 Asia/Tokyo',           value: 'Asia/Tokyo' },
  { label: 'UTC+9    首尔 Asia/Seoul',           value: 'Asia/Seoul' },
  { label: 'UTC+5:30 印度 Asia/Kolkata',         value: 'Asia/Kolkata' },
  { label: 'UTC+4    迪拜 Asia/Dubai',           value: 'Asia/Dubai' },
  { label: 'UTC+3    莫斯科 Europe/Moscow',      value: 'Europe/Moscow' },
  { label: 'UTC+1    柏林 Europe/Berlin',        value: 'Europe/Berlin' },
  { label: 'UTC+0    伦敦 Europe/London',        value: 'Europe/London' },
  { label: 'UTC-5    纽约 America/New_York',     value: 'America/New_York' },
  { label: 'UTC-8    洛杉矶 America/Los_Angeles', value: 'America/Los_Angeles' },
  { label: 'UTC+10   悉尼 Australia/Sydney',     value: 'Australia/Sydney' },
];

const COUNTRY_OPTIONS = [
  { label: 'CN 中国',     value: 'CN' },
  { label: 'US 美国',     value: 'US' },
  { label: 'JP 日本',     value: 'JP' },
  { label: 'KR 韩国',     value: 'KR' },
  { label: 'SG 新加坡',   value: 'SG' },
  { label: 'IN 印度',     value: 'IN' },
  { label: 'AE 阿联酋',   value: 'AE' },
  { label: 'RU 俄罗斯',   value: 'RU' },
  { label: 'DE 德国',     value: 'DE' },
  { label: 'GB 英国',     value: 'GB' },
  { label: 'AU 澳大利亚', value: 'AU' },
  { label: 'NZ 新西兰',   value: 'NZ' },
];

const tzDialog = reactive({
  visible: false,
  sn: '',
  timezoneId: undefined,
  countryCode: undefined,
  submitting: false
});

function openTzDialog(row) {
  tzDialog.sn = row.serialNum;
  tzDialog.timezoneId = row.timezoneId || undefined;
  tzDialog.countryCode = row.countryCode || undefined;
  tzDialog.submitting = false;
  tzDialog.visible = true;
}

function closeTzDialog() {
  tzDialog.visible = false;
}

function submitTz() {
  if (!tzDialog.timezoneId && !tzDialog.countryCode) {
    proxy.$modal.msgWarning('时区和国家编码至少填写一项');
    return;
  }
  tzDialog.submitting = true;
  const data = {
    serialNum: tzDialog.sn,
    timezoneId: tzDialog.timezoneId || undefined,
    countryCode: tzDialog.countryCode || undefined
  };
  updateDeviceConfig(data).then(() => {
    proxy.$modal.msgSuccess('修改成功');
    tzDialog.visible = false;
    getList();
  }).catch(() => {
    // 错误由拦截器统一处理
  }).finally(() => {
    tzDialog.submitting = false;
  });
}

function statusLabel(status) {
  return statusMap[status]?.label || status;
}

function statusTagType(status) {
  return statusMap[status]?.type || 'info';
}

function parseSoftwareVersions(val) {
  if (!val) return [];
  try {
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch (e) {
    return [];
  }
}

/** 查询设备列表 */
function getList() {
  loading.value = true;
  listDevice(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    deviceList.value = response.rows;
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

// ============ 日志拉取 ============

const pullDialog = reactive({
  visible: false,
  deviceSn: '',
  status: '',
  statusType: 'info',
  submitting: false,
  polling: false,
  timer: null
});

const pullForm = reactive({
  timeRange: [],
  componentIds: []
});

function openPullDialog(row) {
  pullDialog.deviceSn = row.serialNum;
  pullDialog.visible = true;
  pullDialog.status = '';
  pullDialog.submitting = false;
  pullDialog.polling = false;
  pullForm.timeRange = [];
  pullForm.componentIds = [];
}

function closePullDialog() {
  if (pullDialog.timer) {
    clearInterval(pullDialog.timer);
    pullDialog.timer = null;
  }
  pullDialog.visible = false;
  pullDialog.polling = false;
}

function submitPull() {
  if (!pullForm.timeRange || pullForm.timeRange.length !== 2) {
    proxy.$modal.msgWarning("请选择时间范围");
    return;
  }

  pullDialog.submitting = true;
  pullDialog.status = '';

  const params = {
    serial_num: pullDialog.deviceSn,
    component_ids: pullForm.componentIds,
    timestamp_start: Math.floor(pullForm.timeRange[0] / 1000),
    timestamp_end: Math.floor(pullForm.timeRange[1] / 1000)
  };

  pullDeviceLog(params).then(() => {
    pullDialog.submitting = false;
    pullDialog.polling = true;
    pullDialog.status = '等待设备应答...';
    pullDialog.statusType = 'info';

    // 轮询状态
    let pollCount = 0;
    pullDialog.timer = setInterval(() => {
      pollCount++;
      getLogPullStatus(pullDialog.deviceSn).then(res => {
        const status = res?.data ?? res?.msg;
        if (status === 'ACKED') {
          clearInterval(pullDialog.timer);
          pullDialog.timer = null;
          pullDialog.polling = false;
          pullDialog.status = '设备已接受，上传中';
          pullDialog.statusType = 'success';
          getList();
        } else if (pollCount >= 10) {
          clearInterval(pullDialog.timer);
          pullDialog.timer = null;
          pullDialog.polling = false;
          pullDialog.status = '等待超时，请稍后刷新查看';
          pullDialog.statusType = 'warning';
          getList();
        }
      }).catch(err => {
        console.error('轮询日志拉取状态失败:', err);
      });
    }, 3000);
  }).catch(() => {
    pullDialog.submitting = false;
    proxy.$modal.msgError("下发失败，请重试");
  });
}

getList();
</script>

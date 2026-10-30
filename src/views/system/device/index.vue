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
         <el-table-column label="产品类型" align="center" prop="productType" width="100">
            <template #default="scope">
               <span>{{ scope.row.productType || '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="设备名称" align="center" prop="name" width="140" :show-overflow-tooltip="true" />
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
         <el-table-column label="IP地址" align="center" prop="deviceIp" width="140" />
         <el-table-column label="IP属地" align="center" prop="ipLocation" width="140" :show-overflow-tooltip="true">
            <template #default="scope">
               <span>{{ scope.row.ipLocation || '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="BMS" align="center" width="90">
            <template #default="scope">
               <el-tooltip v-if="scope.row.bmsSn || scope.row.hardwareVersion || scope.row.bmsSoftwareVersion" placement="left" effect="light">
                  <template #content>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">SN</span>: {{ scope.row.bmsSn || '-' }}
                     </div>
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
         <el-table-column label="导航板信息" align="center" width="140">
            <template #default="scope">
               <el-tooltip
                  v-if="scope.row.naviSn || parseNaviVersions(scope.row.naviVersions).length"
                  placement="left"
                  effect="light"
               >
                  <template #content>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">SN</span>: {{ scope.row.naviSn || '-' }}
                     </div>
                     <div v-for="(item, i) in parseNaviVersions(scope.row.naviVersions)" :key="i"
                          style="line-height: 1.8;">
                        <span style="font-weight: 600;">{{ item.name || '-' }}</span>: {{ item.version || '-' }}
                     </div>
                  </template>
                  <el-tag type="primary">{{ parseNaviVersions(scope.row.naviVersions).length }} 个版本</el-tag>
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
               <el-tooltip v-if="scope.row.systemKernel || scope.row.systemFilesystem || scope.row.systemBuildTime || scope.row.trainId || scope.row.releaseId" placement="left" effect="light">
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
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">Train ID</span>: {{ scope.row.trainId || '-' }}
                     </div>
                     <div style="line-height: 1.8;">
                        <span style="font-weight: 600;">Release ID</span>: {{ scope.row.releaseId || '-' }}
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
         <el-table-column label="备注" align="center" min-width="140">
            <template #default="scope">
               <span v-if="scope.row.notes" class="notes-cell" @click="editNotes(scope.row)" style="cursor: pointer; color: #409eff;">{{ scope.row.notes }}</span>
               <el-button v-else link type="primary" size="small" @click="editNotes(scope.row)">添加备注</el-button>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="370" fixed="right">
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
                  @click="openJointSnHistoryDialog(scope.row)"
               >模组SN</el-button>
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
                  @click="openOtaDialog(scope.row)"
               >OTA</el-button>
               <el-button
                 type="primary"
                 link
                 size="small"
                 :disabled="scope.row.currentStatus !== 'online'"
                 @click="openPullDialog(scope.row)"
              >日志拉取</el-button>
               <el-button
                  type="primary"
                  link
                  size="small"
                  @click="openOnlineSessionDialog(scope.row)"
               >在线记录</el-button>
               <el-button
                  type="primary"
                  link
                  size="small"
                  @click="openOpenclawDialog(scope.row)"
               >OpenClaw令牌</el-button>
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
      <el-dialog title="修改时区/国家编码" v-model="tzDialog.visible" width="480px" @close="closeTzDialog">         <el-form label-width="90px">
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

      <!-- 模组SN变更历史对话框（关节 + 电池BMS） -->
      <el-dialog title="模组SN变更历史" v-model="jointSnHistoryDialog.visible" width="700px" @close="jointSnHistoryDialog.history = []">
         <div style="margin-bottom: 10px;">设备SN：<b>{{ jointSnHistoryDialog.sn }}</b></div>
         <el-table :data="jointSnHistoryDialog.history" v-loading="jointSnHistoryDialog.loading" max-height="400">
            <el-table-column label="变更时间" align="center" width="160">
               <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
               </template>
            </el-table-column>
            <el-table-column label="模组数" align="center" width="80">
               <template #default="scope">
                  <el-tag type="warning">{{ parseJointSnapshot(scope.row.jointSnapshot).length }}</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="模组SN明细" align="center" min-width="300">
               <template #default="scope">
                  <div v-for="(item, i) in parseJointSnapshot(scope.row.jointSnapshot)" :key="i"
                       style="line-height: 1.8;">
                     <template v-if="item.type === 'bms'">
                        <span style="font-weight: 600;">电池</span>: {{ item.sn || '-' }}
                     </template>
                     <template v-else>
                        <span style="font-weight: 600;">#{{ item.index }}</span>: {{ item.sn || '-' }}
                     </template>
                  </div>
                  <span v-if="parseJointSnapshot(scope.row.jointSnapshot).length === 0">-</span>
               </template>
            </el-table-column>
         </el-table>
         <pagination
            v-show="jointSnHistoryDialog.total > 0"
            :total="jointSnHistoryDialog.total"
            v-model:page="jointSnHistoryDialog.pageNum"
            v-model:limit="jointSnHistoryDialog.pageSize"
            @pagination="getJointSnHistory"
         />
      </el-dialog>

      <!-- 在线周期记录对话框 -->
      <el-dialog title="在线周期记录" v-model="onlineSessionDialog.visible" width="700px" @close="onlineSessionDialog.sessions = []">
         <div style="margin-bottom: 10px;">设备SN：<b>{{ onlineSessionDialog.sn }}</b></div>
         <el-table :data="onlineSessionDialog.sessions" v-loading="onlineSessionDialog.loading" max-height="400">
            <el-table-column label="上线时间" align="center" width="160">
               <template #default="scope">
                  <span>{{ parseTime(scope.row.onlineTime) }}</span>
               </template>
            </el-table-column>
            <el-table-column label="离线时间" align="center" width="160">
               <template #default="scope">
                  <span v-if="scope.row.offlineTime">{{ parseTime(scope.row.offlineTime) }}</span>
                  <el-tag v-else type="success" size="small">在线中</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="在线时长" align="center" width="120">
               <template #default="scope">
                  <span v-if="scope.row.durationSec != null">{{ formatDuration(scope.row.durationSec) }}</span>
                  <span v-else>-</span>
               </template>
            </el-table-column>
            <el-table-column label="记录时间" align="center" width="160">
               <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
               </template>
            </el-table-column>
         </el-table>
         <pagination
            v-show="onlineSessionDialog.total > 0"
            :total="onlineSessionDialog.total"
            v-model:page="onlineSessionDialog.pageNum"
            v-model:limit="onlineSessionDialog.pageSize"
            @pagination="getOnlineSessions"
         />
      </el-dialog>

      <!-- OTA属性编辑对话框 -->
      <el-dialog title="修改设备OTA属性" v-model="otaDialog.visible" width="500px" @close="closeOtaDialog">
         <div v-if="otaDialog.loading" style="text-align: center; padding: 20px;">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span style="margin-left: 8px;">加载中...</span>
         </div>
         <el-form v-else label-width="90px">
            <el-form-item label="设备SN">
               <span>{{ otaDialog.sn }}</span>
            </el-form-item>
            <el-form-item label="OTA型号">
               <el-select v-model="otaDialog.otaModel" placeholder="请选择OTA型号" clearable filterable style="width: 100%;" @change="onOtaModelChange">
                  <el-option v-for="m in otaDialog.modelOptions" :key="m" :label="m" :value="m" />
               </el-select>
            </el-form-item>
            <el-form-item label="OTA区域">
               <el-select v-model="otaDialog.otaRegion" placeholder="请选择OTA区域" clearable filterable style="width: 100%;">
                  <el-option v-for="r in otaDialog.regionOptions" :key="r" :label="r" :value="r" />
               </el-select>
            </el-form-item>
            <el-divider />
            <el-form-item label="目标环境">
               <el-select v-model="otaDialog.envType" placeholder="不切换则留空" clearable style="width: 100%;">
                  <el-option label="正式环境 (prod)" value="prod" />
                  <el-option label="测试环境 (test)" value="test" />
               </el-select>
            </el-form-item>
            <el-form-item label="服务URL">
               <span style="font-size: 12px; color: #999;">{{ otaDialog.serviceUrl || '-' }}</span>
            </el-form-item>
         </el-form>
         <template #footer>
            <el-button @click="closeOtaDialog">取消</el-button>
            <el-button type="primary" @click="submitOta" :loading="otaDialog.submitting">确定</el-button>
         </template>
      </el-dialog>

      <!-- 备注编辑对话框 -->
      <el-dialog title="修改备注" v-model="notesDialog.visible" width="450px">
         <el-form label-width="80px">
            <el-form-item label="设备SN">
               <span>{{ notesDialog.sn }}</span>
            </el-form-item>
            <el-form-item label="备注">
               <el-input v-model="notesDialog.notes" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
         </el-form>
         <template #footer>
            <el-button @click="notesDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="submitNotes" :loading="notesDialog.submitting">确定</el-button>
         </template>
      </el-dialog>

      <!-- OpenClaw令牌对话框 -->
      <el-dialog title="OpenClaw 令牌" v-model="openclawDialog.visible" width="620px" @close="closeOpenclawDialog">
         <el-form label-width="90px">
            <el-form-item label="设备SN">
               <span>{{ openclawDialog.sn }}</span>
            </el-form-item>
            <el-form-item v-if="openclawDialog.loginUrl" label="登录URL">
               <el-input :model-value="openclawDialog.loginUrl" readonly>
                  <template #append>
                     <el-button v-if="openclawDialog.loginUrl" v-copyText="openclawDialog.loginUrl" v-copyText:callback="copyOpenclawSuccess">复制</el-button>
                  </template>
               </el-input>
            </el-form-item>
            <el-form-item label="令牌">
               <el-input :model-value="openclawDialog.token" readonly>
                  <template #append>
                     <el-button v-if="openclawDialog.token" v-copyText="openclawDialog.token" v-copyText:callback="copyOpenclawSuccess">复制</el-button>
                  </template>
               </el-input>
            </el-form-item>
            <el-form-item v-if="openclawDialog.validFrom" label="有效期">
               <span>{{ openclawDialog.validFrom }} ~ {{ openclawDialog.validTo }}</span>
            </el-form-item>
         </el-form>
         <template #footer>
            <el-button type="primary" @click="openclawDialog.visible = false">关闭</el-button>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Device">
import { listDevice, pullDeviceLog, getLogPullStatus, updateDeviceConfig, getDeviceOtaConfig, updateDeviceOtaConfig, listOnlineSessions, updateDeviceNotes, getOpenclawToken } from "@/api/system/device";
import { getOtaServiceConfigOptions } from "@/api/system/otaServiceConfig";
import { listIpHistory } from "@/api/system/deviceIpHistory";
import { listJointSnHistory } from "@/api/system/deviceJointSnHistory";

// 设备自建 AP 的局域网 IP（固定）：设备 OpenClaw Web UI 通过该地址访问，
// 不要用设备列表里的 deviceIp（那是设备所在网络路由器的对外 IP）。
const OPENCLAW_AP_LAN_IP = '10.21.40.1';

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

// 模组SN变更历史（关节 + 电池BMS）
const jointSnHistoryDialog = reactive({
  visible: false,
  sn: '',
  loading: false,
  history: [],
  total: 0,
  pageNum: 1,
  pageSize: 10
});

function openJointSnHistoryDialog(row) {
  jointSnHistoryDialog.sn = row.serialNum;
  jointSnHistoryDialog.visible = true;
  jointSnHistoryDialog.pageNum = 1;
  getJointSnHistory();
}

function getJointSnHistory() {
  jointSnHistoryDialog.loading = true;
  listJointSnHistory(jointSnHistoryDialog.sn, {
    pageNum: jointSnHistoryDialog.pageNum,
    pageSize: jointSnHistoryDialog.pageSize
  }).then(response => {
    jointSnHistoryDialog.history = response.rows;
    jointSnHistoryDialog.total = response.total;
  }).finally(() => {
    jointSnHistoryDialog.loading = false;
  });
}

function parseJointSnapshot(val) {
  if (!val) return [];
  try {
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch (e) {
    return [];
  }
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

// ============ OTA属性编辑 ============

const otaDialog = reactive({
  visible: false,
  sn: '',
  otaModel: '',
  otaRegion: '',
  envType: '',
  serviceUrl: '',
  modelOptions: [],
  regionOptions: [],
  loading: false,
  submitting: false
});

function openOtaDialog(row) {
  otaDialog.sn = row.serialNum;
  otaDialog.loading = true;
  otaDialog.visible = true;
  // 并行加载设备当前 OTA 配置 + 全量型号选项
  Promise.all([
    getDeviceOtaConfig(row.serialNum),
    getOtaServiceConfigOptions()
  ]).then(([configRes, optionsRes]) => {
    const d = configRes.data;
    otaDialog.otaModel = d.otaModel || '';
    otaDialog.envType = d.envType || '';
    otaDialog.serviceUrl = d.serviceUrl || '';
    otaDialog.modelOptions = optionsRes.data.models || [];

    // 如果设备已有 otaModel，按该型号加载区域；否则用全量区域
    if (d.otaModel) {
      return getOtaServiceConfigOptions(d.otaModel).then(r => {
        otaDialog.regionOptions = r.data.regions || [];
        otaDialog.otaRegion = d.otaRegion || '';
      });
    } else {
      otaDialog.regionOptions = optionsRes.data.regions || [];
      otaDialog.otaRegion = d.otaRegion || '';
    }
  }).catch(() => {
    proxy.$modal.msgWarning('获取OTA配置失败');
    otaDialog.visible = false;
  }).finally(() => {
    otaDialog.loading = false;
  });
}

function onOtaModelChange(val) {
  otaDialog.otaRegion = '';
  otaDialog.serviceUrl = '';
  if (val) {
    getOtaServiceConfigOptions(val).then(res => {
      otaDialog.regionOptions = res.data.regions || [];
    });
  } else {
    getOtaServiceConfigOptions().then(res => {
      otaDialog.regionOptions = res.data.regions || [];
    });
  }
}

function closeOtaDialog() {
  otaDialog.visible = false;
  otaDialog.sn = '';
  otaDialog.otaModel = '';
  otaDialog.otaRegion = '';
  otaDialog.envType = '';
  otaDialog.serviceUrl = '';
  otaDialog.modelOptions = [];
  otaDialog.regionOptions = [];
  otaDialog.submitting = false;
}

// ============ 在线周期记录 ============

const onlineSessionDialog = reactive({
  visible: false,
  sn: '',
  loading: false,
  sessions: [],
  total: 0,
  pageNum: 1,
  pageSize: 10
});

function openOnlineSessionDialog(row) {
  onlineSessionDialog.sn = row.serialNum;
  onlineSessionDialog.visible = true;
  onlineSessionDialog.pageNum = 1;
  getOnlineSessions();
}

function getOnlineSessions() {
  onlineSessionDialog.loading = true;
  listOnlineSessions(onlineSessionDialog.sn, {
    pageNum: onlineSessionDialog.pageNum,
    pageSize: onlineSessionDialog.pageSize
  }).then(response => {
    onlineSessionDialog.sessions = response.data.rows;
    onlineSessionDialog.total = response.data.total;
  }).finally(() => {
    onlineSessionDialog.loading = false;
  });
}

function formatDuration(seconds) {
  if (seconds == null) return '-';
  if (seconds < 60) return seconds + '秒';
  if (seconds < 3600) return Math.floor(seconds / 60) + '分' + (seconds % 60) + '秒';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h + '时' + m + '分';
}

// ============ OpenClaw 令牌查询 ============

const openclawDialog = reactive({
  visible: false,
  sn: '',
  token: '',
  loginUrl: '',
  validFrom: '',
  validTo: ''
});

function openOpenclawDialog(row) {
  openclawDialog.sn = row.serialNum;
  openclawDialog.token = '';
  openclawDialog.loginUrl = '';
  openclawDialog.validFrom = '';
  openclawDialog.validTo = '';
  openclawDialog.visible = true;
  getOpenclawToken(row.serialNum).then(res => {
    openclawDialog.token = res.data?.token || '';
    openclawDialog.validFrom = res.data?.validFrom || '';
    openclawDialog.validTo = res.data?.validTo || '';
    openclawDialog.loginUrl = `http://${OPENCLAW_AP_LAN_IP}:18789/chat?session=agent%3Amain%3Amain#token=${openclawDialog.token}`;
  }).catch(() => {
    proxy.$modal.msgError('获取 OpenClaw 令牌失败');
    openclawDialog.visible = false;
  });
}

function closeOpenclawDialog() {
  openclawDialog.visible = false;
  openclawDialog.sn = '';
  openclawDialog.token = '';
  openclawDialog.loginUrl = '';
  openclawDialog.validFrom = '';
  openclawDialog.validTo = '';
}

function copyOpenclawSuccess() {
  proxy.$modal.msgSuccess('复制成功');
}

// ============ 备注编辑 ============

const notesDialog = reactive({
  visible: false,
  sn: '',
  notes: '',
  submitting: false
});

function editNotes(row) {
  notesDialog.sn = row.serialNum;
  notesDialog.notes = row.notes || '';
  notesDialog.visible = true;
}

function submitNotes() {
  notesDialog.submitting = true;
  updateDeviceNotes({
    serialNum: notesDialog.sn,
    notes: notesDialog.notes
  }).then(() => {
    proxy.$modal.msgSuccess('备注修改成功');
    notesDialog.visible = false;
    getList();
  }).catch(() => {
    // 错误由拦截器统一处理
  }).finally(() => {
    notesDialog.submitting = false;
  });
}

function submitOta() {
  if (!otaDialog.otaModel && !otaDialog.otaRegion) {
    proxy.$modal.msgWarning('OTA型号和OTA区域至少填写一项');
    return;
  }
  otaDialog.submitting = true;
  updateDeviceOtaConfig({
    sn: otaDialog.sn,
    otaModel: otaDialog.otaModel || undefined,
    otaRegion: otaDialog.otaRegion || undefined,
    envType: otaDialog.envType || undefined
  }).then(() => {
    proxy.$modal.msgSuccess('OTA属性修改成功，已通过MQTT推送至设备');
    otaDialog.visible = false;
    getList();
  }).catch(() => {
    // 错误由拦截器统一处理
  }).finally(() => {
    otaDialog.submitting = false;
  });
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

function parseNaviVersions(val) {
  const versions = parseSoftwareVersions(val);
  return Array.isArray(versions) ? versions : [];
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

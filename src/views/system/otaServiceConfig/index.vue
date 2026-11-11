<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="80px">
      <el-form-item label="OTA型号" prop="otaModel">
        <el-input
          v-model="queryParams.otaModel"
          placeholder="请输入OTA型号"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="OTA区域" prop="otaRegion">
        <el-input
          v-model="queryParams.otaRegion"
          placeholder="请输入OTA区域"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="环境类型" prop="envType">
        <el-select
          v-model="queryParams.envType"
          placeholder="请选择环境类型"
          clearable
          style="width: 200px"
        >
          <el-option label="正式环境" value="prod" />
          <el-option label="测试环境" value="test" />
        </el-select>
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
          @click="handleAdd"
          v-hasPermi="['system:otaServiceConfig:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:otaServiceConfig:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:otaServiceConfig:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="OTA型号" prop="otaModel" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="OTA区域" prop="otaRegion" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="环境类型" prop="envType" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.envType === 'prod' ? 'danger' : 'info'">
            {{ scope.row.envType === 'prod' ? '正式' : '测试' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="服务URL" prop="serviceUrl" :show-overflow-tooltip="true" min-width="220" />
      <el-table-column label="Token" prop="token" :show-overflow-tooltip="true" min-width="200" />
      <el-table-column label="设备Token" prop="deviceToken" :show-overflow-tooltip="true" min-width="200" />
      <el-table-column label="Tailscale AuthKey" prop="tailscaleAuthKey" :show-overflow-tooltip="true" min-width="200" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:otaServiceConfig:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:otaServiceConfig:remove']"></el-button>
          </el-tooltip>
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

    <!-- 添加或修改OTA服务配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="configRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="OTA型号" prop="otaModel">
          <el-input v-model="form.otaModel" placeholder="请输入OTA型号，如 c2_pro1" />
        </el-form-item>
        <el-form-item label="OTA区域" prop="otaRegion">
          <el-input v-model="form.otaRegion" placeholder="请输入OTA区域，如 CN" />
        </el-form-item>
        <el-form-item label="环境类型" prop="envType">
          <el-select v-model="form.envType" placeholder="请选择环境类型" style="width: 100%">
            <el-option label="正式环境 (prod)" value="prod" />
            <el-option label="测试环境 (test)" value="test" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务URL" prop="serviceUrl">
          <el-input v-model="form.serviceUrl" placeholder="请输入OTA服务完整URL" />
        </el-form-item>
        <el-form-item label="Token" prop="token">
          <el-input v-model="form.token" placeholder="请输入OTA服务鉴权Token" />
        </el-form-item>
        <el-form-item label="设备Token" prop="deviceToken">
          <el-input v-model="form.deviceToken" placeholder="请输入设备端OTA Token" />
        </el-form-item>
        <el-form-item label="AuthKey" prop="tailscaleAuthKey">
          <el-input
            v-model="form.tailscaleAuthKey"
            placeholder="Tailscale AuthKey，留空使用系统默认（tskey-auth-k5qz...）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" :loading="submitting">{{ submitting ? '提交中...' : '确 定' }}</el-button>
          <el-button @click="cancel" :disabled="submitting">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="OtaServiceConfig">
import { listOtaServiceConfig, getOtaServiceConfig, addOtaServiceConfig, updateOtaServiceConfig, delOtaServiceConfig } from "@/api/system/otaServiceConfig";

const { proxy } = getCurrentInstance();

const configList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const submitting = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    otaModel: undefined,
    otaRegion: undefined,
    envType: undefined
  },
  rules: {
    otaModel: [{ required: true, message: "OTA型号不能为空", trigger: "blur" }],
    otaRegion: [{ required: true, message: "OTA区域不能为空", trigger: "blur" }],
    envType: [{ required: true, message: "环境类型不能为空", trigger: "change" }],
    serviceUrl: [{ required: true, message: "服务URL不能为空", trigger: "blur" }],
    token: [{ required: true, message: "Token不能为空", trigger: "blur" }],
    deviceToken: [{ required: true, message: "设备Token不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

function getList() {
  loading.value = true;
  listOtaServiceConfig(queryParams.value).then(response => {
    configList.value = response.rows;
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

function handleDelete(row) {
  const configIds = row.id || ids.value.join(",");
  proxy.$modal.confirm('是否确认删除ID为"' + configIds + '"的OTA服务配置?').then(function () {
    return delOtaServiceConfig(configIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

function reset() {
  form.value = {
    id: undefined,
    otaModel: undefined,
    otaRegion: undefined,
    envType: undefined,
    serviceUrl: undefined,
    token: undefined,
    deviceToken: undefined,
    tailscaleAuthKey: undefined
  };
  proxy.resetForm("configRef");
}

function handleAdd() {
  reset();
  open.value = true;
  title.value = "新增OTA服务配置";
}

function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getOtaServiceConfig(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改OTA服务配置";
  });
}

function submitForm() {
  submitting.value = true;
  proxy.$refs["configRef"].validate(valid => {
    if (!valid) {
      submitting.value = false;
      return;
    }
    const isUpdate = form.value.id != undefined;
    const apiCall = isUpdate ? updateOtaServiceConfig(form.value) : addOtaServiceConfig(form.value);
    apiCall.then(() => {
      proxy.$modal.msgSuccess(isUpdate ? "修改成功，MQTT配置推送中..." : "新增成功，MQTT配置推送中...");
      open.value = false;
      getList();
    }).catch(() => {
      // 错误由拦截器统一处理
    }).finally(() => {
      submitting.value = false;
    });
  });
}

function cancel() {
  open.value = false;
  submitting.value = false;
  reset();
}

getList();
</script>

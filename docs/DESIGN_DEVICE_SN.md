# 生产设备SN生成功能 — 设计文档（V3）

## 1. 需求确认结果

| # | 问题 | 确认结论 |
|---|------|----------|
| 1 | 产品型号 "C" | 是 **C2**，C2 → `BPX_` 前缀，C1 → `BAOBAO_` 前缀（与 corm 一致） |
| 2 | 其他型号 | 后续再加，当前仅支持 C1/C2 |
| 3 | 标签纸尺寸 | 未定，暂不限制 |
| 4 | 保存时机 | 生成后**直接入库**，列表中选择 SN 后**导出 Excel** |
| 5 | 流水号范围 | **00001~99999**，需校验 |
| 6 | 重复 SN 检测 | **需要**，入库前检测 |
| 7 | 流水号输入 | **不需要手动输入**，系统根据已有参数自动查询最大流水号并往后累加 |

---

## 2. 需求概述（修订）

1. 用户手动填写参数（**无需输入流水号**）→ 系统自动查询该参数组合下的最大流水号 → 自动累加生成 SN → **直接保存到数据库**
2. SN 列表页面展示已生成的记录，支持查询和勾选
3. 勾选 SN 后 → **导出 Excel**（每条记录含 WiFi名称 + SN + 条形码）
4. 前端负责 SN 拼装 + MD5/WiFi计算；后端负责存储 + Excel导出（含条形码）

---

## 3. SN 格式定义（18位）

```
产品型号(2) + 硬件版本(2) + 工厂代号(2) + 生产日期(6) + 颜色代号(1) + 流水号(5)
    C1          01           GF         250702         S         00001

SN 示例: C1GF01250702S00001
```

| 位置 | 字段 | 长度 | 可选值 |
|------|------|------|--------|
| 1-2 | 产品型号 | 2 | C1 / C2（后续扩展 A1/B1/D1/D2） |
| 3-4 | 硬件版本 | 2 | 01-99 |
| 5-6 | 工厂代号 | 2 | ZB(众邦) / GF(赣锋) / JS(镜识) |
| 7-12 | 生产日期 | 6 | YYMMDD，如 250702 |
| 13 | 颜色代号 | 1 | S(银色) / B(缇芙丽蓝) |
| 14-18 | 流水号 | 5 | 00001-99999 |

---

## 4. WiFi 名称生成规则（与 corm 一致）

```
MD5(SN) → 32位小写hex → 取后6位转大写 → 拼接前缀
```

| 产品型号 | WiFi 前缀 | 示例 |
|----------|-----------|------|
| C1 | `BAOBAO_` | `BAOBAO_` + MD5后6位大写 |
| C2 | `BPX_` | `BPX_` + MD5后6位大写 |
| 其他 | 待定 | 留空 |

---

## 5. 交互流程

```
┌─────────────────────────────────────────────────────────┐
│  【设备SN管理】页面                                       │
│                                                         │
│  ┌─── 搜索区 ───────────────────────────────────────┐   │
│  │  产品型号/工厂代号/生产日期/SN...  [搜索] [重置]     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── 工具栏 ───────────────────────────────────────┐   │
│  │  [生成SN]  [导出Excel]  [删除]                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── SN列表（可勾选）───────────────────────────────┐   │
│  │  ☑ │ SN │ 产品型号 │ 工厂 │ 生产日期 │ WiFi名称  │   │
│  │  ☐ │ C1..│  C1     │ GF  │ 250702  │ BAOBAO_..│   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  < 分页 >                                               │
└─────────────────────────────────────────────────────────┘

点击 [生成SN] → 弹窗
┌──────────────────────────────────┐
│  产品型号: [C1 ▼]                │
│  硬件版本: [01   ]               │
│  工厂代号: [GF ▼]                │
│  生产日期: [250702]              │
│  颜色代号: [S ▼]                 │
│  数量:     [30    ]  台          │
│                                  │
│  ── 系统自动查询流水号 ──          │
│  当前最大流水号: 00015            │
│  将生成流水号:   00016 ~ 00045   │
│                                  │
│  SN预览: C1GF01250702S00016      │
│  WiFi:   BAOBAO_3FA2C1           │
│                                  │
│  [确认生成并入库]  [取消]          │
└──────────────────────────────────┘
> 流水号由系统自动计算，用户无需手动输入

点击 [导出Excel] → 浏览器下载 Excel 文件
  Excel 内容：每条 SN 占一行，含 WiFi名称、SN、条形码图片
```

---

## 6. 技术方案

### 6.1 前端技术选型

| 功能 | 方案 | 说明 |
|------|------|------|
| MD5 计算 | 后端 `MessageDigest` | Java 原生，前端无需依赖 |
| SN 拼装 | 纯 JS | 字符串拼接 + padStart |
| 页面框架 | Element Plus | 与现有项目一致 |
| Excel 导出 | 后端生成，前端 `proxy.download` | 与现有项目模式一致 |

> **条形码 + MD5** 均移到后端处理（ZXing + MessageDigest）。前端不再需要 `crypto-js` 和 `jsbarcode`，**零额外依赖**。

### 6.2 后端技术选型（RuoYi-Vue-master）

| 功能 | 方案 |
|------|------|
| 条形码生成 | `com.google.zxing` (ZXing) |
| Excel 生成 | Apache POI（RuoYi 已内置） |
| MD5 | Java `MessageDigest` |

### 6.3 数据流向

```
[前端]                              [后端]                    [数据库]
  │                                   │                         │
  │  用户填参数（无流水号）              │                         │
  │  GET /device-sn/next-seq ──────► │ 查询 MAX(serial_seq) ──► │
  │                          ◄────── │ 返回 nextSeq + 预览SN    │
  │  展示预览（首个SN + WiFi名称）      │                         │
  │                                   │                         │
  │  用户确认数量                      │                         │
  │  POST /device-sn/batch ────────► │ 校验重复 ──────────────► │
  │                          ◄────── │ 批量插入                 │
  │  刷新列表                         │                         │
  │                               │                         │
  │  GET /device-sn/list ──────► │ 分页查询 ──────────────► │
  │                      ◄────── │                         │
  │                               │                         │
  │  勾选 SN                      │                         │
  │  GET /device-sn/export ────► │ 查数据 + ZXing生成条码   │
  │                      ◄────── │  POI生成Excel → 下载     │
```

---

## 7. 前端 API 设计

### 7.1 `src/api/system/deviceSn.js`

```js
import request from '@/utils/request'

// 查询下一段流水号（预览用）
export function getNextSeq(params) {
  return request({
    url: '/device-sn/next-seq',
    method: 'get',
    params
  })
}

// 批量生成SN并入库
export function batchGenerateSn(data) {
  return request({
    url: '/device-sn/batch',
    method: 'post',
    data
  })
}

// 查询SN列表
export function listDeviceSn(query) {
  return request({
    url: '/device-sn/list',
    method: 'get',
    params: query
  })
}

// 导出Excel（返回blob）
export function exportDeviceSn(ids) {
  return request({
    url: '/device-sn/export',
    method: 'post',
    data: { ids },
    responseType: 'blob'
  })
}

// 删除SN
export function delDeviceSn(ids) {
  return request({
    url: '/device-sn/' + ids,
    method: 'delete'
  })
}
```

### 7.2 批量生成请求体

```json
{
  "productModel": "C1",
  "hardwareVersion": "01",
  "factoryCode": "GF",
  "productionDate": "250702",
  "colorCode": "S",
  "quantity": 30
}
```
> **不再传 `startSeq`**，后端根据参数组合自动查询最大流水号并累加。

### 7.3 查询下一段流水号响应

```
GET /device-sn/next-seq?productModel=C1&hardwareVersion=01&factoryCode=GF&productionDate=250702&colorCode=S
```
```json
{
  "code": 200,
  "data": {
    "nextSeq": 16,
    "previewSn": "C1GF01250702S00016",
    "previewWifi": "BAOBAO_A3F2C1",
    "currentMaxSeq": 15
  }
}
```

### 7.4 后端 API 接口清单

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/device-sn/next-seq` | 查询指定参数组合下的下一个可用流水号（供前端预览） |
| POST | `/device-sn/batch` | 批量生成SN（后端自动计算流水号+拼SN+算WiFi+入库） |
| GET | `/device-sn/list` | 分页查询SN列表 |
| POST | `/device-sn/export` | 导出Excel（含条形码图片） |
| DELETE | `/device-sn/{ids}` | 删除SN记录 |

---

## 8. 前端页面设计

### 8.1 文件结构

```
src/
├── api/system/
│   └── deviceSn.js              # API 封装
└── views/system/
    └── deviceSn/
        └── index.vue            # 主页面（搜索 + 列表 + 生成弹窗）
```

### 8.2 `index.vue` 组件结构

```
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" :inline="true">
      <el-form-item label="产品型号" prop="productModel">
        <el-select v-model="queryParams.productModel" ...>
          <el-option label="C1" value="C1" />
          <el-option label="C2" value="C2" />
        </el-select>
      </el-form-item>
      <el-form-item label="工厂代号" prop="factoryCode">...</el-form-item>
      <el-form-item label="生产日期" prop="productionDate">
        <el-date-picker type="month" ... />  <!-- 筛选月份 -->
      </el-form-item>
      <el-form-item label="设备SN" prop="sn">
        <el-input v-model="queryParams.sn" ... />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row>
      <el-col>
        <el-button type="primary" icon="Plus" @click="handleGenerate">生成SN</el-button>
        <el-button type="warning" icon="Download"
                   :disabled="ids.length === 0"
                   @click="handleExport">导出Excel</el-button>
        <el-button type="danger" icon="Delete"
                   :disabled="ids.length === 0"
                   @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- SN列表 -->
    <el-table v-loading="loading" :data="snList"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="sn" label="设备SN" width="200"
                       :show-overflow-tooltip="true" />
      <el-table-column prop="productModel" label="产品型号" width="90" />
      <el-table-column prop="hardwareVersion" label="硬件版本" width="90" />
      <el-table-column prop="factoryCode" label="工厂代号" width="90" />
      <el-table-column prop="productionDate" label="生产日期" width="100" />
      <el-table-column prop="colorCode" label="颜色代号" width="80" />
      <el-table-column prop="wifiName" label="WiFi名称" width="170"
                       :show-overflow-tooltip="true" />
      <el-table-column prop="serialSeq" label="流水号" width="80" />
      <el-table-column label="创建时间" width="160" align="center">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList" />

    <!-- 生成SN弹窗 -->
    <el-dialog title="生成设备SN" v-model="generateDialog.visible"
               width="600px" @close="resetGenerateForm">
      <el-form :model="generateForm" :rules="generateRules"
               ref="generateFormRef" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品型号" prop="productModel">
              <el-select v-model="generateForm.productModel" style="width:100%">
                <el-option label="C1（家用）" value="C1" />
                <el-option label="C2（家用）" value="C2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="硬件版本" prop="hardwareVersion">
              <el-input v-model="generateForm.hardwareVersion"
                        placeholder="01-99" maxlength="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工厂代号" prop="factoryCode">
              <el-select v-model="generateForm.factoryCode" style="width:100%">
                <el-option label="赣锋 GF" value="GF" />
                <el-option label="众邦 ZB" value="ZB" />
                <el-option label="镜识 JS" value="JS" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产日期" prop="productionDate">
              <el-input v-model="generateForm.productionDate"
                        placeholder="250702" maxlength="6" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="颜色代号" prop="colorCode">
              <el-select v-model="generateForm.colorCode" style="width:100%">
                <el-option label="银色 S" value="S" />
                <el-option label="缇芙丽蓝 B" value="B" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="generateForm.quantity"
                               :min="1" :max="99999" style="width:100%"
                               controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <span style="color:#999;font-size:12px">
            流水号由系统自动计算，无需手动输入
          </span>
        </el-form-item>

        <!-- 自动查询流水号预览区 -->
        <div v-if="nextSeqInfo.nextSeq" class="sn-preview">
          <el-divider />
          <p>当前最大流水号：<strong>{{ padSeq(nextSeqInfo.currentMaxSeq) }}</strong></p>
          <p>将生成流水号：
            <strong>{{ padSeq(nextSeqInfo.nextSeq) }}</strong>
            ~
            <strong>{{ padSeq(nextSeqInfo.nextSeq + generateForm.quantity - 1) }}</strong>
          </p>
          <p>SN预览：<strong>{{ nextSeqInfo.previewSn }}</strong></p>
          <p>WiFi名称：<strong>{{ nextSeqInfo.previewWifi }}</strong></p>
          <p v-if="nextSeqInfo.nextSeq + generateForm.quantity - 1 > 99999"
             style="color:#f56c6c">
            ⚠ 流水号超出范围（最大99999），请减少数量
          </p>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="generateDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="generateDialog.submitting"
                   @click="submitGenerate">确认生成并入库</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

### 8.3 表单校验规则

```js
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
}
```

**流水号范围校验**：`nextSeq + quantity - 1 ≤ 99999`，前端预览时实时判断，超出则红色警告提示。

---

## 9. 前端关键逻辑

### 9.1 参数变化时自动查询流水号

```js
import { getNextSeq } from '@/api/system/deviceSn'

// 监听表单关键字段变化，自动查询下一段流水号
watch(
  () => [generateForm.productModel, generateForm.hardwareVersion,
         generateForm.factoryCode, generateForm.productionDate,
         generateForm.colorCode],
  async ([model, hw, factory, date, color]) => {
    // 所有字段都填写后才查询
    if (!model || !hw || !factory || !date || !color) {
      nextSeqInfo.value = {}
      return
    }
    try {
      const res = await getNextSeq({
        productModel: model,
        hardwareVersion: hw,
        factoryCode: factory,
        productionDate: date,
        colorCode: color
      })
      nextSeqInfo.value = res.data
    } catch (e) {
      nextSeqInfo.value = {}
    }
  },
  { immediate: true, deep: true }
)
```

### 9.2 提交生成

```js
function submitGenerate() {
  proxy.$refs.generateFormRef.validate(async (valid) => {
    if (!valid) return
    // 流水号范围校验
    if (nextSeqInfo.value.nextSeq + generateForm.quantity - 1 > 99999) {
      proxy.$modal.msgWarning('流水号超出范围（最大99999），请减少数量')
      return
    }
    generateDialog.submitting = true
    try {
      await batchGenerateSn({
        productModel: generateForm.productModel,
        hardwareVersion: generateForm.hardwareVersion,
        factoryCode: generateForm.factoryCode,
        productionDate: generateForm.productionDate,
        colorCode: generateForm.colorCode,
        quantity: generateForm.quantity
      })
      proxy.$modal.msgSuccess(`成功生成 ${generateForm.quantity} 条SN`)
      generateDialog.visible = false
      getList()
    } catch (e) {
      // 错误由 request 拦截器统一处理
    } finally {
      generateDialog.submitting = false
    }
  })
}
```

### 9.3 工具函数

```js
function padSeq(n) {
  return String(n).padStart(5, '0')
}
```

> **注意**：前端不再需要 `crypto-js` 做 MD5 计算。SN 拼装、WiFi 名称计算全部移到后端处理。前端只负责参数输入、预览展示（数据来自 `/next-seq` API）、提交确认。

---

## 10. 实施步骤

### 阶段一：前端页面开发（本次）

| 步骤 | 内容 | 文件 |
|------|------|------|
| 1 | 创建 API 模块（含 `getNextSeq` 预览接口） | `src/api/system/deviceSn.js` |
| 2 | 创建主页面（搜索+列表+生成弹窗） | `src/views/system/deviceSn/index.vue` |
| 3 | 实现参数变化时自动查询流水号（watch 监听） | 同上 |
| 4 | 实现批量生成逻辑（提交参数→后端入库→刷新列表） | 同上 |
| 5 | 实现 Excel 导出（勾选→调用后端接口下载） | 同上 |
| 6 | 实现批量删除 | 同上 |

> **零额外 npm 依赖**，纯 RuoYi 现有技术栈即可完成。

### 阶段二：后端接口开发（后续）

| 步骤 | 内容 |
|------|------|
| 1 | 创建数据库表 `tb_device_sn` |
| 2 | 实现 `POST /device-sn/batch`（接收SN列表，校验重复，入库） |
| 3 | 实现 `GET /device-sn/list`（分页查询） |
| 4 | 实现 `POST /device-sn/export`（ZXing生成条码 + POI生成Excel） |
| 5 | 实现 `DELETE /device-sn/{ids}` |

### 阶段三：路由与权限（后续）

| 步骤 | 内容 |
|------|------|
| 1 | RuoYi 菜单管理添加「设备SN管理」 |
| 2 | 前端动态路由自动加载 |

---

## 11. 后端批量生成接口详细设计

### 11.1 请求

```
POST /device-sn/batch
Content-Type: application/json

{
  "productModel": "C1",
  "hardwareVersion": "01",
  "factoryCode": "GF",
  "productionDate": "250702",
  "colorCode": "S",
  "quantity": 30
}
```
> **不传 `startSeq`**，后端自动查询当前参数组合下 `MAX(serial_seq)` 并累加。

### 11.2 后端处理逻辑

```java
// DeviceSnServiceImpl.java
@Transactional
public BatchResult batchGenerate(DeviceSnBatchDTO dto) {
    // 1. 查询当前参数组合下的最大流水号
    Integer maxSeq = deviceSnMapper.selectMaxSeqByParams(
        dto.getProductModel(), dto.getHardwareVersion(),
        dto.getFactoryCode(), dto.getProductionDate(),
        dto.getColorCode()
    );
    int startSeq = (maxSeq == null) ? 1 : maxSeq + 1;

    // 2. 流水号范围校验
    if (startSeq + dto.getQuantity() - 1 > 99999) {
        throw new ServiceException("流水号超出范围(最大99999)");
    }

    // 3. 批量生成
    List<DeviceSn> list = new ArrayList<>();
    for (int i = 0; i < dto.getQuantity(); i++) {
        int seq = startSeq + i;
        String sn = SnUtils.buildSn(dto, seq);       // 拼装18位SN
        String wifiName = SnUtils.buildWifiName(sn, dto.getProductModel());

        // 唯一性校验
        if (deviceSnMapper.existsBySn(sn)) {
            throw new ServiceException("SN已存在: " + sn);
        }

        DeviceSn entity = new DeviceSn();
        entity.setSn(sn);
        // ... 设置其他字段
        entity.setWifiName(wifiName);
        entity.setSerialSeq(seq);
        list.add(entity);
    }
    deviceSnMapper.batchInsert(list);
    return new BatchResult(list.size(), startSeq, startSeq + dto.getQuantity() - 1);
}
```

### 11.3 响应

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "count": 30,
    "seqFrom": 16,
    "seqTo": 45
  }
}
```

### 11.4 数据库表

```sql
CREATE TABLE tb_device_sn (
  id               BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  sn               VARCHAR(18)  NOT NULL COMMENT '设备SN（18位）',
  product_model    VARCHAR(10)  NOT NULL COMMENT '产品型号',
  hardware_version VARCHAR(10)  NOT NULL COMMENT '硬件版本',
  factory_code     VARCHAR(10)  NOT NULL COMMENT '工厂代号',
  production_date  VARCHAR(10)  NOT NULL COMMENT '生产日期(YYMMDD)',
  color_code       VARCHAR(5)   NOT NULL COMMENT '颜色代号',
  serial_seq       INT(5)       NOT NULL COMMENT '流水号(5位)',
  wifi_name        VARCHAR(50)  NOT NULL COMMENT 'WiFi名称',
  create_time      DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_sn (sn),
  KEY idx_product_model (product_model),
  KEY idx_factory_code (factory_code),
  KEY idx_production_date (production_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备SN生成记录表';
```

---

## 12. Excel 导出格式

```
┌──────────────┬──────────────────────┬─────────────────────┐
│   WiFi名称    │     设备SN            │      条形码          │
├──────────────┼──────────────────────┼─────────────────────┤
│ BAOBAO_3FA2C1│ C1GF01250702S00001  │ ████████████████    │  ← 条码图片
├──────────────┼──────────────────────┼─────────────────────┤
│ BAOBAO_A1B2C3│ C1GF01250702S00002  │ ████████████████    │
├──────────────┼──────────────────────┼─────────────────────┤
│     ...      │        ...          │        ...          │
└──────────────┴──────────────────────┴─────────────────────┘
```

每条 SN 占一行，条形码列嵌入 CODE128 格式的条码图片（后端 ZXing 生成）。

---

> 📁 设计文档：`bot-ops-frontend/DESIGN_DEVICE_SN.md`
> 📅 更新日期：2026-06-04（V3 — 增加自动流水号）

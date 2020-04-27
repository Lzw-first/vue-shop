<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片上视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8"
          ><el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button
              slot="append"
              icon="el-icon-search"
            ></el-button> </el-input
        ></el-col>
      </el-row>

      <!-- 订单详情列表 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          width="80px"
          align="center"
        ></el-table-column>
        <el-table-column label="是否付款" width="100px" align="center">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'"
              >未付款</el-tag
            >
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="80px"
          align="center"
        >
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="200px">
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px" align="center">
          <el-button
            icon="el-icon-edit"
            size="mini"
            type="primary"
            @click="showEditAddress"
          ></el-button>
          <el-button
            icon="el-icon-location"
            size="mini"
            type="success"
            @click="showProgress"
          ></el-button>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>

    <!-- 编辑区域弹框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editAddressVisible"
      width="50%"
      @close="editAddressVisibleClose"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="CityData"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import CityData from './citydata.js'

export default {
  data() {
    return {
      // 订单列表
      ordersList: [],
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      editAddressVisible: false,
      // 修改地址表单对应数据
      addressForm: {
        // 一个级联选择器
        address1: [],
        // 详细地址文本
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      CityData,
      progressVisible: false,
      // 物流进度
      progressInfo: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList() {
      // 发送请求获取订单列表
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.ordersList = res.data.goods
      this.total = res.data.total
      console.log(this.ordersList)
    },
    // 每页数目发送变化时
    handleSizeChange(activeSize) {
      this.queryInfo.pagesize = activeSize
      this.getOrdersList()
    },
    // 当前页码发生变化
    handleCurrentChange(activeNum) {
      this.queryInfo.pagenum = activeNum
      this.getOrdersList()
    },
    // 点击显示编辑弹框
    showEditAddress() {
      this.editAddressVisible = true
    },
    // 关闭修改地址对话框
    editAddressVisibleClose() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgress() {
      // 获取物流进度
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败')
      }
      this.progressInfo = res.data
      console.log(this.progressInfo)

      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>

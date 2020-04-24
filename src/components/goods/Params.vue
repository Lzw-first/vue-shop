<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意:只允许为第三级分类设置相关参数" type="warning" closable></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
            size="medium"
            style="width: 250px"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 标签页区域 -->
      <!-- activeName 对应的是下面标签的name值 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数标签页 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisable=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(scope.row, i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showeditParams(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性标签页 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisable=true"
          >添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(scope.row, i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showeditParams(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加弹出框 -->
    <el-dialog :title="'添加' + titleName" :visible.sync="addDialogVisable" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleName" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑弹出框 -->
    <el-dialog :title="'编辑' + titleName" :visible.sync="editDialogVisable" width="50%">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleName" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的id数组
      selectedCateKeys: [],
      // 默认选中的标签页
      activeName: 'many',
      // 保存动态参数的数组
      manyTableData: [],
      // 保存静态属性的数组
      onlyTableData: [],
      // 添加对话框是否弹出
      addDialogVisable: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入修改后的名称', trigger: 'blur' }
        ]
      },
      editDialogVisable: false,
      // 编辑信息对应的数据
      editForm: {}
    }
  },
  created() {
    this.getcatelist()
  },
  methods: {
    async getcatelist() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.catelist = res.data
    },
    // 级联选择器发生改变时
    handleChange() {
      this.getParamsData()
    },
    // Tag标签发生变化时也触发获取
    handleClick() {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 只能选择三级分类   但是新版的组件好像就只能选择最后一级
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error('需要第三级分类')
      }
      // 没有返回出去，证明选中的是第三级分类
      console.log(this.selectedCateKeys)
      // 发送请求获得参数列表

      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }

      // 通过循环 将 attr_vals 字符串变成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.split ? item.attr_vals.split(' ') : []
        // 为每个单独添加一下两个属性，防止联动冲突
        // 控制文本款的显示和隐藏
        item.inputVisible = false
        // 文本框的输入内容
        item.inputValue = ''
      })
      console.log(res.data)

      // 获取成功后
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击确定后验证并添加属性
    addParams() {
      // 验证 表单信息
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.success('请按标准填写表格后再重新提交')
        }
        // 发送请求添加参数
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('创建失败')
        }
        this.$message.success('创建成功')
        this.addDialogVisable = false
        this.getParamsData()
      })
    },
    // 点击修改对话框
    async showeditParams(attrId) {
      // 通过属性id获取参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('根据id获取参数信息失败')
      }
      this.editForm = res.data
      console.log(this.editForm)

      this.editDialogVisable = true
    },
    // 确定修改参数
    editParams() {
      // 验证表单元素
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.success('请按标准填写表格后再重新提交')
        }
        // 发送请求修改数据
        const { data: res } = await this.$http.put(
          `categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.editForm.attr_sel
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败！')
        }
        this.$message.success('更新成功！')
        this.getParamsData()
        this.editDialogVisable = false
      })
    },
    // 删除元素
    async removeParams(attrId) {
      // 弹出确认框
      const confirmRes = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('取消成功')
      }
      // 发送请求删除参数
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    // 离开或者按下enter键后隐藏文本框 并保存新的标签
    handleInputConfirm(row) {
      // 判断是否有输入内容 如果没有直接隐藏
      if (row.inputValue.trim().length === 0) {
        // 单独提供，防止每行的相同内容联动
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 有输入内容，那么需要将新内容保存起来
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      // 发送请求保存
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 点击显示文本输入框   直接在标签中写 但是还要自动获取焦点
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    handleClose(row, i) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabled() {
      // 判断并返回true或者false
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 获取三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 选中标签页名字
    titleName() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px;
  span {
    margin-right: 15px;
  }
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 120px;
}
</style>

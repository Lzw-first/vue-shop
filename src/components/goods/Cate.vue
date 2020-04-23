<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 商品分类列表 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        border
        show-index
        index-text
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: green"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="cateQuery.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="cateQuery.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="cateTotal"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="editCateDialogClose"
    >
      <el-form :model="cateForm" :rules="cateRules" ref="cateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="cateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父类分级">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClose"
    >
      <el-form :model="editForm" :rules="cateRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      cateQuery: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateTotal: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 使用template模板
          type: 'template',
          // 使用的模板名称
          template: 'isok'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      cateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      cateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { max: 10, message: '长度不超过10个字符', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      // 选中的父级数组
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      editCateDialogVisible: false,
      editForm: {
        cat_id: '',
        cat_name: ''
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.cateQuery
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }

      this.cateList = res.data.result
      this.cateTotal = res.data.total
    },
    // 监听 pagesize 的变化
    handleSizeChange(pagesize) {
      this.cateQuery.pagesize = pagesize
      this.getCateList()
    },
    handleCurrentChange(pagenum) {
      this.cateQuery.pagenum = pagenum
      this.getCateList()
    },
    showAddCateDialog() {
      // 先获取父级分类列表
      this.getParentCateList()
      // 再弹出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级列表失败')
      }
      this.parentCateList = res.data
    },
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 将改变 cateForm 里面的值
      // 判断选择的父级分类
      if (this.selectedKeys.length > 0) {
        this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.cateForm.cat_level = this.selectedKeys.length
      } else {
        this.cateForm.cat_pid = 0
        this.cateForm.cat_level = 0
      }
    },
    addCate() {
      // 验证信息是否通过
      this.$refs.cateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请验证表单信息是否填写正确')
        }
        // 向服务器发送请求
        const { data: res } = await this.$http.post('categories', this.cateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')

        this.addCateDialogVisible = false
        this.getCateList()
      })
    },
    addCateDialogClose() {
      this.$refs.cateFormRef.resetFields()
      this.selectedKeys = []
      this.cateForm.cat_level = 0
      this.cateForm.cat_pid = 0
    },
    // 编辑分类名称
    showEditCateDialog(row) {
      this.editForm.cat_name = row.cat_name
      this.editForm.cat_id = row.cat_id
      this.editCateDialogVisible = true
    },
    editCate() {
      // 验证是否满足规定
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请验证表单信息是否填写正确')
        }

        // 向服务器发送请求
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
        this.$message.success('修改分类成功')

        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    editCateDialogClose() {
      this.$refs.editFormRef.resetFields()
      this.editCateDialogVisible = false
    },
    // 删除分类操作
    async removeCate(id) {
      // 弹框确认是否需要删除
      const confirmRes = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发送请求删除分类
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.$message.success('删除成功!')

      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin: 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>

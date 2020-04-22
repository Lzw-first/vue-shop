<template>
  <div>
    <!-- 面包屑头部 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮区域 row 是一行 col是行里面的列  -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 增加一个扩展键 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bd-bottom', l1 == 0 ? 'bd-top' : '', 'vcenter']"
              v-for="(item1, l1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bd-top', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="290px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightsDialog(scope.row)"
            >分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleVisible" width="50%" @close="addRoleDialogClose">
      <el-form :model="addRoleForm" ref="addRoleFormRef" :rules="RoleRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleVisible"
      width="50%"
      @close="editRoleDialogClose"
    >
      <el-form :model="editRoleForm" ref="editRoleFormRef" :rules="RoleRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsVisible"
      width="50%"
      @close="setRoleDialogClose"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      addRoleVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      RoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', triggrt: 'blur' },
          { max: 8, message: '请输入8个内的字符', triggrt: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', triggrt: 'blur' },
          { max: 20, message: '请输入不超过20个字符', triggrt: 'blur' }
        ]
      },
      editRoleVisible: false,
      editRoleForm: {},
      setRightsVisible: false,
      // 角色的所有权限数据
      rightsList: [],
      // 设置需要展示的名称 label 和 子分子的数组  树型控件属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中节点id值
      defaultKeys: [],
      // 当前用户角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取觉得列表失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    addRole() {
      this.addRoleVisible = true
    },
    addRoleInfo() {
      // 验证是否通过验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写正确的格式后再提交')
        // 发送请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加角色成功')

        this.getRolesList()
        this.addRoleVisible = false
      })
    },
    addRoleDialogClose() {
      this.$refs.addRoleFormRef.resetFields()
    },
    async editRoles(id) {
      // 根据ID查询角色信息
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.editRoleForm = res.data
      // 弹出弹框
      this.editRoleVisible = true
    },
    editRoleInfo() {
      // 验证是否满足规则
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写正确的格式后再提交')
        // 发送请求更改角色信息
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败')
        }
        this.$message.success('修改用户成功')

        this.editRoleVisible = false
        this.getRolesList()
      })
    },
    editRoleDialogClose() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 删除角色按钮  需要变成async 然后用 await，否者会直接提示已取消删除
    async deleteRoles(id) {
      // 弹出确认框
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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

      // 发送请求删除角色
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 根据id删除权限
    async removeRightById(role, rightId) {
      // 每次删除之前都要先进行确认
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
      // 发送请求删除权限
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }

      this.$message.success('删除权限成功')
      // 直接修改 role的children 就可以防止重新刷新页面
      role.children = res.data
    },
    // 弹出设置权限对话框
    async showSetRightsDialog(row) {
      // 先获取保存角色id
      this.roleId = row.id
      // 向服务器发送请求获取权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }
      this.rightsList = res.data
      // 递归获得选中节点id值
      this.getLeafKeys(row, this.defaultKeys)

      this.setRightsVisible = true
    },
    // 构建一个递归函数
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    setRoleDialogClose() {
      this.defaultKeys = []
    },
    // 确定分配权限
    async setRoleRights() {
      // 获取选中的权限id值
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      // 将数组转化为指定的字符串
      const keyString = keys.join(',')

      // 向服务器发送请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: keyString }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }

      this.$message.success('更新角色成功')

      this.getRolesList()
      this.setRightsVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bd-bottom {
  border-bottom: 1px solid #eee;
}
.bd-top {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>

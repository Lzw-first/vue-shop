<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 主体侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <div class="toggle_button" @click="toggleCollapse">|||</div>
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="savePath('/' + subItem.path)">
              <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体内容区域 -->
      <el-main>
        <!-- 放置一个路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 被激活的地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      // 清空浏览器的sessionStorage
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus', { token: window.sessionStorage.getItem('token') })
      // 接口获取数据失败，提示token无效
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存连接激活状态
    savePath(activepath) {
      window.sessionStorage.setItem('activePath', activepath)
      this.activePath = activepath
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
      color: #fff;
      font-size: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
    i {
      margin-right: 10px;
    }
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggle_button {
  line-height: 24px;
  font-size: 10px;
  text-align: center;
  background-color: #4a5064;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入外部字体库
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'

// 导入table-tree 插件
import TreeTable from 'vue-table-with-tree-grid'

Vue.component('tree-table', TreeTable)

// 设置默认地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios
// http request 拦截器
axios.interceptors.request.use(
  function(config) {
    // 通过拦截request请求,主动为 请求头,追加新属性 Authorization,等于 token 值
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

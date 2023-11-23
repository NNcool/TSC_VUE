<template>
  <div>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1" @click="user">生成图像</el-menu-item>
      <el-menu-item index="2" @click="lithology">岩性信息</el-menu-item>
      <el-menu-item index="3" @click="relative">知识关联</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: '1'
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    lithology() {
      if (this.$route.path !== '/lithology') {
        this.$router.push('/lithology');
      }
    },
    relative() {
      this.$router.push({ path: '/relative' })
    },
    user() {
      this.$router.push({ path: '/' })
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-menu {
  border-right: solid 1px #e6e6e6;
  list-style: none;
  position: relative;
  margin: 0;
  padding-left: 0;
  background-color: #877e7e;
}

.el-menu-item {
  float: left;
  height: 60px;
  line-height: 60px;
  margin: 0;
  border-bottom: 2px solid transparent;
  color: #fff;
}

.el-menu-item.is-active {
  border-bottom: 2px solid #409EFF;
  color: #fff;
}
</style>

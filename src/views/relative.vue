<template>
    <div>
      <el-container>
        <el-header>
            <home-header />
        </el-header>

        <el-main>知识关联页面
            <el-tree :data="areas" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
        </el-main>
      </el-container>
    </div>
</template>
  
  <script>
  import HomeHeader from '../components/HomeHeader.vue'
  import axios from 'axios';

  export default {
    components: { HomeHeader },
    data() {
      return {
        areas: [],
        defaultProps: {
          children: 'childrenArea',
          label: 'areaName'
        }
      }
    },
    created() {
        this.getAreas(); // 调用 getAreas 方法
    },
    methods: {
        handleNodeClick(data) {
            console.log(data);
        },
        getAreas: function () {
            axios.get("http://localhost:9001/area/buildAreaTree")
            .then((response) => {
                this.areas = response.data.result;
                console.log(this.areas)
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }
  }; 
  </script>
  
  <style scoped></style>

<template>
    <div>
      <el-container>
        <el-header>
            <home-header />
        </el-header>

        <el-main>
          <el-container  style="width: 100%;">

            <el-aside style="flex: 0 0 30%; max-width: 40%; background-color: rgb(238, 241, 246)">
              <el-scrollbar wrap-class="scroll-wrapper">
                <div class="content-container">
                  知识关联页面
                  <el-tree :data="areas" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
                  <div>
                    <h3>点击的叶子节点列表：</h3>
                    <ul>
                      <li v-for="leaf in clickedLeaves" :key="leaf.id" @click="handleOutputClick(leaf)" class="clickable-item">{{ leaf.lithologyPattern }}</li>
                    </ul>
                  </div>
                </div>
              </el-scrollbar>
            </el-aside>

            <el-container style="width: 40%;">
              
            </el-container>

            <el-aside style="flex: 0 0 30%; max-width: 40%; background-color: rgb(238, 241, 246)">
              右边
            </el-aside>
          </el-container>
        </el-main>
      </el-container>
    </div>
</template>
  
  <script>
  import HomeHeader from '../components/HomeHeader.vue'
  import axios from 'axios';

  export default {
    components: { 
      HomeHeader
    },

    data() {
      return {
        mindmapData: null,
        areas: [],
        defaultProps: {
          children: 'childrenArea',
          label: 'areaName'
        },
        clickedLeaves: []  // 用于存储点击的叶子节点信息
      }
    },

    created() {
        this.getAreas(); // 调用 getAreas 方法
        this.fetchMindmapData();
    },

    methods: {
        /**懒加载 */
        loadRelativeOuput(node, resolve) {
          console.info(node)
          if (node.level === 0) {
            return resolve([{ name: 'region' }]);
          }
          if (node.level > 1) return resolve([]);

          setTimeout(() => {
            const data = [{
              name: 'leaf',
              leaf: true
            }, {
              name: 'zone'
            }];

            resolve(data);
          }, 500);
        },
        handleNodeClick(data) {
            console.log(data);
            if (data.leaf) { // 检查是否为叶子节点
                this.getOutputs(data) // 将叶子节点信息添加到数组中
            }
        },
        handleOutputClick(leaf) {
            console.log(leaf);
            console.log(leaf.id);
           
        },
        getOutputs: function (data) {
            axios.get("http://localhost:9001/output/findsByAreaId/"+data.id)
            .then((response) => {
                this.clickedLeaves = response.data.result;
                console.log(this.clickedLeaves)
            })
            .catch((error) => {
                console.log(error);
            });
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
  
<style scoped>
  .page-container {
    height: 50%;
    overflow: auto;
    border: 1px solid #eee;
  }
  .el-icon-plus {
    margin-right: 5px;
  }
  .row-container {
    display: flex;
    align-items: center;
  }
  .clickable-item {
    cursor: pointer;
  }

  .clickable-item:hover {
    background-color: #c3c3c3; /* 设置点击时的背景颜色 */
  }
</style>

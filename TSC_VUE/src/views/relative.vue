<template>
    <div>
      <el-container>
        <el-header>
            <home-header />
        </el-header>

        <el-main>
          <el-container  style="width: 100%;">

            <el-aside style="flex: 0 0 30%; max-width: 20%; background-color: rgb(238, 241, 246)">
              <el-scrollbar wrap-class="scroll-wrapper">
                <div class="content-container">
                  马来西亚地区树
                  <el-tree :data="areas" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
                  <div>
                    <h3>当前点击的地区岩性列表：</h3>
                    <ul>
                      <li v-for="leaf in clickedLeaves" :key="leaf.id" @click="handleOutputClick(leaf)" class="clickable-item">{{ leaf.lithologyPattern+"("+leaf.age+")" }}</li>
                    </ul>
                  </div>
                </div>
              </el-scrollbar>
            </el-aside>

            <el-container style="width: 70%;">
              
                <div class="showBox"></div>
                <div ref="myChart" :style="{width: '80vw', height: '100vh'}" style="margin: 0 auto;"></div>
              
            </el-container>

            <!-- <el-aside style="flex: 0 0 30%; max-width: 40%; background-color: rgb(238, 241, 246)">
              右边
            </el-aside> -->
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
        clickedLeaves: [],  // 用于存储点击的叶子节点信息
        arr:{},
        spotId:null,
      }
    },

    created() {
        this.getAreas(); // 调用 getAreas 方法
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
        // 二、每次点击树的节点进行调佣
        handleNodeClick(data) {
            console.log("当前地区节点数据：",data);
            if (data.leaf) { // 检查是否为叶子节点
                this.getOutputs(data) // 将叶子节点信息添加到数组中
            }
        },
        //四、点击其中一个岩性，展示其节点信息的名称和地质年龄
        handleOutputClick(leaf) {
            console.log("点击的岩性id",leaf.id);
            // 构建echarts
            this.drawLine(leaf.id)
           
        },
        // 三、如果是地区叶子节点，展示其下面岩性信息
        getOutputs: function (data) {
          console.log("dddd",data.id)
            axios.get("http://localhost:9001/output/findsByAreaId/"+data.id)
            .then((response) => {
                this.clickedLeaves = response.data.result;
                console.log("点击叶子结点下的岩性列表：",this.clickedLeaves)
            })
            .catch((error) => {
                console.log(error);
            });
        },

        // 一、获取地区树
        getAreas: function () {
            axios.get("http://localhost:9001/area/buildAreaTree")
            .then((response) => {
                this.areas = response.data.result;
                console.log("当前树：",this.areas)
            })
            .catch((error) => {
                console.log(error);
            });
        },

        drawLine(id) {
          axios.get("http://localhost:9001/output/findRangeSpotById/"+id)
          .then((response) => {
                this.arr = response.data.result;
                // 数据加载完成后进行 ECharts 初始化和绘制
                this.initECharts();
            })
            .catch((error) => {
                console.log(error);
            });
        },

        initECharts(){
          var data = this.arr;
                        var echarts = require('echarts');
                        let imgs = 'el-icon-star-on'
                        var myChart = echarts.init(this.$refs.myChart);
                        var option = {
                            backgroundColor: '#AB9793',
                            tooltip: {
                                show: true,
                                trigger: 'item',
                                triggerOn: 'mousemove',
                                formatter: function (params) {
                                  console.log("是否主表",params.data.isMaster)
                                  // 在这里定义你想要显示的提示信息
                                  if (params.data.isMaster){
                                    //master绝对数据
                                    return "宇(宙)：" + params.data.eon + 
                                          "<br>界(代)：" + params.data.era + 
                                          "<br>系(纪)：" + params.data.period + 
                                          "<br>统(世)：" + params.data.epoch + 
                                          "<br>统(世)-阶段：" + params.data.subEpoch + 
                                          "<br>阶(期)：" + params.data.stage + 
                                          "<br>阶(期)-阶段：" + params.data.subStage + 
                                          "<br>地质年龄[age]：" + params.data.age;
                                  }else{
                                    return "所属地区[location]：" + params.data.areaName +
                                          "<br>Lithology(TSC)：" + params.data.name + 
                                          "<br>Formation：" + params.data.faciesLevel + 
                                          "<br>计算公式：" + params.data.maFormula +
                                          "<br>地质年龄[age]：" + params.data.age;
                                          // "<br>CombinedComments：" + params.data.calibrationComments +
                                          // "<br>Lithology：" + params.data.lithology +
                                          // "<br>CombinedComments：" + params.data.calibrationComments +
                                          // "<br>CombinedComments：" + params.data.calibrationComments;
                                  }
                                }
                            },
                            series: [{
                                type: 'tree',
                                id: 0,
                                name: 'tree1',
                                data: [data],
                                layout: 'orthogonal',

                                top: '10%',
                                left: '8%',
                                bottom: '22%',
                                right: '20%',


                                symbolSize: 7,

                                edgeShape: 'polyline',
                                edgeForkPosition: '63%',
                                initialTreeDepth: 0, //初始展开的层级（深度）

                                //小圆点
                                itemStyle: {
                                    color: '#EE5A0B',
                                    borderColor: '#EE5A0B',
                                },
                    
                                leaves: {
                                  label: {
                                      position: 'inside',
                                      verticalAlign: 'middle',
                                      align: 'center',
                                      // backgroundColor: '#0000FF',  // 设置叶子节点的背景颜色
                                      // color: '#FFFFFF',  // 设置叶子节点文本的颜色
                                  }
                                },

                                lineStyle: {
                                    curveness: 0.5, //线的曲度
                                    width: 3 ,//线宽
                                    color : '#4B3C36',
                                    borderColor:'#FF0000',
                                    formatter: function (params) {
                                            // 返回你想要在每个节点前的线上展示的内容
                                            return '自定义内容';
                                        },
                                    label: {
                                        show: true,
                                        position: 'middle',
                                        formatter: function (params) {
                                            // 返回你想要在每个节点前的线上展示的内容
                                            return '自定义内容';
                                        },
                                        fontSize: 10,  // 设置字体大小
                                        color: '#000',  // 设置字体颜色
                                    }
                                },

                                label: {
                                    backgroundColor: '#A86045',
                                    position: 'inside',
                                    verticalAlign: 'middle',
                                    align: 'center',
                                    borderColor: '#4B3C36',
                                    borderWidth: 2,
                                    borderRadius: 5,
                                    padding: 5,
                                    height: 60,
                                    lineHeight:60,
                                    formatter: function(data) {

                                        return ["{name| "+"10%   "+ data.data.bottom.name+"}{id| "+"\n"+"top:【"+data.data.top.id+"】"+"}{value| "+data.data.top.age+"}{id| "+";"+"bottom:【"+data.data.bottom.id+"】"+"}{value| "+data.data.bottom.age+"}"].join('');
                                    },
                                    rich: { //给不同的数据应用不同的样式
                                        img:{
                                            align: 'left',
                                            backgroundColor: {
                                                image: '../assets/Help.png'
                                            },
                                            height:40
                                        },
                                        name: {
                                            color: '#000',
                                            fontSize: 25,
                                            lineHeight: 40,
                                            align: 'left',  // 设置左对齐
                                        },
                                        id: {
                                            color: '#000',
                                            fontSize: 14,
                                            lineHeight: 20,
                                            align: 'left',  // 设置左对齐
                                        },
                                        
                                        value: {
                                            color: '#000',
                                            fontSize: 14,
                                            lineHeight: 20,
                                            fontWeight: 'bold',
                                            align: 'left',  // 设置左对齐
                                        },

                                    }
                                },

                                expandAndCollapse: true,
                                animationDuration: 550,
                                animationDurationUpdate: 750,
                                roam: true, //是否开启鼠标缩放和平移漫游    如果版本太低的话  这里是不生效的   我用的是4.2.1
                                children: 'children', // 添加 children 配置
                            }]
                        };


                        // 使用刚指定的配置项和数据显示图表。
                        myChart.setOption(option);
                        myChart.on('click',  function(param) {
                            //这个params可以获取你要的图中的当前点击的项的参数
                            console.log("点击")
                            console.dir(param.data)
                        });    
        },
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

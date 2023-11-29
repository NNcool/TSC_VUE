<template>
    <div>
        <el-container>
            <el-header>
                <home-header />
            </el-header>
            <div class="full-box" style="display: flex; flex-direction: column; height: 110%;">
                <div class="button-container">
                    <button class="custom-button" @click="showSettingsDialog">Settings</button>
                    <button class="custom-button" @click="generateChart0">Generate Chart</button>
                    <h1 class="title">TimeScale Creator GTS2020 chart</h1>
                </div>
                <el-container style="width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div ref="chartCanvas" :style="{width: '80vw', height: '100vh'}" style="margin: 16px auto;"></div>
                </el-container>
                <el-table :data="tableData" v-if="showTable" class="table-lines" border :span-method="mergedtable" style="flex: 1; overflow-y: auto;">
                    <el-table-column :prop="dynamicColumns[0].field" :label="dynamicColumns[0].label"></el-table-column>
                    <el-table-column :prop="dynamicColumns[1].field" :label="dynamicColumns[1].label"></el-table-column>
                    <el-table-column :prop="dynamicColumns[2].field" :label="dynamicColumns[2].label"></el-table-column>
                    <el-table-column :prop="dynamicColumns[3].field" :label="dynamicColumns[3].label"></el-table-column>
                    <el-table-column v-for="column in generatedColumns" :key="column.field" :prop="'column.field'" :label="column.label"></el-table-column>
                </el-table>
            </div>
        </el-container>

        <!-- 对话框组件 -->
        <el-dialog :visible.sync="showDialog">
            <div class="form-box">
                <div v-if="showTimeIntervalCard">
                    <el-form ref="form" :model="form" label-width="130px" >
                        <button @click="button1Click">Choose Time Interval</button>
                        <button @click="button2Click">Choose Columns</button>
                        <button @click="button3Click">Font Options</button>
                        <button @click="button4Click">Map Points</button>
                        <hr class="divider">
                        <h1 class="form-title">Ma</h1>
                        <hr class="divider">
                        <el-form-item label="Top of Interval">
                        </el-form-item>
                        <el-radio  v-model="form.selectedOption1" :label="1">Age/Stage Name
                            <el-select v-model="form.region1" placeholder="请选择Name" @change="handleRegion1Change">
                                <el-option label="Present(0 Ma)" value="0"></el-option>
                                <el-option v-for="(item, index) in this.limitData" :key="index" :label="item.stage + '(' + item.ma + ' Ma)'" :value="item.ma"></el-option>
                            </el-select>
                        </el-radio>
                        <el-radio v-model="form.selectedOption1" :label="2">ma：
                            <el-input v-model="form.name1" class="custom-input" @input="handleName1Change"></el-input>
                        </el-radio>
                        <hr class="divider">
                        <el-form-item label="Base of Interval">
                        </el-form-item>
                        <el-radio  v-model="form.selectedOption2" :label="3">Age/Stage Name
                            <el-select v-model="form.region2" placeholder="请选择Name" @change="handleRegion2Change">
                                <el-option label="Present(0 Ma)" value="0"></el-option>
                                <el-option v-for="(item, index) in this.limitData" :key="index" :label="item.stage + '(' + item.ma + ' Ma)'" :value="item.ma"></el-option>
                            </el-select>
                        </el-radio>
                        <el-radio v-model="form.selectedOption2" :label="4">ma：
                            <el-input v-model="form.name2" class="custom-input"  @input="handleName2Change"></el-input>
                        </el-radio>
                        <hr class="divider">
                        <el-form-item label="Vertical Scale:">
                            <el-input v-model="form.name3" class="custom-input1"></el-input>
                            <span>cm per date unit(eg. 1 cm per Myr)</span>
                        </el-form-item>
                        <el-checkbox v-model="checked">Gray out (and do not draw) columns which do not have data on the selected time interval</el-checkbox>
                        <!-- <div class="spacer"></div> -->
                        <hr class="divider">
                        <el-checkbox v-model="checked1">Add MouseOver info (popups)</el-checkbox>
                        <el-checkbox v-model="checked2">Enable Global Priority Filtering for block & event columns.</el-checkbox>
                        <el-checkbox v-model="checked3">Enable stage background for event columns.</el-checkbox>
                        <el-checkbox v-model="checked4">Enable legend for the chart.</el-checkbox>
                        <el-checkbox v-model="checked5">Do not auto-indent lithology patterns.</el-checkbox>
                        <el-checkbox v-model="checked6">Conserve Chart Space in Family Tree Plotting</el-checkbox>
                        <el-checkbox v-model="checked7">Hide block labels based on priority</el-checkbox>
                        <div class="hode-button">
                            <el-button>Load...</el-button>
                            <el-button>Save...</el-button>
                            <el-button @click="showDialog = false">Close</el-button>
                            <el-button type="primary" @click="generateChart0">Generate</el-button>
                            <el-button @click="showDialog = false">Generate and Close</el-button>
                        </div>
                    </el-form>
                </div>
                <div class="Card" v-if="showTimeIntervalCard2">
                    <el-form ref="form" :model="form" label-width="130px" >
                        <button @click="button1Click">Choose Time Interval</button>
                        <button @click="button2Click">Choose Columns</button>
                        <button @click="button3Click">Font Options</button>
                        <button @click="button4Click">Map Points</button>
                        <hr class="divider">
                        <el-tree :data="treeData" show-checkbox :default-expand-all="false" :check-strictly="true" :node-key="'value'" ref="tree" highlight-current
                                :props="defaultProps"></el-tree>
                        <div class="hode-button">
                            <!-- <el-button @click="getCheckedNodes">choose</el-button> -->
                            <el-button>Load...</el-button>
                            <el-button>Save...</el-button>
                            <el-button @click="showDialog = false">Close</el-button>
                            <el-button type="primary" @click="generateChart">Generate</el-button>
                            <el-button @click="showDialog = false">Generate and Close</el-button>
                        </div>
                    </el-form>
                </div>
            
            </div>
        </el-dialog>
    </div>
</template>
  
<script>
import axios from 'axios';
import HomeHeader from '../components/HomeHeader.vue';
import CsRuler from "cs-ruler";
import Chart from 'chart.js';

export default {
    components: { HomeHeader,'cs-ruler':CsRuler.csingruler },
    data() {
        return {
            selectedNodeIds :[],
            generatedColumns:[],//用于存储生成的列信息
            showTable:false,//控制是否显示数据表格
            tableData:[],//存储数据表格的数据
            limitData:[],
            chartDatas:[],
            chart:null,
            minValue:0,
            maxValue:10,
            dynamicColumns:[
                {field:'ma',label:'Ma'},
                {field:'period',label:'Period'},
                {field:'epoch',label:'Epoch'},
                {field:'ageStage',label:'Age/Stage'},
            ],
            defaultProps: {
                children: 'childrenArea',
                label: 'areaName'
            },
            form: {
                name1: '',
                name2: '',
                selectedOption1:1,
                selectedOption2:3,
            },
            imageUrls:[
                '/assets/Clayeylimestone.jpg',
                '/assets/Claystone.jpg'
            ],
            checked:false,
            checked1:false,
            checked2:false,
            checked3:false,
            checked4:false,
            checked5:false,
            checked6:false,
            checked7:false,
            showDialog: false, // 控制对话框的显示/隐藏
            showTimeIntervalCard: false,
            showTimeIntervalCard2: false,
            showList:false
        };
    },
    created(){
        axios.get("http://localhost:9001/area/buildAreaTree")
        .then(response => {
            this.treeData = response.data.result;
        })
        .catch(error => {
            console.error(error);
        });
        axios.get("http://localhost:9001/masterchronos/getma")
        .then(response => {
            this.limitData = response.data.result;
            console.log("this.limitData:",this.limitData);
        })
        axios.get("http://localhost:9001/masterchronos/allEntities")
        .then(response => {
            const dataFromBackend = response.data.result;
            console.log("dataFromBackend:",dataFromBackend);

            // 更新tableData，同时创建ma列
            this.tableData = dataFromBackend.map((rowData, index) => {
                const row = {
                    id: rowData[0],
                    ma: rowData[1], // 填充ma列从1到16
                    period: rowData[2],
                    epoch: rowData[3],
                    ageStage: rowData[4],
                    // 其他属性...
                };
                return row;
            })
        })
        .catch(error => {
            console.error(error);
        });
        axios.get("http://localhost:9001/masterchronos/getChartValue")
        .then(response =>{
            this.chartDatas = response.data.result;
            console.log("chartDatas:",this.chartDatas);
        })
    },
    methods: {
        showSettingsDialog() {
            this.showDialog = true; // 当点击"Settings"按钮时显示对话框
            this.showTimeIntervalCard = true;
            this.showTimeIntervalCard2 = false;
        },
        button1Click() {
            this.showTimeIntervalCard = true;
            this.showTimeIntervalCard2 = false;
        },
        button2Click(){
            this.showTimeIntervalCard = false;
            this.showTimeIntervalCard2 = true;
        },
        button3Click() {
        // 在这里处理按钮3的点击事件
        },
        button4Click() {
        // 在这里处理按钮4的点击事件
            // if(this.$refs.tree){
            //     console.log(this.$refs.tree.getCheckedNodes());
            //         const checkedNodes = this.$refs.tree.getCheckedNodes();
            //         console.log("checkedNodes:",checkedNodes);
            //         const selectedIds = checkedNodes.map(node => node.areaName);
            //         console.log("selectedIds:",selectedIds);
            //         this.selectedNodeIds = selectedIds;
            //         console.log("Selected Node IDs:", this.selectedNodeIds);
            //         //根据所选节点生成对应列的信息
            //         this.generatedColumns = checkedNodes.map(node => {
            //             return{
            //                 field:node.id,
            //                 label:node.areaName
            //             };
            //         });
            //         console.log("generatedColumns:",this.generatedColumns);
            //         this.showDialog = false;
            //         this.showTable = true;
            // }else{
            //     this.generatedColumns = [];
            //     this.showDialog = false;
            //         this.showTable = true;
            // }
        },
        handleRegion1Change(value){
            if (this.form.selectedOption1 === 1) {
                this.minValue = parseFloat(value);
            }
        },
        handleName1Change(value){
            if(this.form.selectedOption1 === 2){
                this.minValue = parseFloat(value);
            }
        },
        handleRegion2Change(value){
            if (this.form.selectedOption2 === 3) {
                console.log('Selected option value for region1:',value);
                this.maxValue = parseFloat(value);
            }
        },
        handleName2Change(value){
            if(this.form.selectedOption2 === 4){
                this.maxValue = parseFloat(value);
            }
        },
        generateChart0(){
            var echarts = require('echarts');
            const fixedLabels = ['period','epoch','ageStage'];
                var chartCanvas = echarts.init(this.$refs.chartCanvas);
                console.log("this.chartDatas:",this.chartDatas);
                const seriesData = this.chartDatas.map(item =>{
                    return {
                        name: item.name, // 替换为从后端数据中获取的系列名称
                        type: 'bar',
                        stack: '使用情况',
                        data: item.data, // 替换为从后端数据中获取的具体系列数据
                        itemStyle: {
                            normal: { color: item.color },
                        },
                        label: {
                            show: true,
                            position: 'inside',
                            formatter: '{a}', // 显示数据值
                        },
                        barGap: 0,
                        barCategoryGap: 0,
                    };
                });
                var option = {
                    title: {
                        text: 'Ma',
                        left:'0.5%',
                        top:'30px',
                        textStyle: {    
                        color: "#436EEE",
                        fontSize: 25,   
                        }
                    },
                    grid: {
                        left: 5,  // 设置图表绘制区域的左边距
                        right: 5, // 设置图表绘制区域的右边距
                        containLabel: true,
                    },
                    dataZoom: [
                        {
                            type: 'slider',
                            show: true,
                            xAxisIndex: [0],
                            start: 0,
                            end: 100, // 初始显示范围的百分比
                        },
                    ],
                    xAxis: {
                        type: 'category',
                        axisLabel: {
                            interval: 0, // 设置刻度点的显示间隔
                                
                            formatter: function (value) {
                                return value.length > 10 ? value.slice(0, 10) + "..." : value; // 控制显示的标签长度
                            },
                        },
                        data: fixedLabels,
                        splitLine:{
                            show:false,
                        },
                        position: 'top', // 设置 x 轴显示在顶部
                    },
                    yAxis: {
                        splitLine: {
                            show: true, // 显示主刻度线
                        },
                        minorSplitLine: {
                            show: true, // 显示次刻度线
                        },
                        axisTick: { // 显示刻度
                            show: true,
                        },
                        inverse: true, // 设置倒序显示
                        min: this.minValue,        // 设置 y 轴最小值
                        max: this.maxValue,       // 设置 y 轴最大值
                        splitNumber: 10, // 设置更小的刻度段数
                        axisLabel: {
                            interval: 5, // 设置刻度点的显示间隔
                            },
                    },
                    tooltip : {
                        trigger: 'axis',//坐标轴吸附①
                        showDelay : 0,
                        formatter : function (params) {//由于axis，获取的params变成数组
                        },
                        axisPointer:{
                            show: true,
                            type : 'cross',
                            lineStyle: {
                                type : 'dashed',
                                width : 1
                            },
                            snap:true,//坐标轴吸附②
                        }
                    },
                    series: seriesData
                };
                // 使用刚指定的配置项和数据显示图表。
                chartCanvas.setOption(option);
                chartCanvas.on('click',  function(param) {
                //这个params可以获取你要的图中的当前点击的项的参数
                console.log("点击")
                console.dir(param)
                });
                this.showDialog = false;
            
        },
        generateChart(){
            var echarts = require('echarts');
            if(this.$refs.tree){
                const fixedLabels = ['period','epoch','ageStage'];
                const checkedNodes = this.$refs.tree.getCheckedNodes();
                console.log("checkedNodes:",checkedNodes);
                const dynamicLabels = checkedNodes.map(node => node.areaName);
                console.log("dynamicLabels:",dynamicLabels);
                const labels = fixedLabels.concat(dynamicLabels);
                console.log("labels:",labels);
                console.log("this.tableData:",this.tableData);
                var chartCanvas = echarts.init(this.$refs.chartCanvas);
                console.log("this.chartDatas:",this.chartDatas);
                const fixedseriesData = this.chartDatas.map(item =>{
                    return {
                        name: item.name, // 替换为从后端数据中获取的系列名称
                        type: 'bar',
                        stack: 'stack-1',
                        barWidth:'100%',
                        data: item.data, // 替换为从后端数据中获取的具体系列数据
                        itemStyle: {
                            normal: { color: item.color },
                        },
                        label: {
                            show: true,
                            position: 'inside',
                            formatter: '{a}', // 显示数据值
                        },
                        barGap: 0,
                        barCategoryGap: 0,
                    };
                });
                const dynamicSeries = [
                    // 将单独的值包装在数组中
                    {
                        name: 'Series A',
                        type: 'bar',
                        stack: 'stack-1',
                        itemStyle: {
                            normal: { 
                                color: {
                                    type: 'pattern',
                                    image: new Image(),
                                },
                            },
                        },
                        data: [null, null,null, 1,2,3], // 替换为具体的数据
                    },
                    {
                        name: 'Series B',
                        type: 'bar',
                        stack: 'stack-1',
                        itemStyle: {
                            normal: { 
                                color: {
                                    type: 'pattern',
                                    image: new Image(),
                                },
                             },
                        },
                        data: [null, null,null, 4,5,6], // 替换为具体的数据
                    },
                    {
                        name: 'Series C',
                        type: 'bar',
                        stack: 'stack-1',
                        itemStyle: {
                            normal: { 
                                color: {
                                    type: 'pattern',
                                    image: new Image(),
                                },
                             },
                        },
                        data: [null, null,null, 7,8,9], // 替换为具体的数据
                    },
                ]
                dynamicSeries.forEach(series => {
                    series.itemStyle.normal.color.image.imageSize = [30, 30]; 
                    series.itemStyle.normal.color.image.src = require('@/assets/Coarse-grainedsandstone.jpg');
                });
                // const dynamicLines = dynamicSeries.map((series,index) =>{
                //     return {
                //         type: 'line',
                //         symbol: 'none',
                //         data: new Array(labels.length).fill(null),
                //         markLine: {
                //             symbol: ['none', 'none'],
                //             lineStyle: {
                //                 type: 'dashed',
                //                 color: 'red', // 你可以自定义竖线的颜色
                //             },
                //             data: [
                //                 { xAxis: index * 3, name: '起始线' },
                //                 { xAxis: (index + 1) * 3, name: '结束线' },
                //             ],
                //         },
                //     };
                // });
                const seriesData = fixedseriesData.concat(dynamicSeries);
                console.log("seriesData:",seriesData);
                // seriesData.push(...dynamicSeries);
                var option = {
                    title: {
                        text: 'Ma',
                        left:'20px',
                        textStyle: {    
                        color: "#436EEE",
                        fontSize: 17,   
                        }
                    },
                    grid: {
                        left: 50,  // 调整图表左边距离
                        right: 50, // 调整图表右边距离
                        bottom: 50, // 调整图表底部距离
                        containLabel: true, // 包含坐标轴的标签
                    },
                    dataZoom: [
                        {
                            type: 'slider',
                            show: true,
                            xAxisIndex: [0],
                            start: 0,
                            end: 100, // 初始显示范围的百分比
                        },
                    ],
                    tooltip : {
                        trigger: 'axis',//坐标轴吸附①
                        showDelay : 0,
                        formatter : function (params) {//由于axis，获取的params变成数组
                        },
                        axisPointer:{
                            show: true,
                            type : 'cross',
                            lineStyle: {
                                type : 'dashed',
                                width : 1
                            },
                            snap:true,//坐标轴吸附②
                        }
                    },
                    xAxis: {
                        type: 'category',
                        axisLabel: {
                            interval: 0, // 设置刻度点的显示间隔
                                
                            formatter: function (value) {
                                return value.length > 10 ? value.slice(0, 10) + "..." : value; // 控制显示的标签长度
                            },
                        },
                        data: labels,
                        splitLine:{
                            show:false,
                        },
                        position: 'top', // 设置 x 轴显示在顶部
                    },
                    yAxis: {
                        splitLine: {
                            show: true, // 显示主刻度线
                        },
                        minorSplitLine: {
                            show: true, // 显示次刻度线
                        },
                        inverse: true, // 设置倒序显示
                        min: this.minValue,        // 设置 y 轴最小值
                        max: this.maxValue,       // 设置 y 轴最大值
                        splitNumber: 10, // 设置更小的刻度段数
                        axisLabel: {
                            interval: 5, // 设置刻度点的显示间隔
                            },
                    },

                    series: seriesData,
                    
                };
                
                // 使用刚指定的配置项和数据显示图表。
                chartCanvas.setOption(option);
                chartCanvas.on('click',  function(param) {
                //这个params可以获取你要的图中的当前点击的项的参数
                console.log("点击")
                console.dir(param)
                });
                this.showDialog = false; 
            }else{
                console.error("this.$refs.tree is undefined");
            }
            
        },
        //合并单元格
        mergedtable({ row, column, rowIndex, columnIndex }) {
            if (columnIndex > 0) {
                let spanOneArr = [];
                let concatOne = 0;
                let prevItem = null;

                this.tableData.forEach((item, index) => {
                    if (index === 0) {
                        spanOneArr.push(1);
                    } else {
                        if (item[column.property] === prevItem && prevItem != null) {
                            spanOneArr[concatOne]++;
                            spanOneArr.push(0);
                        } else {
                            spanOneArr.push(1);
                            concatOne = index;
                        }
                    }
                    prevItem = item[column.property];
                });

                const currentRow = spanOneArr[rowIndex];
                const _col = currentRow > 0 ? 1 : 0;

                return {
                    rowspan: currentRow,
                    colspan: _col,
                };
            }
        },
    }
};
</script>
  
<style scoped>
    .full-box {
        width: calc(100% - 6%);
        height: 150%;
        position: absolute;
        top: 80px;
        left: 1.7%;
        background-color: #f0f0f0;
        text-align: center;
        padding: 20px;
        border: 2px solid #000;
    }

    .button-container {
        display: flex;
        justify-content: 10%;
    }

    .custom-button {
        margin-right: 10px; /* 添加按钮之间的右边距 */
        padding: 10px 10px;
        background-color: #007BFF;
        color: #fff;
        border: none;
        cursor: pointer;
        border-radius: 5px;
        font-size: 16px;
    }

    .hode-button{
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        margin-top: 80px;
    }

    .custom-button:hover {
        background-color: #0056b3;
    }
    .title {
        position: absolute;
        top: -10px; 
        left: 25%; 
        padding: 20px;
        width: 50%; /* 为标题设置固定宽度 */
        z-index: 1;
        
    }
    .form-title{
        font-size:15px;
    }

    .form-box{
        margin-top: -50px;
    }

    .el-form-item{
        margin-bottom: 0px;
    }

    /* .el-form-item{
        margin-bottom: 0px;
    } */
    .custom-input {
        width: 220px;
        margin-left: 80px;
    }
    .custom-input1{
        width: 220px;
        margin-left: 13px;
    }

    .el-checkbox {
        display: block;
        margin-bottom: 10px;
    }

    .spacer{
        height:20px;
    }
    .divider {
        border-top: 1px solid #ccc; /* 分割线的样式，可以根据需要进行调整 */
        margin: 10px 0; /* 控制分割线上下的间距 */
    }

    .list-container{
        width: calc(100% - 6%);
        height: 70%;
        position: absolute;
        left:center;
        margin-top: 80px;
        border: 2px solid black; 
        background-color: white; 
        padding: 20px; 
        border-radius: 10px;
    }
    .Card{
        height: 80%;
    }
    .table-lines{
        margin-top: 2%;
        /* background-color: #03000000; */
        border: 2px solid #000;
    }
    .el-table .cell, .el-table .cell th {
    border-color: #000000; /* 修改边框颜色 */
    border-width: 2px; /* 控制边框的粗细 */
}

</style>
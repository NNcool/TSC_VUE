<template>
    <div>
        <el-container>
            <el-header>
                <home-header />
            </el-header>
            <cs-ruler></cs-ruler>
            <div class="full-box" style="display: flex; flex-direction: column; height: 100%;">
                <div class="button-container">
                    <button class="custom-button" @click="showSettingsDialog">Settings</button>
                    <button class="custom-button" @click="generateChart">Generate Chart</button>
                    <h1 class="title">TimeScale Creator GTS2020 chart</h1>
                </div>
                <el-table :data="tableData" v-if="showTable" class="table-lines" border :span-method="mergedtable" style="flex: 1; overflow-y: auto;">
                    <!-- <span class ="scaleLine" ref = "scaleLine"></span> -->
                    <!-- 固定列标题 -->
                    <div>
                        <canvas ref="canvas" width="50" height="400"></canvas>
                    </div>
                <!-- 数据表格 -->
                    <el-table-column :prop="dynamicColumns[0].field" :label="dynamicColumns[0].label">
                        
                    </el-table-column>
                    <el-table-column :prop="dynamicColumns[1].field" :label="dynamicColumns[1].label"></el-table-column>
                    <el-table-column :prop="dynamicColumns[2].field" :label="dynamicColumns[2].label"></el-table-column>
                    <el-table-column :prop="dynamicColumns[3].field" :label="dynamicColumns[3].label"></el-table-column>
                    <!-- 动态渲染生成的列 -->
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
                            <el-select v-model="form.region1" placeholder="请选择Name">
                            <el-option label="Present(0 Ma)" value="0"></el-option>
                            <el-option v-for="(item, index) in this.limitData" :key="index" :label="item.stage + '(' + item.ma + ' Ma)'" :value="item.ma"></el-option>
                            </el-select>
                        </el-radio>
                        <el-radio v-model="form.selectedOption1" :label="2" @change="setDefaultMaValue">ma：
                            <el-input v-model="form.name1" class="custom-input"></el-input>
                        </el-radio>
                        <hr class="divider">
                        <el-form-item label="Base of Interval">
                        </el-form-item>
                        <el-radio  v-model="form.selectedOption2" :label="3" >Age/Stage Name
                            <el-select v-model="form.region2" placeholder="请选择Name">
                                <el-option label="Present(0 Ma)" value="0"></el-option>
                                <el-option v-for="(item, index) in this.limitData" :key="index" :label="item.stage + '(' + item.ma + ' Ma)'" :value="item.ma"></el-option>
                            </el-select>
                        </el-radio>
                        <el-radio v-model="form.selectedOption2" :label="4" @change="setDefaultMaValue">ma：
                            <el-input v-model="form.name2" class="custom-input"></el-input>
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
                            <el-button type="primary" @click="generateChart">Generate</el-button>
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
                        <el-tree :data="treeData" show-checkbox :default-expand-all="false" :check-strictly="false" :node-key="'value'" ref="tree" highlight-current
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
import { FormItem } from 'element-ui';
// import {ScaleLine, defaults as defaultControls} from "ol/control";
export default {
    mounted() {
        this.drawYAxis();
    },
    components: { HomeHeader,'cs-ruler':CsRuler.csingruler },
    data() {
        return {
            selectedNodeIds :[],
            generatedColumns:[],//用于存储生成的列信息
            showTable:false,//控制是否显示数据表格
            tableData:[],//存储数据表格的数据
            limitData:[],
            // nums:Array.from({length:15},(_,i) => i*4 + 2),//生成从2到16的整数，间隔为4
            yAxisTicks: 10, // 刻度的数量
            yAxisTickSpacing: 40, // 刻度的间隔
            canvasHeight: 405, // 画布的高度
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
                selectedOption1:null,
                selectedOption2:null,
            },
            selectedOption1: null, 
            selectedOption2: null,
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
                
                // console.log("row:",row);

                // 在 tableData 中找到匹配的行并更新额外列
                // const matchingRow = this.tableData.find(row => row.id === item.id);
                // if (matchingRow) {
                //     matchingRow.period = item.period;
                //     matchingRow.epoch = item.epoch;
                //     matchingRow.ageStage = item.stage;
                //     // 根据需要更新其他列
                // }
                return row;
            });

            // 创建ma列数据
            // const maData = this.genereateTableData();
            // this.tableData.forEach((row, index) => {
            //     row.ma = maData[index].ma; // 将生成的ma列内容填入tableData
            // });
        })
        .catch(error => {
            console.error(error);
        });
    },
    methods: {
        showSettingsDialog() {
            this.showDialog = true; // 当点击"Settings"按钮时显示对话框
            this.showTimeIntervalCard = true;
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
        },
        generateChart(){
            console.log(this.$refs.tree.getCheckedNodes());
            const checkedNodes = this.$refs.tree.getCheckedNodes();
            console.log("checkedNodes:",checkedNodes);
            const selectedIds = checkedNodes.map(node => node.areaName);
            console.log("selectedIds:",selectedIds);
            this.selectedNodeIds = selectedIds;
            console.log("Selected Node IDs:", this.selectedNodeIds);
            //根据所选节点生成对应列的信息
            this.generatedColumns = checkedNodes.map(node => {
                return{
                    field:node.id,
                    label:node.areaName
                };
            });
            console.log("generatedColumns:",this.generatedColumns);
            // this.tableData = this.genereateTableData();
            this.showDialog = false;
            this.showTable = true;
        },
        //合并单元格
        mergedtable({ row, column, rowIndex, columnIndex }) {
            // if(columnIndex > 0){
            //     if(rowIndex >= 0 && rowIndex < this.tableData.length - 1){
            //         const currentCellData = row[column.property]
            //         const nextCellData = this.tableData[rowIndex + 1][column.property];
            //         if(currentCellData != null && nextCellData != null && currentCellData === nextCellData){
            //             let rowspan = 2;
            //                 while(rowIndex + rowspan < this.tableData.length && row[column.property] === this.tableData[rowIndex + rowspan][column.property]
            //                 ){
            //                     rowspan++;
            //                 }
            //                 return{
            //                     rowspan,
            //                     colspan:1,
            //                 };
            //         }
            //         else{
            //             return{
            //                 rowspan:1,
            //                 colspan:1,
            //             }
            //         }
            //     }
            // }
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
        genereateTableData(){
        },
        getCheckedNodes() {
            console.log(this.$refs.tree.getCheckedNodes());
        },  
        setDefaultMaValue(){
            if(this.form.selectedOption1 === 2){
                this.form.name1 = "3 ma";
            }else{
                this.form.name1 = '';
            };
            if(this.form.selectedOption2 === 4){
                this.form.name2 = "3 ma";
            }else{
                this.form.name2 = '';
            };
        },
        drawYAxis() {
            // 获取canvas元素和上下文
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');

            // 设置y轴的起始点
            const startX = 50;
            const startY = 0; // 修改起始点为0

            canvas.height = this.canvasHeight;
            // 绘制y轴
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, canvas.height);
            ctx.stroke();

            // 添加y轴刻度（可根据需要添加更多细节）
            ctx.font = '10px Arial';
            for (let i = 0; i <= 10; i++) {
                const yTick = startY + (i * 40); // 调整计算刻度位置的方式

                // 绘制y轴刻度
                ctx.fillText(i, startX - 20, yTick + 5);
                for (let j = 1; j <= 4; j++) {
                const smallTickY = yTick + (j * 8);
                ctx.beginPath();
                ctx.moveTo(startX - 5, smallTickY);
                ctx.lineTo(startX, smallTickY);
                ctx.stroke();
                }

                // 绘制小刻度线
                ctx.beginPath();
                ctx.moveTo(startX - 10, yTick);
                ctx.lineTo(startX, yTick);
                ctx.stroke();

                ctx.fillText(i, startX - 20, yTick + 5);
            }
        }
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
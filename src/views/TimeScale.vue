<template>
    <div>
        <el-container>
            <el-header>
                <home-header />
            </el-header>
            <div class="full-box">
                <div class="button-container">
                    <button class="custom-button" @click="showSettingsDialog">Settings</button>
                    <button class="custom-button" @click="generateChart">Generate Chart</button>
                    <h1 class="title">TimeScale Creator GTS2020 chart</h1>
                </div>
                
                <div class="list-container" v-if="showList">
                    <div v-for="(item, index) in selectedNodes" :key="index">
                        <p>{{ item.label }}</p>
                    </div>
                </div>
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
                            <el-option label="Present(0 Ma)" value="shanghai"></el-option>
                            <el-option label="等等" value="beijing"></el-option>
                            </el-select>
                        </el-radio>
                        <el-radio v-model="form.selectedOption1" :label="2">ma：
                            <el-input v-model="form.name1" class="custom-input"></el-input>
                        </el-radio>
                        <hr class="divider">
                        <el-form-item label="Base of Interval">
                        </el-form-item>
                        <el-radio  v-model="form.selectedOption2" :label="3" >Age/Stage Name
                            <el-select v-model="form.region2" placeholder="请选择Name">
                                <el-option label="Present(0 Ma)" value="shanghai"></el-option>
                                <el-option label="等等" value="beijing"></el-option>
                            </el-select>
                        </el-radio>
                        <el-radio v-model="form.selectedOption2" :label="4" >ma：
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
                        <el-tree :data="treeData" show-checkbox :default-expand-all="false" :check-strictly="false" v-model="selectedNodes" :node-key="'value'" @check="handleCheck"></el-tree>
                        <div class="hode-button">
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
import HomeHeader from '../components/HomeHeader.vue'
export default {
    components: { HomeHeader },
    data() {
        return {
            selectedNodes :[],
            checkedNodes :[],
            treeData:[{
                value:'standerdchronostratigraphy',
                label:'Standerd Chronostratigraphy',
                children:[
                    {value:'eon',label:'Eon'},
                    {value:'era',label:'Era'},
                    {value:'sub-era',label:'Sub-Era'},
                    {value:'period',label:'Period'},
                    {value:'epoch',label:'Epoch'},
                    {value:'subepoch',label:'Sub-Epoch'}
                ]
            }],
            form: {
                name: '',
                region: ''
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
        onSubmit(){
            console.log('submit!');
        },
        handleCheck(checkedNodes, info) {
            console.log("handleCheck called");
            this.selectedNodes = checkedNodes;
            console.log("selectedNodes:", this.selectedNodes);
        },
        generateChart(){
            this.showList = !this.showList;
            console.log("selectedNodes:", this.selectedNodes);
            console.log("sel.length",this.selectedNodes.length);
            if(this.selectedNodes.length > 0){
                // 创建一个空数组来存储选中节点的内容
                const selectedContents = [];
                // 遍历选中的节点并获取其内容
                this.selectedNodes.forEach(node => {
                    // 使用节点的 value 查找相应的内容
                    const content = this.findContentByValue(this.treeData, node.value);
                    if (content) {
                        selectedContents.push(content);
                    }
                });
                // 现在，selectedContents 包含了所选节点的内容
                console.log("所选节点的内容：", selectedConStents);
            } else {
                // 如果没有选中节点，可以显示一条消息或采取其他操作
                console.log("没有选中节点。");
            }
            console.log("111111"+this.selectedNodes);
            console.log(JSON.stringify(this.treeData, null, 2));
        }
        
    }
};
</script>
  
<style scoped>
    .full-box {
        width: calc(100% - 6%);
        height: 90%;
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
        height: 500px;
    }
</style>
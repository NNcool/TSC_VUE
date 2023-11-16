<template>
  <div>
    <el-container>
      <el-header>
        <home-header />
      </el-header>
      <el-main>
        <el-card shadow="always" class="card">
          <el-row>
            <el-col :span="6">
              <el-select v-model="value" placeholder="请选择地图类型">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="changeMapImage">确定</el-button>
              <el-button type="primary" @click="resetImage">Reset</el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div class="img-container" @mousedown="startDrag" @mousemove="dragImage" @mouseup="endDrag"
                @dragstart.prevent @wheel="handleMouseWheel">
                <el-image class="img" :src="imageUrl" v-show="false"
                  :style="{ transform: `scale(${zoom})`, top: `${top}px`, left: `${left}px` }"
                  @load="drawMarkers"></el-image>
                <canvas id="mapCanvas" class="img"
                  :style="{ transform: `scale(${zoom})`, top: `${top}px`, left: `${left}px` }">
                </canvas>
              </div>
            </el-col>
            <el-col v-for="(location, index) in locationList" :key="index" :span="12">
              <el-popover placement="top-start" width="200" trigger="hover">
                <el-button slot="reference" :style="{ width: 'auto' }" class="infoButton">{{
                  location.areaName }}</el-button>
                <div>
                  name: {{ location.areaName }}
                  <br>
                  Lon/Lat: {{ location.lon }} / {{ location.lat }}
                </div>
              </el-popover>
            </el-col>
          </el-row>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>
  
<script>
import HomeHeader from '../components/HomeHeader.vue'
export default {
  components: { HomeHeader },
  data() {
    return {
      options: [{
        value: 'WorldMap',
        label: 'WorldMap'
      }, {
        value: 'Malaysia',
        label: 'Malaysia'
      }, {
        value: 'Malaysia Peninsular',
        label: 'Malaysia Peninsular'
      }, {
        value: 'Sabah Sarawak',
        label: 'Sabah Sarawak'
      }],
      value: '',
      imageUrl: require('@/assets/WorldMap.jpg'),
      zoom: 1,
      left: 0,
      top: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
      originalZoom: 1, // 记录初始的缩放比例
      originalLeft: 0, // 记录初始的左位移
      originalTop: 0,  // 记录初始的上位移
      containerWidth: 800, // 容器的宽度
      containerHeight: 800, // 容器的高度
      locationList: [],
      mapName: '',
      mapNameIndex: '',
      mapInfo: {
        1: {
          lonRange: { minLon: 99.6, maxLon: 119.4 },
          latRange: { minLat: 0.9, maxLat: 7.5 }
        },
        2: {
          lonRange: { minLon: 99.6, maxLon: 119.4 },
          latRange: { minLat: 0.9, maxLat: 7.5 }
        },
        3: {
          lonRange: { minLon: 99.6, maxLon: 103.8 },
          latRange: { minLat: 1.2, maxLat: 6.5 }
        },
        4: {
          lonRange: { minLon: 109.7, maxLon: 118 },
          latRange: { minLat: 0.9, maxLat: 7.5 }
        },
      }
    }
  },
  methods: {
    startDrag(event) {
      this.isDragging = true;
      this.startX = event.clientX;
      this.startY = event.clientY;
    },

    dragImage(event) {
      if (this.isDragging) {
        const deltaX = event.clientX - this.startX;
        const deltaY = event.clientY - this.startY;
        this.left += deltaX;
        this.top += deltaY;
        this.startX = event.clientX;
        this.startY = event.clientY;
        event.preventDefault(); // 阻止默认行为
      }
    },

    endDrag() {
      this.isDragging = false;
    },

    zoomIn() {
      this.zoom += 0.1;
    },

    zoomOut() {
      if (this.zoom > this.originalZoom) { // 添加限制条件
        this.zoom -= 0.1;
      }
    },

    handleMouseWheel(event) {
      event.preventDefault();
      const delta = Math.sign(event.deltaY); // 检测鼠标滚轮方向

      if (delta > 0) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    },

    resetImage() {
      this.zoom = this.originalZoom; // 恢复缩放比例
      this.left = this.originalLeft; // 恢复左位移
      this.top = this.originalTop;   // 恢复上位移
    },

    changeMapImage() {
      // 根据选择的选项更新图片 URL
      if (this.value === 'WorldMap') {
        this.resetImage();
        this.imageUrl = require('@/assets/WorldMap.jpg');
        this.mapName = this.value;
        this.mapNameIndex = 1;
        console.log(this.mapName)
      } else if (this.value === 'Malaysia') {
        this.resetImage();
        this.imageUrl = require('@/assets/Malaysia.jpg');
        this.mapName = this.value;
        this.mapNameIndex = 2;
        console.log(this.mapName)
      } else if (this.value === 'Malaysia Peninsular') {
        this.resetImage();
        this.imageUrl = require('@/assets/Malaysia Peninsular.jpg');
        this.mapName = this.value;
        this.mapNameIndex = 3;
      } else if (this.value === 'Sabah Sarawak') {
        this.resetImage();
        this.imageUrl = require('@/assets/Sabah Sarawak.jpg');
        this.mapName = this.value;
        this.mapNameIndex = 4;

      }
      this.$axios.get(`/malaysiamap/map/${this.mapName}`).then(response => {
        if (response.data.result) {
          console.log(response.data)
          this.locationList = response.data.result;
        } else {
          console.log(response.data)
          this.$message.error("获取失败")
        }
      })
        .catch(error => {
          console.log(error);
          this.$message.error("请求失败")
        })
    },
    drawMarkers() {
      const canvas = document.getElementById('mapCanvas');
      const ctx = canvas.getContext('2d');

      // 绘制地图图片
      const mapImage = new Image();
      mapImage.src = this.imageUrl;
      mapImage.onload = () => {
        // 设置Canvas的大小为图像的原始大小
        canvas.width = mapImage.width;
        canvas.height = mapImage.height;

        ctx.drawImage(mapImage, 0, 0);

        // 绘制标记点
        this.locationList.forEach(location => {
          const { lon, lat, areaName } = location;
          const { lonRange, latRange } = this.mapInfo[this.mapNameIndex];

          const x = mapToPixelX(lon, canvas.width, lonRange.minLon, lonRange.maxLon);
          const y = mapToPixelY(lat, canvas.height, latRange.minLat, latRange.maxLat);

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();

          ctx.font = '12px Arial';
          ctx.fillText(areaName, x + 10, y);
        });
      }

      function mapToPixelX(lon, mapWidth, minLon, maxLon) {
        // 根据经度计算X像素坐标的逻辑
        // const minLon = 99.6;
        // const maxLon = 119.4;
        const lonRange = maxLon - minLon;
        const lonPosition = (lon - minLon) / lonRange;
        const xPixel = lonPosition * mapWidth;
        return xPixel;
      }

      function mapToPixelY(lat, mapHeight, minLat, maxLat) {
        // 根据纬度计算Y像素坐标的逻辑
        // const minLat = 0.9;
        // const maxLat = 7.5;
        const latRange = maxLat - minLat;
        const latPosition = 1 - (lat - minLat) / latRange;
        const yPixel = latPosition * mapHeight;
        return yPixel;
      }


    }
  }
}


</script>
  
<style scoped>
.card {
  width: 100%;
  /* height: 100vh; */
}

.img-container {
  /* position: relative; */
  margin-top: 50px;
  /* max-width: 800px;
  max-height: 800px; */
  overflow: hidden;
  cursor: pointer;

}

.img {
  /* position: absolute; */
  width: 100%;
}

.infoButton {
  margin: 10px;
}

/* .canvas {
  position: absolute;
} */
</style>
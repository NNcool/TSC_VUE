<template>
  <div>
    <el-container>
      <el-header>
        <home-header />
      </el-header>
      <el-main>
        <el-card shadow="always" class="card">
          <el-row>
            <el-col :span="5">
              <el-select v-model="value" placeholder="请选择地图类型">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-button type="primary" @click="changeMapImage">确定</el-button>
              <el-button type="primary" @click="resetImage">Reset</el-button>
            </el-col>
            <el-col :span="6">
              <div class="block">
                <span class="demonstration">选择圆点大小</span>
                <el-slider v-model="circleRadius" :step="10" :min="10" :max="80" show-stops @change="redrawMarkers">
                </el-slider>
              </div>
            </el-col>
          </el-row>
          <el-row>

          </el-row>
          <el-row>
            <el-col :span="6">
              <div class="block">
                <span class="demonstration">Age Slider</span>
                <el-slider v-model="AgeSlider" :max="300" show-input>
                </el-slider>

              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div class="img-container" @mousedown="startDrag" @mousemove="dragImage" @mouseup="endDrag"
                @dragstart.prevent @wheel="handleMouseWheel">
                <el-image class="img" :src="imageUrl" v-show="false"
                  :style="{ transform: `scale(${zoom})`, top: `${top}px`, left: `${left}px` }"
                  @load="onImageLoad"></el-image>
                <canvas id="mapCanvas" class="img" @mousedown="startDrag" @mousemove="dragImage" @mouseup="endDrag"
                  @dragstart.prevent :style="{ transform: `scale(${zoom})`, top: `${top}px`, left: `${left}px` }">
                </canvas>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
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
      canvas: null,
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
      // containerWidth: 800, // 容器的宽度
      // containerHeight: 800, // 容器的高度
      locationList: [],
      mapName: '',
      mapNameIndex: '',
      isDragging: false,
      selectedLocation: null,
      clickHandlers: [],
      circleRadius: 15, // 初始圆点大小
      AgeSlider: 0,
      centerLon: 0, // 初始化为适当的值
      centerLat: 0, // 初始化为适当的值
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
          lonRange: { minLon: 99, maxLon: 105.6 },
          latRange: { minLat: 1.2, maxLat: 6.8 }
        },
        4: {
          lonRange: { minLon: 109, maxLon: 119 },
          latRange: { minLat: 0.8, maxLat: 7 }
        },
      }
    }
  },
  async created() {
    await this.changeMapImage(); // 加载数据的方法
    await this.drawMarkers(); // 确保在数据加载完成后调用 drawMarkers
    this.calculateCenterCoordinates();
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
        // 更新画布大小以匹配图片大小
        // const canvas = document.getElementById('mapCanvas');
        // canvas.width = canvas.width; // 这会清空画布
        // this.drawMarkers(); // 重新绘制标记
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
          // 计算中心经纬度
          this.calculateCenterCoordinates();
          // 重新绘制标记
          this.drawMarkers();
        } else {
          this.$message.error("获取失败")
        }
      })
        .catch(error => {
          this.$message.error("请求失败")
        })
    },
    // 计算中心经纬度
    calculateCenterCoordinates() {
      if (this.locationList.length > 0) {
        // 计算边界框
        const lonArray = this.locationList.map(location => location.lon);
        const latArray = this.locationList.map(location => location.lat);
        const minLon = Math.min(...lonArray);
        const maxLon = Math.max(...lonArray);
        const minLat = Math.min(...latArray);
        const maxLat = Math.max(...latArray);

        // 计算中心经纬度
        this.centerLon = (minLon + maxLon) / 2;
        this.centerLat = (minLat + maxLat) / 2;
        console.log('中心坐标:', this.centerLon, this.centerLat);
      }
    },
    redrawMarkers() {
      this.drawMarkers();
    },
    onImageLoad() {
      this.drawMarkers();
    },
    // 添加一个辅助方法，返回一个 Promise，等待图片加载完成
    imageLoadPromise(image) {
      return new Promise((resolve) => {
        image.onload = () => resolve();
      });
    },
    //绘制点
    async drawMarkers() {
      const canvas = document.getElementById('mapCanvas');
      const ctx = canvas.getContext('2d');

      // 清空点击事件处理程序
      this.clearClickHandlers();

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制地图图片
      const mapImage = new Image();
      mapImage.src = this.imageUrl;

      // 等待图片加载完成
      await this.imageLoadPromise(mapImage);

      // 设置Canvas的大小为图像的原始大小
      canvas.width = mapImage.width;
      canvas.height = mapImage.height;

      ctx.drawImage(mapImage, 0, 0);


      // 添加点击事件处理程序
      const clickHandler = (event) => {
        console.log('Click event triggered'); // 确保点击事件被触发
        const clickX = event.clientX - canvas.getBoundingClientRect().left;
        const clickY = event.clientY - canvas.getBoundingClientRect().top;

        // 将点击坐标转换为地图坐标
        const mapCoordinates = this.pixelToMapCoordinates(clickX, clickY, canvas);

        // 遍历标记点，检查点击坐标是否在某个点的范围内
        for (const location of this.locationList) {
          const { lon, lat, areaName } = location;
          const { lonRange, latRange } = this.mapInfo[this.mapNameIndex];

          // 将点的坐标转换为画布上的坐标
          const { x, y } = this.calculateMarkerPosition(lon, lat, lonRange, latRange, canvas);

          // 检查点击坐标是否在点的范围内
          if (this.isPointInCircle(mapCoordinates.x, mapCoordinates.y, x, y, this.circleRadius)) {
            console.log('Click within circle');
            this.showLocationInfo(location);
            break; // 找到一个匹配的标记点就结束循环
          }
        }
      };

      // 添加点击事件监听器
      canvas.addEventListener('click', clickHandler);
      this.clickHandlers.push({ handler: clickHandler });

      // 绘制标记点
      this.locationList.forEach(location => {
        const { lon, lat, areaName } = location;
        const { lonRange, latRange } = this.mapInfo[this.mapNameIndex];
        const { x, y } = this.calculateMarkerPosition(lon, lat, lonRange, latRange, canvas);

        ctx.beginPath();
        ctx.arc(x, y, this.circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        // 绘制标记点图片
        const imagePath = require('@/assets/logo.png');
        if (imagePath) {
          const markerImage = new Image();
          markerImage.src = imagePath;

          markerImage.onload = () => {
            const { x, y } = this.calculateMarkerPosition(lon, lat, lonRange, latRange, canvas);
            ctx.drawImage(markerImage, x - this.circleRadius, y - this.circleRadius, this.circleRadius * 2, this.circleRadius * 2);
          };

          markerImage.onerror = (error) => {
            console.error(`Error loading image: ${imagePath}`, error);
          };
        }


        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        this.adjustTextPosition(this.locationList, ctx, canvas);
        ctx.fillText(areaName, x - 40, y - 40);
        ctx.fillText(lon, x, y + 20);
        ctx.fillText(lat, x + 80, y + 20);
      });
    },
    // 在绘制标记点文字之前调用此函数
    adjustTextPosition(locationList, ctx, canvas) {
      const padding = 20; // 调整文字位置的边距
      for (let i = 0; i < locationList.length; i++) {
        const currentLocation = locationList[i];
        const { lon, lat, areaName } = currentLocation;
        const { lonRange, latRange } = this.mapInfo[this.mapNameIndex];

        const { x, y } = this.calculateMarkerPosition(lon, lat, lonRange, latRange, canvas);

        // 检查当前标记点与之前标记点之间的距离
        for (let j = 0; j < i; j++) {
          const previousLocation = locationList[j];
          const { prevX, prevY } = this.calculateMarkerPosition(
            previousLocation.lon,
            previousLocation.lat,
            lonRange,
            latRange,
            canvas
          );
          // 如果文字之间的距离太近，调整当前文字的位置
          if (Math.abs(x - prevX) < padding && Math.abs(y - prevY) < padding) {
            // 调整当前标记点文字的位置
            ctx.fillText(areaName, x - 40, y - 40 - padding);

          }
        }
      }
    },
    //点击坐标到地图坐标的转换
    pixelToMapCoordinates(pixelX, pixelY, canvas) {
      const mapX = (pixelX - this.left) / this.zoom + this.centerLon;
      const mapY = (pixelY - this.top) / this.zoom + this.centerLat;
      console.log('pixelX:', pixelX, 'pixelY:', pixelY, 'this.left:', this.left, 'this.top:', this.top, '地图坐标:', mapX, mapY);
      return { x: mapX, y: mapY };
    },
    // pixelToMapCoordinates(pixelX, pixelY, canvas) {
    //   const mapX = (pixelX - canvas.width / 2) / this.zoom + this.centerLon;
    //   const mapY = (canvas.height / 2 - pixelY) / this.zoom + this.centerLat;
    //   console.log('地图坐标:', mapX, mapY);
    //   return { x: mapX, y: mapY };
    // },
    //     pixelToMapCoordinates(pixelX, pixelY, canvas) {
    //   const mapX = pixelX / this.zoom + this.centerLon;
    //   const mapY = pixelY / this.zoom + this.centerLat;
    //   console.log('地图坐标:', mapX, mapY);
    //   return { x: mapX, y: mapY };
    // },
    // pixelToMapCoordinates(pixelX, pixelY, canvas) {
    //   const mapX = (pixelX - canvas.offsetWidth / 2) / this.zoom + this.centerLon;
    //   const mapY = (canvas.offsetHeight / 2 - pixelY) / this.zoom + this.centerLat;
    //   console.log('地图坐标:', mapX, mapY);
    //   return { x: mapX, y: mapY };
    // },
    // 添加一个计算位置的方法
    calculateMarkerPosition(lon, lat, lonRange, latRange, canvas) {
      const x = this.mapToPixelX(lon, canvas.width, lonRange.minLon, lonRange.maxLon);
      const y = this.mapToPixelY(lat, canvas.height, latRange.minLat, latRange.maxLat);
      console.log('位置坐标：', x, y)
      return { x, y };
    },
    showLocationInfo(location) {
      // 根据位置信息展示相应的信息，例如弹窗、在界面上显示等
      alert(`显示位置信息：${location.areaName}，经度：${location.lon}，纬度：${location.lat}`);
    },
    isPointInCircle(px, py, cx, cy, radius) {
      // 允许一定范围的误差
      const tolerance = 10;
      const distanceSquared = (px - cx) ** 2 + (py - cy) ** 2;
      return distanceSquared <= (radius + tolerance) ** 2;
    },
    // 清除点击事件处理程序
    clearClickHandlers() {
      const canvas = document.getElementById('mapCanvas');
      console.log('Clearing click handlers');
      this.clickHandlers.forEach(({ handler }) => {
        canvas.removeEventListener('click', handler);
      });
      this.clickHandlers = [];
    },
    mapToPixelX(lon, mapWidth, minLon, maxLon) {
      // 根据经度计算X像素坐标的逻辑
      const lonRange = maxLon - minLon;
      const lonPosition = (lon - minLon) / lonRange;
      const xPixel = lonPosition * mapWidth;
      return xPixel;
    },
    mapToPixelY(lat, mapHeight, minLat, maxLat) {
      // 根据纬度计算Y像素坐标的逻辑
      const latRange = maxLat - minLat;
      const latPosition = 1 - (lat - minLat) / latRange;
      const yPixel = latPosition * mapHeight;
      return yPixel;
    },
  }
}


</script>
  
<style scoped>
.card {
  width: 100%;
  height: 100%;
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
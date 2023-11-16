<template>
  <div>
    <div>
      <el-container>
        <el-header>
          <home-header />
        </el-header>
        <el-main>地图图像页面</el-main>
      </el-container>
    </div>
    <div>
      <canvas ref="canvas" width="50" height="400"></canvas>
    </div>
  </div>
</template>
  
<script>
import HomeHeader from '../components/HomeHeader.vue'
export default {
  mounted() {
    this.drawAxis();
  },
  components: { HomeHeader },

  data() {
    return {
      xAxisTicks: 10, // X轴刻度的数量
      xAxisTickSpacing: 50, // X轴刻度的间隔
      yAxisTicks: 10, // Y轴刻度的数量
      yAxisTickSpacing: 40, // Y轴刻度的间隔
      canvasWidth: 500, // 画布的宽度
      canvasHeight: 400, // 画布的高度
    };
  },
  methods: {
    drawAxis() {
      // 获取canvas元素和上下文
      // 获取canvas元素和上下文
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');

      // 设置坐标轴的起始点
      const startX = 50;
      const startY = 350; // 调整y轴起始点

      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;

      // 绘制x轴
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(canvas.width, startY);
      ctx.stroke();

      // 添加x轴刻度
      ctx.font = '10px Arial';
      for (let i = 1; i <= this.xAxisTicks; i++) {
        const xTick = startX + i * this.xAxisTickSpacing;

        // 绘制x轴刻度
        ctx.fillText(i, xTick - 5, startY + 20);

        // 绘制小刻度线
        ctx.beginPath();
        ctx.moveTo(xTick, startY);
        ctx.lineTo(xTick, startY + 5);
        ctx.stroke();
      }

      // 绘制y轴
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, startY);
      ctx.stroke();

      // 添加y轴刻度
      ctx.font = '10px Arial';
      for (let i = 1; i <= this.yAxisTicks; i++) {
        const yTick = startY - i * this.yAxisTickSpacing;

        // 绘制小刻度线
        ctx.beginPath();
        ctx.moveTo(startX - 5, yTick);
        ctx.lineTo(startX, yTick);
        ctx.stroke();

        // 绘制y轴刻度
        ctx.fillText(i, startX - 20, yTick + 5);
      }
    }
  }
}

</script>
  
<style scoped>
</style>

<template>
  <div @click="progressClick">
    <div
      id="ball-target"
      ref="circleProgress"
      :class="['progress-circle', jump, horizontal ? 'horizontal' : '']"
      :style="{
        left: touchX,
        top: touchY,
        transform: horizontal ? 'rotate(90deg)' : '',
      }"
      v-show="downloadShow ? (list.length > 0 ? true : false) : true"
    >
      <span v-if="!tagHidden" ref="numTag" :class="['num-tag', scale]">{{
        downloadingNum
      }}</span>
      <div class="hidden-box">
        <div
          v-if="downloadingNum && percent"
          class="progress-circle-cover left"
          :style="{ transform: `rotate(${leftDeg})` }"
        ></div>
      </div>
      <div class="hidden-box right">
        <div
          ref="rightCircle"
          v-if="percent < 50 && downloadingNum && percent"
          class="progress-circle-cover right"
          :style="{ transform: `rotate(${rightDeg})` }"
        ></div>
      </div>
    </div>
  </div>
</template>
<script>
import { HdSDK } from "../../utils/hdsdk";
export default {
  name: "ProgressCircle",
  props: {
    list: {
      require: true, //下载列表
    },
    downloadShow: {
      type: Boolean,
      default: false,
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      shouldHideClose: HdSDK.isSdk() && HdSDK.compareSdkv("1.4.2") < 0,
      touchX: "",
      HdSDK,
      touchY: "",
      tagHidden: true, //数字标签隐藏显示
      jump: "", //下载完成后跳动动画
      scale: "", //下载完成后缩放动画
    };
  },
  computed: {
    //监听list变化
    localList() {
      return this.list;
    },
    //下载列表内正在下载的任务数量
    downloadingNum() {
      let arr = this.localList.filter((item) => {
        return item.status === 0;
      });
      // console.log('downloadingNum:',arr.length);
      return arr.length;
    },
    //下载中任务的总接收大小
    totalReceived() {
      let total = 0;
      for (let i = 0; i < this.localList.length; i++) {
        if (this.localList[i].status === 0) {
          total += this.localList[i].received;
        }
      }
      return total;
    },
    //下载中任务的总大小
    totalSize() {
      let total = 0;
      for (let i = 0; i < this.localList.length; i++) {
        if (this.localList[i].status === 0) {
          total += this.localList[i].size;
        }
      }
      return total;
    },
    //总体下载完成的百分比
    percent() {
      // console.log('received:',this.totalReceived,'size:',this.totalSize);
      return (this.totalReceived / this.totalSize).toFixed(2) * 100;
    },
    //左侧半圆转动的角度，当百分比大于50转动。
    leftDeg() {
      // console.log('percent:',this.percent);
      return this.percent >= 50 ? `${(this.percent - 50) * 3.6}deg` : "0deg";
    },
    //右侧半圆转动的角度，百分比小于50转动
    rightDeg() {
      return this.percent >= 50 ? "0deg" : `${this.percent * 3.6}deg`;
    },
  },
  watch: {
    /**
     * @description: 监听下载中任务数量
     * @param {newVal,oldVal}
     * @return:void
     */
    downloadingNum(newVal, oldVal) {
      //判断新值是否大于旧值且旧值为0，判断是否是下载开始
      if (newVal > oldVal && !oldVal) {
        //下载开始，显示数量标签
        this.tagHidden = false;
        //判断新值是否小于旧值且新值为0，判断是否下载结束
      } else if (newVal < oldVal && !newVal) {
        // console.log('新值：',newVal,'旧值：',oldVal);
        //下载结束，执行缩放动画 0.4s
        this.scale = "end-scale";
        setTimeout(() => {
          //0.4s后隐藏数量标签
          this.tagHidden = true;
          //开始执行跳动动画
          this.jump = "end-jump";
        }, 400);
      } else if (newVal < oldVal && newVal) {
        this.jump = "end-jump";
      }
    },
  },
  created() {},
  mounted() {
    this.$emit("load");
    this.onDragSticky("circleProgress");
    this.onAnimationEnd();
  },
  destroyed() {
    this.offDragSticky("circleProgress");
    this.offAnimationEnd();
  },
  methods: {
    onAnimationEnd() {
      let el = this.$refs.circleProgress;
      el.addEventListener("animationend", this.resetJump);
    },
    offAnimationEnd() {
      let el = this.$refs.circleProgress;
      el.removeEventListener("animationend", this.resetJump);
    },
    resetJump() {
      this.jump = "";
    },
    onDragSticky(ref) {
      console.log(3);
      let _el = this.$refs[ref];
      _el.addEventListener("touchstart", this.dragStickyStart(_el));
      _el.addEventListener("touchmove", this.dragStickyMove(_el));
      _el.addEventListener("touchend", this.dragStickyEnd(_el));
    },
    offDragSticky(ref) {
      console.log(112);
      let _el = this.$refs[ref];
      _el.removeEventListener("touchstart", this.dragStickyStart);
      _el.removeEventListener("touchmove", this.dragStickyMove);
      _el.removeEventListener("touchend", this.dragStickyEnd);
    },
    dragStickyStart() {
      console.log(4);
      return () => {
        // el.style.transition = "left 0s";
      };
    },
    dragStickyMove(el) {
      return () => {
        console.log(11);
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let elWidth = el.offsetWidth;
        let elHeight = el.offsetHeight;
        if (
          event.touches[0].clientX > elWidth / 2 &&
          event.touches[0].clientX < windowWidth - elWidth / 2 &&
          event.touches[0].clientY > elHeight / 2 &&
          event.touches[0].clientY < windowHeight - elHeight / 2
        ) {
          this.touchX = `${event.touches[0].clientX - elWidth / 2}px`;
          this.touchY = `${event.touches[0].clientY - elHeight / 2}px`;
        }
        return;
      };
    },
    dragStickyEnd(el) {
      return () => {
        // el.style.transition = "left .4s ease";
        if (!this.horizontal) {
          this.touchX = `${window.innerWidth - el.offsetWidth}px`;
          setTimeout(() => {
            this.$emit("progressTouchEnd");
          }, 500);
        }
      };
    },
    /**
     * @description: 点击下载器
     * @param {}
     * @return:void
     */
    progressClick() {
      this.$emit("progressClick");
      if (this.shouldHideClose) {
        this.HdSDK.setCloseVisible(false);
      }
    },
  },
};
</script>
<style lang="scss">
#uni-down-index {
  .uni-down-progress .horizontal {
    top: 0rem;
    right: 15rem;
  }
  .progress-circle {
    position: absolute;
    top: 1.5em;
    right: 0em;
    height: 0.48em;
    width: 0.48em;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0em 0.02em 0.1em 0em #000000;
    transition: left 0.4s ease;
    &::before {
      content: "";
      display: inline-block;
      height: 0.3em;
      width: 0.3em;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: url("../assets/icon_download_1_@3x.png") no-repeat center;
      background-size: contain;
    }
    .num-tag {
      position: absolute;
      right: 0.5em;
      top: -0.4em;
      line-height: 0.09em;
      padding: 0.7em 0.5em;
      font-size: 0.09em;
      border-radius: 50%;
      z-index: 3;
      color: #fff;
      background-color: #eb4d3d;
    }
    .hidden-box {
      position: absolute;
      display: inline-block;
      width: 50%;
      height: 100%;
      overflow: hidden;
      &.right {
        left: 50%;
      }
    }
    &-cover {
      display: inline-block;
      width: 100%;
      height: 100%;
      background-color: #80d2a5;
      opacity: 0.5;
      &.left {
        position: absolute;
        border-radius: 1em 0 0 1em;
        transform-origin: right center;
        transition: transform 0.1s;
      }
      &.right {
        position: absolute;
        border-radius: 0 1em 1em 0;
        transform-origin: left center;
        transition: transform 0.1s;
      }
    }
  }
}
.end-jump {
  animation-name: jump;
  animation-duration: 0.6s;
  animation-iteration-count: 3;
}
.end-scale {
  animation-name: scaleIn;
  animation-duration: 0.4s;
  animation-iteration-count: 1;
}
@keyframes jump {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(20px);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes scaleIn {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.3);
  }
}
</style>

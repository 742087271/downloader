<template>
  <div id="uni-down-index">
    <div>
      <download-list
        v-show="!listHidden"
        :appList="appData"
        @backToProgress="backToProgress"
        @OpInhandler="OpInhandler(arguments)"
      />
      <download-progress
        v-show="listHidden"
        class="uni-down-progress"
        :list="appData"
        :downloadShow="downloadShow"
        :horizontal="horizontal"
        @progressClick="progressClick"
        @progressTouchEnd="progressTouchEnd"
      />
    </div>
    <div id="ball" class="tiny-ball"></div>
  </div>
</template>

<script>
import downloadList from "./list.vue";
import downloadProgress from "./progress.vue";
import { HdSDK } from "../../utils/hdsdk";

export default {
  name: "DownIndex",
  components: {
    downloadList,
    downloadProgress,
  },
  props: {
    isShow: {
      type: Boolean,
      default: true,
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
      HdSDK,
      appData: [], //下载列表
      listHidden: true, //下载列表显示隐藏
      targetLeft: "", //下载器坐标left
      targetTop: "", //下载器坐标top
    };
  },
  computed: {
    //是否正在下载中
    isDownloading() {
      let arr = this.appData.filter((item) => {
        return item.status === 0;
      });
      if (arr.length) {
        return true;
      }
      return false;
    },
  },
  beforeCreate() {},
  created() {},
  async mounted() {
    // this.ballTransitionEnd()
    // this.downloadStart()
    this.getTargetPos();
    this.appData = this.HdSDK.getDownloadApps();
    this.addBusListener();
  },
  methods: {
    progressTouchEnd() {
      this.getTargetPos();
    },
    /**
     * @description: 下载事件监听
     */
    addBusListener() {
      this.HdSDK.addEventListener("dl.start", this.downloadStart);
      this.HdSDK.addEventListener("dl.progress", this.downloadProgress);
      this.HdSDK.addEventListener("dl.success", this.downloadSuccess);
      this.HdSDK.addEventListener("dl.failed", this.downloadFailed);
      this.HdSDK.addEventListener("dl.installed", this.downloadInstalled);
      this.HdSDK.addEventListener("wv.resume", this.WvResume);
    },
    /**
     * @description: 获取下载器位置
     */
    getTargetPos() {
      this.$nextTick(() => {
        let target = document.getElementById("ball-target");
        this.targetTop = `${
          target.getBoundingClientRect().top +
          target.getBoundingClientRect().height / 2
        }px`;
        this.targetLeft = `${Math.abs(
          target.getBoundingClientRect().left +
            target.getBoundingClientRect().width / 2
        )}px`;
      });
    },
    /**
     * @description: 添加小下载器过渡效果结束监听
     */
    ballTransitionEnd() {
      let ball = document.getElementById("ball");
      ball.addEventListener("transitionend", () => {
        console.log("transitionEnd");
        ball.style.visibility = "hidden";
      });
    },
    /**
     * @description: 抛物线动效
     */
    throwBall() {
      let startLeft = `${window.innerWidth / 2}px`;
      let startTop = `${window.innerHeight / 2}px`;
      let ball = document.getElementById("ball");
      // console.log(startLeft,startTop);
      ball.style.visibility = "visible";
      ball.style.left = startLeft;
      ball.style.top = startTop;
      ball.style.transition = "left 0s, top 0s";
      setTimeout(() => {
        ball.style.top = this.targetTop;
        ball.style.left = this.targetLeft;
        ball.style.transition = "left 1s ease-in, top 1s linear";
        console.log("transitionStart");
        setTimeout(() => {
          ball.style.visibility = "hidden";
        }, 1000);
      }, 20);
    },
    /**
     * @description: 下载开始回调
     * @param {void}
     * @return {void}
     */
    downloadStart(res) {
      this.appData = this.HdSDK.getDownloadApps();
      this.getTargetPos();
      this.throwBall();
      // console.log('data', this.appData)
      console.log("start", res);
      console.log("list", this.appData);
    },
    /**
     * @description: 下载进度回调
     * @param {void}
     * @return {void}
     */
    downloadProgress(res) {
      let appId = res.app.appId;
      this.appData.map((item) => {
        if (item.appId === appId) {
          // console.log('AppReceived:',res.app.received,'AppSize:',res.app.size);
          item.size = res.app.size;
          item.received = res.app.received;
        }
      });
      console.log("progress", res);
    },
    /**
     * @description: 下载成功回调
     * @param {void}
     * @return {void}
     */
    downloadSuccess(res) {
      this.appData = this.HdSDK.getDownloadApps();
      console.log("success", res);
      try {
        this.$emit("hasInstalled", this.appData);
      } catch (error) {
        // 不需要获取已经安装列表
      }
    },
    /**
     * @description: 下载失败回调
     * @param {void}
     * @return {void}
     */
    downloadFailed(res) {
      this.appData = this.HdSDK.getDownloadApps();
      console.log("failed", res);
      console.log("list", this.appData);
    },
    downloadInstalled(res) {
      this.appData = this.HdSDK.getDownloadApps();
      console.log("installed", res);
      console.log("list", this.appData);
    },
    WvResume(res) {
      this.appData = this.HdSDK.getDownloadApps();
      console.log("resume", res);
      console.log("list", this.appData);
    },
    progressClick() {
      this.listHidden = false;
    },
    backToProgress() {
      this.listHidden = true;
      this.getTargetPos();
    },
    OpInhandler(arg) {
      let status = arg[0];
      let id = arg[1];
      if (status) {
        if (status === 1) {
          this.HdSDK.installApp(id);
        } else if (status !== 5) {
          this.HdSDK.openApp(id);
        } else if (status === 5) {
          this.HdSDK.reDownload(id);
          this.appData = this.HdSDK.getDownloadApps();
          console.log("list", this.appData);
        }
      }
    },
  },
};
</script>

<style>
#uni-down-index * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#uni-down-index {
  position: fixed;
  top: 0;
  right: 0;
  font-size: 100px !important;
  z-index: 9999999;
}

.tiny-ball {
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: hidden;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 0.24em;
  width: 0.24em;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0em 0.02em 0.1em 0em #000000;
  transition: left 1s ease-in, top 1s linear;
}

.tiny-ball::before {
  content: "";
  display: inline-block;
  height: 0.15em;
  width: 0.15em;
  background: url("../assets/icon_download_1_@3x.png") no-repeat center;
  background-size: contain;
}
</style>

<template>
  <div class="wrapper">
    <div class="nav-bar">
      <div class="nav-bar-left" @click="backToProgress"></div>
      <div class="nav-bar-right">Reward Manager</div>
    </div>
    <ul class="download-list" v-if="list.length > 0">
      <li v-for="(item, index) in list" :key="index" class="download-list-item">
        <div
          class="download-list-item_left"
          :style="{ backgroundImage: `url('${item.icon}')` }"
        ></div>
        <div class="download-list-item_mid">
          <div class="title">{{ item.title }}</div>
          <div class="desc"></div>
        </div>
        <div class="download-list-item_right">
          <div
            :class="['button', btnStatusClass(item.status)]"
            @click="OpInhandler(item.status, item.appId)"
          >
            <span
              v-if="item.status === 0 || item.status === 5"
              class="percent"
              :style="{
                width: `${(item.received / item.size).toFixed(2) * 100}%`,
              }"
            ></span>
            <span class="txt">{{ btnText(item) }}</span>
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="emptyStatus">
      <div>
        <div class="empty-box">
          <div class="empty"></div>
        </div>
        <p class="gifTBox">GIFT BOX</p>
        <div class="goToGetNow" @click="backToProgress">Go To Get Now</div>
      </div>
    </div>
  </div>
</template>
<script>
import { HdSDK } from "../../utils/hdsdk";
export default {
  name: "DownloadList",
  props: {
    //下载列表
    appList: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      HdSDK,
      shouldHideClose: HdSDK.isSdk() && HdSDK.compareSdkv("1.4.2") < 0,
    };
  },
  computed: {
    //下载列表
    list() {
      return this.appList;
    },
  },
  mounted() {},
  methods: {
    /**
     * @description: 按钮文字
     * @param {item}
     * @return {String}
     */
    btnText(item) {
      // console.log('item',item);
      //判断当前是否可以显示百分比
      let flag = isNaN(item.received / item.size);
      if (!flag) {
        if (!item.status) {
          return `${((item.received / item.size) * 100).toFixed(2)}%`;
        } else if (item.status === 1) {
          return "INSTALL";
        } else if (item.status === 5) {
          return "Reload";
        } else {
          return "OPEN";
        }
      }
    },
    btnStatusClass(status) {
      if (!status) {
        return "downloading";
      } else if (status === 1) {
        return "install";
      } else if (status === 5) {
        return "fail";
      } else {
        return "open";
      }
    },
    /**
     * @description: 点击列表返回
     * @param {void}
     * @return {void}
     */
    backToProgress() {
      this.$emit("backToProgress");
      if (this.shouldHideClose) {
        this.HdSDK.setCloseVisible(true);
      }
    },
    OpInhandler(status, id) {
      this.$emit("OpInhandler", status, id);
    },
  },
};
</script>
<style lang="scss">
#uni-down-index {
  .wrapper {
    width: 100vw;
    min-height: 100vh;
    background-color: white;
    .nav-bar {
      height: 0.36em;
      background-color: #08964c;
      display: flex;
      &-left {
        height: 100%;
        width: 0.4em;
        position: relative;
        &::before {
          content: "";
          position: absolute;
          display: inline-block;
          height: 100%;
          width: 100%;
          background: url(../assets/icon_back_@2x.png) no-repeat center;
          background-size: contain;
        }
      }
      &-right {
        height: 100%;
        width: 100%;
        flex: 1;
        font-size: 0.18em;
        color: white;
        display: flex;
        align-items: center;
      }
    }
    .download-list {
      height: calc(100vh - 0.36em);
      overflow-y: auto;
      &-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 0.84em;
        padding: 0.08em 0.18em;
        border-bottom: 0.01em solid #e5e5e5;
        &_left {
          height: 0.48em;
          width: 0.48em;
          margin-right: 0.12em;
          border-radius: 0.06em;
          // background-color: black;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
        }
        &_mid {
          width: 1.8em;
          flex: 1;
          .title {
            color: #484848;
            font-size: 0.16em;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            -webkit-line-clamp: 2;
          }
          .desc {
            margin-top: 0.04em;
            color: #a6a6a6;
            font-size: 0.12em;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            -webkit-line-clamp: 2;
          }
        }
        &_right {
          height: 0.34em;
          width: 0.8em;
          margin-left: 0.19em;
          .button {
            height: 100%;
            width: 100%;
            border-radius: 0.4em;
            border: 0.01em solid #08964c;
            text-align: center;
            font-size: 0.14em;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            &.install {
              background-color: #08964c;
            }
            &.open {
              .txt {
                color: #08964c;
              }
            }
            &.fail {
              position: relative;
              background-color: rgba(223, 46, 48, 0.5);
              border-color: #df2e30;
              color: white;
              .percent {
                background-color: #df2e30;
              }
              .txt {
                background: url(../assets/Restart.png) no-repeat left center;
                background-size: 1em 1em;
                padding-left: 1.3em;
              }
            }
            &.downloading {
              background-color: #80d2a5;
              .percent {
                background-color: #08964c;
              }
            }
            .percent {
              position: absolute;
              display: inline-block;
              height: 100%;
              width: 0%;
              left: 0;
              top: 0;
              border-radius: 0.4em 0 0 0.4em;
            }
            .txt {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              z-index: 3;
            }
          }
        }
      }
    }
    .emptyStatus {
      min-height: calc(100vh - 0.36em);
      display: flex;
      justify-content: center;
      align-items: center;
      .empty-box {
        .empty {
          width: 23.8rem;
          height: 17.8rem;
          margin: 0 auto;
          background-image: url("../assets/em.png");
          background-repeat: no-repeat;
          background-size: contain;
        }
      }
      .gifTBox {
        font-size: 19px;
        font-family: Arial;
        font-weight: 400;
        color: #8c8c8c;
      }
      .gifTBox:before {
        display: inline-block;
        content: " ";
        border-bottom: 1px solid #8d8d8d;
        width: 6rem;
        height: 0.1rem;
        margin-bottom: 0.4rem;
        margin-right: 1rem;
      }
      .gifTBox::after {
        display: inline-block;
        content: " ";
        border-bottom: 1px solid #8d8d8d;
        width: 6rem;
        height: 0.1rem;
        margin-left: 1rem;
        margin-bottom: 0.4rem;
      }
      .goToGetNow {
        width: 23.8rem;
        height: 3.6rem;
        background: #08964c;
        border-radius: 0.5rem;
        font-size: 17px;
        font-family: Arial;
        font-weight: 400;
        color: #ffffff;
        text-align: center;
        line-height: 3.6rem;
      }
    }
  }
}
</style>

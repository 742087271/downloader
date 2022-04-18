<template>
  <div v-show="isShow">
    <div v-if="downloader">
      <Home :downloadShow="downloadShow" :horizontal="horizontal" ref="home" />
    </div>
  </div>
</template>

<script>
import Home from "./components/index.vue";
import { HdSDK } from "../utils/hdsdk";

export default {
  components: {
    Home,
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
      downloader: false,
    };
  },
  mounted() {
    if (HdSDK.isSdk() && !HdSDK.getBasicFields().igp) {
      const win = window;
      // 自定义id容器
      win.addEventListener("load", () => {
        this.downloader = true;
      });
    }
  },
  methods: {
    progressClick() {
      this.$refs.home.progressClick();
    },
  },
};
</script>

<style>
#uni-down-index {
  left: 0;
}
#uni-down-index .wrapper {
  width: 100vw;
  min-height: 100vh;
  background-color: #fff;
}
#uni-down-index .wrapper .nav-bar {
  height: 0.36em;
  background-color: #08964c;
  display: flex;
}
#uni-down-index .wrapper .nav-bar-left {
  height: 100%;
  width: 0.4em;
  position: relative;
}
#uni-down-index .wrapper .nav-bar-left:before {
  content: "";
  position: absolute;
  display: inline-block;
  height: 100%;
  width: 100%;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABICAYAAABhlHJbAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC2SURBVHgB7drRCcJQDIbR4ASO4EiO4AaOoJs5iiM4Qr1CfRDKbSURtZwD/wIfeUwEAAAAAAAAP2kYhmPbre3atg+Wa8FOw6tHyG0wbyLe0y7o68S7Bn29eK5vhngJ4iWIlyBegngJ4iWIlyBegngJ4iW0QNs1xNsE/6td2nkNV/hVIhYQsYCIBUQsIGIBEQuIWEDEAiIWELFAJ+IlWKYTcRcsMxHRc9G7xoi3cYcAAAAAAADgo+6JLm/9ZLHVlQAAAABJRU5ErkJggg==)
    no-repeat 50%;
  background-size: contain;
}
#uni-down-index .wrapper .nav-bar-right {
  height: 100%;
  width: 100%;
  flex: 1;
  font-size: 0.18em;
  color: #fff;
  display: flex;
  align-items: center;
}
#uni-down-index .wrapper .download-list {
  height: calc(100vh - 0.36em);
  overflow-y: auto;
}
#uni-down-index .wrapper .download-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 0.84em;
  padding: 0.08em 0.18em;
  border-bottom: 0.01em solid #e5e5e5;
}
#uni-down-index .wrapper .download-list-item_left {
  height: 0.48em;
  width: 0.48em;
  margin-right: 0.12em;
  border-radius: 0.06em;
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: contain;
}
#uni-down-index .wrapper .download-list-item_mid {
  width: 1.8em;
  flex: 1;
}
#uni-down-index .wrapper .download-list-item_mid .title {
  color: #484848;
  font-size: 0.16em;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
}
#uni-down-index .wrapper .download-list-item_mid .desc {
  margin-top: 0.04em;
  color: #a6a6a6;
  font-size: 0.12em;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
}
#uni-down-index .wrapper .download-list-item_right {
  height: 0.34em;
  width: 0.8em;
  margin-left: 0.19em;
}
#uni-down-index .wrapper .download-list-item_right .button {
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
}
#uni-down-index .wrapper .download-list-item_right .button.install {
  background-color: #08964c;
}
#uni-down-index .wrapper .download-list-item_right .button.open .txt {
  color: #08964c;
}
#uni-down-index .wrapper .download-list-item_right .button.fail {
  position: relative;
  background-color: rgba(223, 46, 48, 0.5);
  border-color: #df2e30;
  color: #fff;
}
#uni-down-index .wrapper .download-list-item_right .button.fail .percent {
  background-color: #df2e30;
}
#uni-down-index .wrapper .download-list-item_right .button.fail .txt {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAMAAAANxBKoAAAAOVBMVEUAAAD///////////////////////////////////////////////////////////////////////8KOjVvAAAAEnRSTlMA3+8QIL+AYEAwkM9QcK+fb6D2vGtHAAABR0lEQVRIx72V3ZKDIAxGCeEfqm3e/2F3JTsDEhb1pueqdT7hGExUf7zVAyKFB+lEgPfTQJT4F/q0gSYNNhX8T4SougRLPVuZi/wCyNkT4GciB0AzdiNEVoARIg2dvEGFsXyAGB2lCGP7upfcx6XIa3D0wHEzFbFqwHA8SxFefADZxgkR3lPEoV5HIcIuI/G0eCxvt9usm8uAa4t3mHDct4k0arHKiiQUV4Sqou5SVeLd9Hak/W3xR4/p+oqjeZD2msDcNcHar8t07dfCR3hdTeCZ0A42LCfZQb+PW6Q//cm/qgpeiPjTO+bW9SPTdmpdIzE8hIb/ubnITiPR9XYattxo8v4sZbjlh+keNV8sYx/AdBJ4YvbYZ9mCD30ap+wC1pZ2nO1KLTeV6DCtq6UZlp0lHpZfEpm353WvOtf4rQ45nfe3UV/kB1pqJq5QonVNAAAAAElFTkSuQmCC)
    no-repeat 0;
  background-size: 1em 1em;
  padding-left: 1.3em;
}
#uni-down-index .wrapper .download-list-item_right .button.downloading {
  background-color: #80d2a5;
}
#uni-down-index
  .wrapper
  .download-list-item_right
  .button.downloading
  .percent {
  background-color: #08964c;
}
#uni-down-index .wrapper .download-list-item_right .button .percent {
  position: absolute;
  display: inline-block;
  height: 100%;
  width: 0;
  left: 0;
  top: 0;
  border-radius: 0.4em 0 0 0.4em;
}
#uni-down-index .wrapper .download-list-item_right .button .txt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  z-index: 3;
}
div {
  line-height: 100%;
}
.image-style-contain {
  background-repeat: no-repeat;
  background-size: contain;
}
.image-style-cover {
  background-repeat: no-repeat;
  background-size: cover;
}
.image-style-vertical-mid {
  vertical-align: middle;
}
.flex-row-between {
  display: flex;
  justify-content: space-between;
}
.flex-row-around {
  display: flex;
  justify-content: space-around;
}
.single-txt-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.more-txt-overflow {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.vertical-center {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.horizontal-center {
  margin: 0 auto;
}
.vertical-horizontal-center {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  margin: 0 auto;
  transform: translateY(-50%);
}
#uni-down-index .progress-circle {
  position: absolute;
  top: 1.5em;
  right: 0em;
  height: 0.48em;
  width: 0.48em;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0.02em 0.1em 0 #000;
  transition: left 0.4s ease;
}
#uni-down-index .progress-circle:before {
  content: "";
  display: inline-block;
  height: 0.3em;
  width: 0.3em;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALLSURBVHgB7dyxbtNQFMbx7zppMGXJyOgBsTaPEJggqkR4gzDSDiVvkDKxBYRKJQZQn4AMDYzt2DErMBDeIEOLTJTk4gMSEqK0QO89Po2+35LIWey/bqzE99oAERERERERESlwMGSl32pUa+h4JGu4iMSPka9s593BGEaYCb364m57gcobBJRgfv/LxrsBDEhgxALVPgKbo/IaRpgInT5fbwI+Q2DF17W+8rLVgAFmRnQslXlShwFLH9oKhlbC0EoYWglDK2FoJQythKGVMLQShlbC0EoYWglDK2FoJQythKGVMLSSKpTU++36SW2aVZLfZzz8AmuxZond3DfS3fVTP0vz6mjSHUygQGUW/MrO+lbx0nMOJqaVfuHQyx/ubyOy6KHTnVYHLjEzG30638k3hnuIKPo52iPZgnXedRBZ9NDF6cLEdP9ZvMI+Kvzq8GOYF38f449o4BmMK/bxKSKrILLZ8ONRtXXTFUfThEUe2/nmMPpgiB5azN5+ODQZ+3vk/R4UqIQW5mIrRhZqoYWZ2MqRhWpoUXrsEiIL9dCitNglRRalhBbqsUuMLEoLLdRilxxZlBpaRI9tILIoPbSIFttIZGEitAge21BkYSa0CBbbWGRhKrS4cGyDkYW50OK/YxuNLEyGFv8c23BkYTa0+OvYxiML06HFubEvQWRhPrT4Y+xLElmYeozEedLdO5lfVO/J+6urx3uTB4cqi1+IiIiIiKgcwf+wyMr+vDZtA0mGSyhx85E8wq150MPhrR5CCRo67bczXJkfxHjily43xrRyO380+IRAwq4mXYrIojiG2uyVjOpQgoW+ttNuLEfkn5pH70cZAuHtb2fxswyBBAt9MsXYeyzV1bQ0Px4hkHAjujuYJM5Hv41MiZdr3ZNuuMuwQS/8/1jdf+Ozh8ucw3XY50/ZNC42Pv66OXwCIiIiIiIiIiIiIgrlGwMDFEWmMauZAAAAAElFTkSuQmCC)
    no-repeat 50%;
  background-size: contain;
}
#uni-down-index .progress-circle .num-tag {
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
#uni-down-index .progress-circle .hidden-box {
  position: absolute;
  display: inline-block;
  width: 50%;
  height: 100%;
  overflow: hidden;
}
#uni-down-index .progress-circle .hidden-box.right {
  left: 50%;
}
#uni-down-index .progress-circle-cover {
  display: inline-block;
  width: 100%;
  height: 100%;
  background-color: #80d2a5;
  opacity: 0.5;
}
#uni-down-index .progress-circle-cover.left {
  position: absolute;
  border-radius: 1em 0 0 1em;
  transform-origin: right center;
  transition: transform 0.1s;
}
#uni-down-index .progress-circle-cover.right {
  position: absolute;
  border-radius: 0 1em 1em 0;
  transform-origin: left center;
  transition: transform 0.1s;
}
.end-jump {
  -webkit-animation-name: jump;
  animation-name: jump;
  -webkit-animation-duration: 0.6s;
  animation-duration: 0.6s;
  -webkit-animation-iteration-count: 3;
  animation-iteration-count: 3;
}
.end-scale {
  -webkit-animation-name: scaleIn;
  animation-name: scaleIn;
  -webkit-animation-duration: 0.4s;
  animation-duration: 0.4s;
  -webkit-animation-iteration-count: 1;
  animation-iteration-count: 1;
}
@-webkit-keyframes jump {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(20px);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes jump {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(20px);
  }
  to {
    transform: translateY(0);
  }
}
@-webkit-keyframes scaleIn {
  0% {
    transform: scale(1);
  }
  to {
    transform: scale(0.3);
  }
}
@keyframes scaleIn {
  0% {
    transform: scale(1);
  }
  to {
    transform: scale(0.3);
  }
}
#app {
  position: relative;
}
#uni-down-index * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
#uni-down-index {
  top: 0;
  left: 0;
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
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0.02em 0.1em 0 #000;
  transition: left 1s ease-in, top 1s linear;
}
.tiny-ball:before {
  content: "";
  display: inline-block;
  height: 0.15em;
  width: 0.15em;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALLSURBVHgB7dyxbtNQFMbx7zppMGXJyOgBsTaPEJggqkR4gzDSDiVvkDKxBYRKJQZQn4AMDYzt2DErMBDeIEOLTJTk4gMSEqK0QO89Po2+35LIWey/bqzE99oAERERERERESlwMGSl32pUa+h4JGu4iMSPka9s593BGEaYCb364m57gcobBJRgfv/LxrsBDEhgxALVPgKbo/IaRpgInT5fbwI+Q2DF17W+8rLVgAFmRnQslXlShwFLH9oKhlbC0EoYWglDK2FoJQythKGVMLQShlbC0EoYWglDK2FoJQythKGVMLSSKpTU++36SW2aVZLfZzz8AmuxZond3DfS3fVTP0vz6mjSHUygQGUW/MrO+lbx0nMOJqaVfuHQyx/ubyOy6KHTnVYHLjEzG30638k3hnuIKPo52iPZgnXedRBZ9NDF6cLEdP9ZvMI+Kvzq8GOYF38f449o4BmMK/bxKSKrILLZ8ONRtXXTFUfThEUe2/nmMPpgiB5azN5+ODQZ+3vk/R4UqIQW5mIrRhZqoYWZ2MqRhWpoUXrsEiIL9dCitNglRRalhBbqsUuMLEoLLdRilxxZlBpaRI9tILIoPbSIFttIZGEitAge21BkYSa0CBbbWGRhKrS4cGyDkYW50OK/YxuNLEyGFv8c23BkYTa0+OvYxiML06HFubEvQWRhPrT4Y+xLElmYeozEedLdO5lfVO/J+6urx3uTB4cqi1+IiIiIiKgcwf+wyMr+vDZtA0mGSyhx85E8wq150MPhrR5CCRo67bczXJkfxHjily43xrRyO380+IRAwq4mXYrIojiG2uyVjOpQgoW+ttNuLEfkn5pH70cZAuHtb2fxswyBBAt9MsXYeyzV1bQ0Px4hkHAjujuYJM5Hv41MiZdr3ZNuuMuwQS/8/1jdf+Ozh8ucw3XY50/ZNC42Pv66OXwCIiIiIiIiIiIiIgrlGwMDFEWmMauZAAAAAElFTkSuQmCC)
    no-repeat 50%;
  background-size: contain;
}
</style>

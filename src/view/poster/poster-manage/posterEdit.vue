<template>
  <div class="box">
    <iframe id="mobsf"
      src="https://static-5b19aa0b-a5ec-4c99-87cc-bf7ebffe1e07.bspapp.com/dist/index.html"
      scrolling="no"  frameborder="0" width="100%" height="100%"></iframe>
  </div>

</template>


<script>
  export default {
    data() {
      return {}
    },
    mounted() {
      /**
       * iframe-宽高自适应显示
       */
      // function changeMobsfIframe(){
      //   const mobsf = document.getElementById('mobsf');
      //   const deviceWidth = document.body.clientWidth;
      //   const deviceHeight = document.body.clientHeight;
      //   mobsf.style.width = (Number(deviceWidth)-120) + 'px'; //数字是页面布局宽度差值
      //   mobsf.style.height = (Number(deviceHeight)-80) + 'px'; //数字是页面布局高度差
      // }

      // changeMobsfIframe()

      // window.onresize = function(){
      //   changeMobsfIframe()
      // }
    },
  }
</script>

<style>
   .box {
    height: 800px;
  }

  /*iframe {
    position: absolute;
    transform: scale(0.7);
    left: -660px;
    top: -275px;
    z-index: 9999;
  } */
</style>

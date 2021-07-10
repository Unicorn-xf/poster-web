<style lang="less">
  @import "./common.less";
</style>
<template>
  <div>
    <Row Style="font-size: 15px;padding-left: 8px;margin-bottom: 10px;color: red;font-weight: 600;">
      温馨提示：请先下载模板
    </Row>
    <Card title="导入EXCEL">
      <Row>
        <Upload action="" :before-upload="handleBeforeUpload" accept=".xls, .xlsx" style="display: inline-block;">
          <Button icon="ios-cloud-upload-outline" :loading="uploadLoading" @click="handleUploadFile">上传文件</Button>
        </Upload>
        <Button icon="md-download" @click="exportExcel" style="margin-left: 30px;">下载模板</Button>
      </Row>
      <Row>
        <div class="ivu-upload-list-file" v-if="file !== null">
          <Icon type="ios-stats"></Icon>
          {{ file.name }}
          <Icon v-show="showRemoveFile" type="ios-close" class="ivu-upload-list-remove" @click.native="handleRemove()">
          </Icon>
        </div>
      </Row>
      <Row>
        <transition name="fade">
          <Progress v-if="showProgress" :percent="progressPercent" :stroke-width="2">
            <div v-if="progressPercent == 100">
              <Icon type="ios-checkmark-circle"></Icon>
              <span>成功</span>
            </div>
          </Progress>
        </transition>
      </Row>
    </Card>

    <!-- 推广海报的模态框 -->
    <Card>
      <div id="picbox">
        <div id="pic">
          <div id="p1">
            <img src="../../../assets/images/poster.png" />
            <img src="../../../assets/images/poster.png" />
            <img src="../../../assets/images/poster.png" />
          </div>
          <div id="p2">
            <img src="../../../assets/images/poster.png" />
            <img src="../../../assets/images/poster.png" />
            <img src="../../../assets/images/poster.png" />
          </div>
        </div>
      </div>
    </Card>


    <Row class="margin-top-10">
      <Table :columns="tableTitle" :data="tableData" :loading="tableLoading"></Table>
    </Row>
  </div>
</template>
<script>
  import excel from '@/libs/excel'
  import xlsx from 'xlsx'
  import html2canvas from 'html2canvas'
  export default {
    name: 'upload-excel',
    data() {
      return {
        uploadLoading: false,
        progressPercent: 0,
        showProgress: false,
        showRemoveFile: false,
        file: null,
        tableData: [],
        tableTitle: [],
        tableLoading: false,
        exportLoading: false,
        tableDataInfo: [{
          name: "",
          danweiName: "",
          changpinName: "",
          baofei: ""
        }],
        value1: 0,
        modal1: false,
        value: 0
      }
    },
    methods: {
      // init(){
      //   this.clickGeneratePicture();
      // },
      initUpload() {
        this.file = null
        this.showProgress = false
        this.loadingProgress = 0
        this.tableData = []
        this.tableTitle = []
      },
      handleUploadFile() {
        this.initUpload()
      },
      handleRemove() {
        this.initUpload()
        this.$Message.info('上传的文件已删除！')
      },
      handleBeforeUpload(file) {
        const fileExt = file.name.split('.').pop().toLocaleLowerCase()
        if (fileExt === 'xlsx' || fileExt === 'xls') {
          this.readFile(file)
          this.file = file
        } else {
          this.$Notice.warning({
            title: '文件类型错误',
            desc: '文件：' + file.name + '不是EXCEL文件，请选择后缀为.xlsx或者.xls的EXCEL文件。'
          })
        }
        return false
      },
      // 读取文件
      readFile(file) {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadstart = e => {
          this.uploadLoading = true
          this.tableLoading = true
          this.showProgress = true
        }
        reader.onprogress = e => {
          this.progressPercent = Math.round(e.loaded / e.total * 100)
        }
        reader.onerror = e => {
          this.$Message.error('文件读取出错')
        }
        reader.onload = e => {
          this.$Message.info('文件读取成功')
          const data = e.target.result
          const {
            header,
            results
          } = excel.read(data, 'array')
          const tableTitle = [{
            "title": "姓名",
            "key": "userName"
          }, {
            "title": "单位",
            "key": "unit"
          }, {
            "title": "产品名称",
            "key": "productName"
          }, {
            "title": "保费",
            "key": "premium"
          }] //header.map(item => { return { title: item, key: item } })
          let dataInfo = results
          dataInfo.splice(0, 1)
          this.tableData = dataInfo
          this.tableTitle = tableTitle
          this.uploadLoading = false
          this.tableLoading = false
          this.showRemoveFile = true
        }
      },
      exportExcel() {
        // this.exportLoading = true
        // const params = {
        //   title: ['姓名', '单位名称', '产品名称','保费'],
        //   key: ['name', 'danweiName', 'changpinName','baofei'],
        //   data: this.tableDataInfo,
        //   autoWidth: true,
        //   filename: '海报模板'
        // }
        // excel.export_array_to_excel(params)
        // this.exportLoading = false
        // 规范（隐藏）
        let dataArray = ["userName", "unit", "productName", "premium"]
        // 表头
        let titleArray = ["姓名", "单位", "产品名称", "保费"]
        // 列宽
        let colsWidth = [{
          wch: 10
        }, {
          wch: 10
        }, {
          wch: 10
        }, {
          wch: 10
        }]

        var sheet = xlsx.utils.aoa_to_sheet([dataArray, titleArray]);
        // 隐藏规范数据
        sheet['!rows'] = [{
          'hidden': true
        }]
        // 调整列宽
        sheet['!cols'] = colsWidth
        this.openDownloadDialog(this.sheet2blob(sheet), '数据模板.xlsx');
      },
      /**
       * 通用的打开下载对话框方法，没有测试过具体兼容性
       * @param url 下载地址，也可以是一个blob对象，必选
       * @param saveName 保存文件名，可选
       */
      openDownloadDialog: function(url, saveName) {
        if (typeof url == 'object' && url instanceof Blob) {
          url = URL.createObjectURL(url); // 创建blob地址
        }
        var aLink = document.createElement('a');
        aLink.href = url;
        aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
        var event;
        if (window.MouseEvent) event = new MouseEvent('click');
        else {
          event = document.createEvent('MouseEvents');
          event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);
      },
      // 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
      sheet2blob: function(sheet, sheetName) {
        sheetName = sheetName || 'sheet1';
        var workbook = {
          SheetNames: [sheetName],
          Sheets: {}
        };
        workbook.Sheets[sheetName] = sheet;
        // 生成excel的配置项
        var wopts = {
          bookType: 'xlsx', // 要生成的文件类型
          bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
          type: 'binary'
        };
        var wbout = xlsx.write(workbook, wopts);
        var blob = new Blob([s2ab(wbout)], {
          type: "application/octet-stream"
        });
        // 字符串转ArrayBuffer
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length);
          var view = new Uint8Array(buf);
          for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
          return buf;
        }
        return blob;
      },
      clickGeneratePicture() {
        window.scrollTo(0, 0);
        if (this.value1 == 0) {
          html2canvas(this.$refs.imageDomFirst).then(canvas => {
            // backgroundColor: null;
            // 转成图片，生成图片地址
            this.imgUrl = canvas.toDataURL("../../assets/cs/png");
            // console.log(this.imgUrl);
            var eleLink = document.createElement("a");
            eleLink.href = this.imgUrl; // 转换后的图片地址
            eleLink.download = "海报1";
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
          });
        } else if (this.value1 == 1) {
          html2canvas(this.$refs.imageDomSecond).then(canvas => {
            // backgroundColor: null;
            // 转成图片，生成图片地址
            this.imgUrl = canvas.toDataURL("../../assets/cs/png");
            // console.log(this.imgUrl);
            var eleLink = document.createElement("a");
            eleLink.href = this.imgUrl; // 转换后的图片地址
            eleLink.download = "海报2";
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
          });
        } else {
          html2canvas(this.$refs.imageDomThird).then(canvas => {
            // backgroundColor: null;
            // 转成图片，生成图片地址
            this.imgUrl = canvas.toDataURL("../../assets/cs/png");
            // console.log(this.imgUrl);
            var eleLink = document.createElement("a");
            eleLink.href = this.imgUrl; // 转换后的图片地址
            eleLink.download = "海报3";
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
          });
        }
      },
      cancel() {

      }

    },
    created() {

    },
    mounted() {
      //this.init();
    }
  }
</script>
<style type="text/css">
	#picbox{
		width: 400px;
		overflow: hidden;
	}
	#pic{
		width:2424px;
		font-size: 0;
		
	}
	#pic>div{
		display: inline-block;
		
	}
	
	#pic img{
		width: 400px;
	}
</style>

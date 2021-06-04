<style lang="less">
  .search {
    .operation {
        margin-bottom: 2vh;
    }

    .select-title {
        font-weight: 600;
        color: #40a9ff;
    }

    .select-clear {
        margin-left: 10px;
    }
}

.tree-bar {
    overflow: auto;
    margin-top: 5px;
    position: relative;
    min-height: 80px;
}

.tree-bar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.tree-bar::-webkit-scrollbar-thumb {
    border-radius: 4px;
    -webkit-box-shadow: inset 0 0 2px #d1d1d1;
    background: #e4e4e4;
}
</style>
<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <!--v-hasAuth="'departmentManage.vue_add'"-->
        <Button  @click="add" type="primary" icon="md-add" v-show="showType == 'tree'">添加子部门</Button>
        <!--v-hasAuth="'departmentManage.vue_add'"-->
        <Button  @click="addRoot" icon="md-add">添加一级部门</Button>
        <!--v-hasAuth="'departmentManage.vue_delete'"-->
        <Button  @click="delAll" icon="md-trash">批量删除</Button>
        <Button @click="getParentList" icon="md-refresh">刷新</Button>
        <!--v-hasAuth="'departmentManage.vue_search'"-->
        <Input  v-model="searchKey" suffix="ios-search" @on-change="search" placeholder="输入部门名搜索" clearable style="width: 250px"
          v-show="showType == 'list'" />
        <i-switch v-model="strict" size="large" v-show="showType == 'tree'" style="margin-left: 5px">
          <span slot="open">级联</span>
          <span slot="close">单选</span>
        </i-switch>
        <div style="float: right">
          <RadioGroup v-model="showType" type="button">
            <Radio title="树结构" label="tree">
              <Icon type="md-list"></Icon>
            </Radio>
            <Radio title="列表" label="list">
              <Icon type="ios-apps"></Icon>
            </Radio>
          </RadioGroup>
        </div>
      </Row>
      <Row type="flex" justify="start" :gutter="16" v-show="showType == 'tree'">
        <Col :sm="8" :md="8" :lg="8" :xl="6">
        <Alert show-icon>
          当前选择编辑：
          <span class="select-title">{{ editTitle }}</span>
          <a class="select-clear" v-if="form.id" @click="cancelEdit">取消选择</a>
        </Alert>
        <Input v-model="searchKey" suffix="ios-search" @on-change="search" placeholder="输入部门名搜索" clearable />
        <div class="tree-bar" :style="{ maxHeight: maxHeight }">
          <Tree ref="tree" :data="data" :load-data="loadData" show-checkbox @on-check-change="changeSelect"
            @on-select-change="selectTree" :check-strictly="!strict"></Tree>
          <Spin size="large" fix v-if="loading"></Spin>
        </div>
        </Col>
        <Col :sm="16" :md="16" :lg="16" :xl="9">
        <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
          <FormItem label="上级部门" prop="parentTitle">
            <div style="display: flex">
              <Input v-model="form.parentTitle" readonly style="margin-right: 10px" />
              <Poptip transfer trigger="click" placement="right-start" title="选择上级部门" width="250">
                <Button icon="md-list">选择部门</Button>
                <div slot="content" style="position: relative; min-height: 5vh">
                  <Tree :data="dataEdit" :load-data="loadData" @on-select-change="selectTreeEdit"></Tree>
                  <Spin size="large" fix v-if="loadingEdit"></Spin>
                </div>
              </Poptip>
            </div>
          </FormItem>
          <FormItem label="部门名称" prop="title">
            <Input v-model="form.title" />
          </FormItem>
          <FormItem label="排序值" prop="sortOrder">
            <Tooltip trigger="hover" placement="right" content="值越小越靠前，支持小数">
              <InputNumber :max="1000" :min="0" v-model="form.sortOrder"></InputNumber>
            </Tooltip>
          </FormItem>
          <FormItem label="是否启用" prop="status">
            <i-switch size="large" v-model="form.status" :true-value="0" :false-value="1">
              <span slot="open">启用</span>
              <span slot="close">禁用</span>
            </i-switch>
          </FormItem>
          <FormItem class="br">
            <!--v-hasAuth="'departmentManage.vue_edit'"-->
            <Button @click="submitEdit" :loading="submitLoading" type="primary" icon="ios-create-outline" >修改并保存</Button>
            <Button @click="handleReset">重置</Button>
          </FormItem>
        </Form>
        </Col>
      </Row>
      <Alert show-icon v-show="showType == 'list'">
        已选择
        <span class="select-count">{{ selectList.length }}</span> 项
        <a class="select-clear" @click="clearSelectAll">清空</a>
      </Alert>
      <Table row-key="title" :load-data="loadData" :columns="columns" :data="data" :loading="loading" border
        :update-show-children="true" ref="table" @on-selection-change="showSelect" v-if="showType == 'list'"></Table>
    </Card>

    <Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
      <Form ref="formAdd" :model="formAdd" :label-width="85" :rules="formValidate">
        <div v-if="showParent">
          <FormItem label="上级部门：">{{ form.title }}</FormItem>
        </div>
        <FormItem label="部门名称" prop="title">
          <Input v-model="formAdd.title" />
        </FormItem>
        <FormItem label="排序值" prop="sortOrder">
          <Tooltip trigger="hover" placement="right" content="值越小越靠前，支持小数">
            <InputNumber :max="1000" :min="0" v-model="formAdd.sortOrder"></InputNumber>
          </Tooltip>
        </FormItem>
        <FormItem label="是否启用" prop="status">
          <i-switch size="large" v-model="formAdd.status" :true-value="0" :false-value="1">
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelAdd">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitAdd">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import store from '@/store'
  import {
    // initDepartment,
    loadDepartment,
    addDepartment,
    editDepartment,
    deleteDepartment,
    searchDepartment
    // getUserByDepartmentId,
  } from "@/api/department";
  export default {
    name: "department-manage",
    data() {
      return {
        showType: "tree",
        loading: true,
        maxHeight: "500px",
        strict: true,
        userLoading: false,
        loadingEdit: true,
        modalVisible: false,
        selectList: [],
        showParent: false,
        modalTitle: "",
        editTitle: "",
        searchKey: "",
        form: {
          id: "",
          title: null,
          parentId: "",
          parentTitle: "",
          sortOrder: 0,
          status: 0,
        },
        formAdd: {},
        formValidate: {
          title: [{
            required: true,
            message: "名称不能为空",
            trigger: "change"
          }],
          sortOrder: [{
            required: true,
            type: "number",
            message: "排序值不能为空",
            trigger: "change",
          }, ],
        },
        submitLoading: false,
        data: [],
        dataEdit: [],
        users: [],
        columns: [{
            type: "selection",
            width: 60,
            align: "center",
          },
          {
            title: "序号",
            type: "index",
            width: 75,
            align: "center",
          },
          {
            title: "部门名称",
            key: "title",
            minWidth: 120,
            sortable: true,
            tree: true,
          },
          {
            title: "排序",
            key: "sortOrder",
            width: 150,
            sortable: true,
            align: "center",
            sortType: "asc",
          },
          {
            title: "创建时间",
            key: "createTime",
            sortable: true,
            width: 200,
          },
          {
            title: "操作",
            key: "action",
            width: 300,
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "a", {
                    on: {
                      click: () => {
                        this.tableAdd(params.row);
                      },
                    },
                  },
                  "添加子部门"
                ),
                h("Divider", {
                  props: {
                    type: "vertical",
                  },
                }),
                h(
                  "a", {
                    on: {
                      click: () => {
                        this.remove(params.row);
                      },
                    },
                  },
                  "删除"
                ),
              ]);
            },
          },
        ],
      };
    },
    methods: {
      init() {
        this.getParentList();
        this.getParentListEdit();
      },
      getParentList() {
        this.loading = true;
        console.log("请求一级部门");
        loadDepartment({
          "parentId": "0"
        }).then((res) => {
          this.loading = false;
          res = res.data;
          if (res.retcode == "0000") {
            let needTrans = res.data
            let transed = this.transTree(needTrans)
            this.data = transed;
          }
        });
      },
      getParentListEdit() {
        this.loadingEdit = true;
        loadDepartment({
          "parentId": "0"
        }).then((res) => {
          this.loadingEdit = false;
          res = res.data
          if (res.retcode == "0000") {
            let needTrans = res.data
            let transed = this.transTree(needTrans)
            // 头部加入一级
            let first = {
              id: "0",
              title: "一级部门",
            };
            transed.unshift(first);
            this.dataEdit = transed;
          }
        });
      },
      transTree(needTrans){
        let transed = JSON.parse(JSON.stringify(needTrans).replace(/deptName/g, "title").replace(/parentName/g,
          "parentTitle").replace(/deptPid/g, "parentId").replace(/deptSort/g,"sortOrder"));
        transed.forEach(function(e) {
          if (e.isParent === '1') {
            e.isParent = true
          } else {
            e.isParent = false
          }
          if (e.isParent) {
            e.loading = false;
            e.children = [];
            e._loading = false;
          }
          if (e.parentId === '0') {
            e.parentTitle = '一级部门'
          }
        });
        return transed
      },
      loadData(item, callback) {
        console.log("item.id: ", item.id);
        loadDepartment({
          "parentId": item.id
        }).then((res) => {
          res = res.data
          if (res.retcode == "0000") {
            let needTrans = res.data
            let transed = this.transTree(needTrans)
            callback(transed);
          }
        });
      },
      search() {
        if (this.searchKey) {
          this.loading = true;
          searchDepartment({
            title: this.searchKey
          }).then((res) => {
            this.loading = false;
            if (res.data.code === '0') {
              // 格式转换
              let transed = JSON.parse(JSON.stringify(res.data.result).replace(/deptName/g, "title").replace(/parentName/g,
                "parentTitle").replace(/deptPid/g, "parentId").replace(/deptSort/g,"sortOrder"));
              transed.forEach(function(e) {
                if (e.isParent == '1') {
                  e.loading = false;
                  e.children = [];
                  e._loading = false;
                }
              });
              this.data = transed;
            } else {
              this.$Message.warning("数据库操作错误：" + res.data.message)
            }
          }).catch(e => {
            this.$Message.error("添加部门出错：" + e.message)
          });
        } else {
          this.getParentList();
        }
      },
      selectTree(v) {
        console.log("v: " + JSON.stringify(v));
        if (v.length > 0) {
          // 转换null为""
          for (let attr in v[0]) {
            if (v[0][attr] == null) {
              v[0][attr] = "";
            }
          }
          let str = JSON.stringify(v[0]);
          let data = JSON.parse(str);
          this.editTitle = data.title;
          // 加载部门用户数据
          this.userLoading = true;
          // getUserByDepartmentId(data.id).then((res) => {
          //   this.userLoading = false;
          //   if (res.success) {
          //     this.users = res.result;
          //     // 回显
          //     this.form = data;
          //   }
          // });
          this.form = data;
        } else {
          this.cancelEdit();
        }
      },
      cancelEdit() {
        let data = this.$refs.tree.getSelectedNodes()[0];
        if (data) {
          data.selected = false;
        }
        this.$refs.form.resetFields();
        delete this.form.id;
        this.editTitle = "";
      },
      selectTreeEdit(v) {
        if (v.length > 0) {
          // 转换null为""
          for (let attr in v[0]) {
            if (v[0][attr] == null) {
              v[0][attr] = "";
            }
          }
          let str = JSON.stringify(v[0]);
          let data = JSON.parse(str);
          this.form.parentId = data.id;
          this.form.parentTitle = data.title;
        }
      },
      cancelAdd() {
        this.modalVisible = false;
      },
      handleReset() {
        this.$refs.form.resetFields();
        this.form.status = 0;
      },
      showSelect(e) {
        this.selectList = e;
      },
      clearSelectAll() {
        this.$refs.table.selectAll(false);
      },
      submitEdit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (!this.form.id) {
              this.$Message.warning("请先点击选择要修改的部门");
              return;
            }
            let data = {
              id:this.form.id,
              deptPid: this.form.parentId,
              deptSort: this.form.sortOrder,
              isEnable: this.form.status,
              deptName: this.form.title,
              remark: this.form.title,
            }
            this.submitLoading = true;
            editDepartment(data).then((res) => {
              this.submitLoading = false;
              if (res.data.success) {
                this.$Message.success("编辑成功");
                this.init();
                this.modalVisible = false;
              }
            });
          }
        });
      },
      submitAdd() {
        this.$refs.formAdd.validate((valid) => {
          if (valid) {
            this.submitLoading = true;
            let data = {
              deptPid: this.formAdd.parentId,
              deptSort: this.formAdd.sortOrder,
              isEnable: this.formAdd.status,
              deptName: this.formAdd.title,
              remark: this.formAdd.title,
              creator: store.state.user.userId
            }
            addDepartment(data).then((res) => {
              this.submitLoading = false;
              if (res.data.code === '0') {
                this.$Message.success("添加成功");
                this.init();
                this.modalVisible = false;
              } else {
                this.init();
                this.modalVisible = false;
                this.$Message.warning("数据库操作错误：" + res.data.message)
              }
            }).catch(e => {
              this.init();
              this.modalVisible = false;
              this.$Message.error("添加部门出错：" + e.message)
            });
          }
        });
      },
      tableAdd(v) {
        this.form = v;
        this.add();
      },
      add() {
        if (this.form.id == "" || this.form.id == null) {
          this.$Message.warning("请先点击选择一个部门");
          return;
        }
        this.modalTitle = "添加子部门";
        this.showParent = true;
        this.formAdd = {
          parentId: this.form.id,
          sortOrder: 0,
          status: 0,
        };
        this.modalVisible = true;
      },
      addRoot() {
        this.modalTitle = "添加一级部门";
        this.showParent = false;
        this.formAdd = {
          parentId: 0,
          sortOrder: 0,
          status: 0,
        };
        this.modalVisible = true;
      },
      changeSelect(v) {
        this.selectList = v;
      },
      remove(v) {
        this.selectList = [];
        this.selectList.push(v);
        this.delAll();
      },
      delAll() {
        if (this.selectList.length <= 0) {
          this.$Message.warning("您还未勾选要删除的数据");
          return;
        }
        this.$Modal.confirm({
          title: "确认删除",
          content: "您确认要删除所选的 " +
            this.selectList.length +
            " 条数据及其下级所有数据?",
          loading: true,
          onOk: () => {
            let ids = "";
            this.selectList.forEach(function(e) {
              ids += e.id + ",";
            });
            ids = ids.substring(0, ids.length - 1);
            deleteDepartment({
              ids: ids
            }).then((res) => {
              this.$Modal.remove();
              if (res.data.code === '0') {
                this.$Message.success("删除成功");
                this.selectList = [];
                this.cancelEdit();
                this.init();
              } else {
                this.cancelEdit();
                this.selectList = [];
                this.init();
                this.$Message.warning("数据库操作错误：" + res.data.message)
              }
            }).catch(e => {
              this.cancelEdit();
              this.selectList = [];
              this.init();
              this.$Message.error("删除部门出错：" + e.message)
            });
          },
        });
      },
    },
    mounted() {
      // 计算高度
      let height = document.documentElement.clientHeight;
      this.maxHeight = Number(height - 287) + "px";
      this.init();
    },
  };
</script>

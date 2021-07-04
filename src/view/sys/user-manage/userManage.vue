<template>
  <div>
    <Card>
      <Row>
        <Form ref="searchForm" :model="searchForm" inline :label-width="70">
          <FormItem label="用户名" prop="userName">
            <Input type="text" v-model="searchForm.userName" clearable placeholder="请输入用户名" style="width: 200px" />
          </FormItem>
          <FormItem label="状态" prop="state">
            <Select v-model="searchForm.state" placeholder="请选择" clearable style="width: 200px">
              <Option v-for="(item, i) in dictState" :key="i" :value="item.value">{{ item.title }}</Option>
            </Select>
          </FormItem>
         <!-- <FormItem label="登录IP" prop="lastLoginIp">
            <Input type="text" v-model="searchForm.lastLoginIp" clearable placeholder="请输入上次登录IP" style="width: 200px" />
          </FormItem> -->
          <FormItem label="创建者" prop="creator">
            <Input type="text" v-model="searchForm.creator" clearable placeholder="请输入创建者" style="width: 200px" />
          </FormItem>
          <FormItem label="创建时间">
            <DatePicker v-model="selectDate" type="daterange" format="yyyy-MM-dd" clearable @on-change="selectDateRange"
              placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </FormItem>
          <FormItem style="margin-left: -50px" class="br">
            <!-- v-hasAuth="'userManage.vue_search'" -->
            <Button @click="handleSearch" type="primary" icon="ios-search" style="margin-right: 20px;">搜索</Button>
            <Button @click="add" type="primary" icon="md-add"  style="margin-right: 25px;">添加用户</Button>
            <Dropdown @on-click="handleDropdown">
              <Button>
                更多操作
                <Icon type="md-arrow-dropdown" />
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="refresh">刷新</DropdownItem>
                <!-- <DropdownItem name="reset">重置用户密码</DropdownItem> -->
                <!-- <DropdownItem name="exportData">导出所选数据</DropdownItem>
              <DropdownItem name="exportAll">导出全部数据</DropdownItem>
              <DropdownItem name="importData">导入数据(付费)</DropdownItem> -->
              </DropdownMenu>
            </Dropdown>
          </FormItem>
        </Form>
      </Row>
      <!-- <Row class="operation">
        v-hasAuth="'userManage.vue_add'"
        <Button @click="add" type="primary" icon="md-add"  style="margin-right: 20px;">添加用户</Button>
        <Dropdown @on-click="handleDropdown">
          <Button>
            更多操作
            <Icon type="md-arrow-dropdown" />
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="refresh">刷新</DropdownItem>
            <DropdownItem name="reset">重置用户密码</DropdownItem>
             <DropdownItem name="exportData">导出所选数据</DropdownItem>
          <DropdownItem name="exportAll">导出全部数据</DropdownItem>
          <DropdownItem name="importData">导入数据(付费)</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Row> -->
      <Table border stripe :columns="columns" :data="data" style="margin-top: 20px;text-align: center;"></Table>
      <!-- <Page :total="total" show-elevator style='text-align: center;margin-top: 20px;' @on-change="changePage"></Page> -->
      <Row type="flex" justify="end" class="pages">
        <Page :current="searchForm.pageIndex" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
          @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]" size="small" show-total show-elevator
          show-sizer></Page>
      </Row>
      <!--添加或编辑 -->
      <Modal :title="modalTitle" v-model="userModalVisible" :mask-closable="false" :width="500">
        <Form ref="userForm" :model="userForm" :label-width="80" :rules="userFormValidate">
          <!-- <FormItem label="头像">
            <Avatar icon="person" size="large" />
          </FormItem> -->
          <FormItem label="用户名" prop="userName">
            <Input v-model="userForm.userName" placeholder="请输入用户名" @on-change = "checkUserName"  />
            <span v-if="userExit" class="tip">用户名已存在</span>
          </FormItem>
          <FormItem label="电话号码" prop="phoneNum">
            <Input v-model="userForm.phoneNum" placeholder="请输入用户名"/>
          </FormItem>
          <FormItem label="密码" prop="passwd" v-if="modalType == 0">
            <Input v-model="userForm.passwd" type="password" placeholder="请输入密码" />
          </FormItem>
          <FormItem label="状态" prop="state">
            <Select v-model="userForm.state" placeholder="请选择" clearable style="width: 200px">
              <Option v-for="(item, i) in dictState" :key="i" :value="item.value">{{ item.title }}</Option>
            </Select>
          </FormItem>
          <FormItem label="用户角色" prop="role">
            <Select v-model="userForm.role" placeholder="请选择" clearable style="width: 200px">
              <Option v-for="(item, i) in roleList" :key="i" :value="item.value">{{ item.title }}</Option>
            </Select>
          </FormItem>
          <FormItem label="用户部门" prop="deptId">
            <Select v-model="userForm.deptId" multiple transfer>
              <Option v-for="item in deptList" :value="item.id" :key="item.id" :label="item.deptName">
                <span style="margin-right: 10px">{{ item.deptName }}</span>
              </Option>
            </Select>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" @click="cancelUser">取消</Button>
          <Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<script>
  import {
    enableUser,
    disableUser,
    getUserInfos,
    deleteUser,
    resetUser,
    addUser,
    editUser,
    getRoleList,
    getDeptList
  } from "@/api/userManage";
  import md5 from 'js-md5';
  import store from '@/store'
  export default {
    data() {
      return {
        columns: [{
            title: '序号',
            type: 'index',
            width: 70,
            align: 'center'
          }, {
            title: '用户名',
            width: 100,
            align: "center",
            key: 'userName'
          },
          {
            title: "头像",
            key: "avatar",
            width: 80,
            align: "center",
            render: (h, params) => {
              return h("Avatar", {
                props: {
                  src: params.row.avatar,
                },
              });
            },
          },
          {
            title: "状态",
            key: "state",
            align: "center",
            width: 80,
            render: (h, params) => {
              if (params.row.state == 0) {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "success",
                      text: "启用",
                    },
                  }),
                ]);
              } else if (params.row.state == 1) {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "error",
                      text: "禁用",
                    },
                  }),
                ]);
              }
            },
          },
          {
            title: '创建者',
            align: "center",
            width: 110,
            key: 'creator'
          },
          {
            title: '修改时间',
            align: "center",
            key: 'gmtModified'
          },
          {
            title: '创建时间',
            align: "center",
            key: 'gmtCreate'
          },
          {
            title: "操作",
            key: "action",
            width: 210,
            align: "center",
            render: (h, params) => {
              let enableOrDisable = "";
              if (params.row.state == 0) {
                enableOrDisable = h(
                  "a", {
                    on: {
                      click: () => {
                        this.disable(params.row);
                      },
                    },
                  },
                  "禁用"
                );
              } else {
                enableOrDisable = h(
                  "a", {
                    on: {
                      click: () => {
                        this.enable(params.row);
                      },
                    },
                  },
                  "启用"
                );
              }
              let data = [
                h(
                  "a", {
                    on: {
                      click: () => {
                        this.edit(params.row);
                      },
                    },
                  },
                  "编辑"
                ),
                h("Divider", {
                  props: {
                    type: "vertical",
                  },
                }),
                enableOrDisable,
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
                h("Divider", {
                  props: {
                    type: "vertical",
                  },
                }),
                h(
                  "a", {
                    on: {
                      click: () => {
                        this.reset(params.row);
                      },
                    },
                  },
                  "重置密码"
                ),
              ]
              // 编辑按钮
              // if(!this.$testAuth('userManage.vue_edit')) {
              //   data.splice(0, 2)
              // }
              // 启用/禁用按钮
              // if(!this.$testAuth('userManage.vue_enable')) {
              //   data.splice(2, 2)
              // }
              // 重置按钮
              // if(!this.$testAuth('userManage.vue_setDefault')) {
              //   data.splice(6, 1)
              // }
              // 删除按钮
              // if(!this.$testAuth('userManage.vue_delete')) {
              //   data.splice(4, 2)
              // }

              return h("div", data)
            },
          },
        ],
        data: [],
        searchForm: {
          userName: "",
          state: "",
          creator: "",
          startDate: "",
          endDate: "",
          pageIndex: 1,
          pageSize: 10,
        },
        selectDate: "",
        dictState: [{
          title: "启用",
          value: 0
        }, {
          title: "禁用",
          value: 1
        }],
        total: 0,
        modalTitle: "",
        userModalVisible: false,
        userForm: {
          id: "",
          userName: "",
          avatar: "https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png",
          state: "",
          role: "",
          deptId:[],
          passwd: "",
          phoneNum:"",
          creator: "",
        },
        userFormValidate: {
          userName: [{
            required: true,
            message: "用户名不能为空",
            trigger: "change"
          }, ],
          passwd: [{
            required: true,
            message: "请输入密码",
            trigger: "change"
          }, ],
          state: [{
            required: true,
            message: "请选择用户状态",
            // trigger: "change"
          }, ],
          role: [{
            required: true,
            message: "请选择角色",
            trigger: "change"
          }, ],
          phoneNum: [{
            required: true,
            message: "请输入电话号码",
            trigger: "change"
          }, ]
        },
        modalType: 0,
        submitLoading: false,
        roleList: [],
        allUserList:[],
        editUserName:'',
        userExit:false,
        deptList:[],
      }
    },
    methods: {
      init() {
        this.getDataList();
        this.getRoleList();
        this.getDeptList();
        this.getAllUserList();
      },
      selectDateRange(v) {
        if (v[0]) {
          this.searchForm.startDate = v[0] + " 00:00:00";
          this.searchForm.endDate = v[1] + " 23:59:59";
        } else {
          this.searchForm.startDate = "";
          this.searchForm.endDate = "";
        }
      },
      changePage(v) {
        this.searchForm.pageIndex = v;
        this.getDataList();
      },
      changePageSize(v) {
        this.searchForm.pageSize = v;
        this.getDataList();
      },
      handleSearch() {
        this.searchForm.pageIndex = 1;
        this.searchForm.pageSize = 10;
        this.getDataList();
      },
      //查询用户信息
      getDataList() {
        // 多条件搜索用户列表
        this.loading = true;
        getUserInfos(this.searchForm).then((res) => {
          this.loading = false;
          if (res.data.retcode == "0000") {
            this.data = res.data.data.context;
            if (res.data.data.context.length > 0) {
              this.total = res.data.data.num;
            } else {
              this.total = 0
            }
            if (this.data.length == 0 && this.searchForm.pageIndex > 1) {
              this.searchForm.pageIndex -= 1;
              this.getDataList();
            }
          }
        });
      },
      //查询所有用户
      getAllUserList(){
        let list = {
          userName: "",
          state: "",
          creator: "",
          startDate: "",
          endDate: "",
          pageIndex: 1,
          pageSize: 9999,
        }
        getUserInfos(list).then((res) => {
          if (res.data.retcode="0000") {
            this.allUserList = res.data.data;
          }
        });
      },
      //查询所有部门
      getDeptList() {
        let lists = {}
        getDeptList(lists).then((res) => {
          if (res.data.retcode ==="0000") {
            let list = res.data.data;
            let data = []
            this.deptList = list
          }
        });
      },
      checkUserName(){
       let name = this.userForm.userName
       let list = this.allUserList
       if(name != ""){
         if(this.modalType == 0){
           for(let i=0;i<list.length;i++){
             if(list[i].userName === name){
               this.userExit = true
               return;
             }else{
               this.userExit = false
             }
           }

         }else{
           let editUserName = this.editUserName
           if(name === editUserName){
             this.userExit = false;
           }else{
             for(let i=0;i<list.length;i++){
               if(list[i].userName === name){
                 this.userExit = true
                 return;
               }else{
                 this.userExit = false
               }
             }
           }
         }
       }
      },
      //查询角色数据
      getRoleList() {
        getRoleList({
          pageSize: 9999,
          pageIndex: 1,
          queryValue:""
        }).then((res) => {
          if (res.data.retcode ==="0000") {
            let list = res.data.data.content;
            let data = []
            for (let i = 0; i < list.length; i++) {
              data.push({
                title: list[i].roleName,
                value: list[i].id
              })
            }
            this.roleList = data
          }
        });
      },
      //添加用户
      add() {
        this.modalType = 0;
        this.modalTitle = "添加用户";
        this.userForm = {
          id: "",
          userName: "",
          avatar: "https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png",
          state: "",
          role: "",
          phoneNum:"",
          deptId:[],
          passwd: "",
          creator: "",
        }
        this.$refs.userForm.resetFields();
        delete this.userForm.id;
        this.userModalVisible = true;
      },
      //编辑用户
      edit(v) {
        this.modalType = 1;
        this.modalTitle = "编辑用户";
        this.$refs.userForm.resetFields();
        // 转换null为""
        for (let attr in v) {
          if (v[attr] == null) {
            v[attr] = "";
          }
        }
        let str = JSON.stringify(v);
        let userInfo = JSON.parse(str);
        let list = userInfo.deptId.replace(/\[|]/g, '').split(',')
        userInfo.deptId = list;
        this.editUserName = userInfo.userName;
        this.userForm = userInfo;
        this.userModalVisible = true;
      },
      //启用用户
      enable(v) {
        this.$Modal.confirm({
          title: "确认启用",
          content: "您确认要启用用户 " + v.userName + " ?",
          loading: true,
          onOk: () => {
            enableUser({
              id: v._id,
              type: 0
            }).then((res) => {
              this.$Modal.remove();
              if (res.data.retcode="0000") {
                this.$Message.success("操作成功");
                this.getDataList();
              }
            });
          },
        });
      },
      //禁用用户
      disable(v) {
        this.$Modal.confirm({
          title: "确认禁用",
          content: "您确认要禁用用户 " + v.userName + " ?",
          loading: true,
          onOk: () => {
            disableUser({
              id: v._id,
              type: 1
            }).then((res) => {
              this.$Modal.remove();
              if (res.data.retcode="0000") {
                this.$Message.success("操作成功");
                this.getDataList();
              }
            });
          },
        });
      },
      //删除用户
      remove(v) {
        this.$Modal.confirm({
          title: "确认删除",
          content: "您确认要删除用户 " + v.userName + " ?",
          loading: true,
          onOk: () => {
            deleteUser({
              id: v._id
            }).then((res) => {
              this.$Modal.remove();
              if (res.data.retcode="0000") {
                this.$Message.success("删除成功");
                this.getDataList();
              }
            });
          },
        });
      },
      reset(v) {
        this.$Modal.confirm({
          title: "确认重置密码",
          content: "您确认要重置用户 " + v.userName + "的密码 ?",
          loading: true,
          onOk: () => {
            let password = '123456';
            resetUser({
              id: v._id,
              password: password
            }).then((res) => {
              this.$Modal.remove();
              if (res.data.retcode="0000") {
                this.$Message.success("重置密码成功");
                this.getDataList();
              }
            });
          },
        });
      },
      handleDropdown(name) {
        if (name == "refresh") {
          this.getDataList();
        }
      },
      cancelUser() {
        this.userExit = false
        this.userModalVisible = false;
      },
      submitUser() {
        this.$refs.userForm.validate((valid) => {
          if(this.userExit){
            return;
          }
          if (valid) {
            if (this.modalType == 0) {
              // 添加
              let list = "[";
              for (let i = 0; i < this.userForm.deptId.length; i++) {
                if (i == this.userForm.deptId.length - 1) {
                  list += this.userForm.deptId[i];
                } else {
                  list += this.userForm.deptId[i] + ',';
                }
              }
              list += "]"
              this.userForm.creator = store.state.user.userName;
              this.userForm.passwd = this.userForm.passwd;
              this.userForm.deptId = list
              this.submitLoading = true;
              addUser(this.userForm).then((res) => {
                this.submitLoading = false;
                if (res.data.retcode="0000") {
                  this.$Message.success("操作成功");
                  this.getDataList();
                  this.userModalVisible = false;
                  this.userExit = false
                }
              });
            } else {
              let list = "[";
              for (let i = 0; i < this.userForm.deptId.length; i++) {
                if (i == this.userForm.deptId.length - 1) {
                  list += this.userForm.deptId[i];
                } else {
                  list += this.userForm.deptId[i] + ',';
                }
              }
              list += "]"
              this.submitLoading = true;
              this.userForm.deptId = list
              editUser(this.userForm).then((res) => {
                console.info("修改数据："+JSON.stringify(res))
                this.submitLoading = false;
                if (res.data.retcode=="0000") {
                  this.$Message.success("操作成功");
                  this.getDataList();
                  this.userModalVisible = false;
                  this.userExit = false
                }
              });
            }
          }
        });
      },
    },
    mounted() {
      // 计算高度
      this.height = Number(document.documentElement.clientHeight - 230);
      this.init();
    },
  }
</script>
<style>
  .tip{
    color: red;
    position: absolute;
    display: block;
    top: 30px;
  }
  .pages{
    margin-top: 20px;
    margin-bottom: 10px;
  }
</style>

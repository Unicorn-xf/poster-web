<style lang="less">
@import "../../../styles/table-common.less";
@import "./roleAuthManage.less";
.br button,
.operation button {
 margin-right:8px;
}
</style>
<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <!-- v-hasAuth="'roleAuthManage.vue_add'" -->
        <Button  @click="addRoleFun" type="primary" icon="md-add">添加角色</Button>
         <!-- v-hasAuth="'roleAuthManage.vue_delete'" -->
        <Button  @click="delAll" icon="md-trash">批量删除</Button>
        <Button @click="init" icon="md-refresh">刷新</Button>
        <Button type="dashed" @click="openTip = !openTip">{{
          openTip ? "关闭提示" : "开启提示"
        }}</Button>
        <!-- v-hasAuth="'roleAuthManage.vue_search'" -->
        <Input
          v-model="searchForm.key"
          suffix="ios-search"
          @on-change="getDataList"
          placeholder="输入关键词搜索"
          clearable
          style="width: 250px"
        />
      </Row>
      <Row v-show="openTip">
        <Alert show-icon>
          已选择
          <span class="select-count">{{ selectList.length }}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
        </Alert>
      </Row>
      <Row>
        <Table
          :loading="loading"
          border
          :columns="columns"
          :data="data"
          ref="table"
          sortable="custom"
          @on-sort-change="changeSort"
          @on-selection-change="changeSelect"
        ></Table>
      </Row>
      <Row type="flex" justify="end" class="page">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>

    <!-- 编辑 -->
    <Modal
      :title="modalTitle"
      v-model="roleModalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form
        ref="roleForm"
        :model="roleForm"
        :label-width="80"
        :rules="roleFormValidate"
      >
        <FormItem label="角色名称" prop="name">
          <Input
            v-model="roleForm.roleName"
            placeholder="按照Spring Security约定建议以‘ROLE_’开头"
          />
        </FormItem>
        <FormItem label="备注" prop="description">
          <Input v-model="roleForm.description" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelRole">取消</Button>
        <Button
        type="primary"
        :loading="submitLoading"
        @click="submitRole"
          >提交</Button
        >
      </div>
    </Modal>
    <!-- 菜单权限 -->
    <Modal
      :title="modalTitle"
      v-model="permModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{ top: '30px' }"
      class="permModal"
    >
      <div style="position: relative">
        <Tree
          ref="tree"
          :data="permData"
          show-checkbox
          :render="renderContent"
          :check-strictly="true"
        ></Tree>
        <Spin size="large" fix v-if="treeLoading"></Spin>
      </div>
      <div slot="footer">
        <Button type="text" @click="cancelPermEdit">取消</Button>
        <Select
          v-model="openLevel"
          @on-change="changeOpen"
          style="width: 110px; text-align: left; margin-right: 10px"
        >
          <Option value="0">展开所有</Option>
          <Option value="1">收合所有</Option>
          <Option value="2">仅展开一级</Option>
          <Option value="3">仅展开两级</Option>
        </Select>
        <Button @click="selectTreeAll">全选/反选</Button>
         <!-- v-hasAuth="'roleAuthManage.vue_editPerm'" -->
        <Button
          type="primary"
          :loading="submitPermLoading"
          @click="submitPermEdit"
          >提交</Button
        >
      </div>
    </Modal>
    <!-- 数据权限 -->
    <Modal
      :title="modalTitle"
      v-model="depModalVisible"
      :mask-closable="false"
      :width="500"
      class="depModal"
    >
      <Alert show-icon
        >默认可查看全部数据，自定义数据范围时请勾选下方数据</Alert
      >
      <Form :label-width="85">
        <FormItem label="数据范围">
          <Select v-model="dataType" transfer>
            <Option :value="0">全部数据权限</Option>
            <Option :value="1">自定义数据权限</Option>
            <Option :value="2">本部门及以下数据权限</Option>
            <Option :value="3">本部门数据权限</Option>
          </Select>
        </FormItem>
      </Form>
      <div v-show="dataType == 1" style="margin-top: 15px">
        <div style="position: relative">
          <Tree
            ref="depTree"
            :data="depData"
            :load-data="loadData"
            @on-toggle-expand="expandCheckDep"
            multiple
            style="margin-top: 15px"
          ></Tree>
          <Spin size="large" fix v-if="depTreeLoading"></Spin>
        </div>
      </div>
      <div slot="footer">
        <Button type="text" @click="depModalVisible = false">取消</Button>
        <Button
          type="primary"
          :loading="submitDepLoading"
          @click="submitDepEdit"
          >提交</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getAllRole,
  getMenuTree,
  modifyRoleMenu,
  modifyRoleById,
  addRole,
  delRoleById,
  // setDefaultRole,
  // initDepartment,
  // loadDepartment,
  // editRoleDep,
} from "@/api/roleManage";
import store from '@/store'
export default {
  name: "role-manage",
  data() {
    return {
      openTip: true,
      openLevel: "0",
      loading: true,
      treeLoading: true,
      depTreeLoading: true,
      submitPermLoading: false,
      submitDepLoading: false,
      searchKey: "",
      sortColumn: "createTime",
      sortType: "desc",
      modalType: 0,
      roleModalVisible: false,
      permModalVisible: false,
      depModalVisible: false,
      modalTitle: "",
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        key: "",
      },
      roleForm: {
        name: "",
        description: "",
      },
      roleFormValidate: {
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "change" },
        ],
      },
      submitLoading: false,
      selectList: [],
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "序号",
          type: "index",
          width: 70,
          align: "center",
        },
        {
          title: "角色名称",
          key: "roleName",
          width: 150,
          sortable: true,
          align: "center",
        },
        {
          title: "备注",
          key: "description",
          minWidth: 150,
          sortable: true,
          align: "center",
        },
        {
          title: "已绑定用户(人)",
          key: "userCount",
          minWidth: 150,
          sortable: true,
          align: "center",
        },
        {
          title: "创建时间",
          key: "gmtCreate",
          width: 170,
          sortable: true,
          sortType: "desc",
          align: "center",
        },
        {
          title: "创建人",
          key: "userName",
          width: 170,
          sortable: true,
          align: "center",
        },
        // {
        //   title: "更新时间",
        //   key: "updateTime",
        //   width: 170,
        //   sortable: true,
        // },
        // {
        //   title: "设置为注册用户默认角色",
        //   key: "defaultRole",
        //   align: "center",
        //   width: 200,
        //   render: (h, params) => {
        //     if (params.row.defaultRole) {
        //       return h("div", [
        //         h("Checkbox", {
        //           props: {
        //             value: true,
        //           },
        //           on: {
        //             "on-change": () => {
        //               this.cancelDefault(params.row);
        //             },
        //           },
        //         }),
        //       ]);
        //     } else {
        //       return h("div", [
        //         h("Checkbox", {
        //           props: {
        //             value: false,
        //           },
        //           on: {
        //             "on-change": () => {
        //               this.setDefault(params.row);
        //             },
        //           },
        //         }),
        //       ]);
        //     }
        //   },
        // },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 280,
          render: (h, params) => {
            let data = [
              h(
                "a",
                {
                  on: {
                    click: () => {
                      this.editPerm(params.row);
                    },
                  },
                  //hasAuth: "roleAuthManage.vue_view",
                },
                "菜单权限"
              ),
              h("Divider", {
                props: {
                  type: "vertical",
                },
              }),
              h(
                "a",
                {
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
              h(
                "a",
                {
                  on: {
                    click: () => {
                      this.remove(params.row);
                    },
                  },
                  //hasAuth: "roleAuthManage.vue_delete"
                },
                "删除"
              ),
            ]
            // 编辑按钮
            //if(!this.$testAuth('roleAuthManage.vue_edit')) {
             // data.splice(2, 2)
            //}
            // 菜单按钮
            //if(!this.$testAuth('roleAuthManage.vue_view')) {
              //data.splice(0, 2)
            //}
            // 删除按钮
            //if(!this.$testAuth('roleAuthManage.vue_delete')) {
              //data.splice(4, 1)
            //}
            return h("div", data)
          },
        },
      ],
      data: [],
      total: 0,
      permData: [],
      editRolePermId: "",
      selectAllFlag: false,
      depData: [],
      dataType: 0,
      editDepartments: [],
    };
  },
  methods: {
    init() {
      this.getDataList();
      // 获取所有菜单权限树
      this.getPermList();
    },
    renderContent(h, { root, node, data }) {
      let icon = "";
      if (data.level == 0) {
        icon = "ios-navigate";
      } else if (data.level == 1) {
        icon = "md-list-box";
      } else if (data.level == 2) {
        icon = "md-list";
      } else if (data.level == 3) {
        icon = "md-radio-button-on";
      } else {
        icon = "md-radio-button-off";
      }
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            cursor: "pointer",
          },
          on: {
            click: () => {
              data.checked = !data.checked;
            },
          },
        },
        [
          h("span", [
            h("Icon", {
              props: {
                type: icon,
                size: "16",
              },
              style: {
                "margin-right": "8px",
                "margin-bottom": "3px",
              },
            }),
            h("span", data.title),
          ]),
        ]
      );
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order == "normal") {
        this.searchForm.order = "";
      }
      this.getDataList();
    },
    getDataList() {
      this.loading = false;
      getAllRole({pageIndex: this.searchForm.pageNumber, pageSize: this.searchForm.pageSize, queryValue: this.searchForm.key}).then((res) => {
        this.loading = false;
        if (res.data.retcode === '0000') {
          this.data = res.data.data.content;
          this.total = res.data.data.totalElements;
          if (this.data.length == 0 && this.searchForm.pageNumber > 1) {
            this.searchForm.pageNumber -= 1;
            this.getDataList();
          }
        } else {
          this.$Message.warning("数据库操作错误：" + res.data.message)
        }
      }).catch(e => {
        this.$Message.error("查询角色列表出错：" + e.message)
      });
    },
    getPermList() {
      this.treeLoading = true;
      getMenuTree().then((res) => {
        if (res.data.retcode === '0000') {
          this.initTree(res.data.data, 0)
          this.deleteDisableNode(res.data.data);
          this.permData = res.data.data[0].children;
          this.treeLoading = false;
        } else {
          this.$Message.warning("数据库操作错误：" + res.data.message)
        }
        this.treeLoading = false;
      }).catch(e => {
        this.$Message.error("查询所有菜单出错：" + e.message)
      });
    },
    initTree (data, level) {
      let t = this
      for(let i in data) {
        let item = data[i]
        item.title = item.menuName
        item.checked = false
        item.level = level
        item.expand = true
        if(item.children.length) {
          t.initTree(item.children, level + 1)
        }
      }
    },
    // 递归标记禁用节点
    deleteDisableNode(permData) {
      let that = this;
      permData.forEach(function (e) {
        if (e.menuState === 1) {
          e.title = "[已禁用] " + e.title;
          e.disabled = true;
        }
        if (e.children && e.children.length > 0) {
          that.deleteDisableNode(e.children);
        }
      });
    },
    cancelRole() {
      this.roleModalVisible = false;
    },
    submitRole() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.modalType == 0) {
            // 添加
            this.submitLoading = true;
            addRole(this.roleForm).then((res) => {
              this.submitLoading = false;
              if (res.data.code === '0') {
                this.$Message.success("操作成功");
                this.getDataList();
                this.roleModalVisible = false;
                this.roleForm = {
                  name: "",
                  description: "",
                }
              } else {
                this.$Message.warning("数据库操作错误：" + res.data.message)
              }
            }).catch(e => {
              this.$Message.error("添加角色出错：" + e.message)
            });
          } else {
            this.submitLoading = true;
            modifyRoleById(this.roleForm).then((res) => {
              this.submitLoading = false;
              if (res.data.code === '0') {
                this.$Message.success("操作成功");
                this.getDataList();
                this.roleModalVisible = false;
              } else {
                this.$Message.warning("数据库操作错误：" + res.data.message)
              }
            }).catch(e => {
              this.$Message.error("修改角色出错：" + e.message)
            });
          }
        }
      });
    },
    addRoleFun() {
      this.modalType = 0;
      this.modalTitle = "添加角色";
      this.$refs.roleForm.resetFields();
      delete this.roleForm.id;
      this.roleForm.creator = store.state.user.userId
      this.roleModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑角色";
      this.$refs.roleForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      this.roleForm = roleInfo;
      this.roleModalVisible = true;
    },
    remove(v) {
      if(v.userCount > 0) {
        this.$Modal.confirm({
          title: "删除提示",
          content: "请先清除绑定的用户 ?",
          onOk: () => {
          },
        });
        return
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除角色 " + v.roleName + " ?",
        loading: true,
        onOk: () => {
          delRoleById({ ids: v.id }).then((res) => {
            this.$Modal.remove();
            if (res.data.code === '0') {
              this.clearSelectAll();
              this.$Message.success("删除成功");
              this.getDataList();
            } else {
              this.$Message.warning("数据库操作错误：" + res.data.message)
            }
          }).catch(e => {
              this.$Message.error("删除角色出错：" + e.message)
          })
        },
      });
    },
    setDefault(v) {
      this.loading = true;
      let params = {
        id: v.id,
        isDefault: true,
      };
      setDefaultRole(params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.$Message.success("操作成功");
          this.getDataList();
        }
      });
    },
    cancelDefault(v) {
      this.loading = true;
      let params = {
        id: v.id,
        isDefault: false,
      };
      setDefaultRole(params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.$Message.success("操作成功");
          this.getDataList();
        }
      });
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
    },
    delAll() {
      if (this.selectList.length <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectList.length + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          delRoleById({ ids: ids }).then((res) => {
            this.$Modal.remove();
            if (res.data.code === '0') {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getDataList();
            } else {
              this.$Message.warning("数据库操作错误：" + res.data.message)
            }
          }).catch(e => {
            this.$Message.error("修改角色出错：" + e.message)
          });
        },
      });
    },
    editPerm(v) {
      this.editRolePermId = v.id;
      this.modalTitle = "分配 " + v.roleName + " 的菜单权限";
      // 匹配勾选
      let rolePerms = v.menuFunList;
      if (this.treeLoading) {
        this.$Message.warning("菜单权限数据加载中，请稍后点击查看");
        return;
      }
      // 递归判断子节点
      this.checkPermTree(this.permData, rolePerms);
      this.permModalVisible = true;
    },
    // 递归判断子节点
    checkPermTree(permData, rolePerms) {
      let that = this;
      permData.forEach(function (p) {
        if (that.hasPerm(p, rolePerms) && p.status != -1) {
          p.checked = true;
        } else {
          p.checked = false;
        }
        if (p.children && p.children.length > 0) {
          that.checkPermTree(p.children, rolePerms);
        }
      });
    },
    // 判断角色拥有的权限节点勾选
    hasPerm(p, rolePerms) {
      let flag = false;
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id == rolePerms[i].id) {
          flag = true;
          break;
        }
      }
      if (flag) {
        return true;
      }
      return false;
    },
    // 全选反选
    selectTreeAll() {
      this.selectAllFlag = !this.selectAllFlag;
      let select = this.selectAllFlag;
      this.selectedTreeAll(this.permData, select);
    },
    // 递归全选节点
    selectedTreeAll(permData, select) {
      let that = this;
      permData.forEach(function (e) {
        e.checked = select;
        if (e.children && e.children.length > 0) {
          that.selectedTreeAll(e.children, select);
        }
      });
    },
    submitPermEdit() {
      this.submitPermLoading = true;
      let permIds = "";
      let selectedNodes = this.$refs.tree.getCheckedNodes();
      selectedNodes.forEach(function (e) {
        permIds += e.id + ",";
      });
      permIds = permIds.substring(0, permIds.length - 1);

      modifyRoleMenu({
        roleId: this.editRolePermId,
        menuIds: permIds,
      }).then((res) => {
        this.submitPermLoading = false;
        if (res.data.code === '0') {
          this.$Message.success("操作成功");
          // 标记重新获取菜单数据
          this.$store.commit("setAdded", false);
          // util.initRouter(this);
          this.getDataList();
          this.permModalVisible = false;
        } else {
          this.$Message.warning("数据库操作错误：" + res.data.message)
        }
      }).catch(e => {
        this.$Message.error("修改菜单权限出错：" + e.message)
      });;
    },
    cancelPermEdit() {
      this.permModalVisible = false;
    },
    loadData(item, callback) {
      loadDepartment(item.id, { openDataFilter: false }).then((res) => {
        if (res.success) {
          res.result.forEach(function (e) {
            e.selected = false;
            if (e.isParent) {
              e.loading = false;
              e.children = [];
            }
            if (e.status == -1) {
              e.title = "[已禁用] " + e.title;
              e.disabled = true;
            }
          });
          callback(res.result);
        }
      });
    },
    editDep(v) {
      this.dataType = 0;
      this.editRolePermId = v.id;
      this.modalTitle = "分配 " + v.roleName + " 的数据权限";
      if (v.dataType) {
        this.dataType = v.dataType;
      }
      // 匹配勾选
      let roleDepIds = v.departments;
      this.editDepartments = roleDepIds;
      this.depTreeLoading = true;
      initDepartment({ openDataFilter: false }).then((res) => {
        this.depTreeLoading = false;
        if (res.success) {
          res.result.forEach(function (e) {
            e.selected = false;
            if (e.isParent) {
              e.loading = false;
              e.children = [];
            }
            if (e.status == -1) {
              e.title = "[已禁用] " + e.title;
              e.disabled = true;
            }
          });
          this.depData = res.result;
          // 判断子节点
          this.checkDepTree(this.depData, roleDepIds);
        }
      });
      this.depModalVisible = true;
    },
    expandCheckDep(v) {
      // 判断展开子节点
      this.checkDepTree(v.children, this.editDepartments);
    },
    // 判断子节点
    checkDepTree(depData, roleDepIds) {
      let that = this;
      depData.forEach(function (p) {
        if (that.hasDepPerm(p, roleDepIds)) {
          p.selected = true;
        } else {
          p.selected = false;
        }
      });
    },
    // 判断角色拥有的权限节点勾选
    hasDepPerm(p, roleDepIds) {
      let flag = false;
      for (let i = 0; i < roleDepIds.length; i++) {
        if (p.id == roleDepIds[i].departmentId) {
          flag = true;
          break;
        }
      }
      if (flag) {
        return true;
      }
      return false;
    },
    submitDepEdit() {
      let depIds = "";
      if (this.dataType == 1) {
        let selectedNodes = this.$refs.depTree.getSelectedNodes();
        selectedNodes.forEach(function (e) {
          depIds += e.id + ",";
        });
        depIds = depIds.substring(0, depIds.length - 1);
      }
      this.submitDepLoading = true;
      editRoleDep({
        roleId: this.editRolePermId,
        dataType: this.dataType,
        depIds: depIds,
      }).then((res) => {
        this.submitDepLoading = false;
        if (res.success) {
          this.$Message.success("操作成功");
          this.getDataList();
          this.depModalVisible = false;
        }
      });
    },
    changeOpen(v) {
      if (v == "0") {
        this.permData.forEach((e) => {
          e.expand = true;
          if (e.children && e.children.length > 0) {
            e.children.forEach((c) => {
              c.expand = true;
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = true;
                });
              }
            });
          }
        });
      } else if (v == "1") {
        this.permData.forEach((e) => {
          e.expand = false;
          if (e.children && e.children.length > 0) {
            e.children.forEach((c) => {
              c.expand = false;
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false;
                });
              }
            });
          }
        });
      } else if (v == "2") {
        this.permData.forEach((e) => {
          e.expand = true;
          if (e.children && e.children.length > 0) {
            e.children.forEach((c) => {
              c.expand = false;
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false;
                });
              }
            });
          }
        });
      } else if (v == "3") {
        this.permData.forEach((e) => {
          e.expand = true;
          if (e.children && e.children.length > 0) {
            e.children.forEach((c) => {
              c.expand = true;
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false;
                });
              }
            });
          }
        });
      }
    },
  },
  mounted() {
    this.init();
  },
};
</script>

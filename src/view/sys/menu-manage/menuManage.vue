<style lang="less">
  @import "../../../styles/tree-common.less";
  @import "./menuManage.less";
  .operation button {
    margin-right: 8px;
  }
</style>
<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <Button @click="addMenu" type="primary" icon="md-add"
          >添加子节点</Button
        >
        <!-- <Button @click="addRootMenu" icon="md-add">添加顶部菜单</Button> -->
        <Button @click="delAll" icon="md-trash">批量删除</Button>
        <Dropdown @on-click="handleDropdown">
          <Button>
            更多操作
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="refresh">刷新</DropdownItem>
            <DropdownItem name="expandOne">收合所有</DropdownItem>
            <DropdownItem name="expandTwo">仅展开一级</DropdownItem>
            <DropdownItem name="expandThree">仅展开两级</DropdownItem>
            <DropdownItem name="expandAll">展开所有</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <i-switch v-model="strict" size="large" style="margin-left: 5px">
          <span slot="open">级联</span>
          <span slot="close">单选</span>
        </i-switch>
      </Row>
      <Row type="flex" justify="start" :gutter="16">
        <Col :sm="8" :md="8" :lg="8" :xl="6">
          <Alert show-icon>
            当前选择编辑：
            <span class="select-title">{{ editTitle }}</span>
            <a class="select-clear" v-if="form.id" @click="cancelEdit"
              >取消选择</a
            >
          </Alert>
          <Input
            v-model="searchKey"
            suffix="ios-search"
            @on-change="search"
            placeholder="输入菜单名搜索"
            clearable
          />
          <div class="tree-bar" :style="{ maxHeight: maxHeight }" style="padding-bottom: 40px;">
            <Tree
              ref="tree"
              :data="data"
              show-checkbox
              :render="renderContent"
              @on-select-change="selectTree"
              @on-check-change="changeSelect"
              :check-strictly="!strict"
            ></Tree>
            <Spin size="large" fix v-if="loading"></Spin>
          </div>
        </Col>
        <Col :sm="16" :md="16" :lg="16" :xl="9">
          <Form
            ref="form"
            :model="form"
            :label-width="110"
            :rules="formValidate"
          >
          <FormItem label="上级菜单" prop="parentMenu">
            <div style="display: flex">
              <Input v-model="form.parentMenu" readonly style="margin-right: 10px" />
              <Poptip transfer trigger="click" placement="right-start" title="选择上级菜单" width="250">
                <Button icon="md-list">选择菜单</Button>
                <div slot="content" style="position: relative; min-height: 5vh">
                  <Tree :data="dataEdit" :load-data="loadData" @on-select-change="selectTreeEdit"></Tree>
                  <Spin size="large" fix v-if="loadingEdit"></Spin>
                </div>
              </Poptip>
            </div>
          </FormItem>
            <FormItem label="类型" prop="type">
              <div v-show="form.type == -1">
                <Icon
                  type="ios-navigate-outline"
                  size="16"
                  style="margin-right: 5px"
                ></Icon>
                <span>顶部菜单</span>
              </div>
              <div v-show="form.type == 0">
                <Icon
                  type="ios-list-box-outline"
                  size="16"
                  style="margin-right: 5px"
                ></Icon>
                <span>页面菜单</span>
              </div>
              <div v-show="form.type == 1">
                <Icon
                  type="md-radio-button-on"
                  size="16"
                  style="margin-right: 5px"
                ></Icon>
                <span>操作按钮</span>
              </div>
            </FormItem>
            <FormItem
              label="名称"
              prop="title"
              v-if="form.type == -1 || form.type == 0"
            >
              <Input v-model="form.title" />
            </FormItem>
            <FormItem
              label="名称"
              prop="title"
              v-if="form.type == 1"
              class="block-tool"
            >
              <Tooltip placement="right" content="操作按钮名称不得重复">
                <Input v-model="form.title" />
              </Tooltip>
            </FormItem>
            <FormItem label="路径" prop="path" v-if="form.type == 0">
              <Input v-model="form.path" />
            </FormItem>
            <FormItem
              label="请求路径"
              prop="path"
              v-if="form.type == 1"
              class="block-tool"
            >
              <Tooltip
                placement="right"
                :max-width="230"
                transfer
                content="填写后端请求URL，后端将作权限拦截，若无可填写'无'或其他"
              >
                <Input v-model="form.path" />
              </Tooltip>
            </FormItem>
            <FormItem
              label="按钮权限类型"
              prop="buttonType"
              v-if="form.type == 1"
            >
              <Select
                v-model="form.buttonType"
                placeholder="请选择或输入搜索"
                filterable
                clearable
              >
                <Option
                  v-for="(item, i) in dictPermissions"
                  :key="i"
                  :value="item.value"
                  >{{ item.title }}</Option
                >
              </Select>
            </FormItem>
            <FormItem
              label="英文名"
              prop="name"
              v-if="form.type == -1"
              class="block-tool"
            >
              <Tooltip placement="right" content="需唯一">
                <Input v-model="form.name" />
              </Tooltip>
            </FormItem>
            <FormItem
              label="路由英文名"
              prop="name"
              v-if="form.type == 0"
              class="block-tool"
            >
              <Tooltip placement="right" content="需唯一" transfer>
                <Input v-model="form.name" />
              </Tooltip>
            </FormItem>
            <FormItem
              label="图标"
              prop="icon"
              v-if="form.type == -1 || form.type == 0"
            >
              <icon-choose v-model="form.icon"></icon-choose>
            </FormItem>
            <FormItem label="系统站内菜单" prop="isMenu" v-if="form.type == -1">
              <i-switch size="large" v-model="form.isMenu">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
            <FormItem
              label="其他链接"
              prop="url"
              v-if="form.type == -1 && !form.isMenu"
            >
              <Input v-model="form.url" placeholder="Http链接或路由名" />
            </FormItem>
            <FormItem
              label="打开方式"
              prop="description"
              v-if="form.type == -1 && !form.isMenu"
            >
              <Select v-model="form.description" placeholder="请选择">
                <Option value="direct" label="直接跳转">
                  <span style="margin-right: 10px">直接跳转</span>
                  <span style="color: #ccc">其他链接填写完整链接</span>
                </Option>
                <Option value="window" label="新窗口打开">
                  <span style="margin-right: 10px">新窗口打开</span>
                  <span style="color: #ccc">其他链接填写完整链接</span>
                </Option>
                <Option value="route" label="站内路由">
                  <span style="margin-right: 10px">站内路由</span>
                  <span style="color: #ccc">其他链接填写Vue路由名</span>
                </Option>
              </Select>
            </FormItem>
            <FormItem label="前端组件" prop="component" v-if="form.type == 0">
              <Input v-model="form.component" />
            </FormItem>
            <!-- <FormItem
              label="第三方链接"
              prop="url"
              v-if="form.type == 0 && form.level == 2"
            >
              <Input
                v-model="form.url"
                placeholder="http://"
                @on-change="changeEditUrl"
              />
              <span class="url-remark"
                >前端组件需为 sys/monitor/monitor 时生效</span
              >
            </FormItem> -->
            <FormItem label="排序值" prop="sortOrder">
              <Tooltip
                trigger="hover"
                placement="right"
                content="值越小越靠前，支持小数"
              >
                <InputNumber
                  :max="1000"
                  :min="0"
                  v-model="form.sortOrder"
                ></InputNumber>
              </Tooltip>
            </FormItem>
<!--            <FormItem
              label="始终显示"
              prop="showAlways"
              v-if="form.level == 1"
              class="block-tool"
            >
              <i-switch size="large" v-model="form.showAlways">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
              <Tooltip
                content="当设为不始终显示时，一级菜单下仅有一个子级菜单只会显示该子级菜单，避免用户多次点击"
                placement="right"
                transfer
                max-width="280"
                style="display: inline-block !important"
              >
                <Icon
                  type="md-help-circle"
                  size="20"
                  color="#c5c5c5"
                  style="margin-left: 10px; cursor: pointer"
                />
              </Tooltip>
            </FormItem> -->
            <FormItem label="是否启用" prop="status">
              <i-switch
                size="large"
                v-model="form.status"
                :true-value="0"
                :false-value="-1"
              >
                <span slot="open">启用</span>
                <span slot="close">禁用</span>
              </i-switch>
            </FormItem>
            <FormItem>
              <Button
                style="margin-right: 5px"
                @click="submitEdit"
                :loading="submitLoading"
                type="primary"
                icon="ios-create-outline"
                >修改并保存</Button
              >
              <Button @click="handleReset">重置</Button>
            </FormItem>
          </Form>
        </Col>
      </Row>
    </Card>

    <Modal
      draggable
      :title="modalTitle"
      v-model="menuModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{ top: '30px' }"
    >
      <Form
        ref="formAdd"
        :model="formAdd"
        :label-width="110"
        :rules="formValidate"
      >
        <div v-if="showParent">
          <FormItem label="上级节点：">{{ parentTitle }}</FormItem>
        </div>
        <FormItem label="类型" prop="type">
          <div v-show="formAdd.type == -1">
            <Icon
              type="ios-navigate-outline"
              size="16"
              style="margin-right: 5px"
            ></Icon>
            <span>顶部菜单</span>
          </div>
          <div v-show="formAdd.type == 0">
            <Icon
              type="ios-list-box-outline"
              size="16"
              style="margin-right: 5px"
            ></Icon>
            <span>页面菜单</span>
          </div>
          <div v-show="formAdd.type == 1">
            <Icon
              type="md-radio-button-on"
              size="16"
              style="margin-right: 5px"
            ></Icon>
            <span>操作按钮</span>
          </div>
        </FormItem>
        <FormItem
          label="名称"
          prop="title"
          v-if="formAdd.type == -1 || formAdd.type == 0"
        >
          <Input v-model="formAdd.title" />
        </FormItem>
        <FormItem
          label="名称"
          prop="title"
          v-if="formAdd.type == 1"
          class="block-tool"
        >
          <Tooltip placement="right" content="操作按钮名称不得重复">
            <Input v-model="formAdd.title" />
          </Tooltip>
        </FormItem>
        <FormItem label="路径" prop="path" v-if="formAdd.type == 0">
          <Input v-model="formAdd.path" />
        </FormItem>
        <FormItem
          label="请求路径"
          prop="path"
          v-if="formAdd.type == 1"
          class="block-tool"
        >
          <Tooltip
            placement="right"
            :max-width="230"
            transfer
            content="填写后端请求URL，后端将作权限拦截，若无可填写'无'或其他"
          >
            <Input v-model="formAdd.path" />
          </Tooltip>
        </FormItem>
        <FormItem
          label="按钮权限类型"
          prop="buttonType"
          v-if="formAdd.type == 1"
        >
          <Select
            v-model="formAdd.buttonType"
            placeholder="请选择或输入搜索"
            filterable
            clearable
          >
            <Option
              v-for="(item, i) in dictPermissions"
              :key="i"
              :value="item.value"
              >{{ item.title }}</Option
            >
          </Select>
        </FormItem>
        <FormItem
          label="英文名"
          prop="name"
          v-if="formAdd.type == -1"
          class="block-tool"
        >
          <Tooltip placement="right" content="需唯一">
            <Input v-model="formAdd.name" />
          </Tooltip>
        </FormItem>
        <FormItem
          label="路由英文名"
          prop="name"
          v-if="formAdd.type == 0"
          class="block-tool"
        >
          <Tooltip placement="right" content="需唯一">
            <Input v-model="formAdd.name" />
          </Tooltip>
        </FormItem>
        <FormItem
          label="图标"
          prop="icon"
          v-if="formAdd.type == -1 || formAdd.type == 0"
        >
          <icon-choose v-model="formAdd.icon"></icon-choose>
        </FormItem>
        <FormItem label="系统站内菜单" prop="isMenu" v-if="formAdd.type == -1">
          <i-switch size="large" v-model="formAdd.isMenu">
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
        </FormItem>
        <FormItem
          label="其他链接"
          prop="url"
          v-if="formAdd.type == -1 && !formAdd.isMenu"
        >
          <Input v-model="formAdd.url" placeholder="Http链接或路由名" />
        </FormItem>
        <FormItem
          label="打开方式"
          prop="description"
          v-if="formAdd.type == -1 && !formAdd.isMenu"
        >
          <Select v-model="formAdd.description" placeholder="请选择">
            <Option value="direct" label="直接跳转">
              <span style="margin-right: 10px">直接跳转</span>
              <span style="color: #ccc">其他链接填写完整链接</span>
            </Option>
            <Option value="window" label="新窗口打开">
              <span style="margin-right: 10px">新窗口打开</span>
              <span style="color: #ccc">其他链接填写完整链接</span>
            </Option>
            <Option value="route" label="站内路由">
              <span style="margin-right: 10px">站内路由</span>
              <span style="color: #ccc">其他链接填写Vue路由名</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="前端组件" prop="component" v-if="formAdd.type == 0">
          <Input v-model="formAdd.component" />
        </FormItem>
        <!-- <FormItem
          label="第三方链接"
          prop="url"
          v-if="formAdd.type == 0 && formAdd.level == 2"
        >
          <Input
            v-model="formAdd.url"
            placeholder="http://"
            @on-change="changeAddUrl"
          />
          <span class="url-remark"
            >前端组件需为 sys/monitor/monitor 时生效</span
          >
        </FormItem> -->
        <FormItem label="排序值" prop="sortOrder">
          <Tooltip
            trigger="hover"
            placement="right"
            content="值越小越靠前，支持小数"
          >
            <InputNumber
              :max="1000"
              :min="0"
              v-model="formAdd.sortOrder"
            ></InputNumber>
          </Tooltip>
        </FormItem>
<!--        <FormItem
          label="始终显示"
          prop="showAlways"
          v-if="formAdd.level == 1"
          class="block-tool"
        >
          <i-switch size="large" v-model="formAdd.showAlways">
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
          <Tooltip
            content="当设为不始终显示时，一级菜单下仅有一个子级菜单只会显示该子级菜单，避免用户多次点击"
            placement="right"
            transfer
            max-width="280"
            style="display: inline-block !important"
          >
            <Icon
              type="md-help-circle"
              size="20"
              color="#c5c5c5"
              style="margin-left: 10px; cursor: pointer"
            />
          </Tooltip>
        </FormItem> -->
        <FormItem label="是否启用" prop="status">
          <i-switch
            size="large"
            v-model="formAdd.status"
            :true-value="0"
            :false-value="-1"
          >
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="menuModalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitAdd"
          >提交</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getAllPermissionList,
  addMenu,
  editMenu,
  delMenuByIds,
  searchMenu,
  getDictDataByType,
} from "@/api/menu";
import IconChoose from "./icon-choose.vue";
import util from "@/libs/util.js";
import store from '@/store'
export default {
  name: "menu-manage",
  components: {
    IconChoose,
  },
  data() {
    return {
      loading: true,
      strict: true,
      maxHeight: "500px",
      expandLevel: 1,
      menuModalVisible: false,
      iconModalVisible: false,
      selectList: [],
      showParent: false,
      searchKey: "",
      parentTitle: "",
      editTitle: "",
      modalTitle: "",
      loadingEdit: true,
      dataEdit: [],
      form: {
        id: "",
        title: "",
        name: "",
        icon: "",
        path: "",
        parentMenu:"",
        component: "",
        parentId: "",
        buttonType: "",
        type: 0,
        sortOrder: 0,
        level: 0,
        status: 0,
        url: "",
        showAlways: true,
      },
      formAdd: {
        buttonType: "",
      },
      formValidate: {
        parentMenu:[{ required: true, message: "上级菜单不能为空", trigger: "change" }],
        title: [{ required: true, message: "名称不能为空", trigger: "change" }],
        name: [
          { required: true, message: "路由英文名不能为空", trigger: "change" },
        ],
        icon: [{ required: true, message: "图标不能为空", trigger: "click" }],
        path: [{ required: true, message: "路径不能为空", trigger: "change" }],
        component: [
          { required: true, message: "前端组件不能为空", trigger: "change" },
        ],
        sortOrder: [
          {
            required: true,
            type: "number",
            message: "排序值不能为空",
            trigger: "change",
          },
        ],
      },
      submitLoading: false,
      data: [],
      dictPermissions: [],
      userInfo: {},
    };
  },
  methods: {
    init() {
      this.userInfo = store.state.user;
      this.getAllList();
      this.getAllListEdit();
      this.getDictPermissions();
    },
    getDictPermissions() {
      // getDictDataByType("permission_type").then((res) => {
      //   if (res.success) {
      //     this.dictPermissions = res.result;
      //   }
      // });
      this.dictPermissions = [{
        "id": "75390787835138048",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "查看操作(view)",
        "value": "view",
        "sortOrder": 0.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75390886501945344",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "添加操作(add)",
        "value": "add",
        "sortOrder": 1.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75390993939042304",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "编辑操作(edit)",
        "value": "edit",
        "sortOrder": 2.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391067532300288",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "删除操作(delete)",
        "value": "delete",
        "sortOrder": 3.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391126902673408",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "清空操作(clear)",
        "value": "clear",
        "sortOrder": 4.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391192883269632",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "启用操作(enable)",
        "value": "enable",
        "sortOrder": 5.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391251024711680",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "禁用操作(disable)",
        "value": "disable",
        "sortOrder": 6.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391297124306944",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "搜索操作(search)",
        "value": "search",
        "sortOrder": 7.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391343379091456",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "上传文件(upload)",
        "value": "upload",
        "sortOrder": 8.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391407526776832",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "导出操作(output)",
        "value": "output",
        "sortOrder": 9.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391475042488320",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "导入操作(input)",
        "value": "input",
        "sortOrder": 10.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391522182270976",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "分配权限(editPerm)",
        "value": "editPerm",
        "sortOrder": 11.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391576364290048",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "设为默认(setDefault)",
        "value": "setDefault",
        "sortOrder": 12.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }, {
        "id": "75391798033256448",
        "createBy": "admin",
        "createTime": "2020-12-04 10:08:26",
        "updateBy": "admin",
        "updateTime": "2020-12-04 10:08:26",
        "delFlag": 0,
        "title": "其他操作(other)",
        "value": "other",
        "sortOrder": 13.00,
        "status": 0,
        "description": "",
        "dictId": "75388696739713024"
      }]
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
      return h('Tooltip', {
          props: {
            content: data.title,
            maxWidth: '20px',
            delay: 500
          },
        }, [
          h('span', [
            h('Icon', {
              props: {
                type: icon,
                color: node.node.selected ? '#ff9900' : 'inherit',
              },
              style: {
                marginRight: '4px',
              },
            }),
            h('span', {
              style: {
                // cursor: node.nodeKey !== 0 ? 'pointer' : 'text',
                cursor: 'pointer',
                color: node.node.selected ? '#2d8cf0' : '#1a2846',
                // fontWeight: node.node.selected ? 'bold' : 'normal',
              },
              on: {
                click: () => {
                  // if (!node.node.selected &&node.nodeKey !== 0) {
                  // if (!node.node.selected) {
                    this.$refs.tree.handleSelect(node.nodeKey);
                    // this.searchText(data.title)
                  // }
                },
              }
            }, data.title)]),
        ]);

    },
    handleDropdown(name) {
      if (name == "expandOne") {
        this.expandLevel = 1;
      } else if (name == "expandTwo") {
        this.expandLevel = 2;
      } else if (name == "expandThree") {
        this.expandLevel = 3;
      } else if (name == "expandAll") {
        this.expandLevel = 4;
      }
      this.getAllList();
    },
    initTree (data,level) {
      let t = this
      level++
      //console.info("层级："+JSON.stringify(data))
      for(let i in data) {
        let item = data[i]
        if(this.expandLevel === 4){
          item.expand = true;
        }
        item.level = level
        item.title = item.menuName
        item.sortOrder = item.menuSort
        item.parentId = item.menuPid
        item.status = item.menuState
        if(item.menuType === "1"){
          item.type = 1
          item.path = item.funcName
        }else{
          item.type = 0
          item.path = item.menuPath
          item.name = item.routeName// 路由英文名
        }
        if(item.children != undefined && item.children.length >0) {
          t.initTree(item.children,level)
        }
      }
    },
    getAllList() {
      this.loading = true;
      getAllPermissionList({userId:this.userInfo.userId}).then(res => {
        this.loading = false;
        //console.info("菜单："+JSON.stringify(res))
        res = res.data;
        if (res.retcode === '0000') {
          // 递归
          // res.result = res.result[0].children;
          res.data[0].menuName = "后台管理系统";
          res.data[0].type = -1;
          res.data[0].sortOrder = 0.00;
          this.initTree(res.data,-1);
          // 仅展开指定级数 默认后端已展开所有
          let expandLevel = this.expandLevel;
          res.data.forEach(function (e) {
            if (expandLevel == 1) {
              if (e.level == 0) {
                e.expand = false;
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level == 1) {
                    c.expand = false;
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level == 2) {
                        b.expand = false;
                      }
                    });
                  }
                });
              }
            } else if (expandLevel == 2) {
              if (e.level == 0) {
                e.expand = true;
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level == 1) {
                    c.expand = false;
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level == 2) {
                        b.expand = false;
                      }
                    });
                  }
                });
              }
            } else if (expandLevel == 3) {
              if (e.level == 0) {
                e.expand = true;
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level == 1) {
                    c.expand = true;
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level == 2) {
                        b.expand = false;
                      }
                    });
                  }
                });
              }
            }
          });
          this.data = res.data;
        }else{
          this.$Message.error("查询菜单树出错");
        }
      });
    },
    getAllListEdit() {
      this.loadingEdit = true;
      getAllPermissionList({userId:this.userInfo.userId}).then(res => {
        this.loadingEdit = false;
        res = res.data;
        if (res.retcode === '0000') {
          res.data[0].menuName = "后台管理系统";
          let needTrans = res.data
          let transed = this.transTree(needTrans)
          // 头部加入一级
          // let first = {
          //   id: "0",
          //   title: "一级菜单",
          // };
          // transed.unshift(first);
          this.dataEdit = transed;
        }else{
          this.$Message.error("查询菜单树出错");
        }
      });
    },
    search() {
      if (this.searchKey) {
        this.loading = true;
        searchMenu({ menuName: this.searchKey }).then((res) => {
          this.loading = false;
          if (res.data.retcode === '0000') {
            res.data.data.forEach(function (item) {
              item.title = item.menuName
              item.sortOrder = item.menuSort
              item.parentId = item.menuPid
              item.status = item.menuState
              if(item.menuType === "1"){
                item.type = 1
                item.path = item.funcName
                item.level = 3
              }else{
                item.type = 0
                item.path = item.menuPath
                item.name = item.routeName// 路由英文名
                item.level = 2
              }
              if(item.menuPid === "0"){
                item.level = 1
              }
            })
            this.data = res.data.data;
          }
        });
      } else {
        this.getAllList();
      }
    },
    selectTree(v) {
      if (v.length > 0) {
        // 转换null为""
        for (let attr in v[0]) {
          if (v[0][attr] == null) {
            v[0][attr] = "";
          }
        }
        let str = JSON.stringify(v[0]);
        let menu = JSON.parse(str);
        if(menu.id === '0'){
          return;
        }else{
          if(menu.parentMenuName == ""){
             menu.parentMenu = "后台管理系统"
          }else{
            menu.parentMenu = menu.parentMenuName[0];
          }
        }
        this.form = menu;
        this.editTitle = menu.title;
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
      this.form.id = "";
      this.editTitle = "";
    },
    handleReset() {
      let type = this.form.type;
      this.$refs.form.resetFields();
      this.form.icon = "";
      this.form.component = "";
      this.form.type = type;
    },
    submitEdit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.form.id) {
            this.$Message.warning("请先点击选择要修改的菜单节点");
            return;
          }
          this.submitLoading = true;
          if (this.form.sortOrder == null) {
            this.form.sortOrder = "";
          }
          if (this.form.buttonType == null) {
            this.form.buttonType = "";
          }
          let menuInfo = {}
          if (this.form.type == 1) {
            // this.form.name = "";
            // this.form.icon = "";
            // this.form.component = "";
            menuInfo.id = this.form.id
            menuInfo.menuName = this.form.title// 名称
            menuInfo.menuSort = this.form.sortOrder// 排序值
            menuInfo.menuPid = this.form.parentId// 上级id
            menuInfo.menuType = "1"// 类型
            menuInfo.menuState = this.form.status// 是否启用
            menuInfo.funcName = this.form.path//请求路径
            menuInfo.buttonType = this.form.buttonType//按钮权限类型
          }else{
            menuInfo.id = this.form.id
            menuInfo.component = this.form.component// 前端组件
            menuInfo.icon = this.form.icon// 图标
            menuInfo.menuName = this.form.title// 名称
            menuInfo.menuPath = this.form.path// 路径
            menuInfo.routeName = this.form.name// 路由英文名
            menuInfo.menuSort = this.form.sortOrder// 排序值
            menuInfo.menuState = this.form.status// 是否启用
            // menuInfo.showAlways = this.form.showAlways// 始终显示
            menuInfo.menuPid = this.form.parentId// 上级id
            menuInfo.menuType = "0"// 类型
          }
          editMenu(menuInfo).then((res) => {
            this.submitLoading = false;
            if (res.data.retcode == '0000') {
              this.$Message.success("编辑成功");
              // 标记重新获取菜单数据
              this.$store.commit("setAdded", false);
              // util.initRouter(this);// 初始化动态路由
              this.init();
              this.menuModalVisible = false;
            }
          });
        }
      });
    },
    submitAdd() {
      this.$refs.formAdd.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          let menuInfo = {}
          if (this.formAdd.type == 1) {// 按钮
            /* this.formAdd.name = "";
            this.formAdd.icon = "";
            this.formAdd.component = ""; */
            menuInfo.menuName = this.formAdd.title// 名称
            menuInfo.menuSort = this.formAdd.sortOrder// 排序值
            menuInfo.menuPid = this.formAdd.parentId// 上级id
            menuInfo.menuType = "1"// 类型
            menuInfo.menuState = this.formAdd.status// 是否启用
            menuInfo.funcName = this.formAdd.path//请求路径
            menuInfo.buttonType = this.formAdd.buttonType//按钮权限类型
          }else{
            menuInfo.component = this.formAdd.component// 前端组件
            menuInfo.icon = this.formAdd.icon// 图标
            menuInfo.menuName = this.formAdd.title// 名称
            menuInfo.menuPath = this.formAdd.path// 路径
            menuInfo.routeName = this.formAdd.name// 路由英文名
            menuInfo.menuSort = this.formAdd.sortOrder// 排序值
            menuInfo.menuState = this.formAdd.status// 是否启用
            // menuInfo.showAlways = this.formAdd.showAlways// 始终显示
            menuInfo.menuPid = this.formAdd.parentId// 上级id
            menuInfo.menuType = "0"// 类型
          }
          addMenu(menuInfo).then((res) => {
            this.submitLoading = false;
            if (res.data.retcode == '0000') {
              this.$Message.success("添加成功");
              // 标记重新获取菜单数据
              this.$store.commit("setAdded", false);
              // util.initRouter(this);// 初始化动态路由
              this.init();
              this.menuModalVisible = false;
            }
          });
        }
      });
    },
    changeEditUrl(e) {
      let v = e.target.value;
      if (v.indexOf("http") > -1) {
        this.form.component = "sys/monitor/monitor";
      }
    },
    changeAddUrl(e) {
      let v = e.target.value;
      if (v.indexOf("http") > -1) {
        this.formAdd.component = "sys/monitor/monitor";
      }
    },
    addMenu() {
      if (!this.form.id) {
        this.$Message.warning("请先点击选择一个菜单权限节点");
        return;
      }
      this.parentTitle = this.form.title;
      this.modalTitle = "添加子节点(可拖动)";
      this.showParent = true;
      let type = 0;
      if (this.form.level == 1) {
        type = 0;
      } else if (this.form.level == 2) {
        type = 1;
      } else if (this.form.level == 3) {
        this.$Modal.warning({
          title: "抱歉，不能添加啦",
          content: "左侧仅支持2级菜单目录",
        });
        return;
      } else {
        type = 0;
      }
      let component = "";
      this.formAdd = {
        icon: "",
        type: type,
        parentId: this.form.id,
        level: Number(this.form.level) + 1,
        sortOrder: this.form.children.length + 1,
        buttonType: "",
        status: 0,
        showAlways: true,
      };
      if (this.form.level == 0) {
        this.formAdd.path = "/";
        this.formAdd.component = "Main";
      }
      this.menuModalVisible = true;
    },
    addRootMenu() {
      this.modalTitle = "添加顶部菜单(可拖动)";
      this.showParent = false;
      this.formAdd = {
        type: -1,
        level: 0,
        parentId: 0,
        isMenu: true,
        sortOrder: this.data.length + 1,
        status: 0,
      };
      this.menuModalVisible = true;
    },
    changeSelect(v) {
      this.selectList = v;
    },
    delAll() {
      if (this.selectList.length <= 0) {
        this.$Message.warning("您还未勾选要删除的数据");
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
          delMenuByIds({ ids: ids }).then((res) => {
            this.$Modal.remove();
            if (res.data.retcode == '0000') {
              this.$Message.success("删除成功");
              // 标记重新获取菜单数据
              this.$store.commit("setAdded", false);
              // util.initRouter(this);// 初始化动态路由c
              this.selectList = [];
              this.cancelEdit();
              this.init();
            }
          });
        },
      });
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
        this.form.parentMenu = data.title;
      }
    },
    transTree(needTrans){
      let transed = JSON.parse(JSON.stringify(needTrans).replace(/menuName/g, "title").replace(/menuPid/g, "parentId").replace(/parentMenuName/g, "parentMenu").replace(/menuSort/g,"sortOrder"));
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
      });
      return transed
    },
    loadData(item, callback) {

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

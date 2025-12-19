<template>
  <el-divider content-position="left">插件上传</el-divider>
  <el-row justify="center">
    <el-col :span="6">
      <el-image src="/sim_imgs/plugin.png">
        <template #placeholder>
          <div class="image-slot">Loading<span class="dot">...</span></div>
        </template>
      </el-image>
      <div style="margin-left: 20px;">
        <el-text class="mx-1" type="primary">*.json文件务必使用UTF8编码</el-text>
      </div>
    </el-col>
    <el-col :span="18">
      <el-upload class="upload-demo" drag action="http://127.0.0.1:3822/upload_plugin" accept=".zip" multiple
        :before-upload="onBeforeUploadPluginZip" :on-success="onUploadPluginZipSuc" :on-error="onUploadPluginZipErr">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            Zip file conforming to the plugin structure
          </div>
        </template>
      </el-upload>
    </el-col>
  </el-row>

  <el-divider content-position="left">插件控制</el-divider>
  <el-row :gutter="20">
    <el-col v-for="(plugin, index) in plugin_infos" :key="index" class="plugin-card">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{ plugin.manifest.name }}</span>
            <el-switch v-model="plugin.manifest.enable_main" :active-action-icon="View"
              :inactive-action-icon="Hide" />
          </div>
        </template>
        <el-tabs type="border-card" tab-position="top">
          <el-tab-pane v-for="(control_value, control_key) in plugin.manifest.control"
            :label="control2name_map[control_key]">
            <div>
              <el-text tag="b">是否开启: </el-text>
              <el-switch v-model="control_value.enable" style="margin-left: 5px;" />
            </div>
            <div>
              <el-text tag="b">调用函数: </el-text>
              <el-text tag="ins">{{ control_value.call }}</el-text>
            </div>
            <div>
              <el-text tag="b">调用频率: </el-text>
              <el-input-number v-model="control_value.frequency" :min="0" :max="500" controls-position="right"
                size="small" style="width: 85px;" />
            </div>
          </el-tab-pane>
        </el-tabs>
        <template #footer>
          <el-button type="danger" :icon="Delete"
            @click="onBtnSaveDelPluginClicked(plugin.plugin_name, 'del')">永久删除</el-button>
          <el-popover placement="top-start" title="说明:" :width="200" trigger="hover"
            content="临时应用指仅在此次实例中保存, 不会写入到文件中">
            <template #reference>
              <el-button type="primary" :icon="Link"
              @click="onBtnSaveDelPluginClicked(plugin.plugin_name, 'tmp_save')">临时应用</el-button>
            </template>
          </el-popover>
          <el-button type="primary" :icon="Finished"
            @click="onBtnSaveDelPluginClicked(plugin.plugin_name, 'save')">永久保存</el-button>
        </template>
      </el-card>
    </el-col>
  </el-row>

</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { UploadFilled, Hide, View, Finished, Delete, Link } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { GetPluginInfo, DelOnePlugin, UpdatePluginInfo } from '@/apis/SimPIApi'
import type { PluginInfo, ManifestInfo, PluginControl } from '@/types/plugin';

const plugin_infos = ref<PluginInfo[]>([
  {
    plugin_name: "example",
    manifest: {
      name: "example_plugin",
      file: "/path/to/example_plugin.py",
      control: {
        "pv": {
          call: "some_function",
          frequency: 0,
          enable: true,
        },
      },
      enable_main: true,
    }
  },]
);

const control2name_map:any = {"pv":"产生车辆", "lr": "Link运动", "cr": "Cross运动", "cu":"Controller运动", "cf":"跟驰模型", "cl":"换道模型"};    //control类型到实际名字的映射

onMounted(() => {
  // 请求拿到插件信息
  GetPluginInfo("all").then(pinfos => {
    plugin_infos.value = pinfos as PluginInfo[];
  });

});

function onBeforeUploadPluginZip(rawFile: UploadRawFile) {
  // 通过 MIME 类型判断文件是否为 zip
  const isZip = ['application/zip', 'application/x-zip-compressed'].includes(rawFile.type);
  if (isZip) {
    // 设置文件大小限制，单位为字节
    const max_Size = 50 * 1024 * 1024; // 50 MB
    // 判断文件大小是否超过限制
    if (rawFile.size > max_Size) {
      ElMessage({
        message: 'Plugin文件大小不能超过 50 MB',
        type: 'error',
        duration: 5000,
        showClose: true
      });
      return false; // 阻止上传
    }

  } else {
    ElMessage({
      message: '无效的文件类型, 非zip文件',
      type: 'error',
      duration: 5000,
      showClose: true
    });
    return false;
  } 
  return true;
}

function onUploadPluginZipSuc(response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  if (response.res != "ERR_OK") {
    ElMessage({
      showClose: true,
      message: 'Oops, ' + response.msg,
      type: 'error',
      duration: 6000
    });
    //移除这个校验失败的文件
    const index = uploadFiles.findIndex(item => item.uid === uploadFile.uid);
    if (index !== -1) {
      uploadFiles.splice(index, 1);
    }
  }
  else {
    ElMessage.success('Plugin上传成功!');
    //请求获取新增的这个插件信息并添加到plugin_infos中去
    GetPluginInfo("all").then(pinfos => {
      plugin_infos.value = pinfos as PluginInfo[];
    });
  }
}

function onUploadPluginZipErr(error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  ElMessage({
    showClose: true,
    message: 'Oops, ' + error,
    type: 'error',
    duration: 0
  });
}

function onBtnSaveDelPluginClicked(plugin_name: string, ope: string) {
  if (ope == "del") {  //删除操作
    DelOnePlugin(plugin_name).then(rep => {
      if (rep.res == "ERR_OK") {
        ElMessage.success('删除' + plugin_name + '成功!');
        //从plugin_infos中删除
        plugin_infos.value = plugin_infos.value.filter(plugin => plugin.plugin_name != plugin_name);
      } else {
        ElMessage.error('Oops, ' + rep.msg);
      }
    });
  } else if ((ope == "save") || (ope == "tmp_save") ) {
    let plugin_info = null;
    for (let cur_info of plugin_infos.value) {
      if (cur_info.plugin_name == plugin_name) {
        plugin_info = cur_info;
        break;
      }
    }
    UpdatePluginInfo(plugin_info, ope).then(rep => {
      if (rep.res != 'ERR_OK') {
        ElMessage.error('Oops, ' + rep.msg);
      } else {
        if (ope == 'tmp_save') {
          ElMessage.success('临时更新' + plugin_name + '信息成功!');
        } else {
          ElMessage.success('保存' + plugin_name + '信息成功!');
        }
      }
    });
  }
}

</script>

<style>
.plugin-card {
  flex: 1 1 25%; /* 自适应宽度 */
  max-width: 25%; /* 限制最大宽度，确保所有卡片宽度相同 */
  min-width: 250px;
  margin-bottom: 20px;
}
</style>
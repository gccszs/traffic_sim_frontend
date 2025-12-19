
export interface PluginControl {
  call: string; // 插件要执行的函数名
  frequency: number; // 执行频率 0为自动执行
  enable: boolean; // 此接管行为开启状态
}

export interface ManifestInfo {
  name: string; // 插件名
  file: string; // 插件要执行的Python文件的路径
  control: {
    // 接管行为
    [key: string]: PluginControl;
  };
  enable_main: boolean; // 接管总开关
}

export interface PluginInfo {
  plugin_name: string; // 插件标识(唯一)
  manifest: ManifestInfo; // 插件信息
}

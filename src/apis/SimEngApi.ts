import request from '@/mods/Axios';

/**
 * @brief 向后端请求准备仿真任务，获取taskId
 */
export function PrepareSimulation() {
    return request.post("/simulation/prepare")
    .then(function (response) {
      return response.data;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
}

/**
 * @brief 向后端请求创建一个仿真引擎 一个实例只能创建一个
 */
export function CreateSimEng(taskId: string, sim_info:any, control_views:any) {
    return request.post(`/simulation/start?taskId=${taskId}`, {"simInfo": sim_info, "controlViews": control_views})
    .then(function (response) {
      return response.data;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });;
}

export function GetPluginCode(plugin_name: string) {
  return request.get("/get_plugin_code/?name=" + plugin_name)
    .then(function (response) {
      if (response.data.res == "ERR_OK") {
        return response.data.addition;
      } else {
        return null;
      }
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
}
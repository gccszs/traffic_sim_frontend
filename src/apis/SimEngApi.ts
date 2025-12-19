import request from '@/mods/Axios';

/**
 * @brief 向后端请求创建一个仿真引擎 一个实例只能创建一个
 */
export function CreateSimEng(sim_info:any, control_views:any) {
    return request.post("/create_simeng", {"sim_info": sim_info, "control_views": control_views})
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
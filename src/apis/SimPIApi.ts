import request from "@/mods/Axios";

/**
 * @brief 获取一次仿真实例的认证ID
 */
export function GetAuthIdOnce() {
  return request.get("/cookie_id")
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

/**
 * @brief 删除一次仿真实例的认证ID
 */
export function DelAuthIdOnce() {
  return request.get("/del_id_info")
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

/**
 * @brief 获取路网xml转json的数据
 */
export function GetMapJson() {
  return request.get("/get_map_json")
    .then(function (response) {
      if (response.data.res == "ERR_OK") {
        console.log(response.data)
        let map_json_obj = response.data.addition;
        let map_json_data = map_json_obj.Data;
        
        // 后端xml_to_json会把单节点转为例如{'Cross': {'Cross_Type': 0}}, 但前端需要的都是数组, 需要转为{'Cross': [{'Cross_Type':0}]}
        for (let key in map_json_data) {
          if (!Array.isArray(map_json_data[key])) {
            //检查值是否已经是数组
            map_json_data[key] = [map_json_data[key]];
          }
        }
        // MarginalPoint/Cross的xy要转为int, 后面画图会直接用, 所以不能是字符串
        function convertStringsToInt(obj: any) {
          // 检查如果传入的是对象或数组，递归处理
          if (typeof obj === "object" && obj !== null) {
            for (let key in obj) {
              if (obj.hasOwnProperty(key)) {
                obj[key] = convertStringsToInt(obj[key]);
              }
            }
          }
          // 如果是字符串且可以转换为整数，进行转换
          else if (typeof obj === "string" && !isNaN(Number(obj))) {
            return parseInt(obj, 10);
          }

          // 如果不是字符串或者不能转换为数字，保持原状
          return obj;
        }
        convertStringsToInt(map_json_data); //这个函数会把所有value中的字符串转为int
        console.log(map_json_data)
        // 将MarginalPoint关联上Road_ID
        for (let link_value of map_json_data.Link) {
          // 遍历Link, 其中Link_Start的Object_Type为M时, 其Object_ID就是对应的MarginalPoint的Object_ID
          let link_start_type = link_value.Link_Start.Object_Type;
          if (link_start_type == "M") {
            const road_id = link_value.Road_ID;
            const obj_id = link_value.Link_Start.Object_ID;
            for (let i = 0; i < map_json_data.MarginalPoint.length; i++) {
              const mp_value = map_json_data.MarginalPoint[i];
              if (mp_value.Object_ID == obj_id) {
                map_json_data.MarginalPoint[i].Road_ID = road_id;
                break;
              }
            }
          }
        }

        return map_json_data; //会去掉最外层的'Data'
      } else {
        return null;
      }
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
}

export function GetPluginInfo(plugin_name: string) {
  return request.get("/get_plugin_info/?name=" + plugin_name)
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

export function DelOnePlugin(plugin_name: string) {
  return request.get("/del_plugin/?name=" + plugin_name)
    .then(function (response) {
      return response.data;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
}

export function UpdatePluginInfo(plugin_info: any, ope: string) {
  return request.post("/update_plugin_info", {"ope": ope, "info": plugin_info})
    .then(function (response) {
      return response.data;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });;
}

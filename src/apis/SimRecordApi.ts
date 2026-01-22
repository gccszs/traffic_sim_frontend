import request from '@/mods/Axios';

// 定义仿真记录类型（从API返回的原始字段）
export interface ApiSimRecordRaw {
  taskId: string;
  name: string;
  mapid: string | null;
  mapName: string | null;
  mapXmlPath: string | null;
  simConfig: string | null;
  status: string | null;
  userid: string | null;
  createTime: string;
  updateTime: string | null;
  additionalFields: Record<string, any>;
  map_json: string | null;
  map_pic: string | null;
  fixed_od: string | null;
}

// 定义仿真记录列表响应类型（原始API响应）
export interface SimRecordListResponseRaw {
  res: string;
  msg: string;
  data?: {
    records: ApiSimRecordRaw[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  timestamp: number;
  success: boolean;
}

// 定义前端使用的仿真记录类型（转换后的字段）
export interface SimRecord {
  id: number;
  taskId: string;
  name: string;
  map_name: string;
  description: string;
  status: string;
  create_time: string;
  update_time: string;
  user_name: string;
  duration: number;
  detail_info?: string;
}

// 获取仿真记录列表
export function getSimRecords(params: {
  page: number;
  size: number;
  keyword?: string;
  status?: string;
}): Promise<{
  success: boolean;
  msg: string;
  data?: {
    records: SimRecord[];
    total: number;
    current: number;
    size: number;
    pages: number;
  };
  timestamp: number;
}> {
  return request.get('/simulation/list', {
    params
  })
    .then((response) => {
      const rawResponse = response.data as SimRecordListResponseRaw;
      
      // 打印原始API响应，用于调试
      console.log('原始API响应:', rawResponse);
      
      // 转换响应数据格式
      if (rawResponse.res === 'ERR_OK' && rawResponse.data) {
        // 打印原始记录列表，用于调试
        console.log('原始记录列表:', rawResponse.data.records);
        
        // 转换记录列表
        const convertedRecords = rawResponse.data.records.map(record => {
          console.log('原始记录:', record);
          console.log('原始记录的taskId:', record.taskId);
          console.log('原始记录的taskid:', record.taskid);
          
          const convertedRecord = {
            id: parseInt(record.taskId || record.taskid) || 0,
            taskId: record.taskId || record.taskid || '',
            name: record.name || '',
            map_name: record.mapName || '',
            description: '', // API返回中没有description字段，使用空字符串
            status: record.status || 'unknown',
            create_time: record.createTime || '', // 使用createTime作为仿真时间
            update_time: record.updateTime || '',
            user_name: record.userid || '',
            duration: 0, // API返回中没有duration字段，使用0
            detail_info: JSON.stringify(record.additionalFields || {})
          };
          
          console.log('转换后的记录:', convertedRecord);
          return convertedRecord;
        });
        
        return {
          success: true,
          msg: rawResponse.msg || '获取成功',
          data: {
            records: convertedRecords,
            total: rawResponse.data.total || 0,
            current: rawResponse.data.page || 1,
            size: rawResponse.data.size || 10,
            pages: rawResponse.data.pages || 1
          },
          timestamp: rawResponse.timestamp || Date.now()
        };
      } else {
        return {
          success: false,
          msg: rawResponse.msg || '获取仿真记录失败',
          timestamp: rawResponse.timestamp || Date.now()
        };
      }
    })
    .catch((error) => {
      console.error('Get simulation records error:', error);
      return {
        success: false,
        msg: error.message || '网络错误，请检查网络连接后重试',
        timestamp: Date.now()
      };
    });
}

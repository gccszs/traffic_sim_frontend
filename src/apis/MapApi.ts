import request from '@/mods/Axios';

interface MapItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  filePath: string;
  createTime: string;
  updateTime: string;
}

interface GetMapsParams {
  page?: number;
  pageSize?: number;
  name?: string;
}

interface GetMapsResponse {
  success: boolean;
  message?: string;
  data?: {
    maps: MapItem[];
    total: number;
  };
}

interface MapResponse {
  success: boolean;
  message?: string;
  data?: MapItem;
}

export function getMaps(params: GetMapsParams = {}): Promise<GetMapsResponse> {
  return request.get('/maps', { params })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Get maps error:', error);
      return { success: false, message: error.message || '获取地图列表失败' };
    });
}

export function getMapDetail(id: string): Promise<MapResponse> {
  return request.get(`/maps/${id}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Get map detail error:', error);
      return { success: false, message: error.message || '获取地图详情失败' };
    });
}

export function createMap(data: any): Promise<MapResponse> {
  return request.post('/maps', data)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Create map error:', error);
      return { success: false, message: error.message || '创建地图失败' };
    });
}

export function updateMap(id: string, data: any): Promise<MapResponse> {
  return request.put(`/maps/${id}`, data)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Update map error:', error);
      return { success: false, message: error.message || '更新地图失败' };
    });
}

export function deleteMap(id: string): Promise<MapResponse> {
  return request.delete(`/maps/${id}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Delete map error:', error);
      return { success: false, message: error.message || '删除地图失败' };
    });
}

export function uploadMap(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  return request.post('/maps/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Upload map error:', error);
      return { success: false, message: error.message || '上传地图文件失败' };
    });
}
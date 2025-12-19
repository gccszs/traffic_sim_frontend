export class TimeUtils {

  // 获取当前时间戳
  static getTimestamp(unit: 'seconds' | 'milliseconds' = 'milliseconds'): number {
    const now = Date.now();
    return unit === 'seconds' ? Math.floor(now / 1000) : now;
  }

  // 时间戳转时间字符串，支持毫秒级
  static timestampToString(timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss.SSS'): string {
    const date = new Date(timestamp);
    let formatted = format;

    // 处理日期格式化
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    const millisecond = String(date.getMilliseconds()).padStart(3, '0');

    formatted = formatted.replace('YYYY', String(year));
    formatted = formatted.replace('MM', month);
    formatted = formatted.replace('DD', day);
    formatted = formatted.replace('HH', hour);
    formatted = formatted.replace('mm', minute);
    formatted = formatted.replace('ss', second);
    formatted = formatted.replace('SSS', millisecond);

    return formatted;
  }

  // 时间字符串转时间戳
  static stringToTimestamp(dateString: string): number {
    const date = new Date(dateString);
    return date.getTime();
  }
}

/*
// 示例：获取当前时间戳
console.log('当前秒级时间戳:', TimeUtils.getTimestamp('seconds'));
console.log('当前毫秒级时间戳:', TimeUtils.getTimestamp('milliseconds'));

// 示例：时间戳转时间字符串
const timestamp = 1672531199001; // 示例时间戳（包含毫秒）
console.log('时间戳转时间字符串:', TimeUtils.timestampToString(timestamp));

// 示例：时间字符串转时间戳
const dateString = '2024-11-28 12:34:56.789'; // 示例时间字符串（包含毫秒）
console.log('时间字符串转时间戳:', TimeUtils.stringToTimestamp(dateString));
*/
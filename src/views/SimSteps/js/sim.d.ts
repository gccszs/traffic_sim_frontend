// Type definitions for sim.js

export interface SimCanvas {
  clear(): void;
  resize(): void;
  draw(time: number): void;
  update(data: any): void;
  reset_transform(): void;
  change_lane_num(lane_num: number): void;
  set_road(road_data: any, lane_num: number): void;
  get_image(): string;
}

export declare function generate_thumbnail(road_data: any, lane_num: number, displayroadNume: boolean, displaycrossNume: boolean): string;

export declare function get_roadnetwork_xy(road_data: any, type: string): { x: number; y: number };

export declare class SimCanvas {
  constructor(canvas: HTMLCanvasElement, options?: any);
}

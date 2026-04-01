// Types for datacenter components
// These types extend the database types with additional properties used in the UI

import { Building as DBBuilding, Room as DBRoom, ParentItem, ChildItem } from './database';

export interface Building extends DBBuilding {
  rooms: Room[];
}

export interface Room extends DBRoom {
  items: GridItem[];
}

export interface GridItem extends ParentItem {
  // Additional properties for grid display
  shape: 'rectangle' | 'circle';
  icon_name: string;
  itemTypeColor: string;
  room_id: string;
  width_m: number;
  depthM: number;
  radiusM?: number | null;
  serial_number?: string | null;
  isTagEligible: boolean;
  ownerEmail?: string | null;
  dataSheetUrl?: string | null;
  trellisId?: string | null;
  tamanho_u?: number | null;
  potencia_w?: number | null;
  is_test_data: boolean;

  // Additional UI properties
  parent_id?: string | null;
  parentName?: string;
  buildingName?: string;
  roomName?: string;
  image_url?: string | null;
  tag?: string;
  description?: string;
}

// Type aliases for axis naming
export type AxisNaming = 'alpha' | 'numeric';
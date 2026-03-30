

// Tipos e Interfaces
export interface GridItem {
  id: string;
  label: string;
  x: number;
  y: number;
  width_m: number; 
  heightM: number; 
  radiusM?: number | null; // Adicionando raio
  type: string;
  status: any;
  room_id?: string;
  parent_id?: string | null;
  serial_number?: string;
  brand?: string;
  tag?: string;
  isTagEligible?: boolean;
  ownerEmail?: string;
  dataSheetUrl?: string;
  description?: string;
  image_url?: string;
  modelo?: string;
  preco?: number;
  trellisId?: string;
  tamanho_u?: number;
  posicao_u?: number;
  potencia_w?: number;
  color?: string;
  // Propriedades que podem vir do JOIN
  roomName?: string;
  buildingName?: string;
  itemTypeColor?: string;
  parentName?: string | null;
  // Propriedade para definir a forma
  shape?: 'rectangle' | 'circle';
  icon_name?: string;
}

export type AxisNaming = 'alpha' | 'numeric';

export interface Room {
  id: string;
  name: string;
  building_id: string;
  width_m: number;
  width_m: number;
  tile_width_cm: number;
  tile_height_cm: number;
  x_axis_naming: AxisNaming;
  y_axis_naming: AxisNaming;
  items: GridItem[];
}

export interface Building {
  id: string;
  name: string;
  rooms: Room[];
}

    
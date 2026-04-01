// Database schema interfaces based on PostgREST OpenAPI schema
// These interfaces represent the exact field names and types from the PostgreSQL database

export interface Building {
  id: string;
  name: string;
  address?: string;
  is_test_data: boolean;
}

export interface Room {
  id: string;
  name: string;
  building_id: string;
  width_m: number;
  depth_m: number;
  tile_width_cm: number;
  tile_height_cm: number;
  x_axis_naming: 'alpha' | 'numeric';
  y_axis_naming: 'alpha' | 'numeric';
  items?: any[]; // Itens na sala (adicionado dinamicamente)
  is_test_data: boolean;
}

export interface ParentItem {
  id: string;
  label: string;
  x: number;
  y: number;
  width_m: number;
  depth_m: number;
  radius_m?: number | null;
  type: string;
  status: string;
  room_id?: string | null;
  color?: string | null;
  shape?: 'rectangle' | 'circle' | null;
  serial_number?: string | null;
  brand?: string | null;
  modelo?: string | null;
  preco?: number | null;
  tamanho_u?: number | null;
  posicao_u?: number | null;
  potencia_w?: number | null;
  is_test_data: boolean;
}

export interface ChildItem {
  id: string;
  label: string;
  parent_id: string;
  type: string;
  brand?: string | null;
  modelo?: string | null;
  serial_number?: string | null;
  tamanho_u?: number | null;
  posicao_u?: number | null;
  status: string;
  is_test_data: boolean;
}

export interface Connection {
  id: string;
  port_a_id: string;
  port_b_id?: string | null;
  connection_type_id: string;
  is_test_data: boolean;
}

export interface ConnectionType {
  id: string;
  name: string;
  color?: string | null;
  is_test_data: boolean;
}

export interface ItemStatus {
  id: string;
  name: string;
  color?: string | null;
  isdefault: boolean;
  is_test_data: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle';
  default_color?: string | null;
  defaultwidth_m: number;
  default_depth_m: number;
  default_radius_m?: number | null;
  can_have_children: boolean;
  is_test_data: boolean;
}

export interface EquipmentPort {
  id: string;
  childitemid: string;
  label: string;
  type: string;
  is_test_data: boolean;
}

export interface Manufacturer {
  id: string;
  name: string;
  is_test_data: boolean;
}

export interface Model {
  id: string;
  name: string;
  manufacturer_id: string;
  is_test_data: boolean;
}

export interface PortType {
  id: string;
  name: string;
  color?: string | null;
  is_test_data: boolean;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  photo_url?: string | null;
  role: 'developer' | 'manager' | 'project_manager' | 'supervisor_1' | 'supervisor_2' | 'technician_1' | 'technician_2' | 'guest';
  signature_url?: string | null;
  is_test_data: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description?: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  entity_type: 'building' | 'room' | 'parent_item' | 'child_item' | 'port';
  entity_id: string;
  assigned_to?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_test_data: boolean;
}

export interface IncidentAttribute {
  id: string;
  incident_id: string;
  key: string;
  value: string;
  is_test_data: boolean;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  timestamp: string;
  is_test_data: boolean;
}

// Type aliases for backward compatibility and common usage
export type BuildingEntity = Building;
export type RoomEntity = Room;
export type ParentItemEntity = ParentItem;
export type ChildItemEntity = ChildItem;

// ConnectableItem represents items that can have connections (equipment with ports)
export interface ConnectableItem {
  id: string;
  label: string;
  type?: string;
  parentName?: string;
}
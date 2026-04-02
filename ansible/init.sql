-- 1. Tabelas de Sistema e Autenticação
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  photo_url TEXT,
  last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  permissions TEXT,
  accessible_building_ids TEXT,
  preferences TEXT,
  signature_url TEXT,
  is_test_data BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(100) NOT NULL,
  user_display_name VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  details TEXT
);

-- 2. Dicionários e Tipos
CREATE TABLE IF NOT EXISTS manufacturers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS models (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  manufacturer_id VARCHAR(50) REFERENCES manufacturers(id) ON DELETE CASCADE,
  port_config TEXT,
  tamanho_u INTEGER,
  UNIQUE(name, manufacturer_id)
);

CREATE TABLE IF NOT EXISTS item_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  default_width_m DOUBLE PRECISION NOT NULL,
  default_depth_m DOUBLE PRECISION NOT NULL,
  icon_name VARCHAR(50),
  can_have_children BOOLEAN DEFAULT FALSE,
  is_resizable BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'active',
  default_color VARCHAR(50),
  shape VARCHAR(50) DEFAULT 'rectangle',
  default_radius_m DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE,
  is_test_data BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS item_types_eqp (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  default_width_m DOUBLE PRECISION NOT NULL,
  default_depth_m DOUBLE PRECISION NOT NULL,
  icon_name VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  default_color VARCHAR(50),
  is_test_data BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS item_statuses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  color VARCHAR(20) NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS port_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS connection_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE
);

-- 3. Tabelas de Incidentes e Aprovações
CREATE TABLE IF NOT EXISTS incident_severities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  color VARCHAR(20) NOT NULL,
  rank INTEGER UNIQUE NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS incident_statuses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  color VARCHAR(20) NOT NULL,
  icon_name VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS incident_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  default_severity_id VARCHAR(50) REFERENCES incident_severities(id),
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(50) PRIMARY KEY,
  description TEXT NOT NULL,
  detected_at TIMESTAMP NOT NULL,
  severity_id VARCHAR(50) REFERENCES incident_severities(id),
  status_id VARCHAR(50) REFERENCES incident_statuses(id),
  resolved_at TIMESTAMP,
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  type_id VARCHAR(50)REFERENCES incident_types(id),
  notes TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS evidence (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP NOT NULL,
  type VARCHAR(50) NOT NULL,
  data TEXT NOT NULL,
  entity_id VARCHAR(100) DEFAULT 'unknown',
  entity_type VARCHAR(50) DEFAULT 'unknown'
);

CREATE TABLE IF NOT EXISTS approvals (
  id VARCHAR(50) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  requested_by_user_id VARCHAR(100) NOT NULL,
  requested_by_user_display_name VARCHAR(255),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  details TEXT,
  resolved_by_user_id VARCHAR(100),
  resolved_by_user_display_name VARCHAR(255),
  resolved_at TIMESTAMP,
  resolver_notes TEXT
);

-- 4. Infraestrutura Física e Inventário
CREATE TABLE IF NOT EXISTS buildings (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  is_test_data BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  building_id VARCHAR(50) REFERENCES buildings(id) ON DELETE CASCADE,
  depth_m DOUBLE PRECISION,
  width_m DOUBLE PRECISION,
  tile_width_cm DOUBLE PRECISION,
  tile_height_cm DOUBLE PRECISION,
  x_axis_naming VARCHAR(20) DEFAULT 'alpha',
  y_axis_naming VARCHAR(20) DEFAULT 'numeric',
  background_image_url TEXT,
  background_scale DOUBLE PRECISION,
  background_pos_x DOUBLE PRECISION,
  background_pos_y DOUBLE PRECISION,
  width_m_new DOUBLE PRECISION,
  depth_m_new DOUBLE PRECISION,
  is_test_data BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS room_exclusion_zones (
  id VARCHAR(50) PRIMARY KEY,
  room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE CASCADE,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS parent_items (
  id VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  x INTEGER DEFAULT -1,
  y INTEGER DEFAULT -1,
  width DOUBLE PRECISION DEFAULT 0,
  depth DOUBLE PRECISION DEFAULT 0,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE SET NULL,
  parent_id VARCHAR(50) REFERENCES parent_items(id),
  serial_number VARCHAR(100),
  brand VARCHAR(100),
  tag VARCHAR(100),
  is_tag_eligible BOOLEAN,
  owner_email VARCHAR(255),
  data_sheet_url TEXT,
  description TEXT,
  image_url TEXT,
  modelo VARCHAR(100),
  preco DOUBLE PRECISION,
  trellis_id VARCHAR(100),
  tamanho_u INTEGER,
  potencia_w INTEGER,
  color VARCHAR(50),
  width_m DOUBLE PRECISION,
  depth_m DOUBLE PRECISION,
  radius_m DOUBLE PRECISION,
  is_test_data BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sensors (
  id VARCHAR(50) PRIMARY KEY,
  item_id VARCHAR(50) REFERENCES parent_items(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  value DOUBLE PRECISION,
  unit VARCHAR(20),
  last_reading TIMESTAMP
);

CREATE TABLE IF NOT EXISTS child_items (
  id VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  parent_id VARCHAR(50) REFERENCES parent_items(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  serial_number VARCHAR(100),
  brand VARCHAR(100),
  tag VARCHAR(100),
  is_tag_eligible BOOLEAN,
  owner_email VARCHAR(255),
  data_sheet_url TEXT,
  description TEXT,
  image_url TEXT,
  modelo VARCHAR(100),
  preco DOUBLE PRECISION,
  trellis_id VARCHAR(100),
  tamanho_u INTEGER,
  posicao_u INTEGER,
  is_test_data BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS equipment_ports (
  id VARCHAR(50) PRIMARY KEY,
  child_item_id VARCHAR(50) REFERENCES child_items(id) ON DELETE CASCADE,
  port_type_id VARCHAR(50) REFERENCES port_types(id),
  label VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'down',
  connected_to_port_id VARCHAR(50) REFERENCES equipment_ports(id),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS connections (
  id VARCHAR(50) PRIMARY KEY,
  port_a_id VARCHAR(50) UNIQUE REFERENCES equipment_ports(id),
  port_b_id VARCHAR(50) REFERENCES equipment_ports(id),
  connection_type_id VARCHAR(50) REFERENCES connection_types(id),
  status VARCHAR(50) DEFAULT 'active',
  image_url TEXT,
  label_text VARCHAR(255),
  is_test_data BOOLEAN DEFAULT FALSE,
  UNIQUE(port_a_id, port_b_id)
);

-- =================================================================
-- Inserções de Dados de Catálogo (Traduzido de infra_setup.sql MSSQL)
-- =================================================================

-- Manufacturers
INSERT INTO manufacturers (id, name)
VALUES
  ('man_generic', 'Genérico'),
  ('man_cisco', 'Cisco'),
  ('man_dell', 'Dell EMC'),
  ('man_hpe', 'HPE'),
  ('man_vertiv', 'Vertiv'),
  ('man_schneider', 'Schneider Electric (APC)'),
  ('man_rittal', 'Rittal'),
  ('man_furukawa', 'Furukawa'),
  ('man_nokia', 'Nokia'),
  ('man_padtec', 'Padtec'),
  ('man_juniper', 'Juniper Networks')
ON CONFLICT (name) DO NOTHING;

-- Item Statuses
INSERT INTO item_statuses (id, name, description, color, is_archived, is_default)
VALUES
  ('draft', 'Rascunho', 'Item está sendo criado e não é visível para todos.', 'amber', FALSE, TRUE),
  ('pending_approval', 'Pendente', 'Item aguarda aprovação de um gerente para se tornar ativo.', 'yellow', FALSE, TRUE),
  ('active', 'Ativo', 'Item está em operação normal.', 'green', FALSE, TRUE),
  ('maintenance', 'Em Manutenção', 'Item está temporariamente offline para manutenção.', 'orange', FALSE, TRUE),
  ('decommissioned', 'Descomissionado', 'Item foi retirado de operação e está na lixeira.', 'gray', TRUE, TRUE),
  ('deleted', 'Excluído', 'Item foi permanentemente removido (uso interno).', 'red', TRUE, TRUE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  is_archived = EXCLUDED.is_archived,
  is_default = EXCLUDED.is_default;

-- Item Types
INSERT INTO item_types (id, name, category, icon_name, can_have_children, is_resizable, default_color, shape, default_width_m, default_depth_m, default_radius_m, is_default)
VALUES
  ('type_rack_default', 'Rack 42U', 'Gabinetes', 'Box', TRUE, TRUE, '#3b82f6', 'rectangle', 0.6, 1.2, NULL, TRUE),
  ('type_qdf', 'QDF', 'Cabeamento', 'Network', TRUE, FALSE, '#f97316', 'rectangle', 0.8, 0.6, NULL, TRUE),
  ('type_ac_row', 'Ar Condicionado In-Row', 'Climatização', 'Snowflake', FALSE, FALSE, '#64748b', 'rectangle', 0.3, 1, NULL, TRUE)
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  can_have_children = EXCLUDED.can_have_children,
  is_resizable = EXCLUDED.is_resizable,
  default_color = EXCLUDED.default_color,
  shape = EXCLUDED.shape,
  default_width_m = EXCLUDED.default_width_m,
  default_depth_m = EXCLUDED.default_depth_m,
  default_radius_m = EXCLUDED.default_radius_m,
  is_default = EXCLUDED.is_default;

-- Item Types Eqp
INSERT INTO item_types_eqp (id, name, category, icon_name, default_color, default_width_m, default_depth_m)
VALUES
  ('type_eqp_server', 'Servidor', 'Equipamentos de TI', 'HardDrive', NULL, 0.5, 0.8),
  ('type_eqp_switch', 'Switch', 'Equipamentos de Rede', 'Network', NULL, 0.4, 0.3),
  ('type_eqp_firewall', 'Firewall', 'Segurança de Rede', 'ShieldCheck', NULL, 0.4, 0.3),
  ('type_eqp_storage', 'Storage', 'Armazenamento', 'Database', NULL, 0.5, 0.6),
  ('type_eqp_patch', 'Patch Panel', 'Cabeamento', 'PanelTop', NULL, 0.5, 0.2),
  ('type_eqp_pdu_rack', 'PDU de Rack', 'Energia', 'Power', NULL, 0.1, 1.0),
  ('type_eqp_ups', 'UPS', 'Energia', 'BatteryCharging', NULL, 0.2, 0.4),
  ('type_eqp_telecom', 'Equipamento Telecom', 'Equipamentos de Telecom', 'Router', NULL, 0.4, 0.3)
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  default_color = EXCLUDED.default_color,
  default_width_m = EXCLUDED.default_width_m,
  default_depth_m = EXCLUDED.default_depth_m;

-- Port Types
INSERT INTO port_types (id, name, description, is_default)
VALUES
  ('port_rj45', 'RJ45', 'Conector de rede padrão para cabos UTP.', TRUE),
  ('port_sfp+', 'SFP+', 'Porta 10Gbps SFP.', FALSE),
  ('port_lc_duplex', 'LC_Duplex', 'Conector duplo de fibra óptica LC.', FALSE),
  ('port_c13', 'C13', 'Conector de energia padrão para PDUs.', FALSE),
  ('port_idrac', 'iDRAC', 'Porta de gerenciamento remoto Dell.', FALSE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default;

-- Connection Types
INSERT INTO connection_types (id, name, description, is_default)
VALUES
  ('conn_utp', 'Dados UTP', 'Cabo de par trançado para redes Ethernet.', TRUE),
  ('conn_fiber_mm', 'Fibra Óptica (MM)', 'Cabo de fibra óptica multimodo.', FALSE),
  ('conn_fiber_sm', 'Fibra Óptica (SM)', 'Cabo de fibra óptica monomodo.', FALSE),
  ('conn_power_ac', 'Energia AC', 'Cabo de alimentação de corrente alternada.', FALSE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default;

-- Models
INSERT INTO models (id, name, manufacturer_id, port_config, tamanho_u)
VALUES
  ('model_rittal_tsit', 'TS IT Network/Server Rack', (SELECT id FROM manufacturers WHERE name = 'Rittal'), NULL, 42),
  ('model_apc_sx42', 'NetShelter SX 42U', (SELECT id FROM manufacturers WHERE name = 'Schneider Electric (APC)'), NULL, 42),
  ('model_dell_r740', 'PowerEdge R740', (SELECT id FROM manufacturers WHERE name = 'Dell EMC'), '2xRJ45_Mgmt;2xSFP+;2xRJ45;1xiDRAC;1xVGA', 2),
  ('model_cisco_c9300_48', 'Catalyst 9300 48-port', (SELECT id FROM manufacturers WHERE name = 'Cisco'), '48xRJ45;4xSFP+;1xConsole', 1),
  ('model_cisco_c9300_24', 'Catalyst 9300 24-port', (SELECT id FROM manufacturers WHERE name = 'Cisco'), '24xRJ45;4xSFP+;1xConsole', 1),
  ('model_nokia_7750', '7750 Service Router (SR-1)', (SELECT id FROM manufacturers WHERE name = 'Nokia'), '12xSFP+;2xQSFP28', 3),
  ('model_padtec_tm800g', 'Transponder 800G', (SELECT id FROM manufacturers WHERE name = 'Padtec'), '2xLC_Duplex;4xSFP28', 1),
  ('model_juniper_mx204', 'MX204', (SELECT id FROM manufacturers WHERE name = 'Juniper Networks'), '4xQSFP28;8xSFP+', 1)
ON CONFLICT (name, manufacturer_id) DO UPDATE SET
  port_config = EXCLUDED.port_config,
  tamanho_u = EXCLUDED.tamanho_u;
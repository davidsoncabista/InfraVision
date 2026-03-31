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
  default_height_m DOUBLE PRECISION NOT NULL,
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
  default_height_m DOUBLE PRECISION NOT NULL,
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
  type_id VARCHAR(50),
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
  height DOUBLE PRECISION DEFAULT 0,
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
  height_m DOUBLE PRECISION,
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
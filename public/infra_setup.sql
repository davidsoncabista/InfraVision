-- =================================================================
-- Script de Configuração da Infraestrutura - InfraVision
-- Gerado por: davidson.dev.br
-- Descrição: Este script cria todas as tabelas necessárias e
-- popula os dados essenciais (catálogo) para a aplicação.
-- É idempotente e pode ser executado várias vezes com segurança.
-- =================================================================

-- Tabela: Manufacturers
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Manufacturers' AND xtype='U')
BEGIN
    CREATE TABLE Manufacturers (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        is_test_data BIT NOT NULL DEFAULT 0
    );
END
GO

MERGE INTO Manufacturers AS Target
USING (
    VALUES
        ('man_generic', 'Genérico'), ('man_cisco', 'Cisco'), ('man_dell', 'Dell EMC'),
        ('man_hpe', 'HPE'), ('man_vertiv', 'Vertiv'), ('man_schneider', 'Schneider Electric (APC)'),
        ('man_rittal', 'Rittal'), ('man_furukawa', 'Furukawa'), ('man_nokia', 'Nokia'),
        ('man_padtec', 'Padtec'), ('man_juniper', 'Juniper Networks')
) AS Source (id, name)
ON (Target.name = Source.name)
WHEN MATCHED THEN
    UPDATE SET name = Source.name -- Ação apenas para garantir a cláusula
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name) VALUES (Source.id, Source.name);
GO


-- Tabela: ItemStatuses
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ItemStatuses' AND xtype='U')
BEGIN
    CREATE TABLE ItemStatuses (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        color NVARCHAR(20) NOT NULL,
        isArchived BIT NOT NULL DEFAULT 0,
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

MERGE INTO ItemStatuses AS Target
USING (
    VALUES
        ('draft', 'Rascunho', 'Item está sendo criado e não é visível para todos.', 'amber', 0, 1),
        ('pending_approval', 'Pendente', 'Item aguarda aprovação de um gerente para se tornar ativo.', 'yellow', 0, 1),
        ('active', 'Ativo', 'Item está em operação normal.', 'green', 0, 1),
        ('maintenance', 'Em Manutenção', 'Item está temporariamente offline para manutenção.', 'orange', 0, 1),
        ('decommissioned', 'Descomissionado', 'Item foi retirado de operação e está na lixeira.', 'gray', 1, 1),
        ('deleted', 'Excluído', 'Item foi permanentemente removido (uso interno).', 'red', 1, 1)
) AS Source (id, name, description, color, isArchived, isDefault)
ON (Target.id = Source.id)
WHEN MATCHED THEN
    UPDATE SET name = Source.name, description = Source.description, color = Source.color, isArchived = Source.isArchived, isDefault = Source.isDefault
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, description, color, isArchived, isDefault) VALUES (Source.id, Source.name, Source.description, Source.color, Source.isArchived, Source.isDefault);
GO


-- Tabela: item_types (Planta Baixa)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='item_types' AND xtype='U')
BEGIN
    CREATE TABLE item_types (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        category NVARCHAR(100) NOT NULL,
        icon_name NVARCHAR(50),
        can_have_children BIT NOT NULL DEFAULT 0,
        is_resizable BIT NOT NULL DEFAULT 1,
        status NVARCHAR(50) NOT NULL DEFAULT 'active',
        is_test_data BIT NOT NULL DEFAULT 0,
        default_color NVARCHAR(50),
        shape NVARCHAR(50) NOT NULL DEFAULT 'rectangle',
        defaultwidth_m FLOAT,
        default_height_m FLOAT,
        default_radius_m FLOAT,
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

MERGE INTO item_types AS Target
USING (
    VALUES
        ('type_rack_default', 'Rack 42U', 'Gabinetes', 'Box', 1, 1, '#3b82f6', 'rectangle', 0.6, 1.2, NULL, 1),
        ('type_qdf', 'QDF', 'Cabeamento', 'Network', 1, 0, '#f97316', 'rectangle', 0.8, 0.6, NULL, 1),
        ('type_ac_row', 'Ar Condicionado In-Row', 'Climatização', 'Snowflake', 0, 0, '#64748b', 'rectangle', 0.3, 1, NULL, 1)
) AS Source (id, name, category, icon_name, can_have_children, is_resizable, default_color, shape, defaultwidth_m, default_height_m, default_radius_m, isDefault)
ON (Target.id = Source.id)
WHEN MATCHED THEN
    UPDATE SET name = Source.name, category = Source.category, icon_name = Source.icon_name, can_have_children = Source.can_have_children, is_resizable = Source.is_resizable, default_color = Source.default_color, shape = Source.shape, defaultwidth_m = Source.defaultwidth_m, default_height_m = Source.default_height_m, default_radius_m = Source.default_radius_m, isDefault = Source.isDefault
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, category, icon_name, can_have_children, is_resizable, default_color, shape, defaultwidth_m, default_height_m, default_radius_m, status, isDefault) VALUES (Source.id, Source.name, Source.category, Source.icon_name, Source.can_have_children, Source.is_resizable, Source.default_color, Source.shape, Source.defaultwidth_m, Source.default_height_m, Source.default_radius_m, 'active', Source.isDefault);
GO


-- Tabela: item_typesEqp (Equipamentos Aninhados)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='item_typesEqp' AND xtype='U')
BEGIN
    CREATE TABLE item_typesEqp (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        category NVARCHAR(100) NOT NULL,
        icon_name NVARCHAR(50),
        status NVARCHAR(50) NOT NULL DEFAULT 'active',
        is_test_data BIT NOT NULL DEFAULT 0,
        default_color NVARCHAR(50)
    );
END
GO

MERGE INTO item_typesEqp AS Target
USING (
    VALUES
        ('type_eqp_server', 'Servidor', 'Equipamentos de TI', 'HardDrive', NULL),
        ('type_eqp_switch', 'Switch', 'Equipamentos de Rede', 'Network', NULL),
        ('type_eqp_firewall', 'Firewall', 'Segurança de Rede', 'ShieldCheck', NULL),
        ('type_eqp_storage', 'Storage', 'Armazenamento', 'Database', NULL),
        ('type_eqp_patch', 'Patch Panel', 'Cabeamento', 'PanelTop', NULL),
        ('type_eqp_pdu_rack', 'PDU de Rack', 'Energia', 'Power', NULL),
        ('type_eqp_ups', 'UPS', 'Energia', 'BatteryCharging', NULL),
        ('type_eqp_telecom', 'Equipamento Telecom', 'Equipamentos de Telecom', 'Router', NULL)
) AS Source (id, name, category, icon_name, default_color)
ON (Target.id = Source.id)
WHEN MATCHED THEN
    UPDATE SET name = Source.name, category = Source.category, icon_name = Source.icon_name, default_color = Source.default_color
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, category, icon_name, default_color, status) VALUES (Source.id, Source.name, Source.category, Source.icon_name, Source.default_color, 'active');
GO


-- Tabela: port_types
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='port_types' AND xtype='U')
BEGIN
    CREATE TABLE port_types (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

MERGE INTO port_types AS Target
USING (
    VALUES
        ('port_rj45', 'RJ45', 'Conector de rede padrão para cabos UTP.', 1),
        ('port_sfp+', 'SFP+', 'Porta 10Gbps SFP.', 0),
        ('port_lc_duplex', 'LC_Duplex', 'Conector duplo de fibra óptica LC.', 0),
        ('port_c13', 'C13', 'Conector de energia padrão para PDUs.', 0),
        ('port_idrac', 'iDRAC', 'Porta de gerenciamento remoto Dell.', 0)
) AS Source (id, name, description, isDefault)
ON (Target.id = Source.id)
WHEN MATCHED THEN
    UPDATE SET name = Source.name, description = Source.description, isDefault = Source.isDefault
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, description, isDefault) VALUES (Source.id, Source.name, Source.description, Source.isDefault);
GO


-- Tabela: ConnectionTypes
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ConnectionTypes' AND xtype='U')
BEGIN
    CREATE TABLE ConnectionTypes (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255),
        isDefault BIT NOT NULL DEFAULT 0
    );
END
GO

MERGE INTO ConnectionTypes AS Target
USING (
    VALUES
        ('conn_utp', 'Dados UTP', 'Cabo de par trançado para redes Ethernet.', 1),
        ('conn_fiber_mm', 'Fibra Óptica (MM)', 'Cabo de fibra óptica multimodo.', 0),
        ('conn_fiber_sm', 'Fibra Óptica (SM)', 'Cabo de fibra óptica monomodo.', 0),
        ('conn_power_ac', 'Energia AC', 'Cabo de alimentação de corrente alternada.', 0)
) AS Source (id, name, description, isDefault)
ON (Target.id = Source.id)
WHEN MATCHED THEN
    UPDATE SET name = Source.name, description = Source.description, isDefault = Source.isDefault
WHEN NOT MATCHED BY TARGET THEN
    INSERT (id, name, description, isDefault) VALUES (Source.id, Source.name, Source.description, Source.isDefault);
GO


-- Tabela: Models
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Models' AND xtype='U')
BEGIN
    CREATE TABLE Models (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        manufacturer_id NVARCHAR(50) NOT NULL,
        portConfig NVARCHAR(MAX),
        tamanho_u INT,
        is_test_data BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (manufacturer_id) REFERENCES Manufacturers(id) ON DELETE CASCADE,
        UNIQUE (name, manufacturer_id)
    );
END
GO

-- Inserções para a tabela Models (requer que Manufacturers já tenha sido populada)
-- Usando um bloco anônimo para buscar os IDs dos fabricantes.
BEGIN
    DECLARE @ciscoId NVARCHAR(50) = (SELECT id FROM Manufacturers WHERE name = 'Cisco');
    DECLARE @dellId NVARCHAR(50) = (SELECT id FROM Manufacturers WHERE name = 'Dell EMC');
    DECLARE @nokiaId NVARCHAR(50) = (SELECT id FROM Manufacturers WHERE name = 'Nokia');
    DECLARE @padtecId NVARCHAR(50) = (SELECT id FROM Manufacturers WHERE name = 'Padtec');
    DECLARE @juniperId NVARCHAR(50) = (SELECT id FROM Manufacturers WHERE name = 'Juniper Networks');
    DECLARE @rittalId NVARCHAR(50) = (SELECT id FROM Manufacturers WHERE name = 'Rittal');
    DECLARE @apcId NVARCHAR(50) = (SELECT id FROM Manufacturers WHERE name = 'Schneider Electric (APC)');

    MERGE INTO Models AS Target
    USING (
        VALUES
            ('model_rittal_tsit', 'TS IT Network/Server Rack', @rittalId, NULL, 42),
            ('model_apc_sx42', 'NetShelter SX 42U', @apcId, NULL, 42),
            ('model_dell_r740', 'PowerEdge R740', @dellId, '2xRJ45_Mgmt;2xSFP+;2xRJ45;1xiDRAC;1xVGA', 2),
            ('model_cisco_c9300_48', 'Catalyst 9300 48-port', @ciscoId, '48xRJ45;4xSFP+;1xConsole', 1),
            ('model_cisco_c9300_24', 'Catalyst 9300 24-port', @ciscoId, '24xRJ45;4xSFP+;1xConsole', 1),
            ('model_nokia_7750', '7750 Service Router (SR-1)', @nokiaId, '12xSFP+;2xQSFP28', 3),
            ('model_padtec_tm800g', 'Transponder 800G', @padtecId, '2xLC_Duplex;4xSFP28', 1),
            ('model_juniper_mx204', 'MX204', @juniperId, '4xQSFP28;8xSFP+', 1)
    ) AS Source (id, name, manufacturer_id, portConfig, tamanho_u)
    ON (Target.name = Source.name AND Target.manufacturer_id = Source.manufacturer_id)
    WHEN MATCHED THEN
        UPDATE SET portConfig = Source.portConfig, tamanho_u = Source.tamanho_u
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (id, name, manufacturer_id, portConfig, tamanho_u, is_test_data)
        VALUES (Source.id, Source.name, Source.manufacturer_id, Source.portConfig, Source.tamanho_u, 0);
END
GO

PRINT 'Script de configuração da infraestrutura concluído com sucesso.';
GO

USE [InfraVisionDB];
GO
/****** Object:  Table [dbo].[Approvals]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Approvals](
	[id] [nvarchar](50) NOT NULL,
	[entityType] [nvarchar](50) NOT NULL,
	[entityId] [nvarchar](100) NOT NULL,
	[requestedByUserId] [nvarchar](100) NOT NULL,
	[requestedByUserDisplayName] [nvarchar](255) NULL,
	[requestedAt] [datetime2](7) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[details] [nvarchar](max) NULL,
	[resolvedByUserId] [nvarchar](100) NULL,
	[resolvedByUserDisplayName] [nvarchar](255) NULL,
	[resolvedAt] [datetime2](7) NULL,
	[resolverNotes] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AuditLog]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditLog](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[timestamp] [datetime2](7) NOT NULL,
	[userId] [nvarchar](100) NOT NULL,
	[userDisplayName] [nvarchar](255) NULL,
	[action] [nvarchar](255) NOT NULL,
	[entityType] [nvarchar](50) NULL,
	[entityId] [nvarchar](100) NULL,
	[details] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Buildings]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Buildings](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[address] [nvarchar](255) NULL,
	[isTestData] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[child_items]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[child_items](
	[id] [nvarchar](50) NOT NULL,
	[label] [nvarchar](100) NOT NULL,
	[parentId] [nvarchar](50) NULL,
	[type] [nvarchar](50) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[serialNumber] [nvarchar](100) NULL,
	[brand] [nvarchar](100) NULL,
	[tag] [nvarchar](100) NULL,
	[isTagEligible] [bit] NULL,
	[ownerEmail] [nvarchar](255) NULL,
	[dataSheetUrl] [nvarchar](max) NULL,
	[description] [nvarchar](max) NULL,
	[imageUrl] [nvarchar](max) NULL,
	[modelo] [nvarchar](100) NULL,
	[preco] [float] NULL,
	[trellisId] [nvarchar](100) NULL,
	[tamanhoU] [int] NULL,
	[posicaoU] [int] NULL,
	[isTestData] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Connections]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Connections](
	[id] [nvarchar](50) NOT NULL,
	[portA_id] [nvarchar](50) NOT NULL,
	[portB_id] [nvarchar](50) NULL,
	[connectionTypeId] [nvarchar](50) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[isTestData] [bit] NOT NULL,
	[imageUrl] [nvarchar](max) NULL,
	[labelText] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ConnectionTypes]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ConnectionTypes](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[isDefault] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment_ports]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment_ports](
	[id] [nvarchar](50) NOT NULL,
	[childItemId] [nvarchar](50) NOT NULL,
	[portTypeId] [nvarchar](50) NOT NULL,
	[label] [nvarchar](100) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[connectedToPortId] [nvarchar](50) NULL,
	[notes] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Evidence]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Evidence](
	[id] [nvarchar](50) NOT NULL,
	[timestamp] [datetime2](7) NOT NULL,
	[type] [nvarchar](50) NOT NULL,
	[data] [nvarchar](max) NOT NULL,
	[entityId] [nvarchar](100) NOT NULL,
	[entityType] [nvarchar](50) NOT NULL,
	[userId] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Incidents]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Incidents](
	[id] [nvarchar](50) NOT NULL,
	[description] [nvarchar](max) NOT NULL,
	[detectedAt] [datetime2](7) NOT NULL,
	[severityId] [nvarchar](50) NOT NULL,
	[statusId] [nvarchar](50) NOT NULL,
	[resolvedAt] [datetime2](7) NULL,
	[entityType] [nvarchar](50) NULL,
	[entityId] [nvarchar](100) NULL,
	[typeId] [nvarchar](50) NULL,
	[notes] [nvarchar](max) NULL,
	[imageUrl] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[IncidentSeverities]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[IncidentSeverities](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[color] [nvarchar](20) NOT NULL,
	[rank] [int] NOT NULL,
	[isDefault] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[IncidentStatuses]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[IncidentStatuses](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[color] [nvarchar](20) NOT NULL,
	[iconName] [nvarchar](50) NULL,
	[isDefault] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[IncidentTypes]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[IncidentTypes](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[defaultSeverityId] [nvarchar](50) NULL,
	[isDefault] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ItemStatuses]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ItemStatuses](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[color] [nvarchar](20) NOT NULL,
	[isArchived] [bit] NOT NULL,
	[isDefault] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[item_types]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[item_types](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[category] [nvarchar](100) NOT NULL,
	[defaultWidthM] [float] NOT NULL,
	[defaultHeightM] [float] NOT NULL,
	[iconName] [nvarchar](50) NULL,
	[canHaveChildren] [bit] NOT NULL,
	[isResizable] [bit] NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[defaultColor] [nvarchar](50) NULL,
	[isTestData] [bit] NOT NULL,
	[shape] [nvarchar](50) NOT NULL,
	[defaultRadiusM] [float] NULL,
	[isDefault] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[item_typesEqp]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[item_typesEqp](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[category] [nvarchar](100) NOT NULL,
	[defaultWidthM] [float] NOT NULL,
	[defaultHeightM] [float] NOT NULL,
	[iconName] [nvarchar](50) NULL,
	[status] [nvarchar](50) NOT NULL,
	[isTestData] [bit] NOT NULL,
	[defaultColor] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Manufacturers]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Manufacturers](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Models]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Models](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[manufacturerId] [nvarchar](50) NOT NULL,
	[portConfig] [nvarchar](max) NULL,
	[tamanhoU] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[parent_items]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[parent_items](
	[id] [nvarchar](50) NOT NULL,
	[label] [nvarchar](100) NOT NULL,
	[x] [int] NOT NULL,
	[y] [int] NOT NULL,
	[width] [float] NOT NULL,
	[height] [float] NOT NULL,
	[type] [nvarchar](50) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[roomId] [nvarchar](50) NULL,
	[parentId] [nvarchar](50) NULL,
	[serialNumber] [nvarchar](100) NULL,
	[brand] [nvarchar](100) NULL,
	[tag] [nvarchar](100) NULL,
	[isTagEligible] [bit] NULL,
	[ownerEmail] [nvarchar](255) NULL,
	[dataSheetUrl] [nvarchar](max) NULL,
	[description] [nvarchar](max) NULL,
	[imageUrl] [nvarchar](max) NULL,
	[modelo] [nvarchar](100) NULL,
	[preco] [float] NULL,
	[trellisId] [nvarchar](100) NULL,
	[tamanhoU] [int] NULL,
	[potenciaW] [int] NULL,
	[isTestData] [bit] NOT NULL,
	[color] [nvarchar](50) NULL,
	[widthM] [float] NULL,
	[heightM] [float] NULL,
	[radiusM] [float] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PortTypes]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PortTypes](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[isDefault] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoomExclusionZones]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoomExclusionZones](
	[id] [nvarchar](50) NOT NULL,
	[roomId] [nvarchar](50) NOT NULL,
	[x] [int] NOT NULL,
	[y] [int] NOT NULL,
	[width] [int] NOT NULL,
	[height] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Rooms]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Rooms](
	[id] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[buildingId] [nvarchar](50) NOT NULL,
	[depthM] [float] NULL,
	[widthM] [float] NULL,
	[tileWidthCm] [float] NULL,
	[tileHeightCm] [float] NULL,
	[xAxisNaming] [nvarchar](20) NULL,
	[yAxisNaming] [nvarchar](20) NULL,
	[isTestData] [bit] NOT NULL,
	[backgroundImageUrl] [nvarchar](max) NULL,
	[backgroundScale] [float] NULL,
	[backgroundPosX] [float] NULL,
	[backgroundPosY] [float] NULL,
	[widthM_new] [float] NULL,
	[depthM_new] [float] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Sensors]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Sensors](
	[id] [nvarchar](50) NOT NULL,
	[itemId] [nvarchar](50) NOT NULL,
	[type] [nvarchar](100) NOT NULL,
	[value] [float] NULL,
	[unit] [nvarchar](20) NULL,
	[lastReading] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 22/08/2025 15:49:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [nvarchar](100) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[displayName] [nvarchar](255) NULL,
	[photoURL] [nvarchar](max) NULL,
	[role] [nvarchar](50) NOT NULL,
	[lastLoginAt] [datetime2](7) NOT NULL,
	[permissions] [nvarchar](max) NULL,
	[accessibleBuildingIds] [nvarchar](max) NULL,
	[preferences] [nvarchar](max) NULL,
	[modelo] [nvarchar](100) NULL,
	[preco] [float] NULL,
	[trellisId] [nvarchar](100) NULL,
	[tamanhoU] [int] NULL,
	[potenciaW] [int] NULL,
	[isTestData] [bit] NOT NULL,
	[signatureUrl] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
INSERT [dbo].[Approvals] ([id], [entityType], [entityId], [requestedByUserId], [requestedByUserDisplayName], [requestedAt], [status], [details], [resolvedByUserId], [resolvedByUserDisplayName], [resolvedAt], [resolverNotes]) VALUES (N'appr_1755109946324', N'parent_items', N'item_1753739146663', N'bIG0LVYH9paPEzBfayjU699tuxE2', NULL, CAST(N'2025-08-13T18:32:26.4866667' AS DateTime2), N'approved', N'{"from":"draft","to":"active"}', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-14T17:36:08.7233333' AS DateTime2), N'teste de aprovação')
INSERT [dbo].[Approvals] ([id], [entityType], [entityId], [requestedByUserId], [requestedByUserDisplayName], [requestedAt], [status], [details], [resolvedByUserId], [resolvedByUserDisplayName], [resolvedAt], [resolverNotes]) VALUES (N'appr_1755199863647', N'parent_items', N'item_1753739146663', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-14T19:31:03.8266667' AS DateTime2), N'approved', N'{"from":"draft","to":"active"}', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-14T19:31:36.0166667' AS DateTime2), NULL)
INSERT [dbo].[Approvals] ([id], [entityType], [entityId], [requestedByUserId], [requestedByUserDisplayName], [requestedAt], [status], [details], [resolvedByUserId], [resolvedByUserDisplayName], [resolvedAt], [resolverNotes]) VALUES (N'appr_1755200012834', N'parent_items', N'item_1753739146663', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-14T19:33:33.1333333' AS DateTime2), N'approved', N'{"from":"active","to":"maintenance"}', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-14T21:11:55.3800000' AS DateTime2), NULL)
INSERT [dbo].[Approvals] ([id], [entityType], [entityId], [requestedByUserId], [requestedByUserDisplayName], [requestedAt], [status], [details], [resolvedByUserId], [resolvedByUserDisplayName], [resolvedAt], [resolverNotes]) VALUES (N'appr_1755205933669', N'parent_items', N'item_1753739146663', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-14T21:12:13.7500000' AS DateTime2), N'rejected', N'{"from":"maintenance","to":"active"}', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-14T21:13:20.6700000' AS DateTime2), NULL)
INSERT [dbo].[Approvals] ([id], [entityType], [entityId], [requestedByUserId], [requestedByUserDisplayName], [requestedAt], [status], [details], [resolvedByUserId], [resolvedByUserDisplayName], [resolvedAt], [resolverNotes]) VALUES (N'appr_1755279419134', N'child_items', N'citem_1755279025220', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-15T17:36:59.2100000' AS DateTime2), N'rejected', N'{"from":"draft","to":"active"}', N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', CAST(N'2025-08-15T17:37:32.5600000' AS DateTime2), N'nda a dizer')
GO
SET IDENTITY_INSERT [dbo].[AuditLog] ON 

INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (670, CAST(N'2025-08-15T16:37:16.9700000' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'item_1753739146663', N'{"x":{"old":4,"new":5},"y":{"old":2,"new":2}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (671, CAST(N'2025-08-15T16:37:23.1466667' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"x":{"old":3,"new":4},"y":{"old":2,"new":4}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (672, CAST(N'2025-08-15T17:30:29.6766667' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_CREATED', N'child_items', N'citem_1755279025220', N'{"id":"citem_1755279025220","label":"SWPABLM-01","type":"Switch","modelo":"Catalyst 9300 48-port","brand":"Cisco","parentId":"pitem_1755025212787","status":"draft","posicaoU":10,"tamanhoU":1}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (673, CAST(N'2025-08-15T17:37:32.7533333' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'APPROVAL_REJECTED', N'Approvals', N'appr_1755279419134', N'{"item":"citem_1755279025220","itemType":"child_items","decision":"rejected","notes":"nda a dizer"}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (674, CAST(N'2025-08-15T18:33:23.0400000' AS DateTime2), N'system_admin', N'System Admin', N'USER_DELETED', N'User', N'user_1722384661021', N'{"email":"manager@example.com","displayName":"Maria Gerente (Teste)"}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (675, CAST(N'2025-08-15T18:34:35.5500000' AS DateTime2), N'system_admin', N'System Admin', N'USER_CREATED', N'User', N'p66utzeIl5QlvzQUpeyyKLwzrER2', N'{"data":{"email":"testeusuarionovo@exeplo.com","role":"technician_1"}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (676, CAST(N'2025-08-15T20:30:27.7000000' AS DateTime2), N'system_admin', N'System Admin', N'USER_UPDATED', N'User', N'p66utzeIl5QlvzQUpeyyKLwzrER2', N'{"data":{"email":"testeusuarionovo@exeplo.com","role":"technician_1"}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (677, CAST(N'2025-08-15T20:54:04.6866667' AS DateTime2), N'p66utzeIl5QlvzQUpeyyKLwzrER2', N'teste de usuario novo', N'CONNECTION_CREATED', N'Connections', N'conn_1755291244388', N'{"from":"eport_citem_1755279025220_1","to":"eport_citem_1755279025220_10","type":"conn_utp","status":"active"}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (678, CAST(N'2025-08-15T20:54:16.5966667' AS DateTime2), N'p66utzeIl5QlvzQUpeyyKLwzrER2', N'teste de usuario novo', N'CONNECTION_DELETED', N'Connections', N'conn_1755291244388', N'{"from":"eport_citem_1755279025220_1","to":"eport_citem_1755279025220_10"}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (679, CAST(N'2025-08-18T22:52:19.7966667' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'CONNECTION_CREATED', N'Connections', N'conn_1755557539270', N'{"from":"eport_citem_1755279025220_1","to":null,"type":"conn_utp","status":"unresolved"}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (680, CAST(N'2025-08-18T23:35:17.9333333' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"y":{"old":4,"new":5},"x":{"old":4,"new":4}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (681, CAST(N'2025-08-18T23:35:32.4400000' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"x":{"old":4,"new":3},"y":{"old":5,"new":4}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (682, CAST(N'2025-08-18T23:38:23.6633333' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"y":{"old":4,"new":2},"x":{"old":3,"new":3}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (683, CAST(N'2025-08-18T23:39:13.7000000' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"x":{"old":3,"new":4},"y":{"old":2,"new":2}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (684, CAST(N'2025-08-18T23:40:23.0966667' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"y":{"old":2,"new":3},"x":{"old":4,"new":4}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (685, CAST(N'2025-08-18T23:40:29.7000000' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"y":{"old":3,"new":2},"x":{"old":4,"new":4}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (686, CAST(N'2025-08-18T23:40:54.2633333' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"y":{"old":2,"new":3},"x":{"old":4,"new":4}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (687, CAST(N'2025-08-18T23:40:57.3933333' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'pitem_1755025212787', N'{"y":{"old":3,"new":2},"x":{"old":4,"new":4}}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (688, CAST(N'2025-08-19T21:44:46.2900000' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'EVIDENCE_ADDED', N'Incidents', N'inc_1755557539397', N'{"evidenceType":"note","text":"teste"}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (689, CAST(N'2025-08-19T21:47:10.3133333' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'EVIDENCE_ADDED', N'Incidents', N'inc_1755557539397', N'{"evidenceType":"image","url":"https://infravisionstorage.blob.core.windows.net/infravision-images/evidence-incident-inc_1755557539397-1755640033111.jpg"}')
INSERT [dbo].[AuditLog] ([id], [timestamp], [userId], [userDisplayName], [action], [entityType], [entityId], [details]) VALUES (690, CAST(N'2025-08-20T19:06:12.4700000' AS DateTime2), N'bIG0LVYH9paPEzBfayjU699tuxE2', N'Davidson Santos Conceição', N'ITEM_UPDATED', N'parent_items', N'item_1722383173367', N'{"roomId":{"old":null,"new":"R1753383480097"},"x":{"old":2,"new":6},"y":{"old":1,"new":8}}')
SET IDENTITY_INSERT [dbo].[AuditLog] OFF
GO
INSERT [dbo].[Buildings] ([id], [name], [address], [isTestData]) VALUES (N'B1722382574515', N'Prédio de Teste SP-01', N'Rua do Teste, 123, São Paulo', 1)
INSERT [dbo].[Buildings] ([id], [name], [address], [isTestData]) VALUES (N'B1722382604646', N'Prédio de Teste RJ-01', N'Avenida de Teste, 456, Rio de Janeiro', 1)
INSERT [dbo].[Buildings] ([id], [name], [address], [isTestData]) VALUES (N'B1753382923932', N'SACBLM', N'Belen Sac', 0)
GO
INSERT [dbo].[child_items] ([id], [label], [parentId], [type], [status], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [posicaoU], [isTestData]) VALUES (N'citem_001', N'SW-CORE-TESTE-01', N'pitem_001', N'Switch', N'active', NULL, N'Cisco', NULL, NULL, NULL, NULL, NULL, NULL, N'Catalyst 9300 48-port', NULL, NULL, 1, 40, 1)
INSERT [dbo].[child_items] ([id], [label], [parentId], [type], [status], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [posicaoU], [isTestData]) VALUES (N'citem_002', N'SRV-WEB-TESTE-01', N'pitem_001', N'Servidor', N'active', NULL, N'Dell EMC', NULL, NULL, NULL, NULL, NULL, NULL, N'PowerEdge R740', NULL, NULL, 2, 20, 1)
INSERT [dbo].[child_items] ([id], [label], [parentId], [type], [status], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [posicaoU], [isTestData]) VALUES (N'citem_003', N'DIO-TESTE-01-A', N'pitem_002', N'Patch Panel', N'active', NULL, N'Furukawa', NULL, NULL, NULL, NULL, NULL, NULL, N'DIO 24 Fibras LC Duplex', NULL, NULL, 1, 41, 1)
INSERT [dbo].[child_items] ([id], [label], [parentId], [type], [status], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [posicaoU], [isTestData]) VALUES (N'citem_004', N'PDU-TESTE-01-L', N'pitem_001', N'PDU', N'active', NULL, N'Vertiv', NULL, NULL, NULL, NULL, NULL, NULL, N'Liebert MPH2 Vertical PDU', NULL, NULL, 0, 1, 1)
INSERT [dbo].[child_items] ([id], [label], [parentId], [type], [status], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [posicaoU], [isTestData]) VALUES (N'citem_1755279025220', N'SWPABLM-01', N'pitem_1755025212787', N'Switch', N'draft', NULL, N'Cisco', NULL, NULL, NULL, NULL, NULL, NULL, N'Catalyst 9300 48-port', NULL, NULL, 1, 10, 0)
GO
INSERT [dbo].[Connections] ([id], [portA_id], [portB_id], [connectionTypeId], [status], [isTestData], [imageUrl], [labelText]) VALUES (N'conn_1755123174803', N'eport_citem_002_5', N'eport_citem_001_10', N'conn_utp', N'active', 1, N'https://infravisionstorage.blob.core.windows.net/infravision-images/connection-eport_citem_002_5-eport_citem_001_10.jpeg', N'teste de evidencia em conexão')
INSERT [dbo].[Connections] ([id], [portA_id], [portB_id], [connectionTypeId], [status], [isTestData], [imageUrl], [labelText]) VALUES (N'conn_1755127178538', N'eport_citem_001_11', N'eport_citem_002_6', N'conn_utp', N'active', 0, NULL, NULL)
INSERT [dbo].[Connections] ([id], [portA_id], [portB_id], [connectionTypeId], [status], [isTestData], [imageUrl], [labelText]) VALUES (N'conn_1755186532165', N'eport_citem_002_1', NULL, N'conn_utp', N'unresolved', 0, NULL, NULL)
INSERT [dbo].[Connections] ([id], [portA_id], [portB_id], [connectionTypeId], [status], [isTestData], [imageUrl], [labelText]) VALUES (N'conn_1755557539270', N'eport_citem_1755279025220_1', NULL, N'conn_utp', N'unresolved', 0, NULL, NULL)
INSERT [dbo].[Connections] ([id], [portA_id], [portB_id], [connectionTypeId], [status], [isTestData], [imageUrl], [labelText]) VALUES (N'conn_test_001', N'eport_citem_001_1', N'eport_citem_002_3', N'conn_utp', N'active', 1, NULL, NULL)
GO
INSERT [dbo].[ConnectionTypes] ([id], [name], [description], [isDefault]) VALUES (N'conn_coaxial', N'Coaxial', N'Cabo coaxial para rádio frequência.', 0)
INSERT [dbo].[ConnectionTypes] ([id], [name], [description], [isDefault]) VALUES (N'conn_fiber_mm', N'Fibra Óptica (MM)', N'Cabo de fibra óptica multimodo.', 0)
INSERT [dbo].[ConnectionTypes] ([id], [name], [description], [isDefault]) VALUES (N'conn_fiber_sm', N'Fibra Óptica (SM)', N'Cabo de fibra óptica monomodo.', 0)
INSERT [dbo].[ConnectionTypes] ([id], [name], [description], [isDefault]) VALUES (N'conn_power_ac', N'Energia AC', N'Cabo de alimentação de corrente alternada.', 0)
INSERT [dbo].[ConnectionTypes] ([id], [name], [description], [isDefault]) VALUES (N'conn_power_dc', N'Energia DC', N'Cabo de alimentação de corrente contínua.', 0)
INSERT [dbo].[ConnectionTypes] ([id], [name], [description], [isDefault]) VALUES (N'conn_utp', N'Dados UTP', N'Cabo de par trançado para redes Ethernet.', 1)
GO
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_1', N'citem_001', N'port_rj45', N'RJ45-1', N'up', N'eport_citem_002_3', NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_10', N'citem_001', N'port_rj45', N'RJ45-10', N'up', N'eport_citem_002_5', NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_11', N'citem_001', N'port_rj45', N'RJ45-11', N'up', N'eport_citem_002_6', NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_12', N'citem_001', N'port_rj45', N'RJ45-12', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_13', N'citem_001', N'port_rj45', N'RJ45-13', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_14', N'citem_001', N'port_rj45', N'RJ45-14', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_15', N'citem_001', N'port_rj45', N'RJ45-15', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_16', N'citem_001', N'port_rj45', N'RJ45-16', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_17', N'citem_001', N'port_rj45', N'RJ45-17', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_18', N'citem_001', N'port_rj45', N'RJ45-18', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_19', N'citem_001', N'port_rj45', N'RJ45-19', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_2', N'citem_001', N'port_rj45', N'RJ45-2', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_20', N'citem_001', N'port_rj45', N'RJ45-20', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_21', N'citem_001', N'port_rj45', N'RJ45-21', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_22', N'citem_001', N'port_rj45', N'RJ45-22', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_23', N'citem_001', N'port_rj45', N'RJ45-23', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_24', N'citem_001', N'port_rj45', N'RJ45-24', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_25', N'citem_001', N'port_rj45', N'RJ45-25', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_26', N'citem_001', N'port_rj45', N'RJ45-26', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_27', N'citem_001', N'port_rj45', N'RJ45-27', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_28', N'citem_001', N'port_rj45', N'RJ45-28', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_29', N'citem_001', N'port_rj45', N'RJ45-29', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_3', N'citem_001', N'port_rj45', N'RJ45-3', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_30', N'citem_001', N'port_rj45', N'RJ45-30', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_31', N'citem_001', N'port_rj45', N'RJ45-31', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_32', N'citem_001', N'port_rj45', N'RJ45-32', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_33', N'citem_001', N'port_rj45', N'RJ45-33', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_34', N'citem_001', N'port_rj45', N'RJ45-34', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_35', N'citem_001', N'port_rj45', N'RJ45-35', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_36', N'citem_001', N'port_rj45', N'RJ45-36', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_37', N'citem_001', N'port_rj45', N'RJ45-37', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_38', N'citem_001', N'port_rj45', N'RJ45-38', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_39', N'citem_001', N'port_rj45', N'RJ45-39', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_4', N'citem_001', N'port_rj45', N'RJ45-4', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_40', N'citem_001', N'port_rj45', N'RJ45-40', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_41', N'citem_001', N'port_rj45', N'RJ45-41', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_42', N'citem_001', N'port_rj45', N'RJ45-42', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_43', N'citem_001', N'port_rj45', N'RJ45-43', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_44', N'citem_001', N'port_rj45', N'RJ45-44', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_45', N'citem_001', N'port_rj45', N'RJ45-45', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_46', N'citem_001', N'port_rj45', N'RJ45-46', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_47', N'citem_001', N'port_rj45', N'RJ45-47', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_48', N'citem_001', N'port_rj45', N'RJ45-48', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_49', N'citem_001', N'port_sfp+', N'SFP-1', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_5', N'citem_001', N'port_rj45', N'RJ45-5', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_50', N'citem_001', N'port_sfp+', N'SFP-2', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_51', N'citem_001', N'port_sfp+', N'SFP-3', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_52', N'citem_001', N'port_sfp+', N'SFP-4', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_6', N'citem_001', N'port_rj45', N'RJ45-6', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_7', N'citem_001', N'port_rj45', N'RJ45-7', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_8', N'citem_001', N'port_rj45', N'RJ45-8', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_001_9', N'citem_001', N'port_rj45', N'RJ45-9', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_002_1', N'citem_002', N'port_rj45_mgmt', N'RJ45MGMT-1', N'up', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_002_2', N'citem_002', N'port_rj45_mgmt', N'RJ45MGMT-2', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_002_3', N'citem_002', N'port_sfp+', N'SFP-1', N'up', N'eport_citem_001_1', NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_002_4', N'citem_002', N'port_sfp+', N'SFP-2', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_002_5', N'citem_002', N'port_rj45', N'RJ45-1', N'up', N'eport_citem_001_10', NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_002_6', N'citem_002', N'port_rj45', N'RJ45-2', N'up', N'eport_citem_001_11', NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_002_7', N'citem_002', N'port_idrac', N'IDRAC-1', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_002_8', N'citem_002', N'port_vga', N'VGA-1', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_1', N'citem_004', N'port_c13', N'C13-1', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_10', N'citem_004', N'port_c13', N'C13-10', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_11', N'citem_004', N'port_c13', N'C13-11', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_12', N'citem_004', N'port_c13', N'C13-12', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_13', N'citem_004', N'port_c13', N'C13-13', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_14', N'citem_004', N'port_c13', N'C13-14', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_15', N'citem_004', N'port_c13', N'C13-15', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_16', N'citem_004', N'port_c13', N'C13-16', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_17', N'citem_004', N'port_c13', N'C13-17', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_18', N'citem_004', N'port_c13', N'C13-18', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_19', N'citem_004', N'port_c13', N'C13-19', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_2', N'citem_004', N'port_c13', N'C13-2', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_20', N'citem_004', N'port_c13', N'C13-20', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_21', N'citem_004', N'port_c13', N'C13-21', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_22', N'citem_004', N'port_c13', N'C13-22', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_23', N'citem_004', N'port_c13', N'C13-23', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_24', N'citem_004', N'port_c13', N'C13-24', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_25', N'citem_004', N'port_c19', N'C19-1', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_26', N'citem_004', N'port_c19', N'C19-2', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_27', N'citem_004', N'port_c19', N'C19-3', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_28', N'citem_004', N'port_c19', N'C19-4', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_29', N'citem_004', N'port_c19', N'C19-5', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_3', N'citem_004', N'port_c13', N'C13-3', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_30', N'citem_004', N'port_c19', N'C19-6', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_4', N'citem_004', N'port_c13', N'C13-4', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_5', N'citem_004', N'port_c13', N'C13-5', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_6', N'citem_004', N'port_c13', N'C13-6', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_7', N'citem_004', N'port_c13', N'C13-7', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_8', N'citem_004', N'port_c13', N'C13-8', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_004_9', N'citem_004', N'port_c13', N'C13-9', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_1', N'citem_1755279025220', N'port_rj45', N'RJ45-1', N'up', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_10', N'citem_1755279025220', N'port_rj45', N'RJ45-10', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_11', N'citem_1755279025220', N'port_rj45', N'RJ45-11', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_12', N'citem_1755279025220', N'port_rj45', N'RJ45-12', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_13', N'citem_1755279025220', N'port_rj45', N'RJ45-13', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_14', N'citem_1755279025220', N'port_rj45', N'RJ45-14', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_15', N'citem_1755279025220', N'port_rj45', N'RJ45-15', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_16', N'citem_1755279025220', N'port_rj45', N'RJ45-16', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_17', N'citem_1755279025220', N'port_rj45', N'RJ45-17', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_18', N'citem_1755279025220', N'port_rj45', N'RJ45-18', N'down', NULL, NULL)
GO
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_19', N'citem_1755279025220', N'port_rj45', N'RJ45-19', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_2', N'citem_1755279025220', N'port_rj45', N'RJ45-2', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_20', N'citem_1755279025220', N'port_rj45', N'RJ45-20', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_21', N'citem_1755279025220', N'port_rj45', N'RJ45-21', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_22', N'citem_1755279025220', N'port_rj45', N'RJ45-22', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_23', N'citem_1755279025220', N'port_rj45', N'RJ45-23', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_24', N'citem_1755279025220', N'port_rj45', N'RJ45-24', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_25', N'citem_1755279025220', N'port_rj45', N'RJ45-25', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_26', N'citem_1755279025220', N'port_rj45', N'RJ45-26', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_27', N'citem_1755279025220', N'port_rj45', N'RJ45-27', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_28', N'citem_1755279025220', N'port_rj45', N'RJ45-28', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_29', N'citem_1755279025220', N'port_rj45', N'RJ45-29', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_3', N'citem_1755279025220', N'port_rj45', N'RJ45-3', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_30', N'citem_1755279025220', N'port_rj45', N'RJ45-30', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_31', N'citem_1755279025220', N'port_rj45', N'RJ45-31', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_32', N'citem_1755279025220', N'port_rj45', N'RJ45-32', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_33', N'citem_1755279025220', N'port_rj45', N'RJ45-33', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_34', N'citem_1755279025220', N'port_rj45', N'RJ45-34', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_35', N'citem_1755279025220', N'port_rj45', N'RJ45-35', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_36', N'citem_1755279025220', N'port_rj45', N'RJ45-36', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_37', N'citem_1755279025220', N'port_rj45', N'RJ45-37', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_38', N'citem_1755279025220', N'port_rj45', N'RJ45-38', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_39', N'citem_1755279025220', N'port_rj45', N'RJ45-39', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_4', N'citem_1755279025220', N'port_rj45', N'RJ45-4', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_40', N'citem_1755279025220', N'port_rj45', N'RJ45-40', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_41', N'citem_1755279025220', N'port_rj45', N'RJ45-41', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_42', N'citem_1755279025220', N'port_rj45', N'RJ45-42', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_43', N'citem_1755279025220', N'port_rj45', N'RJ45-43', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_44', N'citem_1755279025220', N'port_rj45', N'RJ45-44', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_45', N'citem_1755279025220', N'port_rj45', N'RJ45-45', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_46', N'citem_1755279025220', N'port_rj45', N'RJ45-46', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_47', N'citem_1755279025220', N'port_rj45', N'RJ45-47', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_48', N'citem_1755279025220', N'port_rj45', N'RJ45-48', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_49', N'citem_1755279025220', N'port_sfp+', N'SFP-1', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_5', N'citem_1755279025220', N'port_rj45', N'RJ45-5', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_50', N'citem_1755279025220', N'port_sfp+', N'SFP-2', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_51', N'citem_1755279025220', N'port_sfp+', N'SFP-3', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_52', N'citem_1755279025220', N'port_sfp+', N'SFP-4', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_6', N'citem_1755279025220', N'port_rj45', N'RJ45-6', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_7', N'citem_1755279025220', N'port_rj45', N'RJ45-7', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_8', N'citem_1755279025220', N'port_rj45', N'RJ45-8', N'down', NULL, NULL)
INSERT [dbo].[equipment_ports] ([id], [childItemId], [portTypeId], [label], [status], [connectedToPortId], [notes]) VALUES (N'eport_citem_1755279025220_9', N'citem_1755279025220', N'port_rj45', N'RJ45-9', N'down', NULL, NULL)
GO
INSERT [dbo].[Evidence] ([id], [timestamp], [type], [data], [entityId], [entityType], [userId]) VALUES (N'evid_1755639886107', CAST(N'2025-08-19T21:44:46.1733333' AS DateTime2), N'note', N'{"text":"teste"}', N'inc_1755557539397', N'Incidents', N'bIG0LVYH9paPEzBfayjU699tuxE2')
INSERT [dbo].[Evidence] ([id], [timestamp], [type], [data], [entityId], [entityType], [userId]) VALUES (N'evid_1755640030128', CAST(N'2025-08-19T21:47:10.2033333' AS DateTime2), N'image', N'{"url":"https://infravisionstorage.blob.core.windows.net/infravision-images/evidence-incident-inc_1755557539397-1755640033111.jpg"}', N'inc_1755557539397', N'Incidents', N'bIG0LVYH9paPEzBfayjU699tuxE2')
GO
INSERT [dbo].[Incidents] ([id], [description], [detectedAt], [severityId], [statusId], [resolvedAt], [entityType], [entityId], [typeId], [notes], [imageUrl]) VALUES (N'inc_1755127178668', N'Conexão da porta ''RJ45-11'' no equipamento ''SW-CORE-TESTE-01'' precisa ser resolvida.', CAST(N'2025-08-13T23:19:38.8620000' AS DateTime2), N'medium', N'resolved', CAST(N'2025-08-14T13:14:55.4166667' AS DateTime2), N'Connections', N'conn_1755127178538', N'data_integrity', NULL, NULL)
INSERT [dbo].[Incidents] ([id], [description], [detectedAt], [severityId], [statusId], [resolvedAt], [entityType], [entityId], [typeId], [notes], [imageUrl]) VALUES (N'inc_1755186532291', N'Conexão da porta ''RJ45MGMT-1'' no equipamento ''SRV-WEB-TESTE-01'' precisa ser resolvida.', CAST(N'2025-08-14T15:48:52.4780000' AS DateTime2), N'medium', N'open', NULL, N'Connections', N'conn_1755186532165', N'data_integrity', NULL, NULL)
INSERT [dbo].[Incidents] ([id], [description], [detectedAt], [severityId], [statusId], [resolvedAt], [entityType], [entityId], [typeId], [notes], [imageUrl]) VALUES (N'inc_1755557539397', N'Conexão da porta ''RJ45-1'' no equipamento ''SWPABLM-01'' precisa ser resolvida.', CAST(N'2025-08-18T22:52:19.5880000' AS DateTime2), N'medium', N'open', NULL, N'Connections', N'conn_1755557539270', N'data_integrity', NULL, NULL)
INSERT [dbo].[Incidents] ([id], [description], [detectedAt], [severityId], [statusId], [resolvedAt], [entityType], [entityId], [typeId], [notes], [imageUrl]) VALUES (N'INC-001', N'Atividade de login incomum detectada para conta de administrador.', CAST(N'2025-07-21T17:58:45.0000000' AS DateTime2), N'medium', N'open', NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Incidents] ([id], [description], [detectedAt], [severityId], [statusId], [resolvedAt], [entityType], [entityId], [typeId], [notes], [imageUrl]) VALUES (N'INC-002', N'Varredura de portas detectada de um endereço IP desconhecido.', CAST(N'2025-07-21T16:58:45.0000000' AS DateTime2), N'medium', N'open', NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Incidents] ([id], [description], [detectedAt], [severityId], [statusId], [resolvedAt], [entityType], [entityId], [typeId], [notes], [imageUrl]) VALUES (N'INC-003', N'Uso de CPU do servidor de produção em 98% por 30 minutos.', CAST(N'2025-07-20T17:58:45.0000000' AS DateTime2), N'medium', N'open', NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Incidents] ([id], [description], [detectedAt], [severityId], [statusId], [resolvedAt], [entityType], [entityId], [typeId], [notes], [imageUrl]) VALUES (N'INC-004', N'Falha no backup do banco de dados de homologação.', CAST(N'2025-07-19T17:58:45.0000000' AS DateTime2), N'medium', N'open', NULL, NULL, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[IncidentSeverities] ([id], [name], [description], [color], [rank], [isDefault]) VALUES (N'critical', N'Crítica', N'Impacto sistêmico, requer atenção imediata.', N'red', 1, 1)
INSERT [dbo].[IncidentSeverities] ([id], [name], [description], [color], [rank], [isDefault]) VALUES (N'high', N'Alta', N'Impacto significativo em uma função principal.', N'orange', 2, 1)
INSERT [dbo].[IncidentSeverities] ([id], [name], [description], [color], [rank], [isDefault]) VALUES (N'low', N'Baixa', N'Impacto mínimo, geralmente informativo.', N'blue', 4, 1)
INSERT [dbo].[IncidentSeverities] ([id], [name], [description], [color], [rank], [isDefault]) VALUES (N'medium', N'Média', N'Impacto moderado, função degradada.', N'yellow', 3, 1)
GO
INSERT [dbo].[IncidentStatuses] ([id], [name], [description], [color], [iconName], [isDefault]) VALUES (N'closed', N'Fechado', N'O incidente foi resolvido e verificado.', N'gray', N'CheckCircle', 1)
INSERT [dbo].[IncidentStatuses] ([id], [name], [description], [color], [iconName], [isDefault]) VALUES (N'investigating', N'Investigando', N'O incidente está sendo ativamente investigado.', N'yellow', N'Clock', 1)
INSERT [dbo].[IncidentStatuses] ([id], [name], [description], [color], [iconName], [isDefault]) VALUES (N'open', N'Aberto', N'O incidente foi registrado e aguarda análise.', N'blue', N'Info', 1)
INSERT [dbo].[IncidentStatuses] ([id], [name], [description], [color], [iconName], [isDefault]) VALUES (N'resolved', N'Resolvido', N'A causa raiz foi encontrada e uma solução foi aplicada.', N'green', N'CheckCircle', 1)
GO
INSERT [dbo].[IncidentTypes] ([id], [name], [description], [defaultSeverityId], [isDefault]) VALUES (N'data_integrity', N'Integridade de Dados', N'Inconsistências ou dados ausentes no sistema.', N'medium', 1)
INSERT [dbo].[IncidentTypes] ([id], [name], [description], [defaultSeverityId], [isDefault]) VALUES (N'operational_alert', N'Alerta Operacional', N'Alertas gerados por sensores ou monitoramento físico.', N'high', 1)
GO
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'active', N'Ativo', N'Item está em operação normal.', N'green', 0, 1)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'aposentado', N'Aposentado', N'Item permanentemente aposentado.', N'red', 1, 1)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'decommissioned', N'Descomissionado', N'Item foi retirado de operação e está na lixeira.', N'gray', 1, 1)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'deleted', N'Excluído', N'Item foi permanentemente removido (uso interno).', N'red', 1, 1)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'draft', N'Rascunho', N'Item está sendo criado e não é visível para todos.', N'amber', 0, 1)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'maintenance', N'Em Manutenção', N'Item está temporariamente offline para manutenção.', N'orange', 0, 1)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'pending_approval', N'Pendente', N'Item aguarda aprovação de um gerente para se tornar ativo.', N'yellow', 0, 1)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'rejected', N'Rejeitado', N'Item rejeitado na aprovação, aguardando correção.', N'red', 0, 1)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'status_1722384196145', N'Aguardando Peças', N'Item aguardando a chegada de peças para reparo.', N'sky', 0, 0)
INSERT [dbo].[ItemStatuses] ([id], [name], [description], [color], [isArchived], [isDefault]) VALUES (N'status_1722384214434', N'Em Testes', N'Item em fase de testes após manutenção ou instalação.', N'violet', 0, 0)
GO
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_1722383794354', N'Switch de Rede', N'Rede', 0.48, 0.044, N'Network', 0, 1, N'deleted', NULL, 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_1753714242558', N'Cilindro FM200', N'Segurança', 0.4, 0.4, N'Flame', 0, 0, N'active', N'#c026d3', 0, N'circle', 0.4, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_ac_default', N'Ar Condicionado de Precisão', N'Climatização', 0.8, 2, N'Snowflake', 0, 1, N'active', NULL, 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_ac_row', N'Ar Condicionado In-Row', N'Climatização', 0.3, 1, N'Snowflake', 0, 0, N'active', N'#64748b', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_ats', N'ATS', N'Energia', 0.6, 0.6, N'Power', 0, 0, N'active', N'#dc2626', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_clima_fc', N'Unidade de Climatização (CLIMA FC)', N'Climatização', 1.2, 1.2, N'Fan', 0, 0, N'active', N'#34d399', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_cmc', N'CMC (Chassis Controller)', N'Gerenciamento', 0.5, 0.5, N'Server', 1, 0, N'active', N'#6366f1', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_patchpanel_default', N'Patch Panel', N'Redes', 0.48, 0.04, N'PanelTop', 0, 0, N'deleted', NULL, 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_pdi', N'Painel de Incêndio (PDI)', N'Segurança', 0.6, 0.6, N'ShieldAlert', 0, 0, N'active', N'#a855f7', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_pdu', N'PDU', N'Energia', 0.8, 0.1, N'Plug', 0, 1, N'active', N'#ef4444', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_pdu_floor', N'PDU de Piso', N'Energia', 0.6, 0.3, N'Power', 0, 0, N'active', N'#ef4444', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_qdf', N'QDF', N'Cabeamento', 0.8, 0.6, N'Network', 1, 0, N'active', N'#f97316', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_qdf_default', N'Quadro de Distribuição', N'Elétrica', 0.8, 1.2, N'Router', 0, 1, N'active', NULL, 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_rack_22u', N'Rack 22U', N'Gabinetes', 0.6, 1, N'Box', 1, 1, N'active', N'#60a5fa', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_rack_default', N'Rack 42U', N'Gabinetes', 0.6, 1.2, N'Box', 1, 1, N'active', N'#3b82f6', 0, N'rectangle', NULL, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_sdf', N'Detector de Fumaça (SDF)', N'Segurança', 0.15, 0.15, N'Cloud', 0, 0, N'active', N'#a855f7', 0, N'circle', 0.15, 0)
INSERT [dbo].[item_types] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [canHaveChildren], [isResizable], [status], [defaultColor], [isTestData], [shape], [defaultRadiusM], [isDefault]) VALUES (N'type_switch_default', N'Switch de Acesso', N'Redes', 0.48, 0.04, N'Network', 0, 0, N'deleted', NULL, 0, N'rectangle', NULL, 0)
GO
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_firewall', N'Firewall', N'Segurança de Rede', 0, 0, N'ShieldCheck', N'active', 0, NULL)
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_patch', N'Patch Panel', N'Cabeamento', 0, 0, N'PanelTop', N'active', 0, NULL)
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_pdu', N'PDU', N'Energia', 0, 0, N'Power', N'active', 0, NULL)
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_pdu_rack', N'PDU de Rack', N'Energia', 0, 0, N'Power', N'active', 0, NULL)
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_server', N'Servidor', N'Equipamentos de TI', 0, 0, N'HardDrive', N'active', 0, NULL)
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_storage', N'Storage', N'Armazenamento', 0, 0, N'Database', N'active', 0, NULL)
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_switch', N'Switch', N'Equipamentos de Rede', 0, 0, N'Network', N'active', 0, NULL)
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_telecom', N'Equipamento Telecom', N'Equipamentos de Telecom', 0, 0, N'Router', N'active', 0, NULL)
INSERT [dbo].[item_typesEqp] ([id], [name], [category], [defaultWidthM], [defaultHeightM], [iconName], [status], [isTestData], [defaultColor]) VALUES (N'type_eqp_ups', N'UPS', N'Energia', 0, 0, N'BatteryCharging', N'active', 0, NULL)
GO
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_arista', N'Arista Networks')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_ciena', N'Ciena')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_cisco', N'Cisco')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_commscope', N'CommScope')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_dell', N'Dell EMC')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_eaton', N'Eaton')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_ericsson', N'Ericsson')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_fortinet', N'Fortinet')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_furukawa', N'Furukawa')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_generic', N'Genérico')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_hpe', N'HPE')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_huawei', N'Huawei')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_ibm', N'IBM')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_intel', N'Intel')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_juniper', N'Juniper Networks')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_legrand', N'Legrand')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_netapp', N'NetApp')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_nokia', N'Nokia')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_padtec', N'Padtec')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_paloalto', N'Palo Alto Networks')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_panduit', N'Panduit')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_rittal', N'Rittal')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_schneider', N'Schneider Electric (APC)')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_siemens', N'Siemens')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_supermicro', N'Supermicro')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_tellabs', N'Tellabs')
INSERT [dbo].[Manufacturers] ([id], [name]) VALUES (N'man_vertiv', N'Vertiv')
GO
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_a7050', N'7050SX-64', N'man_arista', N'48xSFP+;4xQSFP+', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_apc_srt5000', N'APC Smart-UPS SRT 5000VA', N'man_schneider', N'8xTomada_20A', 3)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_apc_sx42', N'NetShelter SX 42U', N'man_schneider', NULL, 42)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_asr9k', N'ASR 9000 Series', N'man_cisco', N'8xService_Slot;2xRSP_Slot', 22)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_c3850_24', N'Catalyst 3850 24-port', N'man_cisco', N'24xRJ45;4xSFP+', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_c7000', N'BladeSystem c7000', N'man_hpe', N'10xFAN_Slot;6xPSU_Slot;16xBlade_Slot', 10)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_c9300_48', N'Catalyst 9300 48-port', N'man_cisco', N'48xRJ45;4xSFP+;1xConsole', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_c9500_32', N'Catalyst 9500 32-port 100G', N'man_cisco', N'32xQSFP28', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_cisco_c9300_24', N'Catalyst 9300 24-port', N'man_cisco', N'24xRJ45;4xSFP+;1xConsole', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_cisco_ncs2k6', N'NCS 2006 Chassis', N'man_cisco', N'6xService_Slot;2xController_Slot', 14)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_dl380g10', N'ProLiant DL380 Gen10', N'man_hpe', N'4xRJ45;1xiLO', 2)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_ericsson_6000', N'Router 6000 Series', N'man_ericsson', N'4xInterface_Module', 4)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_ericsson_rtnxmc2', N'RTN XMC-2', N'man_ericsson', N'Multiple_RF_Ports', 2)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_ex4300', N'EX4300', N'man_juniper', N'48xRJ45;4xQSFP+', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_f_dio24', N'DIO 24 Fibras LC Duplex', N'man_furukawa', N'24xLC_Duplex', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_f_dio48', N'DIO 48 Fibras LC Duplex', N'man_furukawa', N'48xLC_Duplex', 2)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_hw_ce12800', N'CloudEngine 12800', N'man_huawei', N'8xService_Slot;4xSwitchFabric_Slot', 16)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_hw_ce6865', N'CloudEngine 6865', N'man_huawei', N'48xSFP28;8xQSFP28', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_juniper_mx204', N'MX204', N'man_juniper', N'4xQSFP28;8xSFP+', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_juniper_mx960', N'MX960 Chassis', N'man_juniper', N'12xService_Slot;2xRoutingEngine_Slot;3xSFB_Slot', 21)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_l_pp24', N'Patch Panel 24 Portas Cat6', N'man_legrand', N'24xRJ45_Keystone', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_l_pp48', N'Patch Panel 48 Portas Cat6', N'man_legrand', N'48xRJ45_Keystone', 2)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_mx7000', N'PowerEdge MX7000', N'man_dell', N'8xPSU_Slot;4xFAN_Slot;8xBlade_Slot', 7)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_n9k_c93', N'Nexus 93180YC-EX', N'man_cisco', N'48xSFP+;6xQSFP+', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_nokia_7750', N'7750 Service Router (SR-1)', N'man_nokia', N'12xSFP+;2xQSFP28', 3)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_padtec_i6400g', N'LightPad i6400G', N'man_padtec', N'16xService_Slot;2xController_Slot', 14)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_padtec_tm800g', N'Transponder 800G', N'man_padtec', N'2xLC_Duplex;4xSFP28', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_panduit_netaccess', N'Net-Access Cabinet', N'man_panduit', N'Rack_Space', 42)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_r640', N'PowerEdge R640', N'man_dell', N'4xRJ45;2xSFP+;1xVGA;2xUSB;1xiDRAC', 1)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_r740', N'PowerEdge R740', N'man_dell', N'2xRJ45_Mgmt;2xSFP+;2xRJ45;1xiDRAC;1xVGA', 2)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_rittal_tsit', N'TS IT Network/Server Rack', N'man_rittal', NULL, 42)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_tellabs_olt1150', N'OLT1150', N'man_tellabs', N'14xPON_Card_Slot;2xUplink_Slot', 8)
INSERT [dbo].[Models] ([id], [name], [manufacturerId], [portConfig], [tamanhoU]) VALUES (N'model_v_pdu_v', N'Liebert MPH2 Vertical PDU', N'man_vertiv', N'24xC13;6xC19', 0)
GO
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'item_1722382897042', N'RACK-A01', 2, 2, 0.6, 1, N'Rack', N'maintenance', NULL, NULL, N'SN-RACK-001', N'Dell', N'ASSET-001', 1, N'infra@example.com', N'http://example.com/rack.pdf', N'Rack principal de servidores', N'https://placehold.co/600x400.png', N'PowerEdge R42', 5000, N'TRELLIS-001', 42, 3000, 0, NULL, NULL, NULL, NULL)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'item_1722383020668', N'AC-01', 0, 5, 0.8, 2, N'Ar Condicionado de Precisão', N'maintenance', NULL, NULL, N'SN-AC-001', N'Stulz', N'ASSET-002', 0, N'infra@example.com', N'http://example.com/ac.pdf', N'Ar condicionado da fileira A', NULL, N'CyberAir 3', 15000, N'TRELLIS-002', NULL, 10000, 0, NULL, NULL, NULL, NULL)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'item_1722383173367', N'RACK-B05', 6, 8, 0.6, 1, N'Rack', N'maintenance', N'R1753383480097', NULL, N'SN-RACK-005', N'HP', N'ASSET-004', 1, N'infra@example.com', NULL, N'Rack de armazenamento', N'https://infravisionstorage.blob.core.windows.net/infravision-images/item-item_1722383173367-1753793875885.jpeg', N'ProLiant DL380', 4500, N'TRELLIS-004', 42, 2800, 0, N'#385dcc', NULL, NULL, NULL)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'item_1722383173368', N'PDU-A01-L', 2, 3, 0.05, 1.8, N'PDU', N'maintenance', NULL, NULL, N'SN-PDU-001', N'APC', N'ASSET-005', 1, N'infra@example.com', N'http://example.com/pdu.pdf', N'PDU Esquerda do Rack A01', N'https://placehold.co/50x180.png', N'AP8853', 1200, N'TRELLIS-005', 42, 17300, 0, NULL, NULL, NULL, NULL)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'item_1753739146663', N'ar 1 teste', 5, 2, 0.6, 1.2, N'Ar Condicionado de Precisão', N'maintenance', N'R1753383480097', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, N'#7773b5', 0.6, 1.2, NULL)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'pitem_001', N'RACK-TESTE-A01', 5, 2, 0, 0, N'Rack 42U', N'active', N'R1722382686121', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 42, NULL, 1, NULL, 0.6, 1.2, NULL)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'pitem_002', N'RACK-TESTE-A02', 2, 5, 0, 0, N'Rack 42U', N'active', N'R1722382686121', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 42, NULL, 1, NULL, 0.6, 1.2, NULL)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'pitem_1755025212787', N'rack 22', 4, 2, 0.6, 1.2, N'Rack 42U', N'maintenance', N'R1753383480097', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, NULL, 42, NULL, 0, N'#3b82f6', 0.6, 1.2, NULL)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'pitem_1755028899456', N'fm200', 7, 3, 0, 0, N'Cilindro FM200', N'draft', N'R1753383480097', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, N'#ff0000', 0.4, 0.4, 0.3)
INSERT [dbo].[parent_items] ([id], [label], [x], [y], [width], [height], [type], [status], [roomId], [parentId], [serialNumber], [brand], [tag], [isTagEligible], [ownerEmail], [dataSheetUrl], [description], [imageUrl], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [color], [widthM], [heightM], [radiusM]) VALUES (N'pitem_1755275857277', N'qdf teste', 0, 0, 0, 0, N'QDF', N'draft', N'R1753383480097', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, N'#f97316', 0.8, 0.6, NULL)
GO
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_c13', N'C13', N'Conector de energia padrão para PDUs.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_c19', N'C19', N'Conector de energia de alta corrente para PDUs.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_e1', N'E1', N'Porta E1/T1 para links de telecomunicações.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_idrac', N'iDRAC', N'Porta de gerenciamento remoto Dell.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_ilo', N'iLO', N'Porta de gerenciamento remoto HPE.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_ipmi', N'IPMI', N'Porta de gerenciamento genérica.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_lc_duplex', N'LC_Duplex', N'Conector duplo de fibra óptica LC.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_nema_5_15r', N'NEMA_5-15R', N'Tomada padrão NEMA 5-15R.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_qsfp+', N'QSFP+', N'Porta 40Gbps QSFP+.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_qsfp28', N'QSFP28', N'Porta 100Gbps QSFP28.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_qsfp-dd', N'QSFP-DD', N'Porta 400Gbps QSFP-DD.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_rj45', N'RJ45', N'Conector de rede padrão para cabos UTP.', 1)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_rj45_mgmt', N'RJ45_Mgmt', N'Porta RJ45 dedicada para gerenciamento.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_sas', N'SAS', N'Porta Serial Attached SCSI para storage.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_sc', N'SC', N'Conector de fibra óptica SC.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_sfp+', N'SFP+', N'Porta 10Gbps SFP.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_sfp28', N'SFP28', N'Porta 25Gbps SFP28.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_st', N'ST', N'Conector de fibra óptica ST.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_stm1', N'STM-1', N'Porta de fibra óptica STM-1.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_usb', N'USB', N'Porta USB padrão.', 0)
INSERT [dbo].[PortTypes] ([id], [name], [description], [isDefault]) VALUES (N'port_vga', N'VGA', N'Conector de vídeo analógico.', 0)
GO
INSERT [dbo].[Rooms] ([id], [name], [buildingId], [depthM], [widthM], [tileWidthCm], [tileHeightCm], [xAxisNaming], [yAxisNaming], [isTestData], [backgroundImageUrl], [backgroundScale], [backgroundPosX], [backgroundPosY], [widthM_new], [depthM_new]) VALUES (N'R1722382686121', N'Sala de Testes 1A', N'B1722382574515', 15, 20, 60, 60, N'alpha', N'numeric', 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Rooms] ([id], [name], [buildingId], [depthM], [widthM], [tileWidthCm], [tileHeightCm], [xAxisNaming], [yAxisNaming], [isTestData], [backgroundImageUrl], [backgroundScale], [backgroundPosX], [backgroundPosY], [widthM_new], [depthM_new]) VALUES (N'R1722382717387', N'Sala de Testes 1B', N'B1722382574515', 8, 10, 60, 60, N'numeric', N'alpha', 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Rooms] ([id], [name], [buildingId], [depthM], [widthM], [tileWidthCm], [tileHeightCm], [xAxisNaming], [yAxisNaming], [isTestData], [backgroundImageUrl], [backgroundScale], [backgroundPosX], [backgroundPosY], [widthM_new], [depthM_new]) VALUES (N'R1722382741544', N'Sala de Testes 2A', N'B1722382604646', 25, 30, 50, 50, N'alpha', N'numeric', 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Rooms] ([id], [name], [buildingId], [depthM], [widthM], [tileWidthCm], [tileHeightCm], [xAxisNaming], [yAxisNaming], [isTestData], [backgroundImageUrl], [backgroundScale], [backgroundPosX], [backgroundPosY], [widthM_new], [depthM_new]) VALUES (N'R1753383463926', N'Switch', N'B1753382923932', 5, 5, 60, 60, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Rooms] ([id], [name], [buildingId], [depthM], [widthM], [tileWidthCm], [tileHeightCm], [xAxisNaming], [yAxisNaming], [isTestData], [backgroundImageUrl], [backgroundScale], [backgroundPosX], [backgroundPosY], [widthM_new], [depthM_new]) VALUES (N'R1753383480097', N'Controle', N'B1753382923932', 10, 10, 60, 60, N'alpha', N'numeric', 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Rooms] ([id], [name], [buildingId], [depthM], [widthM], [tileWidthCm], [tileHeightCm], [xAxisNaming], [yAxisNaming], [isTestData], [backgroundImageUrl], [backgroundScale], [backgroundPosX], [backgroundPosY], [widthM_new], [depthM_new]) VALUES (N'R1753383491302', N'Transporte', N'B1753382923932', 5, 5, 60, 60, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[Users] ([id], [email], [displayName], [photoURL], [role], [lastLoginAt], [permissions], [accessibleBuildingIds], [preferences], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [signatureUrl]) VALUES (N'99Ak71dBJogZbpgT6Lxgl5EVhtu1', N'davidson.php@gmail.com', N'davidson', NULL, N'developer', CAST(N'2025-08-08T22:55:17.2100000' AS DateTime2), N'["*"]', N'[]', N'{}', NULL, NULL, NULL, NULL, NULL, 0, NULL)
INSERT [dbo].[Users] ([id], [email], [displayName], [photoURL], [role], [lastLoginAt], [permissions], [accessibleBuildingIds], [preferences], [modelo], [preco], [trellisId], [tamanhoU], [potenciaW], [isTestData], [signatureUrl]) VALUES (N'bIG0LVYH9paPEzBfayjU699tuxE2', N'davidson.php@outlook.com', N'Davidson Santos Conceição', N'https://infravisionstorage.blob.core.windows.net/infravision-images/photo-bIG0LVYH9paPEzBfayjU699tuxE2.jfif', N'developer', CAST(N'2025-08-21T12:11:42.2790000' AS DateTime2), N'["section:management:view","section:supervisor:view","page:datacenter:view","page:inventory:view","page:connections:view","page:depara:view","page:import:view","page:reports:view","page:users:view","page:permissions:view","page:settings:view","page:buildings:view","page:system:view","page:incidents:view","page:approvals:view","page:audit:view","page:trash:view","item:image:upload","item:delete:draft","item:decommission:active","user:create","user:edit:role","user:edit:permissions"]', N'["B1753382923932"]', N'{"inventoryColumns":{"child":{"preco":false,"ownerEmail":false,"type":false,"modelo":false,"serialNumber":false,"brand":false,"tag":false},"parent":{"serialNumber":false,"ownerEmail":false,"brand":false,"tamanhoU":false,"potenciaW":false,"tag":false,"type":false}}}', NULL, NULL, NULL, NULL, NULL, 0, N'https://infravisionstorage.blob.core.windows.net/infravision-images/signature-bIG0LVYH9paPEzBfayjU699tuxE2.jfif')
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Connecti__A4920CA13CEDA349]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[Connections] ADD UNIQUE NONCLUSTERED 
(
	[portA_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_portA_portB]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[Connections] ADD  CONSTRAINT [UQ_portA_portB] UNIQUE NONCLUSTERED 
(
	[portA_id] ASC,
	[portB_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Connecti__72E12F1B4C2925A2]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[ConnectionTypes] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Incident__72E12F1BFCF5E69C]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[IncidentSeverities] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__Incident__CAA8FCA190F1B37D]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[IncidentSeverities] ADD UNIQUE NONCLUSTERED 
(
	[rank] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Incident__72E12F1BE8B1B64A]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[IncidentStatuses] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Incident__72E12F1B2EFC57C5]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[IncidentTypes] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ItemStat__72E12F1B1C3D1189]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[ItemStatuses] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ItemType__72E12F1B507A2A85]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[item_types] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ItemType__72E12F1B06BFAF50]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[item_typesEqp] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Manufact__72E12F1BA4782764]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[Manufacturers] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Models__F2CA7A23E5224D60]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[Models] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC,
	[manufacturerId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__PortType__72E12F1B10FAD4F8]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[PortTypes] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__AB6E6164DDD857F3]    Script Date: 22/08/2025 15:49:11 ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Approvals] ADD  DEFAULT (getutcdate()) FOR [requestedAt]
GO
ALTER TABLE [dbo].[Approvals] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[AuditLog] ADD  DEFAULT (getutcdate()) FOR [timestamp]
GO
ALTER TABLE [dbo].[Buildings] ADD  DEFAULT ((0)) FOR [isTestData]
GO
ALTER TABLE [dbo].[child_items] ADD  DEFAULT ((0)) FOR [isTestData]
GO
ALTER TABLE [dbo].[Connections] ADD  DEFAULT ('active') FOR [status]
GO
ALTER TABLE [dbo].[Connections] ADD  DEFAULT ((0)) FOR [isTestData]
GO
ALTER TABLE [dbo].[ConnectionTypes] ADD  DEFAULT ((0)) FOR [isDefault]
GO
ALTER TABLE [dbo].[equipment_ports] ADD  DEFAULT ('down') FOR [status]
GO
ALTER TABLE [dbo].[Evidence] ADD  DEFAULT ('unknown') FOR [entityId]
GO
ALTER TABLE [dbo].[Evidence] ADD  DEFAULT ('unknown') FOR [entityType]
GO
ALTER TABLE [dbo].[IncidentSeverities] ADD  DEFAULT ((0)) FOR [isDefault]
GO
ALTER TABLE [dbo].[IncidentStatuses] ADD  DEFAULT ((0)) FOR [isDefault]
GO
ALTER TABLE [dbo].[IncidentTypes] ADD  DEFAULT ((0)) FOR [isDefault]
GO
ALTER TABLE [dbo].[ItemStatuses] ADD  DEFAULT ((0)) FOR [isArchived]
GO
ALTER TABLE [dbo].[ItemStatuses] ADD  DEFAULT ((0)) FOR [isDefault]
GO
ALTER TABLE [dbo].[item_types] ADD  DEFAULT ((0)) FOR [canHaveChildren]
GO
ALTER TABLE [dbo].[item_types] ADD  DEFAULT ((1)) FOR [isResizable]
GO
ALTER TABLE [dbo].[item_types] ADD  DEFAULT ('active') FOR [status]
GO
ALTER TABLE [dbo].[item_types] ADD  DEFAULT ((0)) FOR [isTestData]
GO
ALTER TABLE [dbo].[item_types] ADD  DEFAULT ('rectangle') FOR [shape]
GO
ALTER TABLE [dbo].[item_types] ADD  DEFAULT ((0)) FOR [isDefault]
GO
ALTER TABLE [dbo].[item_typesEqp] ADD  DEFAULT ('active') FOR [status]
GO
ALTER TABLE [dbo].[item_typesEqp] ADD  DEFAULT ((0)) FOR [isTestData]
GO
ALTER TABLE [dbo].[parent_items] ADD  CONSTRAINT [DF_Items_x]  DEFAULT ((-1)) FOR [x]
GO
ALTER TABLE [dbo].[parent_items] ADD  CONSTRAINT [DF_Items_y]  DEFAULT ((-1)) FOR [y]
GO
ALTER TABLE [dbo].[parent_items] ADD  CONSTRAINT [DF_Items_width]  DEFAULT ((0)) FOR [width]
GO
ALTER TABLE [dbo].[parent_items] ADD  CONSTRAINT [DF_Items_height]  DEFAULT ((0)) FOR [height]
GO
ALTER TABLE [dbo].[parent_items] ADD  DEFAULT ((0)) FOR [isTestData]
GO
ALTER TABLE [dbo].[PortTypes] ADD  DEFAULT ((0)) FOR [isDefault]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT ('alpha') FOR [xAxisNaming]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT ('numeric') FOR [yAxisNaming]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT ((0)) FOR [isTestData]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [isTestData]
GO
ALTER TABLE [dbo].[child_items]  WITH NOCHECK ADD FOREIGN KEY([parentId])
REFERENCES [dbo].[parent_items] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Connections]  WITH CHECK ADD FOREIGN KEY([connectionTypeId])
REFERENCES [dbo].[ConnectionTypes] ([id])
GO
ALTER TABLE [dbo].[Connections]  WITH CHECK ADD FOREIGN KEY([portA_id])
REFERENCES [dbo].[equipment_ports] ([id])
GO
ALTER TABLE [dbo].[Connections]  WITH CHECK ADD FOREIGN KEY([portB_id])
REFERENCES [dbo].[equipment_ports] ([id])
GO
ALTER TABLE [dbo].[equipment_ports]  WITH CHECK ADD FOREIGN KEY([childItemId])
REFERENCES [dbo].[child_items] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[equipment_ports]  WITH CHECK ADD FOREIGN KEY([connectedToPortId])
REFERENCES [dbo].[equipment_ports] ([id])
GO
ALTER TABLE [dbo].[equipment_ports]  WITH CHECK ADD FOREIGN KEY([portTypeId])
REFERENCES [dbo].[PortTypes] ([id])
GO
ALTER TABLE [dbo].[Incidents]  WITH CHECK ADD  CONSTRAINT [FK_Incidents_Severity] FOREIGN KEY([severityId])
REFERENCES [dbo].[IncidentSeverities] ([id])
GO
ALTER TABLE [dbo].[Incidents] CHECK CONSTRAINT [FK_Incidents_Severity]
GO
ALTER TABLE [dbo].[Incidents]  WITH CHECK ADD  CONSTRAINT [FK_Incidents_Status] FOREIGN KEY([statusId])
REFERENCES [dbo].[IncidentStatuses] ([id])
GO
ALTER TABLE [dbo].[Incidents] CHECK CONSTRAINT [FK_Incidents_Status]
GO
ALTER TABLE [dbo].[IncidentTypes]  WITH CHECK ADD FOREIGN KEY([defaultSeverityId])
REFERENCES [dbo].[IncidentSeverities] ([id])
GO
ALTER TABLE [dbo].[Models]  WITH CHECK ADD FOREIGN KEY([manufacturerId])
REFERENCES [dbo].[Manufacturers] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[parent_items]  WITH CHECK ADD FOREIGN KEY([parentId])
REFERENCES [dbo].[parent_items] ([id])
GO
ALTER TABLE [dbo].[parent_items]  WITH CHECK ADD FOREIGN KEY([roomId])
REFERENCES [dbo].[Rooms] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[RoomExclusionZones]  WITH CHECK ADD FOREIGN KEY([roomId])
REFERENCES [dbo].[Rooms] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD FOREIGN KEY([buildingId])
REFERENCES [dbo].[Buildings] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Sensors]  WITH CHECK ADD FOREIGN KEY([itemId])
REFERENCES [dbo].[parent_items] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Approvals]  WITH CHECK ADD CHECK  (([status]='rejected' OR [status]='approved' OR [status]='pending'))
GO
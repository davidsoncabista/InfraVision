-- Esta é a consulta SQL usada pela função `getAllEquipmentPorts` para popular a página "Inventário de Portas".
-- Use esta query para testar diretamente no seu cliente de banco de dados (ex: SSMS, Azure Data Studio).

SELECT 
    ep.id,
    ep.label,
    pt.name AS portTypeName,
    ep.status,
    ci.label AS equipmentName,
    ci.id AS equipmentId,
    pi.label AS locationName,
    connectedPort.label AS connectedToPortLabel,
    connectedItem.label AS connectedToEquipmentName
FROM 
    EquipmentPorts ep
JOIN 
    ChildItems ci ON ep.childItemId = ci.id
JOIN 
    PortTypes pt ON ep.portTypeId = pt.id
LEFT JOIN 
    ParentItems pi ON ci.parentId = pi.id
LEFT JOIN 
    EquipmentPorts connectedPort ON ep.connectedToPortId = connectedPort.id
LEFT JOIN 
    ChildItems connectedItem ON connectedPort.childItemId = connectedItem.id
ORDER BY 
    locationName, equipmentName, ep.id;

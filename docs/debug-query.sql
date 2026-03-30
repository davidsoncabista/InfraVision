-- Esta é a consulta SQL para popular a página "Inventário de Portas".
-- Atualizado para o padrão PostgreSQL (snake_case) do ambiente Self-Hosted.

SELECT 
    ep.id,
    ep.label,
    pt.name AS port_type_name,
    ep.status,
    ci.label AS equipment_name,
    ci.id AS equipment_id,
    pi.label AS location_name,
    connected_port.label AS connected_to_port_label,
    connected_item.label AS connected_to_equipment_name
FROM 
    equipment_ports ep
JOIN 
    child_items ci ON ep.child_item_id = ci.id
JOIN 
    port_types pt ON ep.port_type_id = pt.id
LEFT JOIN 
    parent_items pi ON ci.parent_id = pi.id
LEFT JOIN 
    equipment_ports connected_port ON ep.connected_to_port_id = connected_port.id
LEFT JOIN 
    child_items connected_item ON connected_port.child_item_id = connected_item.id
ORDER BY 
    location_name, equipment_name, ep.id;
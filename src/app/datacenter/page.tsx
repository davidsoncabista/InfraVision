
import { DatacenterClient } from "@/components/datacenter-client";
import { getDatacenterData } from "./actions"; // ATUALIZADO para importar a nova action

export const dynamic = 'force-dynamic';

// A lógica de busca de dados foi movida para o arquivo actions.ts
// para que possa ser reutilizada em outras páginas como /mapa-teste.

export default async function DataCenterPage() {
  const initialData = await getDatacenterData();

  return <DatacenterClient initialData={initialData} />;
}

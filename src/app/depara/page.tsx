
import { DeParaClient } from "@/components/depara/depara-client";

// O código é como um labirinto, se você se perder, a culpa não é minha.
// Esta página será o cérebro das conexões De/Para.
export const dynamic = 'force-dynamic';

export default async function DeParaPage() {
  // O componente DeParaClient agora busca seus próprios dados
  // com base no prédio ativo, então não precisamos mais pré-buscar aqui.
  return <DeParaClient />;
}

    
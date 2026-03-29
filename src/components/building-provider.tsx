
"use client";

import React, { createContext, ReactNode, useContext, useEffect, useCallback, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getPendingApprovalsCount } from '@/lib/approval-actions';

interface Building {
  id: string;
  name: string;
}

interface BuildingContextType {
  buildings: Building[];
  activeBuildingId: string;
  setActiveBuildingId: (id: string) => void;
  pendingApprovalsCount: number;
}

export const BuildingContext = createContext<BuildingContextType>({
    buildings: [],
    activeBuildingId: '',
    setActiveBuildingId: () => {},
    pendingApprovalsCount: 0,
});

export const BuildingProvider = ({ children, initialBuildings }: { children: ReactNode, initialBuildings: Building[] }) => {
  const [activeBuildingId, setActiveBuildingId] = useLocalStorage<string>('activeBuildingId', initialBuildings[0]?.id || '');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const _setActiveBuildingId = useCallback((id: string) => {
    setActiveBuildingId(id);
  }, [setActiveBuildingId]);
  
  useEffect(() => {
    const activeBuildingExists = initialBuildings.some(b => b.id === activeBuildingId);

    // Se a lista de prédios mudar e o prédio ativo não estiver mais na lista (ou se nenhum estiver selecionado),
    // define o primeiro prédio da nova lista como ativo.
    // Esta lógica agora ignora o caso em que o activeBuildingId foi deliberadamente definido como ''
    if (initialBuildings.length > 0 && activeBuildingId && !activeBuildingExists) {
      _setActiveBuildingId(initialBuildings[0].id);
    } else if (initialBuildings.length === 0 && activeBuildingId !== '') {
      // Se não houver prédios, limpa o ID ativo.
      _setActiveBuildingId('');
    }
  }, [initialBuildings, activeBuildingId, _setActiveBuildingId]);

  // Efeito para buscar a contagem de aprovações pendentes sempre que o prédio ativo mudar.
  useEffect(() => {
      if (activeBuildingId) {
          getPendingApprovalsCount(activeBuildingId)
              .then(setPendingApprovalsCount)
              .catch(() => setPendingApprovalsCount(0)); // Em caso de erro, zera a contagem.
      } else {
          setPendingApprovalsCount(0);
      }
  }, [activeBuildingId]);
  
  const value = {
    buildings: initialBuildings,
    activeBuildingId,
    setActiveBuildingId: _setActiveBuildingId,
    pendingApprovalsCount,
  };

  return (
    <BuildingContext.Provider value={value}>
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuilding = () => {
    const context = useContext(BuildingContext);
    if (context === undefined) {
        throw new Error('useBuilding must be used within a BuildingProvider');
    }
    return context;
};


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
  activebuildingid: string;
  setactivebuildingid: (id: string) => void;
  pendingApprovalsCount: number;
}

export const BuildingContext = createContext<BuildingContextType>({
    buildings: [],
    activebuildingid: '',
    setactivebuildingid: () => {},
    pendingApprovalsCount: 0,
});

export const BuildingProvider = ({ children, initialBuildings }: { children: ReactNode, initialBuildings: Building[] }) => {
  const [activebuildingid, setactivebuildingid] = useLocalStorage<string>('activebuildingid', initialBuildings[0]?.id || '');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const _setactivebuildingid = useCallback((id: string) => {
    setactivebuildingid(id);
  }, [setactivebuildingid]);
  
  useEffect(() => {
    const activeBuildingExists = initialBuildings.some(b => b.id === activebuildingid);

    // Se a lista de prédios mudar e o prédio ativo não estiver mais na lista (ou se nenhum estiver selecionado),
    // define o primeiro prédio da nova lista como ativo.
    // Esta lógica agora ignora o caso em que o activebuildingid foi deliberadamente definido como ''
    if (initialBuildings.length > 0 && activebuildingid && !activeBuildingExists) {
      _setactivebuildingid(initialBuildings[0].id);
    } else if (initialBuildings.length === 0 && activebuildingid !== '') {
      // Se não houver prédios, limpa o ID ativo.
      _setactivebuildingid('');
    }
  }, [initialBuildings, activebuildingid, _setactivebuildingid]);

  // Efeito para buscar a contagem de aprovações pendentes sempre que o prédio ativo mudar.
  useEffect(() => {
      if (activebuildingid) {
          getPendingApprovalsCount(activebuildingid)
              .then(setPendingApprovalsCount)
              .catch(() => setPendingApprovalsCount(0)); // Em caso de erro, zera a contagem.
      } else {
          setPendingApprovalsCount(0);
      }
  }, [activebuildingid]);
  
  const value = {
    buildings: initialBuildings,
    activebuildingid,
    setactivebuildingid: _setactivebuildingid,
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

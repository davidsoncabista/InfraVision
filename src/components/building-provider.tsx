
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
  activebuilding_id: string;
  setActivebuilding_id: (id: string) => void;
  pendingApprovalsCount: number;
}

export const BuildingContext = createContext<BuildingContextType>({
    buildings: [],
    activebuilding_id: '',
    setActivebuilding_id: () => {},
    pendingApprovalsCount: 0,
});

export const BuildingProvider = ({ children, initialBuildings }: { children: ReactNode, initialBuildings: Building[] }) => {
  const [activebuilding_id, setActivebuilding_id] = useLocalStorage<string>('activebuilding_id', initialBuildings[0]?.id || '');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const _setActivebuilding_id = useCallback((id: string) => {
    setActivebuilding_id(id);
  }, [setActivebuilding_id]);
  
  useEffect(() => {
    const activeBuildingExists = initialBuildings.some(b => b.id === activebuilding_id);

    // Se a lista de prédios mudar e o prédio ativo não estiver mais na lista (ou se nenhum estiver selecionado),
    // define o primeiro prédio da nova lista como ativo.
    // Esta lógica agora ignora o caso em que o activebuilding_id foi deliberadamente definido como ''
    if (initialBuildings.length > 0 && activebuilding_id && !activeBuildingExists) {
      _setActivebuilding_id(initialBuildings[0].id);
    } else if (initialBuildings.length === 0 && activebuilding_id !== '') {
      // Se não houver prédios, limpa o ID ativo.
      _setActivebuilding_id('');
    }
  }, [initialBuildings, activebuilding_id, _setActivebuilding_id]);

  // Efeito para buscar a contagem de aprovações pendentes sempre que o prédio ativo mudar.
  useEffect(() => {
      if (activebuilding_id) {
          getPendingApprovalsCount(activebuilding_id)
              .then(setPendingApprovalsCount)
              .catch(() => setPendingApprovalsCount(0)); // Em caso de erro, zera a contagem.
      } else {
          setPendingApprovalsCount(0);
      }
  }, [activebuilding_id]);
  
  const value = {
    buildings: initialBuildings,
    activebuilding_id,
    setActivebuilding_id: _setActivebuilding_id,
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

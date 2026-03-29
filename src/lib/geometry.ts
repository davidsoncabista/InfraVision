
import type { GridItem, Room, AxisNaming } from '@/types/datacenter';

// Bem-vindo à selva. Você está por sua conta.

interface TileDimensions {
  widthCm: number;
  heightCm: number;
}

/**
 * Converte um índice numérico em uma etiqueta alfabética (A, B, ..., Z, AA, AB, ...).
 * @param index O índice numérico (base 0).
 * @returns A etiqueta alfabética correspondente.
 */
function getAlphaLabel(index: number): string {
    let label = '';
    let tempIndex = index;
    while (tempIndex >= 0) {
        label = String.fromCharCode(65 + (tempIndex % 26)) + label;
        tempIndex = Math.floor(tempIndex / 26) - 1;
    }
    return label;
}

/**
 * Converte coordenadas numéricas (x, y) em uma etiqueta de grid legível (ex: C3, 15-A).
 * @param x A coordenada X (base 0).
 * @param y A coordenada Y (base 0).
 * @param xAxisNaming O tipo de nomenclatura do eixo X ('alpha' ou 'numeric').
 * @param yAxisNaming O tipo de nomenclatura do eixo Y ('alpha' ou 'numeric').
 * @returns A etiqueta formatada da célula do grid.
 */
export function getGridLabel(x: number, y: number, xAxisNaming: AxisNaming, yAxisNaming: AxisNaming): string {
  // Retorna apenas a parte do grid se o eixo não for relevante (índice -1)
  if (x === -1 && y >= 0) return yAxisNaming === 'alpha' ? getAlphaLabel(y) : String(y + 1);
  if (y === -1 && x >= 0) return xAxisNaming === 'alpha' ? getAlphaLabel(x) : String(x + 1);
  if (x < 0 || y < 0) return '';
  
  const xLabel = xAxisNaming === 'alpha' ? getAlphaLabel(x) : String(x + 1);
  const yLabel = yAxisNaming === 'alpha' ? getAlphaLabel(y) : String(y + 1);
  return `${xLabel}${yLabel}`;
};


/**
 * Verifica se um item colide com qualquer outro item em uma lista ou com os limites da sala.
 * @param itemToCheck O item que está sendo verificado.
 * @param allItems A lista de todos os outros itens na sala.
 * @param room A sala onde os itens estão localizados.
 * @returns `true` se houver colisão, `false` caso contrário.
 */
export function checkCollision(
  itemToCheck: GridItem,
  allItems: GridItem[],
  room: Room
): boolean {
  if (!room.tileWidthCm || !room.tileHeightCm) return false;

  const tileDimensions: TileDimensions = {
    widthCm: room.tileWidthCm,
    heightCm: room.tileHeightCm,
  };

  const GRID_COLS = Math.floor((room.widthM * 100) / tileDimensions.widthCm);
  const GRID_ROWS = Math.floor((room.depthM * 100) / tileDimensions.heightCm);

  // Calcula as dimensões do item em células do grid
  const itemWidthInCells = itemToCheck.widthM / (tileDimensions.widthCm / 100);
  const itemHeightInCells = itemToCheck.heightM / (tileDimensions.heightCm / 100);

  const itemToCheckEndX = itemToCheck.x + itemWidthInCells;
  const itemToCheckEndY = itemToCheck.y + itemHeightInCells;

  // 1. Verifica colisão com os limites da sala
  if (itemToCheck.x < 0 || itemToCheck.y < 0 || itemToCheckEndX > GRID_COLS || itemToCheckEndY > GRID_ROWS) {
    return true; // Colisão com as paredes
  }

  // 2. Verifica colisão com outros itens
  for (const otherItem of allItems) {
    // Ignora a verificação do item com ele mesmo
    if (otherItem.id === itemToCheck.id) continue;

    const otherItemWidthInCells = otherItem.widthM / (tileDimensions.widthCm / 100);
    const otherItemHeightInCells = otherItem.heightM / (tileDimensions.heightCm / 100);
    const otherItemEndX = otherItem.x + otherItemWidthInCells;
    const otherItemEndY = otherItem.y + otherItemHeightInCells;

    // Lógica de intersecção de retângulos (AABB - Axis-Aligned Bounding Box)
    if (
      itemToCheck.x < otherItemEndX &&
      itemToCheckEndX > otherItem.x &&
      itemToCheck.y < otherItemEndY &&
      itemToCheckEndY > otherItem.y
    ) {
      return true; // Colisão detectada
    }
  }

  // Se não encontrou nenhuma colisão
  return false;
}

    

'use server';
/**
 * @fileOverview Um fluxo de IA para analisar e estruturar dados brutos (texto ou imagem) para importação.
 *
 * - analyzeImportFlow - Uma função que recebe dados textuais ou uma imagem e um tipo de entidade, e retorna uma lista estruturada de objetos.
 * - AnalyzeImportInput - O tipo de entrada para o fluxo.
 * - AnalyzeImportOutput - O tipo de retorno para o fluxo.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImportInputSchema = z.object({
  dataType: z.enum(['child_items', 'parent_items', 'connections']).describe('O tipo de entidade que está sendo importada.'),
  rawData: z.string().optional().describe('Os dados brutos do arquivo ou área de texto, geralmente em formato CSV ou similar.'),
  imageDataUri: z.string().optional().describe("Uma foto de um equipamento, rack ou patch panel, como um data URI que deve incluir um MIME type e usar Base64. Formato: 'data:<mimetype>;base64,<dados_codificados>'."),
});
export type AnalyzeImportInput = z.infer<typeof AnalyzeImportInputSchema>;

const AnalyzeImportOutputSchema = z.object({
    structuredData: z.array(z.record(z.string(), z.any())).describe('Um array de objetos JSON, onde cada objeto representa um item a ser importado.')
});
export type AnalyzeImportOutput = z.infer<typeof AnalyzeImportOutputSchema>;

const analysisPrompt = ai.definePrompt({
    name: 'dataAnalysisPrompt',
    input: { schema: AnalyzeImportInputSchema },
    prompt: `Você é um assistente especialista em Data Center Infrastructure Management (DCIM) com capacidade de OCR. Sua tarefa é EXCLUSIVAMENTE extrair texto de etiquetas, identificar nomes de equipamentos, fabricantes, modelos, números de série e conexões (De/Para).

Ignore completamente outros elementos na imagem, como pessoas, o ambiente de fundo, ou objetos que não sejam equipamentos de TI. Foque APENAS nos dados relevantes para inventário de data center.

O usuário fornecerá o tipo de dado e a fonte (texto ou imagem).

Tipo de Dado a ser extraído: {{{dataType}}}

{{#if rawData}}
Fonte dos Dados (Texto):
---
{{{rawData}}}
---
{{/if}}

{{#if imageDataUri}}
Fonte dos Dados (Imagem):
{{media url=imageDataUri}}
{{/if}}

Analise a fonte de dados fornecida. Se for uma imagem, use suas capacidades de OCR para ler as etiquetas e identificar os itens. Se for texto, interprete a estrutura. Adapte-se a diferentes separadores (ponto e vírgula, vírgula, tabulação). Ignore cabeçalhos e linhas em branco.

Baseado no tipo de dado, retorne os dados encontrados em um formato de valores separados por ponto e vírgula (CSV-like), com uma linha por item.

- Se dataType for 'child_items', as colunas devem ser: label;type;manufacturer;model;serialNumber;sizeU;parentRack
- Se dataType for 'parent_items', as colunas devem ser: label;type;location
- Se dataType for 'connections', as colunas devem ser: from_equipment;from_port;to_equipment;to_port

IMPORTANTE: Se a informação de uma coluna não for encontrada (ex: 'to_equipment' em uma conexão unilateral), deixe o campo em branco, mas mantenha o ponto e vírgula como separador.

Retorne APENAS os dados no formato CSV, sem cabeçalhos ou qualquer texto adicional.
`,
});

const parseCsvToJson = (csv: string, dataType: AnalyzeImportInput['dataType']): any[] => {
    if (!csv) return [];
    
    let headers: string[] = [];
    switch(dataType) {
        case 'child_items':
            headers = ['label', 'type', 'manufacturer', 'model', 'serialNumber', 'sizeU', 'parentRack'];
            break;
        case 'parent_items':
            headers = ['label', 'type', 'location'];
            break;
        case 'connections':
            headers = ['from_equipment', 'from_port', 'to_equipment', 'to_port'];
            break;
    }
    
    const lines = csv.trim().split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
        const values = line.split(';');
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
            const value = values[index]?.trim() || '';
            // Converte para número se for o caso
            if ((header === 'sizeU' || header === 'posicaoU') && value) {
                const num = parseInt(value, 10);
                obj[header] = isNaN(num) ? null : num;
            } else {
                obj[header] = value;
            }
        });
        return obj;
    });
}

const analyzeImportFlow = ai.defineFlow(
  {
    name: 'analyzeImportFlow',
    inputSchema: AnalyzeImportInputSchema,
    outputSchema: AnalyzeImportOutputSchema,
  },
  async (input) => {
    const { text } = await analysisPrompt(input);
    const structuredData = parseCsvToJson(text, input.dataType);
    return { structuredData };
  }
);

export async function analyzeImport(input: AnalyzeImportInput): Promise<AnalyzeImportOutput> {
  return analyzeImportFlow(input);
}

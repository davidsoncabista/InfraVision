
import { getPrintableReportData, PrintableReportData } from './actions';
import { Badge } from '@/components/ui/badge';
import { Building, Home, HardDrive, Server, Cable, Link2, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

interface SearchParams {
  signatures?: string;
}

const ReportSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType, children: React.ReactNode }) => (
    <section className="mb-8 break-inside-avoid">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-b-2 border-gray-300 pb-2 mb-4">
            <Icon className="h-6 w-6" />
            {title}
        </h2>
        {children}
    </section>
);

const DataPair = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-base text-gray-900">{value || '-'}</dd>
    </div>
);

export default async function PrintableReportPage({ searchParams }: { searchParams: SearchParams }) {
  const includeSignatures = searchParams.signatures === 'true';
  const data = await getPrintableReportData();

  if (!data.buildings || data.buildings.length === 0) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Nenhum dado encontrado</h1>
        <p className="text-gray-600">Não há informações de inventário para gerar o relatório.</p>
      </div>
    );
  }

  return (
    <div className="p-10">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary">Relatório de Infraestrutura</h1>
        <p className="text-lg text-gray-500">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
      </header>

      <main>
        {data.buildings.map(building => (
          <ReportSection key={building.id} title={building.name} icon={Building}>
            {building.rooms.map(room => (
              <div key={room.id} className="ml-4 mb-6 p-4 border-l-2 border-gray-200">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4"><Home className="h-5 w-5 text-gray-600" /> {room.name}</h3>
                {room.items.map(item => (
                  <div key={item.id} className="ml-4 mb-6 p-4 border-l-2 border-gray-200 break-inside-avoid">
                    <h4 className="text-lg font-semibold flex items-center gap-2 mb-3"><Server className="h-5 w-5 text-gray-500" /> {item.label} <Badge variant="outline">{item.type}</Badge></h4>
                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                       <DataPair label="Status" value={<Badge>{item.statusName}</Badge>} />
                       <DataPair label="Localização no Grid" value={item.gridPosition} />
                       <DataPair label="Fabricante" value={item.brand} />
                       <DataPair label="Modelo" value={item.modelo} />
                       <DataPair label="Nº de Série" value={item.serialNumber} />
                       <DataPair label="TAG" value={item.tag} />
                    </dl>
                    {item.child_items && item.child_items.length > 0 && (
                        <div className="mt-4">
                            <h5 className="font-semibold text-gray-700 flex items-center gap-2"><HardDrive className="h-4 w-4" /> Equipamentos Aninhados:</h5>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {item.child_items.map(child => <li key={child.id}>{child.label} ({child.modelo}) - <span className="font-mono text-xs">{child.serialNumber || 'S/N'}</span></li>)}
                            </ul>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </ReportSection>
        ))}

        <ReportSection title="Conexões" icon={Cable}>
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Origem (A)</th>
                        <th className="p-2 border">Destino (B)</th>
                        <th className="p-2 border">Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {data.connections.map(conn => (
                        <tr key={conn.id} className="break-inside-avoid">
                            <td className="p-2 border">
                                <p className="font-semibold">{conn.itemA_label}</p>
                                <p className="text-xs text-gray-600">{conn.itemA_parentName} / <span className="font-mono">{conn.portA_label}</span></p>
                            </td>
                             <td className="p-2 border">
                                <p className="font-semibold">{conn.itemB_label || <span className="italic text-gray-500">Não Conectado</span>}</p>
                                 {conn.itemB_parentName && <p className="text-xs text-gray-600">{conn.itemB_parentName} / <span className="font-mono">{conn.portB_label}</span></p>}
                            </td>
                            <td className="p-2 border"><Badge variant="secondary">{conn.connectionType}</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ReportSection>

        {includeSignatures && (
             <ReportSection title="Assinaturas" icon={User}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-6">
                    {data.usersWithSignatures.map(user => (
                        <div key={user.id} className="text-center break-inside-avoid">
                            <div className="h-24 w-full border-b-2 border-gray-400 mb-2 flex items-center justify-center">
                                {user.signatureUrl && <img src={user.signatureUrl} alt={`Assinatura de ${user.displayName}`} className="max-h-full max-w-full object-contain" />}
                            </div>
                            <p className="font-semibold">{user.displayName}</p>
                            <p className="text-sm text-gray-600">{user.role}</p>
                        </div>
                    ))}
                </div>
            </ReportSection>
        )}
      </main>
    </div>
  );
}

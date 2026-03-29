// Este layout especial substitui o layout raiz para a rota /reports/printable.
// Ele define sua própria estrutura <html> e <body> para criar um documento HTML independente,
// ideal para impressão e livre de componentes do layout principal da aplicação.

import { PrintableReportStyles } from './printable-report-styles';

export default function PrintableReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <title>Relatório Completo de Inventário</title>
        <PrintableReportStyles />
      </head>
      <body className="bg-white font-sans text-gray-800">
        {children}
      </body>
    </html>
  );
}

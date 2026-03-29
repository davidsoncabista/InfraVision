
"use client";

// Este componente não renderiza nada visível, apenas injeta uma folha de estilos
// na página que é específica para impressão.
export function PrintableReportStyles() {
    return (
        <style jsx global>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                @page {
                    size: A4;
                    margin: 1.5cm;
                }

                /* Esconde elementos da UI da aplicação principal */
                header, footer, .no-print {
                    display: none !important;
                }
            }
        `}</style>
    )
}

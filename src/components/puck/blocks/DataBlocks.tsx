export interface TableBlockProps {
    headers: string | string[];
    rows: { cells: string | string[] }[];
}

export const TableBlock = ({ headers, rows }: TableBlockProps) => {
    const headerArray = typeof headers === 'string' ? headers.split(',').map((h: string) => h.trim()) : headers;
    const rowsArray = rows.map((row) => {
        if (typeof row.cells === 'string') {
            return row.cells.split(',').map((c: string) => c.trim());
        }
        return row.cells;
    });

    return (
        <section className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            {headerArray.map((header: string, idx: number) => (
                                <th key={idx} className="text-left p-3 font-semibold">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowsArray.map((cells: string[], rowIdx: number) => (
                            <tr key={rowIdx} className="border-b hover:bg-muted/50">
                                {cells.map((cell: string, cellIdx: number) => (
                                    <td key={cellIdx} className="p-3">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

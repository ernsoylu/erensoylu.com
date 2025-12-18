export interface TableBlockProps {
    headers: string | string[];
    rows: { cells: string | string[] }[];
}

const hashString = (input: string) => {
    let hash = 5381
    for (const char of input) {
        hash = (hash * 33) ^ (char.codePointAt(0) ?? 0)
    }
    return (hash >>> 0).toString(36)
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
                            {headerArray.map((header: string) => (
                                <th key={header} className="text-left p-3 font-semibold">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowsArray.map((cells: string[]) => {
                            const rowKey = hashString(cells.join("\u0001"))
                            const cellCounts = new Map<string, number>()

                            return (
                                <tr key={rowKey} className="border-b hover:bg-muted/50">
                                    {cells.map((cell: string) => {
                                        const nextCount = (cellCounts.get(cell) || 0) + 1
                                        cellCounts.set(cell, nextCount)
                                        const cellKey = hashString(`${rowKey}:${cell}:${nextCount}`)

                                        return <td key={cellKey} className="p-3">{cell}</td>
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

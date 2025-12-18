import { Separator } from "@/components/ui/separator";

export interface SpacerProps {
    height: number;
}

export const Spacer = ({ height }: SpacerProps) => (
    <div style={{ height: `${height}px` }} />
);

export interface DividerProps {
    style: 'solid' | 'dashed' | 'dotted';
}

export const Divider = ({ style }: DividerProps) => (
    <div className="container mx-auto px-4 py-8">
        <hr className={style === 'dashed' ? 'border-dashed' : style === 'dotted' ? 'border-dotted' : ''} />
    </div>
);

export interface SeparatorBlockProps {
    spacing: number;
}

export const SeparatorBlock = ({ spacing }: SeparatorBlockProps) => (
    <section className="container mx-auto px-4" style={{ paddingTop: `${spacing}px`, paddingBottom: `${spacing}px` }}>
        <Separator />
    </section>
);

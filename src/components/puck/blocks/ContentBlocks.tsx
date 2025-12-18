import { Code as CodeIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface RichTextProps {
    content: string;
}

export const RichText = ({ content }: RichTextProps) => (
    <section className="container mx-auto px-4 py-8">
        <div className="prose prose-lg max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
    </section>
);

export interface VideoEmbedProps {
    title?: string;
    videoUrl: string;
    description?: string;
}

export const VideoEmbed = ({ title, videoUrl, description }: VideoEmbedProps) => (
    <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
            {title && <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>}
            {description && <p className="text-center text-muted-foreground mb-8">{description}</p>}
            <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                <iframe src={videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
        </div>
    </section>
);

export interface BlockquoteBlockProps {
    quote: string;
    author?: string;
    role?: string;
}

export const BlockquoteBlock = ({ quote, author, role }: BlockquoteBlockProps) => (
    <section className="container mx-auto px-4 py-8">
        <blockquote className="border-l-4 border-primary pl-6 py-4 italic text-xl max-w-3xl mx-auto">
            <p className="mb-4">"{quote}"</p>
            {author && (
                <footer className="text-sm not-italic text-muted-foreground">
                    — <cite className="font-semibold">{author}</cite>{role && `, ${role}`}
                </footer>
            )}
        </blockquote>
    </section>
);

export interface CodeBlockProps {
    code: string;
    language: string;
}

export const CodeBlock = ({ code, language }: CodeBlockProps) => (
    <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-t-lg border-b">
                <CodeIcon className="w-4 h-4" />
                <span className="text-sm font-mono">{language}</span>
            </div>
            <pre className="bg-muted p-4 rounded-b-lg overflow-x-auto">
                <code className="text-sm font-mono">{code}</code>
            </pre>
        </div>
    </section>
);

export interface ImageGalleryProps {
    images: { url: string; caption?: string }[];
    columns?: number;
}

export const ImageGallery = ({ images, columns }: ImageGalleryProps) => (
    <section className="container mx-auto px-4 py-8">
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns || 3}, 1fr)` }}>
            {images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer">
                    <img src={img.url} alt={img.caption || `Image ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                </div>
            ))}
        </div>
    </section>
);

export interface AuthorBioProps {
    name: string;
    role: string;
    bio: string;
    avatarUrl?: string;
}

export const AuthorBio = ({ name, role, bio, avatarUrl }: AuthorBioProps) => (
    <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto flex items-start gap-4">
            <Avatar className="w-16 h-16">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <h3 className="font-bold text-lg">{name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{role}</p>
                <p className="text-sm">{bio}</p>
            </div>
        </div>
    </section>
);

import type { Config } from "@measured/puck";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Check, Star, AlertCircle, Info, Code as CodeIcon } from "lucide-react";

// ===== COMPONENTS =====

// 1. Hero
export const Hero = ({ title, subtitle, bgImage, ctaText, ctaLink }: any) => (
    <div
        className="relative py-24 px-6 md:py-32 md:px-12 text-center overflow-hidden rounded-3xl mx-4 my-8"
        style={{
            backgroundImage: bgImage ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "var(--foreground)"
        }}
    >
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">{title}</h1>
            {subtitle && <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">{subtitle}</p>}
            {ctaText && ctaLink && (
                <Button asChild size="lg" className="rounded-full text-lg px-8 py-6">
                    <Link to={ctaLink}>{ctaText}</Link>
                </Button>
            )}
        </div>
    </div>
);

// 2. Post Grid
export const PostGrid = ({ title, categorySlug, limit }: any) => {
    const [posts, setPosts] = useState<any[]>([]);
    useEffect(() => {
        const fetchPosts = async () => {
            let query = supabase.from("posts").select("*, category:categories(slug, name)").eq("published", true).order("created_at", { ascending: false }).limit(limit || 6);
            if (categorySlug && categorySlug !== 'all') {
                const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
                if (cat) query = query.eq('category_id', cat.id);
            }
            const { data } = await query;
            if (data) setPosts(data);
        };
        fetchPosts();
    }, [categorySlug, limit]);

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                <Button variant="ghost" asChild><Link to={categorySlug && categorySlug !== 'all' ? `/posts?category=${categorySlug}` : "/posts"}>View All</Link></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Link key={post.id} to={`/post/${post.slug}`} className="group">
                        <Card className="h-full overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/50 hover:bg-card">
                            <div className="aspect-video w-full bg-muted/50 relative overflow-hidden">
                                {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                                <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur">{post.category?.name}</Badge>
                            </div>
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{post.title}</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
};

// 3. Feature Section
export const FeatureSection = ({ title, description, image, alignRight }: any) => (
    <section className="container mx-auto px-4 py-16">
        <div className={`flex flex-col md:flex-row items-center gap-12 ${alignRight ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
                <div className="prose text-lg text-muted-foreground" dangerouslySetInnerHTML={{ __html: description }} />
            </div>
            <div className="flex-1 w-full">
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-video bg-muted">
                    {image && <img src={image} alt={title} className="w-full h-full object-cover" />}
                </div>
            </div>
        </div>
    </section>
);

// 4. Newsletter Signup
export const Newsletter = ({ title, description, placeholder, buttonText }: any) => {
    const [email, setEmail] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Subscribed: ${email}`); // Replace with actual integration
        setEmail("");
    };
    return (
        <section className="container mx-auto px-4 py-16">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-8 md:p-12 text-center">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-3xl font-bold mb-4">{title}</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <Input type="email" placeholder={placeholder} value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1" />
                        <Button type="submit" size="lg">{buttonText}</Button>
                    </form>
                </CardContent>
            </Card>
        </section>
    );
};

// 5. Stats Counter
export const StatsCounter = ({ stats }: any) => (
    <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat: any, idx: number) => (
                <div key={idx} className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</div>
                </div>
            ))}
        </div>
    </section>
);

// 6. Testimonials
export const Testimonials = ({ title, testimonials }: any) => (
    <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t: any, idx: number) => (
                <Card key={idx} className="bg-card/50">
                    <CardContent className="p-6">
                        <div className="flex mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                        </div>
                        <p className="text-muted-foreground mb-4 italic">"{t.quote}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{t.name[0]}</div>
                            <div>
                                <div className="font-semibold">{t.name}</div>
                                <div className="text-sm text-muted-foreground">{t.role}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </section>
);

// 7. CTA Banner
export const CTABanner = ({ title, description, buttonText, buttonLink, bgColor }: any) => (
    <section className="container mx-auto px-4 py-16">
        <div className="rounded-3xl p-12 text-center text-white" style={{ backgroundColor: bgColor || 'var(--primary)' }}>
            <h2 className="text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl mb-8 opacity-90">{description}</p>
            <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link to={buttonLink}>{buttonText}</Link>
            </Button>
        </div>
    </section>
);

// 8. Logo Cloud
export const LogoCloud = ({ title, logos }: any) => (
    <section className="container mx-auto px-4 py-16">
        <h3 className="text-center text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-wider">{title}</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
            {logos.map((logo: any, idx: number) => (
                <img key={idx} src={logo.url} alt={logo.name} className="h-8 md:h-10 object-contain" />
            ))}
        </div>
    </section>
);

// 9. FAQ Accordion
export const FAQSection = ({ title, faqs }: any) => (
    <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {faqs.map((faq: any, idx: number) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </section>
);

// 10. Category Showcase
export const CategoryShowcase = ({ title }: any) => {
    const [categories, setCategories] = useState<any[]>([]);
    useEffect(() => {
        supabase.from("categories").select("*").limit(6).then(({ data }) => data && setCategories(data));
    }, []);

    return (
        <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                    <Link key={cat.id} to={`/posts?category=${cat.slug}`}>
                        <Card className="hover:shadow-md transition-all hover:border-primary">
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl mb-2">📁</div>
                                <div className="font-semibold">{cat.name}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
};

// 11. Team Members
export const TeamSection = ({ title, members }: any) => (
    <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((member: any, idx: number) => (
                <Card key={idx} className="text-center">
                    <CardContent className="p-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                            {member.name[0]}
                        </div>
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.bio}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </section>
);

// 12. Pricing Table
export const PricingTable = ({ title, plans }: any) => (
    <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan: any, idx: number) => {
                const features = typeof plan.features === 'string' ? plan.features.split(',').map((f: string) => f.trim()) : plan.features;
                return (
                    <Card key={idx} className={plan.featured ? "border-primary shadow-lg scale-105" : ""}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="text-4xl font-bold mt-4">${plan.price}<span className="text-sm text-muted-foreground">/mo</span></div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 mb-6">
                                {features.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />{feature}</li>
                                ))}
                            </ul>
                            <Button className="w-full" variant={plan.featured ? "default" : "outline"}>Get Started</Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    </section>
);

// 13. Video Embed
export const VideoEmbed = ({ title, videoUrl, description }: any) => (
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

// 14. Spacer
export const Spacer = ({ height }: any) => <div style={{ height: `${height}px` }} />;

// 15. Divider
export const Divider = ({ style }: any) => (
    <div className="container mx-auto px-4 py-8">
        <hr className={style === 'dashed' ? 'border-dashed' : style === 'dotted' ? 'border-dotted' : ''} />
    </div>
);

// 16. Rich Text Block
export const RichText = ({ content }: any) => (
    <section className="container mx-auto px-4 py-8">
        <div className="prose prose-lg max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
    </section>
);

// 17. Alert Block
export const AlertBlock = ({ variant, title, description }: any) => {
    const icons = { default: Info, destructive: AlertCircle };
    const Icon = icons[variant as keyof typeof icons] || Info;
    return (
        <section className="container mx-auto px-4 py-8">
            <Alert variant={variant}>
                <Icon className="h-4 w-4" />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{description}</AlertDescription>
            </Alert>
        </section>
    );
};

// 18. Tabs Block
export const TabsBlock = ({ tabs }: any) => (
    <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue={tabs[0]?.value || "tab1"} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                {tabs.map((tab: any) => (
                    <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((tab: any) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-6">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: tab.content }} />
                </TabsContent>
            ))}
        </Tabs>
    </section>
);

// 19. Image Carousel
export const ImageCarousel = ({ images }: any) => (
    <section className="container mx-auto px-4 py-8">
        <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
                {images.map((img: any, idx: number) => (
                    <CarouselItem key={idx}>
                        <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                            <img src={img.url} alt={img.caption || `Image ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                        {img.caption && <p className="text-center text-sm text-muted-foreground mt-2">{img.caption}</p>}
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    </section>
);

// 20. Progress Bar
export const ProgressBar = ({ label, value, showPercentage }: any) => (
    <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-2">
            <div className="flex justify-between items-center">
                <span className="font-medium">{label}</span>
                {showPercentage && <span className="text-sm text-muted-foreground">{value}%</span>}
            </div>
            <Progress value={value} className="h-3" />
        </div>
    </section>
);

// 21. Blockquote
export const BlockquoteBlock = ({ quote, author, role }: any) => (
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

// 22. Code Block
export const CodeBlock = ({ code, language }: any) => (
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

// 23. Image Gallery Grid
export const ImageGallery = ({ images, columns }: any) => (
    <section className="container mx-auto px-4 py-8">
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns || 3}, 1fr)` }}>
            {images.map((img: any, idx: number) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer">
                    <img src={img.url} alt={img.caption || `Image ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                </div>
            ))}
        </div>
    </section>
);

// 24. Simple Table
export const TableBlock = ({ headers, rows }: any) => {
    const headerArray = typeof headers === 'string' ? headers.split(',').map((h: string) => h.trim()) : headers;
    const rowsArray = rows.map((row: any) => {
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

// 25. Separator Block
export const SeparatorBlock = ({ spacing }: any) => (
    <section className="container mx-auto px-4" style={{ paddingTop: `${spacing}px`, paddingBottom: `${spacing}px` }}>
        <Separator />
    </section>
);

// 26. Author Bio
export const AuthorBio = ({ name, role, bio, avatarUrl }: any) => (
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

// 27. Footer
export const Footer = ({ copyrightText, links, socialLinks }: any) => (
    <footer className="bg-muted/30 border-t mt-16">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        {links?.map((link: any, i: number) => (
                            <li key={i}>
                                <Link to={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-4">Connect</h3>
                    <div className="flex gap-4">
                        {socialLinks?.map((social: any, i: number) => (
                            <a
                                key={i}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                {social.platform}
                            </a>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-4">About</h3>
                    <p className="text-muted-foreground text-sm">
                        {copyrightText || "© 2025 All rights reserved."}
                    </p>
                </div>
            </div>
            <Separator className="my-6" />
            <div className="text-center text-sm text-muted-foreground">
                Built with React & Supabase
            </div>
        </div>
    </footer>
);

// 28. Latest Pages
export const LatestPages = ({ title, limit }: any) => {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPages = async () => {
            setLoading(true);
            const { data } = await supabase
                .from("pages")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(limit || 6);
            if (data) setPages(data);
            setLoading(false);
        };
        fetchPages();
    }, [limit]);

    return (
        <section className="container mx-auto px-4 py-12">
            {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : pages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((page) => (
                        <Link key={page.id} to={`/page/${page.slug}`} className="group">
                            <Card className="h-full overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/50 hover:bg-card">
                                <CardHeader className="p-6">
                                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                                        {page.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 mt-2">
                                        {page.excerpt || "Read more..."}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-muted/30 rounded-2xl border-dashed border-2">
                    <p className="text-muted-foreground">No published pages yet. Create some pages in the admin panel!</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link to="/admin/pages">Go to Page Manager</Link>
                    </Button>
                </div>
            )}
        </section>
    );
};

// ===== CONFIG =====
export const config: Config = {
    categories: {
        layout: {
            title: "Layout",
            components: ["Hero", "Spacer", "Divider", "SeparatorBlock", "Footer"]
        },
        content: {
            title: "Content",
            components: ["PostGrid", "FeatureSection", "RichText", "VideoEmbed", "CategoryShowcase", "BlockquoteBlock", "CodeBlock", "ImageGallery", "TableBlock", "AuthorBio", "LatestPages"]
        },
        interactive: {
            title: "Interactive",
            components: ["TabsBlock", "ImageCarousel", "AlertBlock", "ProgressBar"]
        },
        engagement: {
            title: "Engagement",
            components: ["Newsletter", "CTABanner", "Testimonials", "FAQSection"]
        },
        business: {
            title: "Business",
            components: ["StatsCounter", "LogoCloud", "TeamSection", "PricingTable"]
        }
    },
    components: {
        Hero: {
            fields: {
                title: { type: "text" },
                subtitle: { type: "textarea" },
                bgImage: { type: "text", label: "Background Image URL" },
                ctaText: { type: "text", label: "Button Label" },
                ctaLink: { type: "text", label: "Button Link" },
            },
            defaultProps: { title: "Welcome", subtitle: "Your tagline here", bgImage: "https://images.unsplash.com/photo-1499750310159-5b5f38e31638?q=80&w=2000", ctaText: "Get Started", ctaLink: "/posts" },
            render: Hero,
        },
        PostGrid: {
            fields: {
                title: { type: "text" },
                categorySlug: { type: "select", options: [{ label: "All", value: "all" }, { label: "Tech", value: "tech" }, { label: "Travel", value: "travel" }, { label: "Lifestyle", value: "lifestyle" }, { label: "Health", value: "health" }, { label: "Business", value: "business" }, { label: "Culture", value: "culture" }] },
                limit: { type: "number" }
            },
            defaultProps: { title: "Latest Posts", categorySlug: "all", limit: 6 },
            render: PostGrid
        },
        FeatureSection: {
            fields: {
                title: { type: "text" },
                description: { type: "textarea" },
                image: { type: "text" },
                alignRight: { type: "radio", options: [{ label: "Left", value: false }, { label: "Right", value: true }] }
            },
            defaultProps: { title: "Feature Title", description: "Description here", alignRight: false },
            render: FeatureSection
        },
        Newsletter: {
            fields: {
                title: { type: "text" },
                description: { type: "textarea" },
                placeholder: { type: "text" },
                buttonText: { type: "text" }
            },
            defaultProps: { title: "Subscribe to Newsletter", description: "Get the latest updates", placeholder: "Enter your email", buttonText: "Subscribe" },
            render: Newsletter
        },
        StatsCounter: {
            fields: {
                stats: { type: "array", arrayFields: { value: { type: "text" }, label: { type: "text" } } }
            },
            defaultProps: { stats: [{ value: "10K+", label: "Users" }, { value: "500+", label: "Posts" }, { value: "50+", label: "Categories" }, { value: "99%", label: "Satisfaction" }] },
            render: StatsCounter
        },
        Testimonials: {
            fields: {
                title: { type: "text" },
                testimonials: { type: "array", arrayFields: { quote: { type: "textarea" }, name: { type: "text" }, role: { type: "text" } } }
            },
            defaultProps: { title: "What People Say", testimonials: [{ quote: "Amazing service!", name: "John Doe", role: "CEO" }, { quote: "Highly recommend!", name: "Jane Smith", role: "Designer" }, { quote: "Best decision ever!", name: "Bob Johnson", role: "Developer" }] },
            render: Testimonials
        },
        CTABanner: {
            fields: {
                title: { type: "text" },
                description: { type: "textarea" },
                buttonText: { type: "text" },
                buttonLink: { type: "text" },
                bgColor: { type: "text", label: "Background Color (hex)" }
            },
            defaultProps: { title: "Ready to Get Started?", description: "Join thousands of satisfied users", buttonText: "Sign Up Now", buttonLink: "/signup", bgColor: "#0ea5e9" },
            render: CTABanner
        },
        LogoCloud: {
            fields: {
                title: { type: "text" },
                logos: { type: "array", arrayFields: { name: { type: "text" }, url: { type: "text" } } }
            },
            defaultProps: { title: "Trusted By", logos: [{ name: "Company 1", url: "https://via.placeholder.com/150x50" }, { name: "Company 2", url: "https://via.placeholder.com/150x50" }] },
            render: LogoCloud
        },
        FAQSection: {
            fields: {
                title: { type: "text" },
                faqs: { type: "array", arrayFields: { question: { type: "text" }, answer: { type: "textarea" } } }
            },
            defaultProps: { title: "Frequently Asked Questions", faqs: [{ question: "What is this?", answer: "This is an FAQ section." }, { question: "How does it work?", answer: "It works great!" }] },
            render: FAQSection
        },
        CategoryShowcase: {
            fields: { title: { type: "text" } },
            defaultProps: { title: "Explore Categories" },
            render: CategoryShowcase
        },
        TeamSection: {
            fields: {
                title: { type: "text" },
                members: { type: "array", arrayFields: { name: { type: "text" }, role: { type: "text" }, bio: { type: "textarea" } } }
            },
            defaultProps: { title: "Meet Our Team", members: [{ name: "Alice", role: "CEO", bio: "Visionary leader" }, { name: "Bob", role: "CTO", bio: "Tech genius" }] },
            render: TeamSection
        },
        PricingTable: {
            fields: {
                title: { type: "text" },
                plans: {
                    type: "array", arrayFields: {
                        name: { type: "text" },
                        description: { type: "text" },
                        price: { type: "number" },
                        features: { type: "textarea", label: "Features (comma-separated)" },
                        featured: { type: "radio", options: [{ label: "No", value: false }, { label: "Yes", value: true }] }
                    }
                }
            },
            defaultProps: { title: "Choose Your Plan", plans: [{ name: "Basic", description: "For starters", price: 9, features: "Feature 1, Feature 2, Feature 3", featured: false }] },
            render: PricingTable
        },
        VideoEmbed: {
            fields: {
                title: { type: "text" },
                description: { type: "textarea" },
                videoUrl: { type: "text", label: "Video URL (YouTube/Vimeo embed)" }
            },
            defaultProps: { title: "Watch Our Video", description: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            render: VideoEmbed
        },
        Spacer: {
            fields: { height: { type: "number", label: "Height (px)" } },
            defaultProps: { height: 60 },
            render: Spacer
        },
        Divider: {
            fields: { style: { type: "select", options: [{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }] } },
            defaultProps: { style: "solid" },
            render: Divider
        },
        RichText: {
            fields: { content: { type: "textarea", label: "HTML Content" } },
            defaultProps: { content: "<h2>Rich Text Block</h2><p>Add your HTML content here.</p>" },
            render: RichText
        },
        AlertBlock: {
            fields: {
                variant: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Destructive", value: "destructive" }] },
                title: { type: "text" },
                description: { type: "textarea" }
            },
            defaultProps: { variant: "default", title: "Alert Title", description: "This is an alert message." },
            render: AlertBlock
        },
        TabsBlock: {
            fields: {
                tabs: { type: "array", arrayFields: { value: { type: "text" }, label: { type: "text" }, content: { type: "textarea" } } }
            },
            defaultProps: { tabs: [{ value: "tab1", label: "Tab 1", content: "<p>Content for tab 1</p>" }, { value: "tab2", label: "Tab 2", content: "<p>Content for tab 2</p>" }] },
            render: TabsBlock
        },
        ImageCarousel: {
            fields: {
                images: { type: "array", arrayFields: { url: { type: "text" }, caption: { type: "text" } } }
            },
            defaultProps: { images: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", caption: "Mountain landscape" }, { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800", caption: "Forest path" }] },
            render: ImageCarousel
        },
        ProgressBar: {
            fields: {
                label: { type: "text" },
                value: { type: "number" },
                showPercentage: { type: "radio", options: [{ label: "No", value: false }, { label: "Yes", value: true }] }
            },
            defaultProps: { label: "Progress", value: 75, showPercentage: true },
            render: ProgressBar
        },
        BlockquoteBlock: {
            fields: {
                quote: { type: "textarea" },
                author: { type: "text" },
                role: { type: "text" }
            },
            defaultProps: { quote: "This is an inspiring quote.", author: "John Doe", role: "Author" },
            render: BlockquoteBlock
        },
        CodeBlock: {
            fields: {
                code: { type: "textarea" },
                language: { type: "text" }
            },
            defaultProps: { code: "function hello() {\n  console.log('Hello World');\n}", language: "javascript" },
            render: CodeBlock
        },
        ImageGallery: {
            fields: {
                images: { type: "array", arrayFields: { url: { type: "text" }, caption: { type: "text" } } },
                columns: { type: "number" }
            },
            defaultProps: { images: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" }, { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400" }, { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" }], columns: 3 },
            render: ImageGallery
        },
        TableBlock: {
            fields: {
                headers: { type: "text", label: "Headers (comma-separated)" },
                rows: { type: "array", arrayFields: { cells: { type: "text", label: "Cells (comma-separated)" } } }
            },
            defaultProps: { headers: "Name, Email, Role", rows: [{ cells: "John Doe, john@example.com, Admin" }, { cells: "Jane Smith, jane@example.com, User" }] },
            render: TableBlock
        },
        SeparatorBlock: {
            fields: { spacing: { type: "number", label: "Spacing (px)" } },
            defaultProps: { spacing: 40 },
            render: SeparatorBlock
        },
        AuthorBio: {
            fields: {
                name: { type: "text" },
                role: { type: "text" },
                bio: { type: "textarea" },
                avatarUrl: { type: "text" }
            },
            defaultProps: { name: "John Doe", role: "Author & Developer", bio: "Passionate about technology and writing.", avatarUrl: "" },
            render: AuthorBio
        },
        Footer: {
            fields: {
                copyrightText: { type: "text" },
                links: { type: "array", arrayFields: { label: { type: "text" }, url: { type: "text" } } },
                socialLinks: { type: "array", arrayFields: { platform: { type: "text" }, url: { type: "text" } } }
            },
            defaultProps: {
                copyrightText: "© 2025 All rights reserved.",
                links: [{ label: "Home", url: "/" }, { label: "Posts", url: "/posts" }],
                socialLinks: [{ platform: "Twitter", url: "https://twitter.com" }, { platform: "GitHub", url: "https://github.com" }]
            },
            render: Footer
        },
        LatestPages: {
            fields: {
                title: { type: "text" },
                limit: { type: "number" }
            },
            defaultProps: { title: "Latest Pages", limit: 6 },
            render: LatestPages
        }
    },
};

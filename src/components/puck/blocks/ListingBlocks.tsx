import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export interface PostGridProps {
    title: string;
    categorySlug?: string;
    limit?: number;
}

interface Post {
    id: string;
    slug: string;
    image_url: string;
    title: string;
    category?: { name: string };
}

export const PostGrid = ({ title, categorySlug, limit }: PostGridProps) => {
    const [posts, setPosts] = useState<Post[]>([]);
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
                                {post.category?.name && <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600/20 backdrop-blur-sm">{post.category.name}</Badge>}
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

export interface CategoryShowcaseProps {
    title: string;
}

interface Category {
    id: string;
    slug: string;
    name: string;
}

export const CategoryShowcase = ({ title }: CategoryShowcaseProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
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

export interface LatestPagesProps {
    title?: string;
    limit?: number;
}

interface Page {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
}

export const LatestPages = ({ title, limit }: LatestPagesProps) => {
    const [pages, setPages] = useState<Page[]>([]);
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

    const renderContent = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                    ))}
                </div>
            )
        }

        if (pages.length > 0) {
            return (
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
            )
        }

        return (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border-dashed border-2">
                <p className="text-muted-foreground">No published pages yet. Create some pages in the admin panel!</p>
                <Button asChild variant="link" className="mt-2">
                    <Link to="/admin/pages">Go to Page Manager</Link>
                </Button>
            </div>
        )
    }

    return (
        <section className="container mx-auto px-4 py-12">
            {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
            {renderContent()}
        </section>
    );
};

import type { Config } from "@measured/puck";
import { Hero, FeatureSection, Newsletter, StatsCounter, Testimonials, CTABanner, LogoCloud, PricingTable, TeamSection } from "./blocks/MarketingBlocks";
import type { HeroProps, FeatureSectionProps, NewsletterProps, StatsCounterProps, TestimonialsProps, CTABannerProps, LogoCloudProps, PricingTableProps, TeamSectionProps } from "./blocks/MarketingBlocks";
import { PostGrid, CategoryShowcase, LatestPages } from "./blocks/ListingBlocks";
import type { PostGridProps, CategoryShowcaseProps, LatestPagesProps } from "./blocks/ListingBlocks";
import { RichText, VideoEmbed, BlockquoteBlock, CodeBlock, ImageGallery, AuthorBio } from "./blocks/ContentBlocks";
import type { RichTextProps, VideoEmbedProps, BlockquoteBlockProps, CodeBlockProps, ImageGalleryProps, AuthorBioProps } from "./blocks/ContentBlocks";
import { Spacer, Divider, SeparatorBlock } from "./blocks/LayoutBlocks";
import type { SpacerProps, DividerProps, SeparatorBlockProps } from "./blocks/LayoutBlocks";
import { AlertBlock, TabsBlock, ImageCarousel, ProgressBar, FAQSection } from "./blocks/InteractiveBlocks";
import type { AlertBlockProps, TabsBlockProps, ImageCarouselProps, ProgressBarProps, FAQSectionProps } from "./blocks/InteractiveBlocks";
import { TableBlock } from "./blocks/DataBlocks";
import type { TableBlockProps } from "./blocks/DataBlocks";

type Props = {
    Hero: HeroProps;
    PostGrid: PostGridProps;
    FeatureSection: FeatureSectionProps;
    Newsletter: NewsletterProps;
    StatsCounter: StatsCounterProps;
    Testimonials: TestimonialsProps;
    CTABanner: CTABannerProps;
    LogoCloud: LogoCloudProps;
    FAQSection: FAQSectionProps;
    CategoryShowcase: CategoryShowcaseProps;
    TeamSection: TeamSectionProps;
    PricingTable: PricingTableProps;
    VideoEmbed: VideoEmbedProps;
    Spacer: SpacerProps;
    Divider: DividerProps;
    RichText: RichTextProps;
    AlertBlock: AlertBlockProps;
    TabsBlock: TabsBlockProps;
    ImageCarousel: ImageCarouselProps;
    ProgressBar: ProgressBarProps;
    BlockquoteBlock: BlockquoteBlockProps;
    CodeBlock: CodeBlockProps;
    ImageGallery: ImageGalleryProps;
    TableBlock: TableBlockProps;
    SeparatorBlock: SeparatorBlockProps;
    AuthorBio: AuthorBioProps;
    LatestPages: LatestPagesProps;
};

// ===== CONFIG =====
export const config: Config<Props> = {
    categories: {
        layout: {
            title: "Layout",
            components: ["Hero", "Spacer", "Divider", "SeparatorBlock"]
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

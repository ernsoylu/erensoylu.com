import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Check, Star } from "lucide-react";

export interface HeroProps {
    title: string;
    subtitle?: string;
    bgImage?: string;
    ctaText?: string;
    ctaLink?: string;
}

export const Hero = ({ title, subtitle, bgImage, ctaText, ctaLink }: HeroProps) => (
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

export interface FeatureSectionProps {
    title: string;
    description: string;
    image?: string;
    alignRight?: boolean;
}

export const FeatureSection = ({ title, description, image, alignRight }: FeatureSectionProps) => (
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

export interface NewsletterProps {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
}

export const Newsletter = ({ title, description, placeholder, buttonText }: NewsletterProps) => {
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

export interface StatsCounterProps {
    stats: { value: string; label: string }[];
}

export const StatsCounter = ({ stats }: StatsCounterProps) => (
    <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</div>
                </div>
            ))}
        </div>
    </section>
);

export interface TestimonialsProps {
    title: string;
    testimonials: { quote: string; name: string; role: string }[];
}

export const Testimonials = ({ title, testimonials }: TestimonialsProps) => (
    <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
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

export interface CTABannerProps {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    bgColor?: string;
}

export const CTABanner = ({ title, description, buttonText, buttonLink, bgColor }: CTABannerProps) => (
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

export interface LogoCloudProps {
    title: string;
    logos: { name: string; url: string }[];
}

export const LogoCloud = ({ title, logos }: LogoCloudProps) => (
    <section className="container mx-auto px-4 py-16">
        <h3 className="text-center text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-wider">{title}</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
            {logos.map((logo, idx) => (
                <img key={idx} src={logo.url} alt={logo.name} className="h-8 md:h-10 object-contain" />
            ))}
        </div>
    </section>
);

export interface TeamSectionProps {
    title: string;
    members: { name: string; role: string; bio: string }[];
}

export const TeamSection = ({ title, members }: TeamSectionProps) => (
    <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((member, idx) => (
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

export interface PricingTableProps {
    title: string;
    plans: {
        name: string;
        description: string;
        price: number;
        features: string | string[];
        featured: boolean;
    }[];
}

export const PricingTable = ({ title, plans }: PricingTableProps) => (
    <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, idx) => {
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

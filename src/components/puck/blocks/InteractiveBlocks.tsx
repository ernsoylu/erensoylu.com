import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, AlertCircle } from "lucide-react";

export interface AlertBlockProps {
    variant: "default" | "destructive";
    title: string;
    description: string;
}

export const AlertBlock = ({ variant, title, description }: AlertBlockProps) => {
    const icons = { default: Info, destructive: AlertCircle };
    const Icon = icons[variant] || Info;
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

export interface TabsBlockProps {
    tabs: { value: string; label: string; content: string }[];
}

export const TabsBlock = ({ tabs }: TabsBlockProps) => (
    <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue={tabs[0]?.value || "tab1"} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-6">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: tab.content }} />
                </TabsContent>
            ))}
        </Tabs>
    </section>
);

export interface ImageCarouselProps {
    images: { url: string; caption?: string }[];
}

export const ImageCarousel = ({ images }: ImageCarouselProps) => (
    <section className="container mx-auto px-4 py-8">
        <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
                {images.map((img, idx) => (
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

export interface ProgressBarProps {
    label: string;
    value: number;
    showPercentage: boolean;
}

export const ProgressBar = ({ label, value, showPercentage }: ProgressBarProps) => (
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

export interface FAQSectionProps {
    title: string;
    faqs: { question: string; answer: string }[];
}

export const FAQSection = ({ title, faqs }: FAQSectionProps) => (
    <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </section>
);

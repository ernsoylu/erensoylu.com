import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { config } from "@/components/puck/puck.config";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const initialData: Data = {
    content: [],
    root: {},
};

export const FrontPageManager = () => {
    const [data, setData] = useState<Data>(initialData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const { data: settings } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'puck_home')
                .single();

            if (settings?.value) {
                setData(settings.value);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const handlePublish = async (newData: Data) => {
        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key: 'puck_home',
                value: newData,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Error saving data:", error);
            alert("Failed to save layout.");
        } else {
            console.log("Published!");
        }
    };

    if (loading) return <div>Loading Builder...</div>;

    return (
        <div className="h-[calc(100vh-4rem)] -m-8">
            {/* Offset padding from AdminLayout to make it full screen */}
            <Puck
                config={config}
                data={data}
                onPublish={handlePublish}
                headerPath="Front Page Builder"
                overrides={{
                    headerActions: ({ children }) => (
                        <div className="flex gap-2">
                            {children}
                            {/* We could add generic preview button here if needed */}
                        </div>
                    )
                }}
            />
        </div>
    );
};

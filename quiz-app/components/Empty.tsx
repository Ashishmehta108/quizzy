import { EmptyStateProps } from "@/lib/types";
import { Card, CardContent } from "./ui/card";



const EmptyState = ({
    icon: Icon,
    title,
    description,
    action
}: EmptyStateProps) => (
    <Card className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 shadow-inner ring-1 ring-zinc-200/40 dark:ring-zinc-700/40 flex items-center justify-center mb-6">
                <Icon size="32" className="text-zinc-600 dark:text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                {title}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-center mb-8 max-w-md leading-relaxed ">
                {description}
            </p>
            {action}
        </CardContent>
    </Card>
);


export default EmptyState
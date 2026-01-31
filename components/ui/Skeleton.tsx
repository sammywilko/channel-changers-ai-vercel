import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
    return (
        <div
            className={`animate-pulse bg-muted/50 rounded ${className}`}
        />
    );
};

// Pre-built skeleton variants for common use cases
export const CardSkeleton: React.FC = () => (
    <div className="border border-border rounded-lg p-6 space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
    </div>
);

export const TableRowSkeleton: React.FC = () => (
    <div className="flex items-center gap-4 py-3 border-b border-border">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-6 w-16 rounded-full" />
    </div>
);

export const DashboardSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 border border-border rounded-lg p-6 space-y-4">
                <Skeleton className="h-5 w-40" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <TableRowSkeleton key={i} />
                ))}
            </div>
            <div className="col-span-3 border border-border rounded-lg p-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
            </div>
        </div>
    </div>
);

export default Skeleton;

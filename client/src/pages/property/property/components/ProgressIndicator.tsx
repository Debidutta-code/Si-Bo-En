import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
    progress: number;
    totalFields: number;
    filledFields: number;
}

export const ProgressIndicator = ({ progress, totalFields, filledFields }: ProgressIndicatorProps) => {
    return (
        <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
                <span className='font-medium text-gray-700 flex items-center gap-2'>
                    {progress === 100 ? (
                        <CheckCircle2 className='h-4 w-4 text-green-600' />
                    ) : (
                        <Circle className='h-4 w-4 text-gray-400' />
                    )}
                    Form Progress
                </span>
                <span className='text-gray-600'>
                    {filledFields} of {totalFields} fields completed
                </span>
            </div>
            <Progress value={progress} className='h-2' />
        </div>
    );
};
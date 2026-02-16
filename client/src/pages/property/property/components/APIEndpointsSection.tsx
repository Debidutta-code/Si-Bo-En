import { Label } from '@/components/ui/label';
import { ExternalLink, Link2 } from 'lucide-react';
import type { ImasterIntegrationURLFields } from '../types';

interface APIEndpointsSectionProps {
    endpoints: ImasterIntegrationURLFields[];
    partnerName: string;
}

export const APIEndpointsSection = ({ endpoints, partnerName }: APIEndpointsSectionProps) => {
    if (endpoints.length === 0) return null;

    return (
        <div className='space-y-3'>
            <div className='flex items-center gap-2'>
                <Link2 className='h-4 w-4 text-gray-600' />
                <Label className='text-base font-semibold text-gray-900'>API Endpoints</Label>
            </div>
            
            <p className='text-sm text-gray-600'>
                Our system uses these endpoints to communicate with {partnerName}
            </p>
            
            <div className='space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4'>
                {endpoints.map((urlField) => (
                    <div 
                        key={urlField.id} 
                        className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded hover:bg-white transition-colors'
                    >
                        <span className='font-medium text-sm text-gray-700'>
                            {urlField.name}
                        </span>
                        <a
                            href={urlField.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 group'
                        >
                            <span className='truncate max-w-xs'>{urlField.url}</span>
                            <ExternalLink className='h-3 w-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform' />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};
import { Badge } from '@/components/ui/badge';
import { Cable, Building2 } from 'lucide-react';

interface PartnerInfoCardProps {
    name: string;
    type: 'channel_manager' | 'pms';
}

export const PartnerInfoCard = ({ name, type }: PartnerInfoCardProps) => {
    return (
        <div className='relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6'>
            {/* Background decoration */}
            <div className='absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-100 opacity-20' />
            <div className='absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-indigo-100 opacity-20' />
            
            <div className='relative flex items-start gap-4'>
                <div className='flex-shrink-0'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 shadow-lg'>
                        <Cable className='h-6 w-6 text-white' />
                    </div>
                </div>
                
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h3 className='text-lg font-semibold text-gray-900'>{name}</h3>
                        <Badge variant='secondary' className='bg-blue-100 text-blue-700 border-blue-200'>
                            <Building2 className='h-3 w-3 mr-1' />
                            {type === 'channel_manager' ? 'Channel Manager' : 'PMS'}
                        </Badge>
                    </div>
                    
                    <p className='text-sm text-gray-600 leading-relaxed'>
                        Setting up integration with <strong>{name}</strong>. 
                        Ensure you have the correct credentials from your {name} admin panel.
                    </p>
                </div>
            </div>
        </div>
    );
};
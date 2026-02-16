import { Shield, Lock } from 'lucide-react';

interface SecurityNoticeProps {
    partnerName: string;
}

export const SecurityNotice = ({ partnerName }: SecurityNoticeProps) => {
    return (
        <div className='relative overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4'>
            <div className='absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-full bg-amber-100 opacity-30' />
            
            <div className='relative flex items-start gap-3'>
                <div className='flex-shrink-0'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100'>
                        <Shield className='h-4 w-4 text-amber-700' />
                    </div>
                </div>
                
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                        <Lock className='h-3 w-3 text-amber-700' />
                        <h4 className='text-sm font-semibold text-amber-900'>Security Notice</h4>
                    </div>
                    <p className='text-xs text-amber-800 leading-relaxed'>
                        Your credentials are encrypted and stored securely. They will only be used 
                        for API communication with {partnerName} and are never shared with third parties.
                    </p>
                </div>
            </div>
        </div>
    );
};
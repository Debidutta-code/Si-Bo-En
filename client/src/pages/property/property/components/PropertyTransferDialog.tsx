import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { ArrowRight, Building2, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import { initTransferProcessService, completeTransferProcessService } from '../services';

// ── Step identifiers ─────────────────────────────────────────────────────────
type Step = 'prompt' | 'code' | 'otp';

interface PropertyTransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    creationId: string;
    /** The already-created property ID (if any). Used for the skip / normal navigate. */
    propertyId?: string;
}

export default function PropertyTransferDialog({
    open,
    onOpenChange,
    creationId,
    propertyId,
}: PropertyTransferDialogProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('prompt');
    const [propertyCode, setPropertyCode] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ── helpers ──────────────────────────────────────────────────────────────

    const resetState = () => {
        setStep('prompt');
        setPropertyCode('');
        setOtp('');
        setIsLoading(false);
    };

    const handleOpenChange = (v: boolean) => {
        if (!v) resetState();
        onOpenChange(v);
    };

    /** Normal flow — same as the original handleCreateProperty navigation */
    const navigateNormal = () => {
        if (!propertyId) {
            navigate(`/property/create?creationId=${creationId}`);
        } else {
            navigate(`/property/create?propertyId=${propertyId}`);
        }
    };

    // ── Step handlers ─────────────────────────────────────────────────────────

    const handleSkip = () => {
        handleOpenChange(false);
        navigateNormal();
    };

    const handleInitTransfer = async () => {
        if (!propertyCode.trim()) {
            toast.error('Please enter the property code.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await initTransferProcessService({
                propertyCode: propertyCode.trim(),
                newCreationId: creationId,
            });
            if (res?.success) {
                toast.success(res.message || 'OTP sent to the property registered email.');
                setStep('otp');
            } else {
                toast.error(res?.message || 'Failed to initiate transfer process.');
            }
        } catch {
            toast.error('Failed to initiate transfer process.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteTransfer = async () => {
        if (!otp.trim()) {
            toast.error('Please enter the OTP.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await completeTransferProcessService({
                propertyCode: propertyCode.trim(),
                newCreationId: creationId,
                otp: otp.trim(),
            });
            if (res?.success) {
                toast.success(res.message || 'Property recovered successfully!');
                handleOpenChange(false);
                const recoveredPropertyId = res.data ?? propertyId;
                navigate(`/property/${recoveredPropertyId}`);
            } else {
                toast.error(res?.message || 'Failed to complete transfer process.');
            }
        } catch {
            toast.error('Failed to complete transfer process.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">

                {/* ── Step 1: Prompt ────────────────────────────────────── */}
                {step === 'prompt' && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <DialogTitle className="text-lg font-semibold">
                                    Import Existing RevChill Property
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                                Do you want to import an existing RevChill property into this creation? 
                                If you have a property code from a previously deleted property, you can 
                                recover and link it here. Otherwise, click <strong>Skip</strong> to 
                                proceed with a fresh property setup.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-2 rounded-lg border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                            <p className="font-medium mb-1">What happens when you proceed?</p>
                            <ul className="space-y-1 list-disc list-inside text-blue-600">
                                <li>You'll enter the property code of the existing property.</li>
                                <li>An OTP will be sent to the property's registered email.</li>
                                <li>After OTP verification the property will be linked to this account.</li>
                            </ul>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
                            <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
                                Skip
                            </Button>
                            <Button onClick={() => setStep('code')} className="w-full sm:w-auto gap-2">
                                Proceed
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* ── Step 2: Property Code ─────────────────────────────── */}
                {step === 'code' && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                                    <KeyRound className="h-5 w-5 text-violet-600" />
                                </div>
                                <DialogTitle className="text-lg font-semibold">
                                    Enter Property Code
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Enter the unique property code of the RevChill property you want to recover.
                                An OTP will be sent to the property's registered email address.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="property-code">Property Code</Label>
                                <Input
                                    id="property-code"
                                    placeholder="e.g. RVC-12345"
                                    value={propertyCode}
                                    onChange={(e) => setPropertyCode(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleInitTransfer()}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
                            <Button
                                variant="outline"
                                onClick={() => setStep('prompt')}
                                className="w-full sm:w-auto"
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleInitTransfer}
                                disabled={isLoading || !propertyCode.trim()}
                                className="w-full sm:w-auto gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending OTP…
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* ── Step 3: OTP Verification ──────────────────────────── */}
                {step === 'otp' && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                    <MailCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <DialogTitle className="text-lg font-semibold">
                                    Verify OTP
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-muted-foreground">
                                An OTP has been sent to the registered email of property{' '}
                                <strong>{propertyCode}</strong>. Enter it below to complete the transfer.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="otp-input">One-Time Password</Label>
                                <Input
                                    id="otp-input"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCompleteTransfer()}
                                    autoFocus
                                    maxLength={8}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Didn't receive the OTP?{' '}
                                <button
                                    type="button"
                                    className="text-blue-600 hover:underline disabled:opacity-50"
                                    onClick={() => {
                                        setOtp('');
                                        setStep('code');
                                    }}
                                    disabled={isLoading}
                                >
                                    Go back and resend
                                </button>
                            </p>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
                            <Button
                                variant="outline"
                                onClick={() => setStep('code')}
                                className="w-full sm:w-auto"
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCompleteTransfer}
                                disabled={isLoading || !otp.trim()}
                                className="w-full sm:w-auto gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Verifying…
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-4 w-4" />
                                        Complete Transfer
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

            </DialogContent>
        </Dialog>
    );
}

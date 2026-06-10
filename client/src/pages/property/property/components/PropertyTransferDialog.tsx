import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { ArrowRight, Building2, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import { initTransferProcessService, completeTransferProcessService } from '../services';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
            toast.error(t('PropertyTransferDialog.toast.enterPropertyCode'));
            return;
        }
        setIsLoading(true);
        try {
            const res = await initTransferProcessService({
                propertyCode: propertyCode.trim(),
                newCreationId: creationId,
            });
            if (res?.success) {
                toast.success(res.message || t('PropertyTransferDialog.toast.otpSentFallback'));
                setStep('otp');
            } else {
                toast.error(res?.message || t('PropertyTransferDialog.toast.initFailed'));
            }
        } catch {
            toast.error(t('PropertyTransferDialog.toast.initFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteTransfer = async () => {
        if (!otp.trim()) {
            toast.error(t('PropertyTransferDialog.toast.enterOtp'));
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
                toast.success(res.message || t('PropertyTransferDialog.toast.recoveredFallback'));
                handleOpenChange(false);
                const recoveredPropertyId = res.data ?? propertyId;
                navigate(`/property/${recoveredPropertyId}`);
            } else {
                toast.error(res?.message || t('PropertyTransferDialog.toast.completeFailed'));
            }
        } catch {
            toast.error(t('PropertyTransferDialog.toast.completeFailed'));
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
                                    {t('PropertyTransferDialog.prompt.title')}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                                {t('PropertyTransferDialog.prompt.description')}{' '}
                                <strong>{t('PropertyTransferDialog.prompt.descriptionSkipWord')}</strong>{' '}
                                {t('PropertyTransferDialog.prompt.descriptionSuffix')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-2 rounded-lg border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                            <p className="font-medium mb-1">{t('PropertyTransferDialog.prompt.whatHappens')}</p>
                            <ul className="space-y-1 list-disc list-inside text-blue-600">
                                <li>{t('PropertyTransferDialog.prompt.step1')}</li>
                                <li>{t('PropertyTransferDialog.prompt.step2')}</li>
                                <li>{t('PropertyTransferDialog.prompt.step3')}</li>
                            </ul>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
                            <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
                                {t('PropertyTransferDialog.prompt.skip')}
                            </Button>
                            <Button onClick={() => setStep('code')} className="w-full sm:w-auto gap-2">
                                {t('PropertyTransferDialog.prompt.proceed')}
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
                                    {t('PropertyTransferDialog.code.title')}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-muted-foreground">
                                {t('PropertyTransferDialog.code.description')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="property-code">{t('PropertyTransferDialog.code.label')}</Label>
                                <Input
                                    id="property-code"
                                    placeholder={t('PropertyTransferDialog.code.placeholder')}
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
                                {t('PropertyTransferDialog.code.back')}
                            </Button>
                            <Button
                                onClick={handleInitTransfer}
                                disabled={isLoading || !propertyCode.trim()}
                                className="w-full sm:w-auto gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {t('PropertyTransferDialog.code.sendingOtp')}
                                    </>
                                ) : (
                                    <>
                                        {t('PropertyTransferDialog.code.next')}
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
                                    {t('PropertyTransferDialog.otp.title')}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-muted-foreground">
                                {t('PropertyTransferDialog.otp.descriptionPrefix')}{' '}
                                <strong>{propertyCode}</strong>{t('PropertyTransferDialog.otp.descriptionSuffix')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="otp-input">{t('PropertyTransferDialog.otp.label')}</Label>
                                <Input
                                    id="otp-input"
                                    placeholder={t('PropertyTransferDialog.otp.placeholder')}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCompleteTransfer()}
                                    autoFocus
                                    maxLength={8}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('PropertyTransferDialog.otp.didntReceive')}{' '}
                                <button
                                    type="button"
                                    className="text-blue-600 hover:underline disabled:opacity-50"
                                    onClick={() => {
                                        setOtp('');
                                        setStep('code');
                                    }}
                                    disabled={isLoading}
                                >
                                    {t('PropertyTransferDialog.otp.goBackResend')}
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
                                {t('PropertyTransferDialog.otp.back')}
                            </Button>
                            <Button
                                onClick={handleCompleteTransfer}
                                disabled={isLoading || !otp.trim()}
                                className="w-full sm:w-auto gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {t('PropertyTransferDialog.otp.verifying')}
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-4 w-4" />
                                        {t('PropertyTransferDialog.otp.completeTransfer')}
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

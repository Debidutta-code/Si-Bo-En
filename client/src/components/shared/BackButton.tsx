import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
export default function BackButton() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <Button variant={"ghost"} onClick={() => { navigate(-1); }}><ChevronLeft />{t('goBack')}</Button>
    )
}
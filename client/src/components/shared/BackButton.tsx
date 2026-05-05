import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';

export default function BackButton() {
    const navigate = useNavigate();
    return (
        <Button variant={"ghost"} onClick={() => { navigate(-1); }}><ChevronLeft />Go back</Button>
    )
}
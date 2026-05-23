import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TableView() {
  const { t } = useTranslation('PriceManagement');
  const { propertyId } = useParams();
  const [selectedMonth, setSelectedMonth] = useState('December 2025');
  const [selectedRate, setSelectedRate] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/app" className="hover:text-gray-900">{t('home')}</Link>
          <span>/</span>
          <span>{t('prices')}</span>
          <span>/</span>
          <Link to={`/property/price-management/seasons/${propertyId}`} className="hover:text-gray-900">
            {t('seasons.title')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('table.title')}</span>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">{t('table.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="month" className="text-base font-medium">{t('table.chooseMonth')}</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="November 2025">November 2025</SelectItem>
                  <SelectItem value="December 2025">December 2025</SelectItem>
                  <SelectItem value="January 2026">January 2026</SelectItem>
                  <SelectItem value="February 2026">February 2026</SelectItem>
                  <SelectItem value="March 2026">March 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rate" className="text-base font-medium">{t('table.chooseRate')}</Label>
              <Select value={selectedRate} onValueChange={setSelectedRate}>
                <SelectTrigger id="rate" className="mt-2">
                  <SelectValue placeholder={t('table.selectOption')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Rate</SelectItem>
                  <SelectItem value="special">Special Rate</SelectItem>
                  <SelectItem value="promo">Promotional Rate</SelectItem>
                  <SelectItem value="weekend">Weekend Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rooms" className="text-base font-medium">{t('table.chooseRooms')}</Label>
              <Select>
                <SelectTrigger id="rooms" className="mt-2">
                  <SelectValue placeholder={t('table.selectOptions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Room</SelectItem>
                  <SelectItem value="double">Double Room</SelectItem>
                  <SelectItem value="deluxe">Deluxe Room</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="boards" className="text-base font-medium">{t('table.chooseBoards')}</Label>
              <Select>
                <SelectTrigger id="boards" className="mt-2">
                  <SelectValue placeholder={t('table.selectOptions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ro">Room Only</SelectItem>
                  <SelectItem value="bb">Bed & Breakfast</SelectItem>
                  <SelectItem value="hb">Half Board</SelectItem>
                  <SelectItem value="fb">Full Board</SelectItem>
                  <SelectItem value="ai">All Inclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center pt-6">
              <Button className="bg-primary hover:bg-primary/90 text-white px-12 py-2 text-base">
                {t('table.viewTable')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
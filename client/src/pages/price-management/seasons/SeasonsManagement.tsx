import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function SeasonsManagement() {
  const { t } = useTranslation('PriceManagement');
  const { propertyId } = useParams();
  const [activeTab, setActiveTab] = useState('seasons');

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/app" className="hover:text-gray-900">{t('home')}</Link>
        <span>/</span>
        <span>{t('prices')}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{t('seasons.title')}</span>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('seasons')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'seasons'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('seasons.seasonsManagement')}
          </button>
          <Link
            to={`/property/price-management/periods/${propertyId}`}
            className="pb-3 px-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t('seasons.pricesPerSeason')}
          </Link>
          <Link
            to={`/property/price-management/calendar/${propertyId}`}
            className="pb-3 px-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t('seasons.seeCalendar')}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">{t('seasons.title')}</CardTitle>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            {t('seasons.addSeason')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">{t('seasons.name')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">{t('seasons.colour')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={2} className="text-center py-12 text-gray-500">
                    {t('seasons.noSeasons')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
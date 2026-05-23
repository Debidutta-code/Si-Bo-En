import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const months = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarView() {
  const { t } = useTranslation('PriceManagement');
  const { propertyId } = useParams();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [dateFrom, setDateFrom] = useState('');
  const [dateUntil, setDateUntil] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const toggleWeekday = (index: number) => {
    if (selectedWeekdays.includes(index)) {
      setSelectedWeekdays(selectedWeekdays.filter(d => d !== index));
    } else {
      setSelectedWeekdays([...selectedWeekdays, index]);
    }
  };

  return (
    <div className="container mx-auto p-6">
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
        <span className="text-gray-900 font-medium">{t('calendar.title')}</span>
      </div>

      {/* Year Selector */}
      <div className="flex justify-center gap-4 mb-6">
        {[2025, 2026, 2027].map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? "default" : "outline"}
            onClick={() => setSelectedYear(year)}
            className={selectedYear === year ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' : ''}
          >
            {year}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Date Range and Weekday Selector */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('calendar.addDates')}</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder={t('calendar.from')}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder={t('calendar.until')}
                    value={dateUntil}
                    onChange={(e) => setDateUntil(e.target.value)}
                  />
                </div>
              </div>

              {/* Weekdays */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('calendar.weekdays')}</label>
                <div className="grid grid-cols-7 gap-2">
                  {weekdays.map((day, idx) => (
                    <Button
                      key={idx}
                      variant={selectedWeekdays.includes(idx) ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10 p-0"
                      onClick={() => toggleWeekday(idx)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button className="bg-primary hover:bg-primary/90 text-white flex-1">
                  {t('calendar.apply')}
                </Button>
                <Button variant="outline" className="flex-1">
                  {t('calendar.clear')}
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            {months.map((month, monthIdx) => {
              const daysInMonth = getDaysInMonth(monthIdx, selectedYear);
              return (
                <div key={month} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 font-semibold text-gray-700">{month}</div>
                    <div className="flex-1">
                      <div className="grid grid-cols-7 md:grid-cols-14 lg:grid-cols-31 gap-1">
                        {Array.from({ length: daysInMonth }, (_, i) => (
                          <button
                            key={i}
                            className="w-8 h-8 text-xs hover:bg-gray-200 rounded flex items-center justify-center transition-colors border border-gray-200"
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
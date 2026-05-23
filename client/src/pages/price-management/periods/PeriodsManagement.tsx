import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Upload {
  id: number;
  room: string;
  occupancy: string;
  board: string;
  rate: string;
  from: string;
  until: string;
  options: string[];
  price: string;
}

export default function PeriodsManagement() {
  const { t } = useTranslation('PriceManagement');
  const { propertyId: _propertyId } = useParams();
  const [uploads, setUploads] = useState<Upload[]>([
    {
      id: 1,
      room: '',
      occupancy: '',
      board: '',
      rate: '',
      from: '',
      until: '',
      options: [],
      price: ''
    }
  ]);

  const addPeriod = () => {
    setUploads([
      ...uploads,
      {
        id: uploads.length + 1,
        room: '',
        occupancy: '',
        board: '',
        rate: '',
        from: '',
        until: '',
        options: [],
        price: ''
      }
    ]);
  };

  const removePeriod = () => {
    if (uploads.length > 1) {
      setUploads(uploads.slice(0, -1));
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/app" className="hover:text-gray-900">{t('home')}</Link>
        <span>/</span>
        {/* <span>Prices</span>
        <span>/</span>
        <span>Prices upload (period)</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">Hotel Social Hotel</span> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t('periods.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {uploads.map((upload, index) => (
            <div key={upload.id} className="space-y-4 border-b pb-6 last:border-0 last:pb-0">
              <h3 className="font-semibold text-lg text-gray-700">{t('periods.upload', { number: index + 1 })}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`room-${upload.id}`}>{t('periods.room')}</Label>
                  <Select>
                    <SelectTrigger id={`room-${upload.id}`}>
                      <SelectValue placeholder={t('periods.selectRoom')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deluxe">Deluxe Room</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="standard">Standard Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`occupancy-${upload.id}`}>{t('periods.occupancy')}</Label>
                  <Select>
                    <SelectTrigger id={`occupancy-${upload.id}`}>
                      <SelectValue placeholder={t('periods.selectOccupancy')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="triple">Triple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`board-${upload.id}`}>{t('periods.board')}</Label>
                  <Select>
                    <SelectTrigger id={`board-${upload.id}`}>
                      <SelectValue placeholder={t('periods.selectBoard')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">Room Only</SelectItem>
                      <SelectItem value="bb">Bed & Breakfast</SelectItem>
                      <SelectItem value="hb">Half Board</SelectItem>
                      <SelectItem value="fb">Full Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`rate-${upload.id}`}>{t('periods.rate')}</Label>
                  <Select>
                    <SelectTrigger id={`rate-${upload.id}`}>
                      <SelectValue placeholder={t('periods.selectRate')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Rate</SelectItem>
                      <SelectItem value="special">Special Rate</SelectItem>
                      <SelectItem value="promotional">Promotional Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`from-${upload.id}`}>{t('periods.from')}</Label>
                  <Input
                    id={`from-${upload.id}`}
                    type="date"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor={`until-${upload.id}`}>{t('periods.until')}</Label>
                  <Input
                    id={`until-${upload.id}`}
                    type="date"
                    className="w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`options-${upload.id}`}>{t('periods.selectOptions')}</Label>
                  <Select>
                    <SelectTrigger id={`options-${upload.id}`}>
                      <SelectValue placeholder={t('periods.selectOptions')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`price-${upload.id}`}>{t('periods.price')}</Label>
                  <Input
                    id={`price-${upload.id}`}
                    type="number"
                    placeholder={t('periods.enterPrice')}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={addPeriod} variant="outline">
              {t('periods.addPeriod')}
            </Button>
            <Button onClick={removePeriod} variant="outline" disabled={uploads.length === 1}>
              {t('periods.removePeriod')}
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              {t('periods.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
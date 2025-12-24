import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function SeasonsManagement() {
  const { propertyId } = useParams();
  const [activeTab, setActiveTab] = useState('seasons');

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/app" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <span>Prices</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">Seasons management</span>
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
            SEASONS MANAGEMENT
          </button>
          <Link
            to={`/property/price-management/periods/${propertyId}`}
            className="pb-3 px-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            PRICES PER SEASON
          </Link>
          <Link
            to={`/property/price-management/calendar/${propertyId}`}
            className="pb-3 px-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            SEE CALENDAR
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Seasons management</CardTitle>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            ADD SEASON
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Colour</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={2} className="text-center py-12 text-gray-500">
                    There is not any season created.
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
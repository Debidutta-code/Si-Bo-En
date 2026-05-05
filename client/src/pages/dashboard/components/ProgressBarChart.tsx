import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressBarChartProps {
  data: Array<{
    label: string;
    value: number;
    total: number;
    color: string;
  }>;
  title: string;
}

export default function ProgressBarChart({ data, title }: ProgressBarChartProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.value / item.total) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {item.value} / {item.total} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${item.color} flex items-center justify-end px-3`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-bold text-white">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

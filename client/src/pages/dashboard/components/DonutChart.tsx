import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DonutChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  title: string;
  centerLabel?: string;
}

export default function DonutChart({ data, title, centerLabel }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let cumulativePercent = 0;
  
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
      <CardHeader>
        <CardTitle className="text-orange-800 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Donut Chart */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const startPercent = cumulativePercent;
                cumulativePercent += percentage;
                
                const circumference = 2 * Math.PI * 40;
                const dashOffset = circumference - (percentage / 100) * circumference;
                const rotation = (startPercent / 100) * 360;
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={-dashOffset}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: '50% 50%',
                    }}
                  />
                );
              })}
              <circle cx="50" cy="50" r="34" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-800">{total}</div>
                <div className="text-xs text-gray-600">{centerLabel || 'Total'}</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 flex-row">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-white/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.value}</div>
                    <div className="text-xs text-gray-600">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

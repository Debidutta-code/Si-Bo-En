import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface StatusPieChartProps {
  data: ChartDataItem[];
  title: string;
}

export default function StatusPieChart({ data, title }: StatusPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);


  // Calculate pie chart segments
  let cumulativePercent = 0;
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Pie Chart */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const startPercent = cumulativePercent;
                cumulativePercent += percentage;
                
                const startAngle = (startPercent / 100) * 360;
                const endAngle = (cumulativePercent / 100) * 360;
                
                const x1 = 50 + 45 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 45 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 45 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 45 * Math.sin((Math.PI * endAngle) / 180);
                
                const largeArc = percentage > 50 ? 1 : 0;
                
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 45 45 0 ${largeArc} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                );
              })}
              <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-white/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium capitalize">
                      {item.label}
                    </span>
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

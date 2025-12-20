import { Sparkles, Clock, CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react';
import StatCard from './StatCard';
import StatusPieChart from './StatusPieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IHousekeepingAnalytics } from '../interface';

interface HousekeepingStatsProps {
  data: IHousekeepingAnalytics;
}

export default function HousekeepingStats({ data }: HousekeepingStatsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-primary to-primary rounded-lg shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
          Housekeeping Analytics
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={data?.totalTasks}
          icon={ClipboardList}
          description="All tasks"
        />
        <StatCard
          title="Completed Tasks"
          value={data?.completedTasks}
          icon={CheckCircle2}
          description={`${data?.completionRate}% completion rate`}
        />
        <StatCard
          title="Today's Tasks"
          value={data?.todayTasks}
          icon={AlertCircle}
          description="Assigned today"
        />
        <StatCard
          title="Avg Completion Time"
          value={`${data?.averageCompletionTimeMinutes} min`}
          icon={Clock}
          description="Per task"
        />
      </div>

      {/* Task Status with Pie Chart */}
      <StatusPieChart
        data={data?.taskStatusBreakdown.map((task, index) => {
          const colors = ['#10b981', '#3b82f6', '#a855f7', '#6b7280'];
          return {
            label: task.status.replace('_', ' '),
            value: task.count,
            color: colors[index % colors.length]
          };
        })}
        title="Task Status Distribution"
      />

      {/* Priority Distribution */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-lg">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data?.priorityBreakdown.map((priority) => (
              <div 
                key={priority.priority} 
                className={`p-3 border-2 rounded-lg shadow-sm transition-all hover:shadow-md ${
                  priority.priority === 'high' ? 'border-red-400 bg-gradient-to-r from-red-50 to-red-100' :
                  priority.priority === 'medium' ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100' :
                  'border-green-400 bg-gradient-to-r from-green-50 to-green-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold capitalize text-base ${
                    priority.priority === 'high' ? 'text-red-700' :
                    priority.priority === 'medium' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {priority.priority} Priority
                  </span>
                  <span className="text-2xl font-bold">{priority.count}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                  {((priority.count / data?.totalTasks) * 100).toFixed(1)}% of tasks
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

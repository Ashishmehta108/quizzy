import { Activity } from "iconsax-reactjs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ActivityChartProps {
  data: Array<{
    name: string;
    quizzes: number;
    score: number;
    date?: string;
    day?: string;
  }>;
}

const ActivityChart = ({ data }: ActivityChartProps) => {
  const hasData = data && data.length > 0 && data.some((d) => d.quizzes > 0);

  if (!hasData) {
    return (
      <Card className="col-span-full bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <Activity size="20" className="text-zinc-600 dark:text-zinc-400" />
            Quiz Activity (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="h-[280px] w-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 shadow-inner ring-1 ring-zinc-200/40 dark:ring-zinc-700/40 flex items-center justify-center mb-4 mx-auto">
                <Activity
                  size="32"
                  className="text-zinc-400 dark:text-zinc-500"
                />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                No quiz activity yet. Take some quizzes to see your progress!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <Activity size="20" className="text-zinc-600 dark:text-zinc-400" />
          Quiz Activity (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="opacity-20 text-zinc-400 dark:text-zinc-600"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-zinc-500 dark:text-zinc-400"
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-zinc-500 dark:text-zinc-400"
              />
              //@ts-expect-error
              <Tooltip
                //@ts-ignore
                content={({
                  active,
                  payload,
                  label,
                }: {
                  active?: boolean;
                  payload?: any[];
                  label?: string;
                }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Card className="bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 rounded-xl">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                            {data.day} ({label})
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Average Score: {payload[0].value}%
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Quizzes Taken: {data.quizzes}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="currentColor"
                strokeWidth={2}
                fill="currentColor"
                fillOpacity={0.1}
                className="text-blue-500 dark:text-zinc-300"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;

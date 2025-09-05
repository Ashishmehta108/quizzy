import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
// import type { Result } from "@/lib/types";
interface Result {
  name: string;
  quizzes: number;
  score: number;
  date?: string;
  day?: string;
}

export const useActivityData = () => {
  return useQuery({
    queryKey: ["activity-data"],
    queryFn: async () => {
      const res = await api.post<{ success: boolean; data: Result[] }>(
        "/utility/activityData",
        {
          userId: "d61d5cac-4079-4a80-93e9-a6be7e385c0c",

          resultId: null,
        },
        { withCredentials: true }
      );
      return res.data.data;
    },
    staleTime: 1000 * 60,
  });
};

export interface UsageData {
  billing: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    monthlyLimit: {
      quizzesGenerated: number;
      websearches: number;
    };
  };
  usage: {
    websearchesUsed: number;
    quizzesGeneratedUsed: number;
    periodStart: string;
    periodEnd: string;
  };
}

export const useUsageData = () => {
  return useQuery<UsageData>({
    queryKey: ["usage-data"],
    queryFn: async () => {
      const res = await api.post<{ success: boolean; data: UsageData }>(
        "/utility/usage",
        {
          userId: "d61d5cac-4079-4a80-93e9-a6be7e385c0c",
        },
        { withCredentials: true }
      );
      console.log(res.data.data);
      return res.data.data;
    },
    staleTime: 1000 * 60,
  });
};

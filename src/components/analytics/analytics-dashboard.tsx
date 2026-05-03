"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, FileDown, Loader2 } from "lucide-react";
import { generatePDF } from "@/lib/pdf";
import { toast } from "sonner";

interface AnalyticsData {
  totalMentions: number;
  sentimentBreakdown: { POSITIVE: number; NEGATIVE: number; NEUTRAL: number };
  mentionsTrend: { date: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  keywordStats: { keyword: string; positive: number; negative: number; neutral: number; total: number }[];
  avgSentimentScore: number;
}

const SENTIMENT_COLORS = { POSITIVE: "#22c55e", NEGATIVE: "#ef4444", NEUTRAL: "#94a3b8" };
const SOURCE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days]);

  async function handleExportPDF() {
    if (!data) return;
    setExporting(true);
    try {
      await generatePDF(data, days);
      toast.success("PDF report downloaded");
    } catch {
      toast.error("PDF export failed");
    } finally {
      setExporting(false);
    }
  }

  const sentimentScore = data?.avgSentimentScore ?? 0;
  const sentimentLabel = sentimentScore > 0.2 ? "Positive" : sentimentScore < -0.2 ? "Negative" : "Neutral";
  const SentimentIcon = sentimentScore > 0.2 ? TrendingUp : sentimentScore < -0.2 ? TrendingDown : Minus;

  const pieSentimentData = data
    ? [
        { name: "Positive", value: data.sentimentBreakdown.POSITIVE, color: SENTIMENT_COLORS.POSITIVE },
        { name: "Negative", value: data.sentimentBreakdown.NEGATIVE, color: SENTIMENT_COLORS.NEGATIVE },
        { name: "Neutral", value: data.sentimentBreakdown.NEUTRAL, color: SENTIMENT_COLORS.NEUTRAL },
      ].filter((d) => d.value > 0)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div id="analytics-report" className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Select value={days} onValueChange={(v) => v && setDays(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleExportPDF} disabled={exporting || !data?.totalMentions}>
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
          Export PDF
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total Mentions</p>
            <p className="text-3xl font-bold mt-1">{data?.totalMentions ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Positive</p>
            <p className="text-3xl font-bold mt-1 text-green-600">{data?.sentimentBreakdown.POSITIVE ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Negative</p>
            <p className="text-3xl font-bold mt-1 text-red-500">{data?.sentimentBreakdown.NEGATIVE ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Overall Sentiment</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{sentimentLabel}</p>
              <SentimentIcon className={`h-5 w-5 ${sentimentScore > 0.2 ? "text-green-500" : sentimentScore < -0.2 ? "text-red-500" : "text-gray-400"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mentions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.mentionsTrend ?? []}>
                <defs>
                  <linearGradient id="mentionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#mentionsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Split</CardTitle>
          </CardHeader>
          <CardContent>
            {pieSentimentData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieSentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieSentimentData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}`, n]} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.sourceBreakdown ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(data?.sourceBreakdown ?? []).map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Keyword Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.keywordStats ?? []).length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.keywordStats ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="keyword" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar dataKey="positive" fill="#22c55e" radius={[0, 4, 4, 0]} stackId="a" />
                  <Bar dataKey="neutral" fill="#94a3b8" stackId="a" />
                  <Bar dataKey="negative" fill="#ef4444" radius={[0, 4, 4, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

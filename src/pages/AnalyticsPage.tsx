import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';

import { useAuth } from '../context/AuthContext';
import { analyticsDashboardQuery } from '../lib/graphql/analytics';
import {
  commentsPerPostQuery,
  commentsPerUserQuery,
  commentsPerPeriodQuery,
  commentRatingDistributionQuery,
} from '../lib/graphql/comments';
import { Card } from '../components/Card';
import type {
  AnalyticsDashboard,
  CommentsPerPeriodStat,
  CommentsPerPostStat,
  CommentsPerUserStat,
  RatingDistributionStat,
} from '../lib/types';

const SEQUENTIAL_BLUE = '#2a78d6';
const DIVERGING_BLUE = '#2a78d6';
const DIVERGING_RED = '#e34948';
const STATUS_GOOD = '#0ca30c';
const MUTED = '#898781';
const GRID_COLOR = '#e1e0d9';
const AXIS_COLOR = '#c3c2b7';
const RATING_RAMP: Record<number, string> = { 1: '#86b6ef', 2: '#6da7ec', 3: '#5598e7', 4: '#3987e5', 5: '#2a78d6' };

const axisTickStyle = { fontSize: 12, fill: MUTED };

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
    </Card>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface AnalyticsData {
  dashboard: AnalyticsDashboard;
  commentsPerPost: CommentsPerPostStat[];
  commentsPerUser: CommentsPerUserStat[];
  commentsPerDay: CommentsPerPeriodStat[];
  ratingDistribution: RatingDistributionStat[];
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      analyticsDashboardQuery(token),
      commentsPerPostQuery(token),
      commentsPerUserQuery(token),
      commentsPerPeriodQuery(token, 'DAY'),
      commentRatingDistributionQuery(token),
    ]).then(([dashboard, commentsPerPost, commentsPerUser, commentsPerDay, ratingDistribution]) => {
      setData({ dashboard, commentsPerPost, commentsPerUser, commentsPerDay, ratingDistribution });
    });
  }, [token]);

  if (!data) {
    return null;
  }

  const { dashboard, commentsPerPost, commentsPerUser, commentsPerDay, ratingDistribution } = data;

  const totalUsers = dashboard.roleBreakdown.reduce((sum, row) => sum + row.online + row.offline, 0);
  const onlineNow = dashboard.roleBreakdown.reduce((sum, row) => sum + row.online, 0);

  const userGrowthData = dashboard.userGrowth.map((point) => ({ ...point, label: formatDate(point.date) }));
  const velocityData = dashboard.commentVelocity.map((point) => ({ ...point, label: formatDate(point.date) }));
  const commentsPerDayData = commentsPerDay
    .slice()
    .reverse()
    .map((point) => ({ ...point, label: formatDate(point.period) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Admin-only dashboard — user growth, engagement, and comment sentiment.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Total users" value={totalUsers} />
        <StatTile label="Online now" value={onlineNow} />
        <StatTile label="Top-rated posts tracked" value={dashboard.topRatedPosts.length} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="User growth" description="New signups over time">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userGrowthData}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="label" tick={axisTickStyle} stroke={AXIS_COLOR} />
              <YAxis tick={axisTickStyle} stroke={AXIS_COLOR} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                name="Signups"
                stroke={SEQUENTIAL_BLUE}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Role & presence" description="Users per role, online vs offline">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dashboard.roleBreakdown}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="role" tick={axisTickStyle} stroke={AXIS_COLOR} />
              <YAxis tick={axisTickStyle} stroke={AXIS_COLOR} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="online" name="Online" fill={STATUS_GOOD} radius={[4, 4, 0, 0]} />
              <Bar dataKey="offline" name="Offline" fill={MUTED} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Top cities" description="Where users are located">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dashboard.topCities} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={axisTickStyle} stroke={AXIS_COLOR} allowDecimals={false} />
              <YAxis type="category" dataKey="term" tick={axisTickStyle} stroke={AXIS_COLOR} width={110} />
              <Tooltip />
              <Bar dataKey="count" name="Users" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">
            Map view not available — showing user counts per city. Full location list below.
          </p>
          <div className="mt-3 max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="font-semibold pb-1">Geohash</th>
                  <th className="font-semibold pb-1">Lat</th>
                  <th className="font-semibold pb-1">Lon</th>
                  <th className="font-semibold pb-1">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.geoClusters.map((cluster) => (
                  <tr key={cluster.geohash}>
                    <td className="py-1 text-slate-600">{cluster.geohash}</td>
                    <td className="py-1 text-slate-600">{cluster.latitude.toFixed(2)}</td>
                    <td className="py-1 text-slate-600">{cluster.longitude.toFixed(2)}</td>
                    <td className="py-1 text-slate-600">{cluster.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Rating distribution" description="How comments are rated, 1-5 stars">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="rating" tick={axisTickStyle} stroke={AXIS_COLOR} />
              <YAxis tick={axisTickStyle} stroke={AXIS_COLOR} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Comments" radius={[4, 4, 0, 0]}>
                {ratingDistribution.map((entry) => (
                  <Cell key={entry.rating} fill={RATING_RAMP[entry.rating] ?? SEQUENTIAL_BLUE} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Comments per day" description="Comment volume over time">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={commentsPerDayData}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="label" tick={axisTickStyle} stroke={AXIS_COLOR} />
              <YAxis tick={axisTickStyle} stroke={AXIS_COLOR} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                name="Comments"
                stroke={SEQUENTIAL_BLUE}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Comment velocity" description="Day-over-day change in comment count">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={velocityData}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="label" tick={axisTickStyle} stroke={AXIS_COLOR} />
              <YAxis tick={axisTickStyle} stroke={AXIS_COLOR} allowDecimals={false} />
              <Tooltip />
              <ReferenceLine y={0} stroke={AXIS_COLOR} />
              <Bar dataKey="dailyChange" name="Change vs. prior day" radius={[4, 4, 4, 4]}>
                {velocityData.map((entry) => (
                  <Cell key={entry.date} fill={(entry.dailyChange ?? 0) >= 0 ? DIVERGING_BLUE : DIVERGING_RED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Top-rated posts" description="Highest average rating, min. one comment">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs">
                <th className="font-semibold pb-2">Post</th>
                <th className="font-semibold pb-2 text-right">Avg rating</th>
                <th className="font-semibold pb-2 text-right">Ratings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.topRatedPosts.map((post) => (
                <tr key={post.postId}>
                  <td className="py-2 text-slate-800 truncate max-w-[16rem]">{post.postTitle}</td>
                  <td className="py-2 text-right text-slate-600">{post.averageRating.toFixed(1)} ★</td>
                  <td className="py-2 text-right text-slate-600">{post.ratingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Most-commented posts" description="Comment count leaderboard">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs">
                <th className="font-semibold pb-2">Post</th>
                <th className="font-semibold pb-2 text-right">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commentsPerPost.slice(0, 10).map((row) => (
                <tr key={row.postId}>
                  <td className="py-2 text-slate-800 truncate max-w-[20rem]">{row.postTitle}</td>
                  <td className="py-2 text-right text-slate-600">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Most active commenters" description="Comment count per user">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs">
                <th className="font-semibold pb-2">User</th>
                <th className="font-semibold pb-2 text-right">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commentsPerUser.slice(0, 10).map((row) => (
                <tr key={row.userId}>
                  <td className="py-2 text-slate-800">{row.userName}</td>
                  <td className="py-2 text-right text-slate-600">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Commenter sentiment" description="Positive (rating ≥4) vs. critical (rating ≤2) per user">
          <div className="space-y-2">
            {dashboard.commenterSentiment.slice(0, 10).map((row) => {
              const total = row.positiveCount + row.criticalCount || 1;
              const positivePct = (row.positiveCount / total) * 100;
              const criticalPct = (row.criticalCount / total) * 100;
              return (
                <div key={row.userId}>
                  <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                    <span>{row.userName}</span>
                    <span>
                      {row.positiveCount} positive / {row.criticalCount} critical
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                    <div style={{ width: `${criticalPct}%`, backgroundColor: DIVERGING_RED }} />
                    <div style={{ width: `${positivePct}%`, backgroundColor: DIVERGING_BLUE }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <Section
        title="Significant terms in negative comments"
        description="Words that show up disproportionately in low-rated (≤2 star) comments"
      >
        {dashboard.negativeCommentTerms.length === 0 ? (
          <p className="text-sm text-slate-400">Not enough low-rated comments yet to surface significant terms.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs">
                <th className="font-semibold pb-2">Term</th>
                <th className="font-semibold pb-2 text-right">Score</th>
                <th className="font-semibold pb-2 text-right">Occurrences</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.negativeCommentTerms.map((row) => (
                <tr key={row.term}>
                  <td className="py-2 text-slate-800">{row.term}</td>
                  <td className="py-2 text-right text-slate-600">{row.score.toFixed(2)}</td>
                  <td className="py-2 text-right text-slate-600">{row.docCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}

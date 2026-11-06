import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from 'recharts';
import { KeywordData, isKeywordDroppedOver5 } from '../types/seo';

export interface DailyRankPoint {
  day: number;
  date: string;
  rank: number;
}

/**
 * Deterministic pseudo-random number generator seeded by string
 */
function seededRandom(seedStr: string, index: number): number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash + index * 997) * 10000;
  return x - Math.floor(x);
}

/**
 * Computes or retrieves a realistic 30-day rank trajectory for a keyword
 */
export function getKeywordRankHistory(kw: KeywordData): DailyRankPoint[] {
  if (kw.rankHistory && kw.rankHistory.length >= 7) {
    return kw.rankHistory;
  }

  const currentRank = kw.currentRank ?? 25;
  const rankDelta = kw.rankDelta ?? 0;
  const previousRank = kw.previousRank ?? Math.max(1, currentRank - rankDelta);
  const isDropped = isKeywordDroppedOver5(kw);

  const points: DailyRankPoint[] = [];
  const now = new Date();

  for (let i = 1; i <= 30; i++) {
    const daysAgo = 30 - i;
    const dateObj = new Date(now);
    dateObj.setDate(now.getDate() - daysAgo);

    const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = dateObj.getDate();
    const dateLabel = daysAgo === 0 ? `Today (${monthStr} ${dayNum})` : `${monthStr} ${dayNum}`;

    let computedRank = currentRank;

    if (isDropped) {
      // For keywords dropped >5 positions:
      // Days 1-22 were at the good previous rank (with minor noise)
      // Days 23-30 experienced the drop down to currentRank
      if (i <= 22) {
        const jitter = Math.floor(seededRandom(kw.keyword, i) * 3) - 1;
        computedRank = Math.max(1, previousRank + jitter);
      } else {
        const dropProgress = (i - 22) / 8; // 0 to 1
        const interpolated = previousRank + (currentRank - previousRank) * dropProgress;
        const jitter = Math.floor(seededRandom(kw.keyword, i) * 2);
        computedRank = Math.max(1, Math.round(interpolated + jitter));
      }
    } else if (rankDelta > 0) {
      // Climbing keyword: started lower (higher rank number) and steadily improved
      const climbProgress = i / 30;
      const startRank = Math.max(1, currentRank + rankDelta);
      const interpolated = startRank - (startRank - currentRank) * climbProgress;
      const jitter = Math.floor(seededRandom(kw.keyword, i) * 3) - 1;
      computedRank = Math.max(1, Math.round(interpolated + jitter));
    } else {
      // Stable or slight fluctuations around currentRank
      const jitter = Math.floor(seededRandom(kw.keyword, i) * 3) - 1;
      computedRank = Math.max(1, currentRank + jitter);
    }

    // Ensure the last day matches currentRank exactly
    if (i === 30) {
      computedRank = currentRank;
    }

    points.push({
      day: i,
      date: dateLabel,
      rank: computedRank,
    });
  }

  return points;
}

interface RankSparklineProps {
  keyword: KeywordData;
  width?: number | string;
  height?: number;
  showTooltip?: boolean;
  className?: string;
}

export const RankSparkline: React.FC<RankSparklineProps> = ({
  keyword,
  width = 110,
  height = 32,
  showTooltip = true,
  className = '',
}) => {
  const data = useMemo(() => getKeywordRankHistory(keyword), [keyword]);

  const isDropped = isKeywordDroppedOver5(keyword);
  const isRising = (keyword.rankDelta ?? 0) > 0;

  // In SEO:
  // Dropped rank = rose-600
  // Gained rank = emerald-500
  // Neutral = sky-600
  const strokeColor = isDropped ? '#e11d48' : isRising ? '#059669' : '#0284c7';

  // Compute min and max rank for the domain so the chart breathes nicely
  const ranks = data.map((d) => d.rank);
  const minRank = Math.max(1, Math.min(...ranks) - 1);
  const maxRank = Math.max(...ranks) + 1;

  if (!keyword.currentRank) {
    return (
      <div className={`flex items-center justify-center text-[10px] text-slate-400 font-mono ${className}`}>
        <span>No 30d SERP data</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: `${height}px` }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 3, right: 3, bottom: 3, left: 3 }}>
          {/* YAxis reversed: Rank #1 is at the top of the chart */}
          <YAxis
            type="number"
            reversed
            domain={[minRank, maxRank]}
            hide
          />
          {showTooltip && (
            <Tooltip
              isAnimationActive={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as DailyRankPoint;
                  return (
                    <div className="bg-slate-900/95 text-white text-[10px] px-2 py-1 rounded-md shadow-xl border border-slate-700 pointer-events-none whitespace-nowrap z-50">
                      <div className="font-mono text-slate-300">{pt.date}</div>
                      <div className="font-mono font-bold flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-400">SERP:</span>
                        <span style={{ color: strokeColor }}>#{pt.rank}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="rank"
            stroke={strokeColor}
            strokeWidth={1.75}
            dot={false}
            activeDot={{ r: 3, fill: strokeColor, stroke: '#ffffff', strokeWidth: 1.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

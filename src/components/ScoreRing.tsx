import React from 'react';
import { SubScores } from '../types/seo';

interface ScoreRingProps {
  score: number;
  projectedScore: number;
  subScores: SubScores;
  size?: number;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  projectedScore,
  subScores,
  size = 210,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const currentOffset = circumference - (score / 100) * circumference;
  const projectedOffset = circumference - (projectedScore / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 85) return '#059669'; // emerald-600
    if (val >= 70) return '#0284c7'; // sky-600
    if (val >= 50) return '#d97706'; // warm amber
    return '#e11d48'; // rose-600
  };

  const currentStrokeColor = getScoreColor(score);
  const delta = projectedScore - score;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-white via-sky-50/50 to-blue-50/40 border border-sky-100/90 shadow-sm backdrop-blur-md">
      {/* SVG Score Ring */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 filter drop-shadow-xs"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Projected score track (dashed warm gold) */}
          {delta > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={projectedOffset}
              strokeLinecap="round"
              strokeOpacity={0.4}
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Current score track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={currentStrokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={currentOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Live SEO Score
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
              {score}
            </span>
            <span className="text-sm font-bold text-slate-400">/100</span>
          </div>

          {delta > 0 && (
            <div className="mt-1 text-xs text-amber-600 font-bold flex items-center gap-1">
              <span>+{delta} pts with fixes</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-scores breakdown */}
      <div className="w-full flex-1 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">On-Page Health Audit</h2>
            <span className="text-xs text-sky-700 font-mono font-semibold bg-sky-100/60 px-2 py-0.5 rounded">
              Target Potential: {projectedScore}/100
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time crawler analysis across meta tags, semantic headings, schema graphs, and media alt attributes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Technical */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-sky-100 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Technical SEO</span>
              <span className="font-mono font-bold text-sky-700 tabular-nums">
                {subScores.technical}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-700"
                style={{ width: `${subScores.technical}%` }}
              />
            </div>
          </div>

          {/* Content & Keywords */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-sky-100 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Content &amp; Keywords</span>
              <span className="font-mono font-bold text-amber-600 tabular-nums">
                {subScores.contentKeywords}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${subScores.contentKeywords}%` }}
              />
            </div>
          </div>

          {/* Schema & Meta */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-sky-100 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Schema &amp; Meta Tags</span>
              <span className="font-mono font-bold text-indigo-600 tabular-nums">
                {subScores.schemaMeta}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${subScores.schemaMeta}%` }}
              />
            </div>
          </div>

          {/* Media & A11y */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-sky-100 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Media &amp; Accessibility</span>
              <span className="font-mono font-bold text-emerald-600 tabular-nums">
                {subScores.mediaA11y}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${subScores.mediaA11y}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, DollarSign, Briefcase, Shield, MapPin } from "lucide-react";
import { FALLBACK_STATE_METRICS, formatPopulation, formatIncome } from "@/lib/overlay-data";
import { STATE_NAMES } from "@/lib/fips-utils";
import { computeStateRanks } from "@/lib/state-rankings";

const allRanks = computeStateRanks(FALLBACK_STATE_METRICS);
const totalStates = Object.keys(FALLBACK_STATE_METRICS).length;

export function generateStaticParams() {
  return Object.keys(FALLBACK_STATE_METRICS).map((abbr) => ({ abbr }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ abbr: string }>;
}): Promise<Metadata> {
  const { abbr } = await params;
  const upper = abbr.toUpperCase();
  const name = STATE_NAMES[upper] || upper;
  const m = FALLBACK_STATE_METRICS[upper];

  if (!m) {
    return { title: "State Not Found | Meridian" };
  }

  return {
    title: `${name} Economic Profile | Meridian`,
    description: `${name}: Population ${formatPopulation(m.population)}, Median Income ${formatIncome(m.medianIncome)}, Unemployment ${m.unemploymentRate}%, Poverty ${m.povertyRate}%. Explore economic data on Meridian.`,
  };
}

function RankBadge({ rank, label }: { rank: number; label: string }) {
  const color =
    rank <= 5
      ? "text-[#14b8a6] bg-[#14b8a6]/10"
      : rank <= 15
        ? "text-[#f97316] bg-[#f97316]/10"
        : "text-[#4a4540] bg-[#1a1a1a]";

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${color}`}>
        #{rank}
      </span>
      <span className="text-[10px] text-[#4a4540] uppercase tracking-wider">
        of {totalStates} &middot; {label}
      </span>
    </div>
  );
}

export default async function StateProfilePage({
  params,
}: {
  params: Promise<{ abbr: string }>;
}) {
  const { abbr } = await params;
  const upper = abbr.toUpperCase();
  const name = STATE_NAMES[upper] || upper;
  const m = FALLBACK_STATE_METRICS[upper];
  const ranks = allRanks[upper];

  if (!m || !ranks) {
    return (
      <div className="min-h-screen bg-[#050505] pt-14 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-[#f5f0eb] mb-2">State not found</h1>
          <Link href="/rank" className="text-sm text-[#14b8a6] hover:underline">
            Back to rankings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/rank"
          className="inline-flex items-center gap-1.5 text-xs text-[#4a4540] hover:text-[#8a8580] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to rankings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#4a4540] mb-3">
            State Profile
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-[#f5f0eb] tracking-[-0.03em]">
            {name}
          </h1>
          <p className="mt-2 text-sm text-[#8a8580]">
            {upper} &middot; Population {formatPopulation(m.population)}
          </p>
        </div>

        {/* Metrics grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="card-glass rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3498db]" />
              <span className="text-xs text-[#4a4540] uppercase tracking-wider">Population</span>
            </div>
            <div className="text-2xl font-display text-[#f5f0eb]">
              {formatPopulation(m.population)}
            </div>
            <RankBadge rank={ranks.population} label="by population" />
          </div>

          <div className="card-glass rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs text-[#4a4540] uppercase tracking-wider">Median Income</span>
            </div>
            <div className="text-2xl font-display text-[#f5f0eb]">
              {formatIncome(m.medianIncome)}
            </div>
            <RankBadge rank={ranks.medianIncome} label="by income" />
          </div>

          <div className="card-glass rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#f97316]" />
              <span className="text-xs text-[#4a4540] uppercase tracking-wider">Unemployment</span>
            </div>
            <div className="text-2xl font-display text-[#f5f0eb]">
              {m.unemploymentRate}%
            </div>
            <RankBadge rank={ranks.unemploymentRate} label="lowest unemployment" />
          </div>

          <div className="card-glass rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#ef4444]" />
              <span className="text-xs text-[#4a4540] uppercase tracking-wider">Poverty Rate</span>
            </div>
            <div className="text-2xl font-display text-[#f5f0eb]">
              {m.povertyRate}%
            </div>
            <RankBadge rank={ranks.povertyRate} label="lowest poverty" />
          </div>

          <div className="card-glass rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#a78bfa]" />
              <span className="text-xs text-[#4a4540] uppercase tracking-wider">Gig Economy</span>
            </div>
            <div className="text-2xl font-display text-[#f5f0eb]">
              {m.gig_pct}%
            </div>
            <RankBadge rank={ranks.gig_pct} label="by gig economy" />
          </div>

          <div className="card-glass rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#ef4444]" />
              <span className="text-xs text-[#4a4540] uppercase tracking-wider">Privacy Law</span>
            </div>
            <div className="text-2xl font-display text-[#f5f0eb]">
              {m.hasActiveLegislation ? "Active" : "None"}
            </div>
            {m.legislationTopics.length > 0 && (
              <div className="space-y-1">
                {m.legislationTopics.map((topic) => (
                  <div key={topic} className="text-[10px] text-[#8a8580]">
                    {topic}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="accent-line mb-8" />
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/compare?states=${upper}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#14b8a6]/10 border border-[#14b8a6]/30 text-[#14b8a6] hover:bg-[#14b8a6]/20 transition-all"
          >
            <MapPin className="w-3.5 h-3.5" />
            Compare with other states
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#0a0a0a] border border-[#1a1a1a] text-[#8a8580] hover:border-[#2a2a2a] hover:text-[#f5f0eb] transition-all"
          >
            <MapPin className="w-3.5 h-3.5" />
            View on Map
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import StateRanker from "./components/StateRanker";

export const metadata: Metadata = {
  title: "Rank States | Meridian",
  description:
    "Rank all 50 US states by your priorities. Adjust weighted sliders for unemployment, income, poverty, cost of living, and gig economy to find the best state for you.",
};

export default function RankPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] pt-14 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#14b8a6] border-t-transparent" />
        </div>
      }
    >
      <StateRanker />
    </Suspense>
  );
}

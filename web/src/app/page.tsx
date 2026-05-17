"use client";

import { useState } from "react";
import { Hero, type HeroSearchParams } from "@/components/home/hero";
import { SearchResultsPanel } from "@/components/home/search-results-panel";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  const [search, setSearch] = useState<HeroSearchParams | null>(null);

  return (
    <div className="bg-[#f4f5f7]">
      <Hero onSearch={setSearch} />
      {search && (
        <SearchResultsPanel params={search} onClose={() => setSearch(null)} />
      )}
      <Footer />
    </div>
  );
}

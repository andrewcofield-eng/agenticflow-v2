"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";
import { mockAssets } from "@/lib/data/mock-data/assets";
import { mockAudiences } from "@/lib/data/mock-data/audiences";
import { mockProducts } from "@/lib/data/mock-data/products";
import SourcePanelCard from "./sourcepanelcard";

type SourceMode = "live" | "mock";

type SourceStatus = {
  source: "directus" | "cloudinary" | "hubspot";
  mode: SourceMode;
  count: number;
  lastRefreshed: string;
  warning?: string;
};

type SourceContextResponse = {
  normalized: {
    products: { name: string }[];
    assets: { title: string }[];
    audiences: { name: string }[];
  };
  sourceStatuses: SourceStatus[];
  recordCounts: {
    products: number;
    assets: number;
    audiences: number;
  };
};

type SourcePanelState = {
  products: string[];
  assets: string[];
  audiences: string[];
  statuses: Record<SourceStatus["source"], SourceStatus>;
};

const fallbackState: SourcePanelState = {
  products: mockProducts.map((product) => product.name),
  assets: mockAssets.map((asset) => asset.title),
  audiences: mockAudiences.map((audience) => audience.name),
  statuses: {
    directus: { source: "directus", mode: "mock", count: mockProducts.length, lastRefreshed: new Date(0).toISOString() },
    cloudinary: { source: "cloudinary", mode: "mock", count: mockAssets.length, lastRefreshed: new Date(0).toISOString() },
    hubspot: { source: "hubspot", mode: "mock", count: mockAudiences.length, lastRefreshed: new Date(0).toISOString() },
  },
};

export default function SourceDataPanelsShell() {
  const [state, setState] = useState<SourcePanelState>(fallbackState);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataUpdated, setDataUpdated] = useState(false);

  useEffect(() => {
    void loadSourceContext();
  }, []);

  const refreshLabel = isRefreshing ? "Refreshing..." : "Refresh Data";

  const activeStatuses = useMemo(() => state.statuses, [state.statuses]);

  async function loadSourceContext() {
    try {
      const response = await fetch("/api/source-context", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = await response.json() as SourceContextResponse;
      setState(mapResponseToState(payload));
      setDataUpdated(false);
    } catch {
      setDataUpdated(false);
    }
  }

  async function refreshData() {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      const response = await fetch("/api/source-context/refresh", {
        method: "POST",
      });

      if (!response.ok) {
        setDataUpdated(false);
        return;
      }

      const payload = await response.json() as SourceContextResponse & { dataUpdated?: boolean };
      setState(mapResponseToState(payload));
      setDataUpdated(Boolean(payload.dataUpdated));
      if (payload.dataUpdated) {
        setTimeout(() => setDataUpdated(false), 3000);
      }
    } catch {
      setDataUpdated(false);
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <SectionCard>
      <PageHeader
        eyebrow="Source context"
        title="Visible data inputs from CRM, PIM, and DAM"
        description="These panels show the kinds of source records the workflow will draw from. The live adapter layer can refresh from each source independently while preserving mock fallbacks."
      />

      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          {dataUpdated ? <p className="muted" style={{ margin: 0 }}>Data updated</p> : null}
        </div>
        <button type="button" className="button-secondary" onClick={refreshData} disabled={isRefreshing}>
          {refreshLabel}
        </button>
      </div>

      <div className="source-grid">
        <SourcePanelCard
          systemName="HubSpot"
          systemType="CRM"
          summary="Audience segments, lifecycle stages, engagement signals, and audience fit metadata."
          items={state.audiences}
          sourceMode={activeStatuses.hubspot.mode}
          lastRefreshed={activeStatuses.hubspot.lastRefreshed}
          warning={activeStatuses.hubspot.warning}
        />
        <SourcePanelCard
          systemName="Directus"
          systemType="PIM"
          summary="Product categories, use cases, audience fit tags, and value tier metadata."
          items={state.products}
          sourceMode={activeStatuses.directus.mode}
          lastRefreshed={activeStatuses.directus.lastRefreshed}
          warning={activeStatuses.directus.warning}
        />
        <SourcePanelCard
          systemName="Cloudinary"
          systemType="DAM"
          summary="Asset metadata, channel suitability, campaign fit, and product associations."
          items={state.assets}
          sourceMode={activeStatuses.cloudinary.mode}
          lastRefreshed={activeStatuses.cloudinary.lastRefreshed}
          warning={activeStatuses.cloudinary.warning}
        />
      </div>
    </SectionCard>
  );
}

function mapResponseToState(payload: SourceContextResponse): SourcePanelState {
  return {
    products: payload.normalized.products.map((product) => product.name),
    assets: payload.normalized.assets.map((asset) => asset.title),
    audiences: payload.normalized.audiences.map((audience) => audience.name),
    statuses: payload.sourceStatuses.reduce<SourcePanelState["statuses"]>((accumulator, status) => {
      accumulator[status.source] = status;
      return accumulator;
    }, {
      directus: { source: "directus", mode: "mock", count: 0, lastRefreshed: new Date(0).toISOString() },
      cloudinary: { source: "cloudinary", mode: "mock", count: 0, lastRefreshed: new Date(0).toISOString() },
      hubspot: { source: "hubspot", mode: "mock", count: 0, lastRefreshed: new Date(0).toISOString() },
    }),
  };
}

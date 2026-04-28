import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { HtmlArtifact } from "@/lib/types/renderers";
import type { Product } from "@/lib/types/product";
import CopyHtmlButton from "./copyhtmlbutton";

type HtmlPreviewCardProps = {
  artifact?: HtmlArtifact;
  audience?: Audience;
  products: Product[];
  asset?: Asset;
  brandName?: string;
  brandSourceMode?: "live" | "mock";
  copySource?: "ai-generated" | "placeholder";
};

export default function HtmlPreviewCard({
  artifact,
  audience,
  products,
  asset,
  brandName,
  brandSourceMode = "mock",
  copySource,
}: HtmlPreviewCardProps) {
  return (
    <div className="result-card">
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div>
          <h3>{artifact?.title ?? "HTML preview"}</h3>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            {artifact?.summary ?? "Rendered HTML preview will appear after content generation completes."}
          </p>
        </div>
        {artifact ? <CopyHtmlButton html={artifact.html} /> : null}
      </div>

      <div className="badge-row" style={{ marginBottom: 12 }}>
        {copySource ? (
          <span className={`badge ${copySource === "ai-generated" ? "badge-success" : "badge-warning"}`}>
            {copySource === "ai-generated" ? "AI-generated copy" : "Placeholder copy"}
          </span>
        ) : null}
        {artifact ? <span className="badge badge-subtle">Rendered HTML</span> : null}
        <span className={`badge ${brandSourceMode === "live" ? "badge-success" : "badge-warning"}`}>
          Brand {brandSourceMode === "live" ? "Live" : "Mock"}
        </span>
      </div>

      <p className="muted" style={{ marginTop: 0 }}>
        Audience: {audience?.name ?? "Not selected"} · Products: {products.slice(0, 2).map((product) => product.name).join(", ") || "Not selected"} · Asset: {asset?.title ?? "Not selected"} · Brand: {brandName ?? "Not available"}
      </p>

      {!artifact ? (
        <p className="muted">Rendered HTML will appear after copy is prepared.</p>
      ) : (
        <iframe
          title={artifact.title}
          srcDoc={artifact.html}
          sandbox=""
          style={{ width: "100%", minHeight: 420, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, background: "#fff" }}
        />
      )}
    </div>
  );
}

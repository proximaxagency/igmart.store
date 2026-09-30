import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "IGMART — The #1 Gaming Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0B0E17",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          color: "white",
        }}
      >
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              IG
            </div>
            <span style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px" }}>IGMART</span>
          </div>
          <div
            style={{
              padding: "8px 20px",
              borderRadius: "999px",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#F59E0B",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            100% Escrow Protection
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "900",
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              margin: 0,
              background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            The Premier Gaming Marketplace
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#94A3B8",
              maxWidth: "800px",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Buy & Sell Verified Accounts across 5 Top Mobile & Online Games
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "40px",
            padding: "20px 40px",
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "28px", fontWeight: "900", color: "#7C3AED" }}>5</span>
            <span style={{ fontSize: "14px", color: "#64748B" }}>Top Games</span>
          </div>
          <div style={{ width: "1px", height: "40px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "28px", fontWeight: "900", color: "#F59E0B" }}>100%</span>
            <span style={{ fontSize: "14px", color: "#64748B" }}>Escrow Protected</span>
          </div>
          <div style={{ width: "1px", height: "40px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "28px", fontWeight: "900", color: "#10B981" }}>4.9 / 5</span>
            <span style={{ fontSize: "14px", color: "#64748B" }}>Trust Score</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

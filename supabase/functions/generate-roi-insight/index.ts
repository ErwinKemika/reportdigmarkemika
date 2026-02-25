import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const {
      b2bLeads,
      b2gLeads,
      totalLeads,
      estimatedRevenue,
      investment,
      actualMarketplaceRevenue,
      projectedROI,
      roas,
      leadPipeline,
    } = data;

    const totalInvestment =
      investment.socialAds +
      investment.websiteSEO +
      investment.webstoreOps +
      investment.marketplaceAds;

    const pipelineSummary = leadPipeline
      .map(
        (l: any) =>
          `${l.projectName} (${l.leadSource}, ${l.stage}, Est. Revenue: Rp ${l.estimatedRevenue.toLocaleString("id-ID")})`
      )
      .join("; ");

    const wonCount = leadPipeline.filter((l: any) => l.stage === "Won").length;
    const qualifiedCount = leadPipeline.filter((l: any) => l.stage === "Qualified").length;
    const processingCount = leadPipeline.filter((l: any) => l.stage === "Processing").length;

    const prompt = `Kamu adalah analis digital marketing senior. Berikan insight summary dalam bahasa Indonesia (2-4 kalimat) berdasarkan data ROI & Revenue Impact berikut:

- B2B Leads: ${b2bLeads.value} (bulan lalu: ${b2bLeads.previousValue})
- B2G Leads: ${b2gLeads.value} (bulan lalu: ${b2gLeads.previousValue})
- Total Leads: ${totalLeads.value} (bulan lalu: ${totalLeads.previousValue})
- Est. Revenue: Rp ${estimatedRevenue.value.toLocaleString("id-ID")}
- Total Digital Investment: Rp ${totalInvestment.toLocaleString("id-ID")}
  - Social Ads: Rp ${investment.socialAds.toLocaleString("id-ID")}
  - Website/SEO: Rp ${investment.websiteSEO.toLocaleString("id-ID")}
  - Webstore Ops: Rp ${investment.webstoreOps.toLocaleString("id-ID")}
  - Marketplace Ads: Rp ${investment.marketplaceAds.toLocaleString("id-ID")}
- Actual Marketplace Revenue: Rp ${actualMarketplaceRevenue.toLocaleString("id-ID")}
- ROAS: ${roas.toFixed(2)}x
- Projected Digital ROI: ${projectedROI.toFixed(1)}%
- Lead Pipeline: ${pipelineSummary}
- Status pipeline: Won=${wonCount}, Qualified=${qualifiedCount}, Processing=${processingCount}

Berikan insight yang actionable, soroti pencapaian positif dan area yang perlu diperbaiki. Jangan gunakan bullet point, cukup paragraf singkat.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Kamu adalah analis digital marketing senior yang memberikan insight singkat, padat, dan actionable dalam bahasa Indonesia.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, coba lagi nanti." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credit habis, silakan top up." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const insight = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-roi-insight error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

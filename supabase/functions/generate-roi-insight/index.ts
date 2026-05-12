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
    const { data, type, month, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let prompt = "";
    let systemPrompt = "";
    let responseFormat = undefined;

    if (type === "global") {
      systemPrompt = "Kamu adalah Tim Digital Marketing Internal yang menulis laporan ke manajemen. Hasil akhir selalu dalam format JSON murni.";
      responseFormat = { type: "json_object" };
      prompt = `Kamu adalah Tim Digital Marketing Internal senior di perusahaan kami (KEMIKA - website resmi: www.kemika.co.id). Tugasmu adalah menyusun Executive Summary bulanan berdasarkan data laporan performa berikut untuk bulan ${month}.
JANGAN PERNAH menyebutkan bahwa kamu adalah AI, asisten, atau bot. Berbicaralah selayaknya manusia ahli marketing yang sedang melaporkan hasil ke manajemen.
Gunakan bahasa Indonesia yang profesional, padat, dan mudah dipahami oleh orang awam.

Berikut adalah raw data performa (dalam format JSON):
${JSON.stringify(payload, null, 2)}

Tugasmu:
1. Analisis performa keseluruhan.
2. Identifikasi channel terbaik (Best Channel).
3. Hitung/estimasi pencapaian target (Achievement Percent) dalam skala 0-100 secara logis berdasarkan data.
4. Buat daftar Key Insights (2-4 poin singkat).
5. Buat daftar Supporting Factors (Faktor Pendukung) (2-3 poin).
6. Buat daftar Limiting Factors (Faktor Penghambat/Kebocoran) (2-3 poin).
7. Buat satu paragraf Insight Summary yang menyimpulkan performa dan memberikan rekomendasi strategis untuk bulan depan.

PENTING: Output HARUS berupa JSON murni dengan skema berikut tanpa tambahan teks markdown lain:
{
  "keyInsights": ["Poin 1", "Poin 2"],
  "supportingFactors": ["Poin 1", "Poin 2"],
  "limitingFactors": ["Poin 1", "Poin 2"],
  "bestChannel": "Nama Channel Terbaik",
  "achievementPercent": 85,
  "insightSummary": "Paragraf kesimpulan..."
}`;
    } else {
      // Backward compatibility for ROI insight
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
        investment.ads +
        investment.websiteSEO +
        investment.maintenanceWebSosmed;

      const pipelineSummary = leadPipeline
        .map(
          (l: any) =>
            `${l.projectName} (${l.leadSource}, ${l.stage}, Est. Revenue: Rp ${l.estimatedRevenue.toLocaleString("id-ID")})`
        )
        .join("; ");

      const wonCount = leadPipeline.filter((l: any) => l.stage === "Won").length;
      const qualifiedCount = leadPipeline.filter((l: any) => l.stage === "Qualified").length;
      const processingCount = leadPipeline.filter((l: any) => l.stage === "Processing").length;

      systemPrompt = "Kamu adalah analis digital marketing senior yang memberikan insight singkat, padat, dan actionable dalam bahasa Indonesia.";
      prompt = `Kamu adalah analis digital marketing senior. Berikan insight summary dalam bahasa Indonesia (2-4 kalimat) berdasarkan data ROI & Revenue Impact berikut:

- B2B Leads: ${b2bLeads.value} (bulan lalu: ${b2bLeads.previousValue})
- B2G Leads: ${b2gLeads.value} (bulan lalu: ${b2gLeads.previousValue})
- Total Leads: ${totalLeads.value} (bulan lalu: ${totalLeads.previousValue})
- Est. Revenue: Rp ${estimatedRevenue.value.toLocaleString("id-ID")}
- Total Digital Investment: Rp ${totalInvestment.toLocaleString("id-ID")}
  - Website/SEO: Rp ${investment.websiteSEO.toLocaleString("id-ID")}
  - Ads: Rp ${investment.ads.toLocaleString("id-ID")}
  - Maintenance Web&Sosmed: Rp ${investment.maintenanceWebSosmed.toLocaleString("id-ID")}
- Actual Marketplace Revenue: Rp ${actualMarketplaceRevenue.toLocaleString("id-ID")}
- ROAS: ${roas.toFixed(2)}x
- Projected Digital ROI: ${projectedROI.toFixed(1)}%
- Lead Pipeline: ${pipelineSummary}
- Status pipeline: Won=${wonCount}, Qualified=${qualifiedCount}, Processing=${processingCount}

Berikan insight yang actionable, soroti pencapaian positif dan area yang perlu diperbaiki. Jangan gunakan bullet point, cukup paragraf singkat.`;
    }

    const fetchBody: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    };

    if (responseFormat) {
      fetchBody.responseFormat = responseFormat;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fetchBody),
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
    let content = result.choices?.[0]?.message?.content || "";

    if (type === "global") {
      content = content.replace(/^\`\`\`json/m, "").replace(/^\`\`\`/m, "").trim();
      const insightData = JSON.parse(content);
      return new Response(JSON.stringify(insightData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ insight: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("generate-roi-insight error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

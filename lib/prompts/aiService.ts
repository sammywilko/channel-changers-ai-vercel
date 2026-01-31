/**
 * Channel Changers - Pipeline AI Service
 * 
 * Uses the backend proxy for all Gemini API calls.
 * Integrates prompts for the production pipeline.
 */
// Use dynamic import to avoid TS parsing issues with complex template literals
// @ts-ignore - index.ts has valid exports but complex templates confuse TS
import * as PromptModule from './index';

// Types (inline to avoid import issues)
interface ScriptInput {
  brandContext: { brandName: string; brandUrl: string; productDescription: string; pricePoint?: string; keyDifferentiator: string };
  icpContext: { summary: string; painPoints: Array<{ pain: string; emotionalTrigger: string; exactLanguage: string }>; desires: Array<{ desire: string; aspirationLanguage: string }>; languageToUse: string[]; languageToAvoid: string[] };
  archetypeContext: { name: string; age: string; gender: string; aesthetic: string; energy: string; platformFit: string };
  competitorSourceUrl?: string;
  angleDescription: string;
  track: 'organic' | 'ads';
  lengthSeconds: number;
  platform: string;
  notes?: string;
}

interface BangerCheckInput {
  script: string;
  icpContext: ScriptInput['icpContext'];
  adType: 'organic' | 'ads';
  adLength: string;
}

// Access exports - using 'any' cast because TS has trouble parsing the large template literals in index.ts
const PROMPTS = (PromptModule as any).PROMPTS || (PromptModule as any).default;
const PROMPT_BUILDERS = (PromptModule as any).PROMPT_BUILDERS || {};
const { buildBrandResearchPrompt, buildScriptGenerationPrompt, buildBangerCheckPrompt } = PROMPT_BUILDERS;

// API call helper
async function callAI(prompt: string, options: {
  model?: 'fast' | 'thinking' | 'pro';
  maxTokens?: number;
  temperature?: number;
} = {}): Promise<string> {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      model: options.model || 'fast',
      maxOutputTokens: options.maxTokens || 4000,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'AI request failed' }));
    throw new Error(error.error || `AI call failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

// Extract JSON from AI response
function extractJSON(text: string): any {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  throw new Error('Failed to parse JSON from response');
}

// ===========================================
// STEP 0: Brand Research
// ===========================================
export async function runBrandResearch(
  brandUrl: string,
  competitorUrls: string[],
  additionalContext?: string
) {
  const prompt = buildBrandResearchPrompt(brandUrl, competitorUrls, additionalContext);

  const text = await callAI(prompt, {
    model: 'thinking',
    maxTokens: 8000,
    temperature: 0.7,
  });

  return extractJSON(text);
}

// ===========================================
// STEP 1: Daily Competitor Monitor
// ===========================================
export async function runCompetitorMonitor(
  brandContext: any,
  competitorContent: any[]
) {
  const prompt = `
${PROMPTS.DAILY_COMPETITOR_MONITOR}

---

## YOUR TASK

Analyze the following competitor content and generate today's report.

BRAND CONTEXT:
${JSON.stringify(brandContext, null, 2)}

COMPETITOR CONTENT (Last 48 hours):
${competitorContent.map(c => `
Source: ${c.handle}
URL: ${c.url}
Hook: "${c.hook}"
Engagement: ${c.engagement}
`).join('\n---\n')}

Generate the complete intelligence report.
`;

  const text = await callAI(prompt, { model: 'fast' });
  return extractJSON(text);
}

// ===========================================
// STEP 2: Script Generation
// ===========================================
export async function generateScript(input: ScriptInput) {
  const prompt = buildScriptGenerationPrompt(input);

  return await callAI(prompt, {
    model: 'thinking',
    maxTokens: 4000,
    temperature: 0.8, // Higher for creative output
  });
}

// ===========================================
// STEP 3: Banger Check
// ===========================================
export async function runBangerCheck(input: BangerCheckInput) {
  const prompt = buildBangerCheckPrompt(input);

  const text = await callAI(prompt, {
    model: 'thinking',
    maxTokens: 4000,
    temperature: 0.3, // Lower for consistent scoring
  });

  return parseBangerCheckResult(text);
}

function parseBangerCheckResult(text: string) {
  const scores = {
    hookStrength: parseInt(text.match(/Hook Strength:\s*(\d+)/i)?.[1] || '0'),
    painDesire: parseInt(text.match(/Pain\/Desire:\s*(\d+)/i)?.[1] || '0'),
    proofMechanism: parseInt(text.match(/Proof(?:\sMechanism)?:\s*(\d+)/i)?.[1] || '0'),
    structurePacing: parseInt(text.match(/Structure(?:\s&\sPacing)?:\s*(\d+)/i)?.[1] || '0'),
    ctaStrength: parseInt(text.match(/CTA(?:\sStrength)?:\s*(\d+)/i)?.[1] || '0'),
    productionViability: parseInt(text.match(/Production(?:\sViability)?:\s*(\d+)/i)?.[1] || '0'),
  };

  const totalScore = parseInt(text.match(/TOTAL(?:\sSCORE)?:\s*(\d+)/i)?.[1] || '0');

  let verdict: 'banger' | 'pass' | 'conditional' | 'fail' = 'fail';
  if (text.includes('BANGER')) verdict = 'banger';
  else if (text.includes('✅ PASS')) verdict = 'pass';
  else if (text.includes('CONDITIONAL')) verdict = 'conditional';

  const rewriteMatch = text.match(/REWRITTEN SCRIPT:([\s\S]*?)(?=REWRITE CHANGES|$)/i);

  return {
    scores,
    totalScore,
    verdict,
    passed: verdict === 'banger' || verdict === 'pass',
    rewrite: rewriteMatch ? rewriteMatch[1].trim() : undefined,
    rawResponse: text,
  };
}

// ===========================================
// STEP 4: Production Specs
// ===========================================
export async function generateProductionSpecs(
  script: string,
  characterSpecs: any,
  productionId: string
) {
  const prompt = `
${PROMPTS.HYBRID_PRODUCTION}

---

## YOUR TASK

Generate all 6 production specification documents for the following script.

APPROVED SCRIPT:
${script}

CHARACTER SPECS:
${JSON.stringify(characterSpecs, null, 2)}

PRODUCTION_ID: ${productionId}

Output each specification as a separate JSON code block labeled with the document name.
`;

  const text = await callAI(prompt, {
    model: 'thinking',
    maxTokens: 8000,
    temperature: 0.5,
  });

  const specs: any = {};

  const specNames = [
    'NANO_BANANA_PROMPTS',
    'CLING_ANIMATION_SPECS',
    'AURORA_LIPSYNC_SPECS',
    'ELEVEN_LABS_SCRIPT',
    'CAPCUT_RECIPE',
    'TOPAZ_SETTINGS'
  ];

  for (const name of specNames) {
    const regex = new RegExp(`${name}[\\s\\S]*?\`\`\`json\\n([\\s\\S]*?)\\n\`\`\``, 'i');
    const match = text.match(regex);
    if (match) {
      specs[name] = JSON.parse(match[1]);
    }
  }

  return specs;
}

// ===========================================
// FULL PIPELINE ORCHESTRATOR
// ===========================================
export async function runFullPipeline(
  brandId: string,
  angleDescription: string,
  options: {
    track: 'organic' | 'ads';
    lengthSeconds: number;
    platform: string;
    competitorSource?: string;
  }
) {
  // Fetch from Supabase
  const brand = await fetchBrandFromDb(brandId);
  const icp = await fetchICPFromDb(brandId);
  const archetype = await fetchArchetypeFromDb(brandId);

  console.log('📝 Step 2: Generating script...');
  const script = await generateScript({
    brandContext: brand,
    icpContext: icp,
    archetypeContext: archetype,
    angleDescription,
    track: options.track,
    lengthSeconds: options.lengthSeconds,
    platform: options.platform,
    competitorSourceUrl: options.competitorSource,
  });

  console.log('🎯 Step 3: Running banger check...');
  const check = await runBangerCheck({
    script,
    icpContext: icp,
    adType: options.track,
    adLength: `${options.lengthSeconds}s`,
  });

  if (!check.passed) {
    if (check.rewrite) {
      console.log('⚠️ Script needs rewrite, using improved version...');
      return {
        status: 'conditional',
        originalScript: script,
        rewrittenScript: check.rewrite,
        bangerCheck: check,
      };
    }
    return {
      status: 'failed',
      script,
      bangerCheck: check,
    };
  }

  console.log('🎨 Step 4: Generating production specs...');
  const productionId = `prod_${Date.now()}`;
  const specs = await generateProductionSpecs(script, archetype, productionId);

  return {
    status: 'ready_for_production',
    script,
    bangerCheck: check,
    productionSpecs: specs,
    productionId,
  };
}

// DB helpers - use Supabase
import { supabase } from '../supabase';

async function fetchBrandFromDb(brandId: string) {
  const { data } = await supabase
    .from('brands')
    .select('name, website_url, icp_summary')
    .eq('id', brandId)
    .single();

  return {
    brandName: data?.name || '',
    brandUrl: data?.website_url || '',
    productDescription: '',
    keyDifferentiator: '',
  };
}

async function fetchICPFromDb(brandId: string) {
  const { data } = await supabase
    .from('brands')
    .select('icp_summary, pain_points, desires')
    .eq('id', brandId)
    .single();

  return {
    summary: data?.icp_summary || '',
    painPoints: (data?.pain_points || []).map((p: string) => ({
      pain: p,
      emotionalTrigger: '',
      exactLanguage: '',
    })),
    desires: (data?.desires || []).map((d: string) => ({
      desire: d,
      aspirationLanguage: '',
    })),
    languageToUse: [],
    languageToAvoid: [],
  };
}

async function fetchArchetypeFromDb(brandId: string) {
  const { data } = await supabase
    .from('brands')
    .select('archetype_name, archetype_aesthetic')
    .eq('id', brandId)
    .single();

  return {
    name: data?.archetype_name || '',
    age: '',
    gender: '',
    aesthetic: data?.archetype_aesthetic || '',
    energy: '',
    platformFit: '',
  };
}

export { PROMPTS };

export default {
  runBrandResearch,
  runCompetitorMonitor,
  generateScript,
  runBangerCheck,
  generateProductionSpecs,
  runFullPipeline,
  PROMPTS,
};

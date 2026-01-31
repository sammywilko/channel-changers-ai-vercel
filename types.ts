export type UUID = string;

export enum BrandStatus {
  Draft = 'draft',
  Active = 'active',
  Paused = 'paused',
  Archived = 'archived',
}

export interface Brand {
  id: UUID;
  name: string;
  website_url: string;
  created_at: string;
  updated_at: string;
  
  // ICP Data
  icp_summary?: string;
  pain_points?: string[];
  desires?: string[];
  
  // Archetype
  archetype_name?: string;
  archetype_aesthetic?: string;
  
  // Voice
  voice_type?: string;
  
  // Nano Banana Brief
  nano_banana_character_brief?: string;
  
  status: BrandStatus;
}

export enum ScriptTrack {
  Organic = 'organic',
  Ads = 'ads',
}

export enum ScriptStatus {
  Draft = 'draft',
  PendingCheck = 'pending_check',
  Passed = 'passed',
  Failed = 'failed',
  InProduction = 'in_production',
  Complete = 'complete',
}

export interface Script {
  id: UUID;
  brand_id: UUID;
  title: string;
  track: ScriptTrack;
  length_seconds: number;
  platform: 'tiktok' | 'instagram' | 'youtube';
  
  full_script?: string;
  hook?: string;
  scenes?: any[];
  
  status: ScriptStatus;
  created_at: string;
  
  // Mock relational data
  brand_name?: string;
  banger_score?: number;
}

export enum ProductionStatus {
  Pending = 'pending',
  GeneratingImages = 'generating_images',
  GeneratingAnimations = 'generating_animations',
  GeneratingVoice = 'generating_voice',
  Assembling = 'assembling',
  QAReview = 'qa_review',
  HumanReview = 'human_review',
  Approved = 'approved',
  Rejected = 'rejected',
  Published = 'published',
}

export interface Production {
  id: UUID;
  script_id: UUID;
  brand_id: UUID;
  status: ProductionStatus;
  
  generated_images?: string[];
  final_video_url?: string;
  
  created_at: string;
  
  // Mock relational data
  script_title?: string;
  brand_name?: string;
}

export enum JobType {
  BrandResearch = 'brand_research',
  ScriptGeneration = 'script_generation',
  Production = 'production_spec',
}

export enum JobStatus {
  Pending = 'pending',
  Processing = 'processing',
  Complete = 'complete',
  Failed = 'failed',
}

export interface Job {
  id: UUID;
  job_type: JobType;
  related_entity_id: UUID; // brand_id or script_id
  related_entity_name: string;
  status: JobStatus;
  priority: number;
  scheduled_for: string;
  created_at: string;
}

export interface BangerCheck {
    id: UUID;
    script_id: UUID;
    hook_strength: number;
    pain_desire_targeting: number;
    proof_mechanism: number;
    structure_pacing: number;
    cta_strength: number;
    production_viability: number;
    total_score: number;
    verdict: 'banger' | 'pass' | 'conditional' | 'fail';
    strengths: string[];
    weaknesses: string[];
    rewrite_suggestions: string[];
}

export interface CompetitorReport {
  id: UUID;
  brand_id: UUID;
  brand_name: string;
  report_date: string;
  analyzed_count: number;
  trends_spotted: string[];
  status: 'pending' | 'processing' | 'complete' | 'failed';
  created_at: string;
}
/**
 * Database Service
 * Replaces in-memory mockDb with Supabase queries.
 * Maintains same interface for minimal refactoring.
 */

import { supabase, getUser } from '../lib/supabase';
import {
  Brand, BrandStatus,
  Script, ScriptStatus, ScriptTrack,
  Production, ProductionStatus,
  Job, JobType, JobStatus,
  CompetitorReport
} from '../types';

// Helper to get current user ID
const getUserId = async () => {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

export const Db = {
  // ============================================
  // BRANDS
  // ============================================
  getBrands: async (): Promise<Brand[]> => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getBrandById: async (id: string): Promise<Brand | undefined> => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  },

  createBrand: async (brand: Partial<Brand>): Promise<Brand> => {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('brands')
      .insert({
        ...brand,
        user_id: userId,
        status: BrandStatus.Draft,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateBrand: async (id: string, updates: Partial<Brand>): Promise<Brand | undefined> => {
    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================
  // SCRIPTS
  // ============================================
  getScripts: async (): Promise<Script[]> => {
    const { data, error } = await supabase
      .from('scripts')
      .select(`
        *,
        brands!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map brand name to script
    return (data || []).map(s => ({
      ...s,
      brand_name: s.brands?.name,
    }));
  },

  getScriptById: async (id: string): Promise<Script | undefined> => {
    const { data, error } = await supabase
      .from('scripts')
      .select(`
        *,
        brands!inner(name)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      return {
        ...data,
        brand_name: data.brands?.name,
      };
    }
    return undefined;
  },

  createScript: async (script: Partial<Script>): Promise<Script> => {
    const userId = await getUserId();
    const brand = script.brand_id ? await Db.getBrandById(script.brand_id) : undefined;

    const { data, error } = await supabase
      .from('scripts')
      .insert({
        ...script,
        user_id: userId,
        status: ScriptStatus.Draft,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      brand_name: brand?.name,
    };
  },

  updateScript: async (id: string, updates: Partial<Script>): Promise<Script | undefined> => {
    const { data, error } = await supabase
      .from('scripts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================
  // PRODUCTIONS
  // ============================================
  getProductions: async (): Promise<Production[]> => {
    const { data, error } = await supabase
      .from('productions')
      .select(`
        *,
        scripts(title),
        brands(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      ...p,
      script_title: p.scripts?.title,
      brand_name: p.brands?.name,
    }));
  },

  getProductionById: async (id: string): Promise<Production | undefined> => {
    const { data, error } = await supabase
      .from('productions')
      .select(`
        *,
        scripts(title),
        brands(name)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      return {
        ...data,
        script_title: data.scripts?.title,
        brand_name: data.brands?.name,
      };
    }
    return undefined;
  },

  createProduction: async (scriptId: string): Promise<Production> => {
    const userId = await getUserId();
    const script = await Db.getScriptById(scriptId);

    if (!script) throw new Error("Script not found");

    const { data, error } = await supabase
      .from('productions')
      .insert({
        script_id: script.id,
        brand_id: script.brand_id,
        user_id: userId,
        status: ProductionStatus.Pending,
      })
      .select()
      .single();

    if (error) throw error;

    // Create associated job
    await Db.createJob({
      job_type: JobType.Production,
      related_entity_id: data.id,
      related_entity_name: script.title,
      status: JobStatus.Pending,
      priority: 5,
    });

    return {
      ...data,
      script_title: script.title,
      brand_name: script.brand_name,
    };
  },

  // ============================================
  // JOBS
  // ============================================
  getJobs: async (): Promise<Job[]> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  createJob: async (job: Partial<Job>): Promise<Job> => {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...job,
        user_id: userId,
        status: job.status || JobStatus.Pending,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateJob: async (id: string, updates: Partial<Job>): Promise<Job | undefined> => {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================
  // REPORTS
  // ============================================
  getReports: async (): Promise<CompetitorReport[]> => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        brands(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(r => ({
      ...r,
      brand_name: r.brands?.name,
    }));
  },

  getReportById: async (id: string): Promise<CompetitorReport | undefined> => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        brands(name)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      return {
        ...data,
        brand_name: data.brands?.name,
      };
    }
    return undefined;
  },
};

// Keep MockDb as alias for backwards compatibility during migration
export const MockDb = Db;

export default Db;
#!/usr/bin/env node

/**
 * Database seeding script for magic items
 *
 * This script processes the magic-items-list.json file and can either:
 * 1. Create a normalized JSON file for frontend consumption
 * 2. Seed the database with magic items (if we decide to store them in DB)
 *
 * Usage:
 * npm run seed:magic-items
 *
 * Options:
 * --format=json    - Output normalized JSON (default)
 * --format=db      - Seed database
 * --output=path    - Output file path (for JSON format)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Types
interface SourceMagicItem {
  name: string;
  slug: string;
  description: string;
  traits: Array<{
    name: string;
    description: string;
  }>;
}

interface DbMagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: Array<{
    name: string;
    description: string;
  }>;
}

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

// Simple converter from source JSON to database format

function normalizeItem(item: SourceMagicItem): DbMagicItem {
  return {
    id: item.slug,
    name: item.name,
    slug: item.slug,
    description: item.description,
    traits: item.traits
  };
}

async function loadSourceData(): Promise<SourceMagicItem[]> {
  const filePath = path.join(process.cwd(), 'magic-items-list.json');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Magic items file not found at: ${filePath}`);
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

async function generateNormalizedJson(items: DbMagicItem[], outputPath?: string): Promise<void> {
  const output = outputPath || path.join(process.cwd(), 'public', 'data', 'magic-items.json');

  // Ensure output directory exists
  const outputDir = path.dirname(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write normalized data
  fs.writeFileSync(output, JSON.stringify(items, null, 2));

  console.log(`✅ Generated normalized magic items JSON: ${output}`);
  console.log(`📊 Total items: ${items.length}`);

  // Generate statistics
  const traitNames = items.flatMap(item => item.traits.map(trait => trait.name));
  const traitStats = traitNames.reduce((acc, traitName) => {
    acc[traitName] = (acc[traitName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📈 Trait Distribution:');
  Object.entries(traitStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([trait, count]) => {
      console.log(`  ${trait}: ${count}`);
    });
}

async function seedDatabase(items: DbMagicItem[]): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY environment variables.');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('🔄 Starting database seeding...');

  // Clear existing data first (if any)
  console.log('🔄 Clearing existing magic items...');
  const { error: deleteError } = await supabase
    .from('magic_items')
    .delete()
    .gt('id', ''); // Delete all (gt('id', '') is a workaround to select all records)

  if (deleteError && !deleteError.message.includes('No rows found')) {
    console.warn('⚠️  Delete warning:', deleteError.message);
  }

  // Insert items in batches
  const batchSize = 100; // Supabase can handle larger batches
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    console.log(`🔄 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}...`);

    const { error: insertError, count } = await supabase
      .from('magic_items')
      .insert(batch)
      .select('id', { count: 'exact', head: true });

    if (insertError) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError.message);
      errors++;
    } else {
      inserted += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} items`);
    }
  }

  console.log(`\n🎉 Database seeding complete!`);
  console.log(`📊 Total items processed: ${items.length}`);
  console.log(`✅ Successfully inserted: ${inserted}`);
  if (errors > 0) {
    console.log(`❌ Batches with errors: ${errors}`);
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'json';
    const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1];

    console.log('🔄 Loading source magic items...');
    const sourceItems = await loadSourceData();

    console.log('🔄 Normalizing items...');
    const normalizedItems = sourceItems.map(normalizeItem);

    if (format === 'db') {
      await seedDatabase(normalizedItems);
    } else {
      await generateNormalizedJson(normalizedItems, outputPath);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { normalizeItem };
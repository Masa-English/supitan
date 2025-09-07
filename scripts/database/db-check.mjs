#!/usr/bin/env node
/*
  Simple Supabase DB check script.
  - Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from env
  - Prints counts and small samples of key tables
*/
import { createClient } from '@supabase/supabase-js';

function fail(message) {
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  fail('Environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.');
}

const supabase = createClient(url, anonKey);

async function fetchCount(table) {
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
  if (error) return { table, error: error.message };
  return { table, count };
}

async function fetchSample(table, columns = 'id', order = undefined) {
  let q = supabase.from(table).select(columns).limit(5);
  if (order) q = q.order(order, { ascending: true });
  const { data, error } = await q;
  if (error) return { table, error: error.message };
  return { table, sample: data };
}

async function main() {
  const start = Date.now();
  const results = {};

  const counts = await Promise.all([
    fetchCount('words'),
    fetchCount('categories'),
    fetchCount('user_progress'),
    fetchCount('review_words'),
    fetchCount('study_sessions'),
    fetchCount('user_profiles'),
  ]);

  counts.forEach((r) => {
    results[r.table] = { ...(results[r.table] || {}), total: r.count ?? null, error: r.error ?? null };
  });

  const samples = await Promise.all([
    fetchSample('words', 'id, word, category, phonetic', 'word'),
    fetchSample('categories', 'name, sort_order, is_active', 'sort_order'),
  ]);

  samples.forEach((r) => {
    results[r.table] = { ...(results[r.table] || {}), sample: r.sample ?? null, error: r.error ?? null };
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        env:
          url && anonKey
            ? { url: `${url.substring(0, 32)}...`, keyPresent: true }
            : { url: null, keyPresent: false },
        results,
        tookMs: Date.now() - start,
      },
      null,
      2
    )
  );
}

main().catch((e) => fail(e.message || String(e)));



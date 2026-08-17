import { v4 as uuid } from 'uuid';
import { getDb } from '../db/connection';
import type { AIInsight } from '../../../shared/src/index';

interface InsightRow {
  id: string;
  lead_id: string;
  type: string;
  title: string;
  content: string;
  confidence: number;
  generated_at: string;
}

function rowToInsight(row: InsightRow): AIInsight {
  return {
    id: row.id,
    leadId: row.lead_id,
    type: row.type as AIInsight['type'],
    title: row.title,
    content: row.content,
    confidence: row.confidence,
    generatedAt: row.generated_at,
  };
}

export class InsightRepository {
  findByLeadId(leadId: string): AIInsight[] {
    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM ai_insights WHERE lead_id = ? ORDER BY generated_at DESC'
    ).all(leadId) as InsightRow[];
    return rows.map(rowToInsight);
  }

  create(insight: Omit<AIInsight, 'id' | 'generatedAt'>): AIInsight {
    const db = getDb();
    const id = uuid();
    const now = new Date().toISOString();

    db.prepare(
      'INSERT INTO ai_insights (id, lead_id, type, title, content, confidence, generated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, insight.leadId, insight.type, insight.title, insight.content, insight.confidence, now);

    return { id, ...insight, generatedAt: now };
  }

  deleteByLeadId(leadId: string): void {
    const db = getDb();
    db.prepare('DELETE FROM ai_insights WHERE lead_id = ?').run(leadId);
  }
}

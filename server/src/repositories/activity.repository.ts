import { v4 as uuid } from 'uuid';
import { getDb } from '../db/connection';
import type { Activity, CreateActivityInput } from '../../../shared/src/index';

interface ActivityRow {
  id: string;
  lead_id: string;
  type: string;
  description: string;
  outcome: string;
  created_at: string;
}

function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    leadId: row.lead_id,
    type: row.type as Activity['type'],
    description: row.description,
    outcome: row.outcome,
    createdAt: row.created_at,
  };
}

export class ActivityRepository {
  findByLeadId(leadId: string): Activity[] {
    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM activities WHERE lead_id = ? ORDER BY created_at DESC'
    ).all(leadId) as ActivityRow[];
    return rows.map(rowToActivity);
  }

  create(leadId: string, input: CreateActivityInput): Activity {
    const db = getDb();
    const id = uuid();
    const now = new Date().toISOString();

    db.prepare(
      'INSERT INTO activities (id, lead_id, type, description, outcome, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, leadId, input.type, input.description, input.outcome || '', now);

    return { id, leadId, ...input, outcome: input.outcome || '', createdAt: now };
  }

  getRecentAcrossLeads(limit: number = 10) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT a.*, l.first_name || ' ' || l.last_name as lead_name
      FROM activities a
      JOIN leads l ON a.lead_id = l.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(limit) as (ActivityRow & { lead_name: string })[];

    return rows.map(row => ({
      ...rowToActivity(row),
      leadName: row.lead_name,
    }));
  }
}

import { v4 as uuid } from 'uuid';
import { getDb } from '../db/connection';
import type { Lead, CreateLeadInput, UpdateLeadInput, LeadFilters } from '../../../shared/src/index';

interface LeadRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  source: string;
  status: string;
  score: number;
  estimated_value: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    title: row.title,
    source: row.source as Lead['source'],
    status: row.status as Lead['status'],
    score: row.score,
    estimatedValue: row.estimated_value,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class LeadRepository {
  findAll(filters: LeadFilters = {}): { leads: Lead[]; total: number } {
    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    if (filters.source) {
      conditions.push('source = ?');
      params.push(filters.source);
    }
    if (filters.scoreMin !== undefined) {
      conditions.push('score >= ?');
      params.push(filters.scoreMin);
    }
    if (filters.scoreMax !== undefined) {
      conditions.push('score <= ?');
      params.push(filters.scoreMax);
    }
    if (filters.search) {
      conditions.push('(first_name || \' \' || last_name LIKE ? OR company LIKE ? OR email LIKE ?)');
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    const sortColumn = {
      name: 'first_name',
      score: 'score',
      value: 'estimated_value',
      company: 'company',
      status: 'status',
      created_at: 'created_at',
      date: 'created_at',
    }[sortBy] || 'created_at';

    const countRow = db.prepare(`SELECT COUNT(*) as count FROM leads ${where}`).get(...params) as any;
    const total = countRow.count;

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const rows = db.prepare(
      `SELECT * FROM leads ${where} ORDER BY ${sortColumn} ${sortOrder === 'asc' ? 'ASC' : 'DESC'} LIMIT ? OFFSET ?`
    ).all(...params, pageSize, offset) as LeadRow[];

    return { leads: rows.map(rowToLead), total };
  }

  findById(id: string): Lead | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as LeadRow | undefined;
    return row ? rowToLead(row) : null;
  }

  findByStatus(status: string): Lead[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM leads WHERE status = ? ORDER BY score DESC').all(status) as LeadRow[];
    return rows.map(rowToLead);
  }

  create(input: CreateLeadInput): Lead {
    const db = getDb();
    const id = uuid();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO leads (id, first_name, last_name, email, phone, company, title, source, status, score, estimated_value, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
    `).run(id, input.firstName, input.lastName, input.email, input.phone, input.company, input.title, input.source, input.status, input.estimatedValue, input.notes || '', now, now);

    return this.findById(id)!;
  }

  update(id: string, input: UpdateLeadInput): Lead | null {
    const db = getDb();
    const existing = this.findById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const params: any[] = [];

    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      company: 'company',
      title: 'title',
      source: 'source',
      status: 'status',
      estimatedValue: 'estimated_value',
      notes: 'notes',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if ((input as any)[key] !== undefined) {
        fields.push(`${column} = ?`);
        params.push((input as any)[key]);
      }
    }

    if (fields.length === 0) return existing;

    fields.push("updated_at = datetime('now')");
    params.push(id);

    db.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  updateScore(id: string, score: number): void {
    const db = getDb();
    db.prepare("UPDATE leads SET score = ?, updated_at = datetime('now') WHERE id = ?").run(score, id);
  }

  updateStatus(id: string, status: string): Lead | null {
    const db = getDb();
    const existing = this.findById(id);
    if (!existing) return null;

    db.prepare("UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
    return this.findById(id);
  }

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    return result.changes > 0;
  }

  search(query: string): Lead[] {
    const db = getDb();
    const term = `%${query}%`;
    const rows = db.prepare(`
      SELECT * FROM leads
      WHERE first_name || ' ' || last_name LIKE ? OR company LIKE ? OR email LIKE ?
      ORDER BY score DESC LIMIT 10
    `).all(term, term, term) as LeadRow[];
    return rows.map(rowToLead);
  }

  getMetrics() {
    const db = getDb();

    const total = (db.prepare('SELECT COUNT(*) as count FROM leads').get() as any).count;
    const newThisWeek = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', '-7 days')").get() as any).count;

    const wonCount = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Won'").get() as any).count;
    const closedCount = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status IN ('Won', 'Lost')").get() as any).count;
    const conversionRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

    const pipelineValue = (db.prepare("SELECT COALESCE(SUM(estimated_value), 0) as total FROM leads WHERE status NOT IN ('Won', 'Lost')").get() as any).total;

    const statusRows = db.prepare('SELECT status, COUNT(*) as count FROM leads GROUP BY status').all() as any[];
    const leadsByStatus: Record<string, number> = {};
    for (const row of statusRows) leadsByStatus[row.status] = row.count;

    const sourceRows = db.prepare('SELECT source, COUNT(*) as count FROM leads GROUP BY source').all() as any[];
    const leadsBySource: Record<string, number> = {};
    for (const row of sourceRows) leadsBySource[row.source] = row.count;

    const topLeads = db.prepare('SELECT * FROM leads ORDER BY score DESC LIMIT 5').all() as LeadRow[];

    return {
      totalLeads: total,
      newLeadsThisWeek: newThisWeek,
      conversionRate,
      pipelineValue,
      leadsByStatus,
      leadsBySource,
      topScoringLeads: topLeads.map(rowToLead),
    };
  }
}

import { v4 as uuid } from 'uuid';
import { getDb } from '../db/connection';
import type { Conversation, Message } from '../../../shared/src/index';

interface ConversationRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  lead_id: string | null;
  status: string;
  started_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

function rowToConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    leadId: row.lead_id,
    status: row.status as Conversation['status'],
    startedAt: row.started_at,
    updatedAt: row.updated_at,
  };
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role as Message['role'],
    content: row.content,
    createdAt: row.created_at,
  };
}

export class ConversationRepository {
  findAll(): Conversation[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
        (SELECT m.content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      FROM conversations c
      ORDER BY c.updated_at DESC
    `).all() as (ConversationRow & { message_count: number; last_message: string })[];

    return rows.map(row => ({
      ...rowToConversation(row),
      messageCount: row.message_count,
      lastMessage: row.last_message,
    }));
  }

  findById(id: string): Conversation | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as ConversationRow | undefined;
    if (!row) return null;

    const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(id) as MessageRow[];

    return {
      ...rowToConversation(row),
      messages: messages.map(rowToMessage),
    };
  }

  create(): Conversation {
    const db = getDb();
    const id = uuid();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO conversations (id, customer_name, customer_email, customer_phone, status, started_at, updated_at)
      VALUES (?, '', '', '', 'active', ?, ?)
    `).run(id, now, now);
    return this.findById(id)!;
  }

  addMessage(conversationId: string, role: string, content: string): Message {
    const db = getDb();
    const id = uuid();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)').run(id, conversationId, role, content, now);
    db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").run(now, conversationId);
    return { id, conversationId, role: role as Message['role'], content, createdAt: now };
  }

  updateCustomerInfo(id: string, info: { name?: string; email?: string; phone?: string }): void {
    const db = getDb();
    const fields: string[] = [];
    const params: any[] = [];

    if (info.name !== undefined) { fields.push('customer_name = ?'); params.push(info.name); }
    if (info.email !== undefined) { fields.push('customer_email = ?'); params.push(info.email); }
    if (info.phone !== undefined) { fields.push('customer_phone = ?'); params.push(info.phone); }

    if (fields.length === 0) return;
    fields.push("updated_at = datetime('now')");
    params.push(id);
    db.prepare(`UPDATE conversations SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  }

  linkLead(conversationId: string, leadId: string): void {
    const db = getDb();
    db.prepare("UPDATE conversations SET lead_id = ?, updated_at = datetime('now') WHERE id = ?").run(leadId, conversationId);
  }

  close(id: string): void {
    const db = getDb();
    db.prepare("UPDATE conversations SET status = 'closed', updated_at = datetime('now') WHERE id = ?").run(id);
  }

  getMessages(conversationId: string): Message[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conversationId) as MessageRow[];
    return rows.map(rowToMessage);
  }
}

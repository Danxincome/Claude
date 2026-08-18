import { getDb } from '../db/connection';
import type { AISettings, UpdateAISettingsInput } from '../../../shared/src/index';

interface SettingsRow {
  id: string;
  business_name: string;
  services: string;
  business_hours: string;
  location: string;
  faqs: string;
  booking_instructions: string;
  ai_greeting: string;
  created_at: string;
  updated_at: string;
}

function safeJsonParse(str: string, fallback: any[] = []): any[] {
  try {
    const parsed = JSON.parse(str || '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function rowToSettings(row: SettingsRow): AISettings {
  return {
    id: row.id,
    businessName: row.business_name,
    services: safeJsonParse(row.services),
    businessHours: row.business_hours,
    location: row.location,
    faqs: safeJsonParse(row.faqs),
    bookingInstructions: row.booking_instructions,
    aiGreeting: row.ai_greeting,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class AISettingsRepository {
  get(): AISettings {
    const db = getDb();
    const row = db.prepare("SELECT * FROM ai_settings WHERE id = 'default'").get() as SettingsRow | undefined;
    if (!row) {
      db.prepare("INSERT OR IGNORE INTO ai_settings (id) VALUES ('default')").run();
      return this.get();
    }
    return rowToSettings(row);
  }

  update(input: UpdateAISettingsInput): AISettings {
    const db = getDb();
    db.prepare(`
      UPDATE ai_settings SET
        business_name = ?,
        services = ?,
        business_hours = ?,
        location = ?,
        faqs = ?,
        booking_instructions = ?,
        ai_greeting = ?,
        updated_at = datetime('now')
      WHERE id = 'default'
    `).run(
      input.businessName,
      JSON.stringify(input.services),
      input.businessHours,
      input.location,
      JSON.stringify(input.faqs),
      input.bookingInstructions,
      input.aiGreeting
    );
    return this.get();
  }
}

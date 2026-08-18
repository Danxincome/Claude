import { AISettingsRepository } from '../repositories/ai-settings.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { LeadRepository } from '../repositories/lead.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { ScoringService } from './scoring.service';
import type { AISettings, Message } from '../../../shared/src/index';

interface ExtractedInfo {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  vehicle?: string;
  preferredTime?: string;
}

export class ReceptionistService {
  private settingsRepo = new AISettingsRepository();
  private conversationRepo = new ConversationRepository();
  private leadRepo = new LeadRepository();
  private activityRepo = new ActivityRepository();
  private scoringService = new ScoringService();

  private apiKey = process.env.ANTHROPIC_API_KEY || '';

  async chat(conversationId: string | undefined, userMessage: string): Promise<{
    conversationId: string;
    reply: string;
    leadCreated: boolean;
    leadId?: string;
  }> {
    const settings = this.settingsRepo.get();

    let convId = conversationId;
    if (!convId) {
      const conv = this.conversationRepo.create();
      convId = conv.id;
    }

    this.conversationRepo.addMessage(convId, 'customer', userMessage);

    const messages = this.conversationRepo.getMessages(convId);
    const extracted = this.extractInfoFromMessages(messages);

    this.conversationRepo.updateCustomerInfo(convId, {
      name: extracted.name,
      email: extracted.email,
      phone: extracted.phone,
    });

    let reply: string;
    if (this.apiKey) {
      reply = await this.getAIResponse(settings, messages);
    } else {
      reply = this.getRuleBasedResponse(settings, messages, extracted);
    }

    this.conversationRepo.addMessage(convId, 'assistant', reply);

    let leadCreated = false;
    let leadId: string | undefined;

    if (extracted.name && (extracted.email || extracted.phone)) {
      const conv = this.conversationRepo.findById(convId);
      if (!conv?.leadId) {
        const result = this.createOrUpdateLead(convId, extracted, settings);
        leadCreated = result.created;
        leadId = result.leadId;
      } else {
        leadId = conv.leadId;
      }
    }

    return { conversationId: convId, reply, leadCreated, leadId };
  }

  private async getAIResponse(settings: AISettings, messages: Message[]): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(settings);
    const apiMessages = messages.map(m => ({
      role: m.role === 'customer' ? 'user' : 'assistant',
      content: m.content,
    }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Anthropic API error:', response.status, errText);
        return this.getRuleBasedResponse(this.settingsRepo.get(), messages, this.extractInfoFromMessages(messages));
      }

      const data = await response.json() as any;
      return data.content?.[0]?.text || 'I apologize, I had trouble generating a response. Could you please try again?';
    } catch (err) {
      console.error('AI API call failed:', err);
      return this.getRuleBasedResponse(this.settingsRepo.get(), messages, this.extractInfoFromMessages(messages));
    }
  }

  private buildSystemPrompt(settings: AISettings): string {
    const parts = [
      `You are a friendly, professional AI receptionist for ${settings.businessName || 'our business'}.`,
      'Your job is to help customers learn about our services, answer their questions, and help them book appointments.',
      '',
      'IMPORTANT RULES:',
      '- Only provide information that has been configured below. Do NOT invent prices, services, hours, availability, or policies.',
      '- If information has not been configured, say you do not have that information and suggest the customer contact the business directly.',
      '- Be conversational but concise. Keep responses to 2-3 sentences when possible.',
      '- Naturally collect customer information during the conversation: name, phone number, email, what service they want, their vehicle details, and preferred appointment time.',
      '- Do not ask for all information at once. Gather it naturally over the conversation.',
      '',
    ];

    if (settings.services.length > 0) {
      parts.push('SERVICES AND PRICES:');
      for (const svc of settings.services) {
        parts.push(`- ${svc.name}: ${svc.price}${svc.duration ? ` (${svc.duration})` : ''}${svc.description ? ` - ${svc.description}` : ''}`);
      }
      parts.push('');
    }

    if (settings.businessHours) {
      parts.push(`BUSINESS HOURS: ${settings.businessHours}`);
      parts.push('');
    }

    if (settings.location) {
      parts.push(`LOCATION: ${settings.location}`);
      parts.push('');
    }

    if (settings.faqs.length > 0) {
      parts.push('FREQUENTLY ASKED QUESTIONS:');
      for (const faq of settings.faqs) {
        parts.push(`Q: ${faq.question}`);
        parts.push(`A: ${faq.answer}`);
      }
      parts.push('');
    }

    if (settings.bookingInstructions) {
      parts.push(`BOOKING INSTRUCTIONS: ${settings.bookingInstructions}`);
      parts.push('');
    }

    return parts.join('\n');
  }

  private getRuleBasedResponse(settings: AISettings, messages: Message[], extracted: ExtractedInfo): string {
    const customerMessages = messages.filter(m => m.role === 'customer');
    const messageCount = customerMessages.length;
    const lastMsg = customerMessages[customerMessages.length - 1]?.content.toLowerCase() || '';

    if (messageCount === 1) {
      if (settings.aiGreeting) return settings.aiGreeting;
      const name = settings.businessName || 'our business';
      return `Welcome to ${name}! I'm here to help you learn about our services and schedule an appointment. What can I help you with today?`;
    }

    if (lastMsg.includes('price') || lastMsg.includes('cost') || lastMsg.includes('how much') || lastMsg.includes('rate')) {
      if (settings.services.length > 0) {
        const list = settings.services.map(s => `${s.name}: ${s.price}${s.duration ? ` (${s.duration})` : ''}`).join('\n- ');
        return `Here are our services and pricing:\n- ${list}\n\nWould you like to know more about any of these, or would you like to schedule an appointment?`;
      }
      return "I don't have specific pricing information configured yet. Please contact us directly for pricing details. Is there anything else I can help with?";
    }

    if (lastMsg.includes('service') || lastMsg.includes('offer') || lastMsg.includes('what do you')) {
      if (settings.services.length > 0) {
        const list = settings.services.map(s => `${s.name}${s.description ? ` - ${s.description}` : ''}`).join('\n- ');
        return `We offer the following services:\n- ${list}\n\nWould you like to know the pricing for any of these?`;
      }
      return "I don't have our service list configured yet. Please contact us directly for information about our services.";
    }

    if (lastMsg.includes('hour') || lastMsg.includes('open') || lastMsg.includes('when')) {
      if (settings.businessHours) {
        return `Our business hours are: ${settings.businessHours}. Would you like to schedule an appointment?`;
      }
      return "I don't have our business hours configured yet. Please contact us directly for our availability.";
    }

    if (lastMsg.includes('where') || lastMsg.includes('location') || lastMsg.includes('address') || lastMsg.includes('direction')) {
      if (settings.location) {
        return `We're located at: ${settings.location}. Would you like to schedule a visit?`;
      }
      return "I don't have our location information configured yet. Please contact us directly.";
    }

    if (lastMsg.includes('book') || lastMsg.includes('schedule') || lastMsg.includes('appointment')) {
      if (settings.bookingInstructions) {
        if (!extracted.name) return "I'd love to help you book an appointment! Could I get your name first?";
        if (!extracted.phone) return `Thanks, ${extracted.name}! Could I get your phone number so we can reach you?`;
        if (!extracted.service) return `What service would you like to book?`;
        return `Great! Here's how to complete your booking: ${settings.bookingInstructions}`;
      }
      if (!extracted.name) return "I'd love to help! Could I get your name to start?";
      if (!extracted.phone) return `Thanks, ${extracted.name}! What's the best phone number to reach you?`;
      return "I've noted your interest in booking. Someone from our team will follow up with you shortly to confirm the appointment.";
    }

    if (!extracted.name && messageCount > 2) {
      return "I'd be happy to help you further! Could I get your name so I can assist you better?";
    }

    if (extracted.name && !extracted.phone && messageCount > 3) {
      return `Thanks for chatting with us, ${extracted.name}! If you'd like us to follow up, could I get your phone number or email?`;
    }

    for (const faq of settings.faqs) {
      const keywords = faq.question.toLowerCase().split(' ').filter(w => w.length > 3);
      const matchCount = keywords.filter(k => lastMsg.includes(k)).length;
      if (matchCount >= 2 || (keywords.length <= 3 && matchCount >= 1)) {
        return faq.answer;
      }
    }

    return "Thank you for your message! Is there anything specific about our services I can help you with? I can share information about our services, pricing, hours, or help you schedule an appointment.";
  }

  private extractInfoFromMessages(messages: Message[]): ExtractedInfo {
    const info: ExtractedInfo = {};
    const customerText = messages
      .filter(m => m.role === 'customer')
      .map(m => m.content)
      .join(' ');

    const emailMatch = customerText.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) info.email = emailMatch[0];

    const phoneMatch = customerText.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) info.phone = phoneMatch[0];

    const namePatterns = [
      /(?:my name is|i'm|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:name(?:'s| is))\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    ];
    for (const pattern of namePatterns) {
      const match = customerText.match(pattern);
      if (match) { info.name = match[1].trim(); break; }
    }

    const vehiclePatterns = [
      /(?:my|a|the)\s+(\d{4}\s+\w+\s+\w+)/i,
      /(?:drive|have|own|got)\s+(?:a\s+)?(\d{4}\s+\w+\s+\w+)/i,
      /(20\d{2}|19\d{2})\s+(toyota|honda|ford|chevy|chevrolet|bmw|mercedes|audi|tesla|nissan|hyundai|kia|subaru|mazda|lexus|acura|infiniti|cadillac|buick|gmc|dodge|jeep|ram|volkswagen|vw|porsche|volvo)\s+(\w+)/i,
    ];
    for (const pattern of vehiclePatterns) {
      const match = customerText.match(pattern);
      if (match) { info.vehicle = match[0].trim(); break; }
    }

    return info;
  }

  private createOrUpdateLead(conversationId: string, info: ExtractedInfo, settings: AISettings): { created: boolean; leadId: string } {
    const nameParts = (info.name || 'Chat Customer').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Unknown';

    const lead = this.leadRepo.create({
      firstName,
      lastName,
      email: info.email || '',
      phone: info.phone || '',
      company: info.vehicle || '',
      title: info.service || 'Chat Inquiry',
      source: 'Website' as any,
      status: 'New' as any,
      estimatedValue: 0,
      notes: `Created from AI Receptionist chat. ${info.vehicle ? `Vehicle: ${info.vehicle}. ` : ''}${info.preferredTime ? `Preferred time: ${info.preferredTime}. ` : ''}`,
    });

    this.activityRepo.create(lead.id, {
      type: 'Note' as any,
      description: `Lead created via AI Receptionist chat conversation`,
      outcome: '',
    });

    const activities = this.activityRepo.findByLeadId(lead.id);
    const { score } = this.scoringService.calculateScore(lead, activities);
    this.leadRepo.updateScore(lead.id, score);

    this.conversationRepo.linkLead(conversationId, lead.id);

    return { created: true, leadId: lead.id };
  }
}

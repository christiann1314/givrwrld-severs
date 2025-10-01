import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async track(event: AnalyticsEvent): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const eventData = {
        event_type: event.event_type,
        user_id: user?.id || event.user_id,
        properties: event.properties || {},
        timestamp: event.timestamp || new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // Insert into analytics table
      const { error } = await supabase
        .from('analytics_events')
        .insert([eventData]);

      if (error) {
        console.error('Analytics tracking error:', error);
      } else {
        console.log('Event tracked:', event.event_type);
      }
    } catch (error) {
      console.error('Analytics service error:', error);
    }
  }

  // Specific event tracking methods
  async trackUserRegistration(userData: any): Promise<void> {
    await this.track({
      event_type: 'user_registration',
      properties: {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        registration_method: 'email'
      }
    });
  }

  async trackUserLogin(userId: string): Promise<void> {
    await this.track({
      event_type: 'user_login',
      user_id: userId,
      properties: {
        login_method: 'email'
      }
    });
  }

  async trackAffiliateJoin(userId: string, affiliateCode?: string): Promise<void> {
    await this.track({
      event_type: 'affiliate_join',
      user_id: userId,
      properties: {
        affiliate_code: affiliateCode
      }
    });
  }

  async trackServerPurchase(userId: string, serverData: any): Promise<void> {
    await this.track({
      event_type: 'server_purchase',
      user_id: userId,
      properties: {
        server_type: serverData.game,
        server_specs: serverData.specs,
        price: serverData.price,
        payment_method: serverData.payment_method
      }
    });
  }

  async trackBillingUpdate(userId: string, billingData: any): Promise<void> {
    await this.track({
      event_type: 'billing_update',
      user_id: userId,
      properties: {
        billing_action: billingData.action,
        amount: billingData.amount,
        currency: billingData.currency
      }
    });
  }

  async trackGamePanelAccess(userId: string, serverId: string): Promise<void> {
    await this.track({
      event_type: 'game_panel_access',
      user_id: userId,
      properties: {
        server_id: serverId,
        access_method: 'ui_dashboard'
      }
    });
  }

  async trackServerAction(userId: string, serverId: string, action: string): Promise<void> {
    await this.track({
      event_type: 'server_action',
      user_id: userId,
      properties: {
        server_id: serverId,
        action: action
      }
    });
  }

  async trackSupportTicket(userId: string, ticketData: any): Promise<void> {
    await this.track({
      event_type: 'support_ticket',
      user_id: userId,
      properties: {
        ticket_type: ticketData.type,
        priority: ticketData.priority,
        subject: ticketData.subject
      }
    });
  }
}

export const analytics = AnalyticsService.getInstance();

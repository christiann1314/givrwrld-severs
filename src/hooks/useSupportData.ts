import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { API_BASE_URL } from '../config/api';
import { toast } from '@/components/ui/use-toast';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created: string;
  updated: string;
  responses: number;
}

interface SupportData {
  tickets: SupportTicket[];
  loading: boolean;
}

export const useSupportData = (userEmail?: string) => {
  const [supportData, setSupportData] = useState<SupportData>({
    tickets: [],
    loading: false
  });
  // toast is now imported directly from sonner

  const fetchSupportData = async () => {
    if (!userEmail) return;
    
    setSupportData(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSupportData({
          tickets: data.tickets || [],
          loading: false
        });
      } else {
        // Fallback to mock data if API is not available
        setSupportData({
          tickets: [],
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch support data:', error);
      // Fallback to mock data
      setSupportData({
        tickets: [],
        loading: false
      });
    }
  };

  const createTicket = async (ticketData: {
    subject: string;
    category: string;
    priority: string;
    description: string;
  }) => {
    if (!userEmail) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/user/support/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          ...ticketData
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Support ticket created successfully"
        });
        fetchSupportData(); // Refresh the tickets
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to create support ticket",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast({
        title: "Error", 
        description: "Failed to create support ticket",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchSupportData();
    }
  }, [userEmail]);

  // Set up real-time subscription for support tickets
  useEffect(() => {
    if (!userEmail) return;

    const channel = supabase
      .channel('support-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          console.log('Support data changed, refetching...');
          fetchSupportData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  return { supportData, createTicket, refetchSupport: fetchSupportData };
};
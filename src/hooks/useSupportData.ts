import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

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
  const { toast } = useToast();

  const fetchSupportData = async () => {
    if (!userEmail) return;
    
    setSupportData(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`https://api.givrwrldservers.com/api/user/support`, {
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
          tickets: [
            {
              id: 'TICK-001',
              subject: 'Server connection issues',
              category: 'Technical',
              priority: 'high',
              status: 'open',
              created: '2024-01-15',
              updated: '2024-01-16',
              responses: 3
            },
            {
              id: 'TICK-002',
              subject: 'Billing question about upgrade', 
              category: 'Billing',
              priority: 'medium',
              status: 'resolved',
              created: '2024-01-10',
              updated: '2024-01-12',
              responses: 5
            }
          ],
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch support data:', error);
      // Fallback to mock data
      setSupportData({
        tickets: [
          {
            id: 'TICK-001',
            subject: 'Server connection issues',
            category: 'Technical', 
            priority: 'high',
            status: 'open',
            created: '2024-01-15',
            updated: '2024-01-16',
            responses: 3
          }
        ],
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
      const response = await fetch(`https://api.givrwrldservers.com/api/user/support/create`, {
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

  return { supportData, createTicket, refetchSupport: fetchSupportData };
};
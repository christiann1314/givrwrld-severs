import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Shield, ShieldCheck, ShieldAlert, Key, Settings } from 'lucide-react';

interface AdminStatus {
  isAdmin: boolean;
  has2FA: boolean;
  requires2FA: boolean;
  userId: string;
}

export const Admin2FAManager = () => {
  const { user } = useAuth();
  // toast is now imported directly from sonner
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling2FA, setEnrolling2FA] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'check_2fa_status' }
      });

      if (error) throw error;
      setAdminStatus(data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Error",
        description: "Failed to check admin status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignAdminRole = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'assign_admin' }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin role assigned successfully! Please set up 2FA immediately.",
      });

      await checkAdminStatus();
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Error",
        description: "Failed to assign admin role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    try {
      setEnrolling2FA(true);
      
      // Enroll a new factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin 2FA'
      });

      if (error) throw error;

      // This will contain the QR code and setup instructions
      const { id, totp, type } = data;
      
      // Store the factor ID for verification
      localStorage.setItem('temp_factor_id', id);
      
      toast({
        title: "2FA Setup Started",
        description: "Please scan the QR code with your authenticator app and enter the verification code.",
      });

      // In a real implementation, you'd show a modal with:
      // - QR code (data.totp.qr_code)
      // - Secret key (data.totp.secret)
      // - Verification input field
      
      console.log('2FA Setup Data:', { id, totp, type });
      
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to set up 2FA",
        variant: "destructive"
      });
    } finally {
      setEnrolling2FA(false);
    }
  };

  const verify2FA = async (verificationCode: string) => {
    try {
      const factorId = localStorage.getItem('temp_factor_id');
      if (!factorId) throw new Error('No factor ID found');

      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: factorId, // This would be from a challenge in a real implementation
        code: verificationCode
      });

      if (error) throw error;

      localStorage.removeItem('temp_factor_id');
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled!",
      });

      await checkAdminStatus();
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to verify 2FA code",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 animate-spin" />
            <span>Checking admin status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Please log in to manage admin settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Admin Account Security</span>
          </CardTitle>
          <CardDescription>
            Manage administrative privileges and two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Admin Status:</span>
              {adminStatus?.isAdmin ? (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
              ) : (
                <Badge variant="secondary">Regular User</Badge>
              )}
            </div>
            
            {!adminStatus?.isAdmin && (
              <Button onClick={assignAdminRole} disabled={loading}>
                <Key className="h-4 w-4 mr-2" />
                Assign Admin Role
              </Button>
            )}
          </div>

          {adminStatus?.isAdmin && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>Two-Factor Authentication:</span>
                  {adminStatus.has2FA ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      Not Enabled
                    </Badge>
                  )}
                </div>

                {!adminStatus.has2FA && (
                  <Button 
                    onClick={setup2FA} 
                    disabled={enrolling2FA}
                    variant="outline"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {enrolling2FA ? 'Setting up...' : 'Enable 2FA'}
                  </Button>
                )}
              </div>

              {adminStatus.requires2FA && (
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Warning:</strong> Admin accounts require two-factor authentication. 
                    Please enable 2FA immediately to secure your administrative access.
                  </AlertDescription>
                </Alert>
              )}

              {adminStatus.has2FA && (
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>
                    Your admin account is properly secured with two-factor authentication.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {adminStatus?.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Responsibilities</CardTitle>
            <CardDescription>
              As an administrator, you have access to sensitive operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Server provisioning and management</li>
              <li>• User role assignments</li>
              <li>• System configuration changes</li>
              <li>• Security settings management</li>
              <li>• Billing and subscription oversight</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorLog {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  request_id?: string;
  user_agent?: string;
  url?: string;
  ip_address?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    const { error, user_context, sanitize = true } = body;

    if (!error) {
      return new Response(JSON.stringify({ error: 'Error data required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Sanitize sensitive information from error
    const sanitizedError = sanitize ? sanitizeError(error) : error;
    
    // Determine error severity
    const severity = determineSeverity(sanitizedError);
    
    // Extract user ID if available
    let userId = null;
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: userData } = await supabaseClient.auth.getUser(token);
        userId = userData.user?.id || null;
      }
    } catch {
      // Ignore auth errors when logging other errors
    }

    // Create error log entry
    const errorLog: ErrorLog = {
      error_type: sanitizedError.name || 'UnknownError',
      error_message: sanitizedError.message || 'No error message provided',
      stack_trace: sanitizedError.stack ? sanitizeStackTrace(sanitizedError.stack) : null,
      user_id: userId,
      request_id: crypto.randomUUID(),
      user_agent: req.headers.get('user-agent'),
      url: user_context?.url || req.url,
      ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
      severity,
      context: user_context || {}
    };

    // Log to database
    const { error: logError } = await supabaseClient
      .from('error_logs')
      .insert(errorLog);

    if (logError) {
      console.error('[ERROR-HANDLER] Failed to log error to database:', logError);
    }

    // For critical errors, trigger alerts
    if (severity === 'critical') {
      await triggerCriticalErrorAlert(errorLog);
    }

    // Log to console with appropriate level
    const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
    console[logLevel](`[ERROR-HANDLER] ${severity.toUpperCase()}: ${errorLog.error_message}`, {
      request_id: errorLog.request_id,
      user_id: userId,
      error_type: errorLog.error_type
    });

    // Return safe error response (never expose sensitive info)
    const safeResponse = createSafeErrorResponse(sanitizedError, errorLog.request_id);

    return new Response(JSON.stringify(safeResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: getHttpStatusFromError(sanitizedError),
    });

  } catch (processingError) {
    // If error handling itself fails, return minimal safe response
    console.error('[ERROR-HANDLER] Error while processing error:', processingError);
    
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred',
      request_id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function sanitizeError(error: any): any {
  const sensitivePatterns = [
    /password/gi,
    /token/gi,
    /key/gi,
    /secret/gi,
    /auth/gi,
    /bearer/gi,
    /api[_-]?key/gi,
    /stripe/gi,
    /pterodactyl/gi
  ];

  const sanitized = { ...error };

  // Sanitize error message
  if (sanitized.message) {
    sensitivePatterns.forEach(pattern => {
      sanitized.message = sanitized.message.replace(pattern, '[REDACTED]');
    });
  }

  // Sanitize stack trace
  if (sanitized.stack) {
    sanitized.stack = sanitizeStackTrace(sanitized.stack);
  }

  return sanitized;
}

function sanitizeStackTrace(stackTrace: string): string {
  // Remove file paths that might contain sensitive information
  return stackTrace
    .replace(/\/[^\s]+\/(node_modules|\.env|config)/g, '[PATH_REDACTED]')
    .replace(/at\s+[^\s]+\s+\(([^\)]+)\)/g, (match) => {
      // Keep function names but sanitize file paths
      return match.replace(/\/[^\s)]+/g, '[PATH]');
    });
}

function determineSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
  const errorMessage = (error.message || '').toLowerCase();
  const errorType = (error.name || '').toLowerCase();

  // Critical errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('payment') ||
    errorMessage.includes('auth') ||
    errorType.includes('security') ||
    errorMessage.includes('unauthorized access')
  ) {
    return 'critical';
  }

  // High severity errors
  if (
    errorMessage.includes('server') ||
    errorMessage.includes('connection') ||
    errorType.includes('network') ||
    errorMessage.includes('timeout')
  ) {
    return 'high';
  }

  // Medium severity errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('not found') ||
    errorType.includes('notfound')
  ) {
    return 'medium';
  }

  // Default to low severity
  return 'low';
}

function createSafeErrorResponse(error: any, requestId: string): any {
  const errorType = error.name || 'Error';
  
  // Map of error types to safe user messages
  const safeMessages: Record<string, string> = {
    'ValidationError': 'The provided data is invalid. Please check your input and try again.',
    'AuthenticationError': 'Authentication failed. Please log in and try again.',
    'AuthorizationError': 'You do not have permission to perform this action.',
    'NotFoundError': 'The requested resource was not found.',
    'RateLimitError': 'Too many requests. Please wait a moment and try again.',
    'PaymentError': 'Payment processing failed. Please check your payment details.',
    'ServerError': 'A server error occurred. Please try again later.',
    'NetworkError': 'Network connection failed. Please check your connection.',
    'TimeoutError': 'The request timed out. Please try again.'
  };

  const safeMessage = safeMessages[errorType] || 'An unexpected error occurred. Please try again.';

  return {
    error: safeMessage,
    error_type: errorType,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    support_message: 'If this problem persists, please contact support with the request ID above.'
  };
}

function getHttpStatusFromError(error: any): number {
  const errorType = (error.name || '').toLowerCase();
  const errorMessage = (error.message || '').toLowerCase();

  if (errorType.includes('validation') || errorMessage.includes('invalid')) {
    return 400;
  }
  
  if (errorType.includes('authentication') || errorMessage.includes('unauthorized')) {
    return 401;
  }
  
  if (errorType.includes('authorization') || errorMessage.includes('forbidden')) {
    return 403;
  }
  
  if (errorType.includes('notfound') || errorMessage.includes('not found')) {
    return 404;
  }
  
  if (errorType.includes('ratelimit') || errorMessage.includes('rate limit')) {
    return 429;
  }

  return 500;
}

async function triggerCriticalErrorAlert(errorLog: ErrorLog): Promise<void> {
  try {
    // In production, this would send alerts via email, Slack, PagerDuty, etc.
    console.error('[CRITICAL-ERROR-ALERT]', {
      message: 'Critical error detected',
      error_type: errorLog.error_type,
      error_message: errorLog.error_message,
      request_id: errorLog.request_id,
      user_id: errorLog.user_id,
      timestamp: new Date().toISOString()
    });

    // Log alert to database
    // await supabaseClient
    //   .from('error_alerts')
    //   .insert({
    //     error_log_id: errorLog.request_id,
    //     alert_type: 'critical_error',
    //     status: 'sent',
    //     created_at: new Date().toISOString()
    //   });
  } catch (alertError) {
    console.error('[ERROR-HANDLER] Failed to send critical error alert:', alertError);
  }
}

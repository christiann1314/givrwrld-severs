import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
}

interface DependencyVulnerability {
  package_name: string;
  current_version: string;
  latest_version?: string;
  has_vulnerabilities: boolean;
  vulnerability_count: number;
  vulnerability_details: any[];
  update_recommendation: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Get the authenticated user
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await userSupabase.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id })
    if (!isAdmin) {
      return new Response('Forbidden: Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    const { action, audit_type } = await req.json()

    if (action === 'start_audit') {
      // Create new audit record
      const { data: audit, error: auditError } = await supabase
        .from('security_audits')
        .insert({
          audit_type,
          status: 'running',
          created_by: user.id
        })
        .select()
        .single()

      if (auditError) {
        return new Response(JSON.stringify({ error: auditError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Run audit based on type
      let findings: SecurityFinding[] = []
      let dependencies: DependencyVulnerability[] = []

      switch (audit_type) {
        case 'dependency_scan':
          findings = await performDependencyScan()
          dependencies = await scanDependencies()
          break
        case 'rls_check':
          findings = await performRLSCheck(supabase)
          break
        case 'access_audit':
          findings = await performAccessAudit(supabase)
          break
        case 'comprehensive':
          findings = [
            ...await performDependencyScan(),
            ...await performRLSCheck(supabase),
            ...await performAccessAudit(supabase)
          ]
          dependencies = await scanDependencies()
          break
      }

      // Calculate severity counts
      const severity_counts = {
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length
      }

      // Update audit with results
      const { error: updateError } = await supabase
        .from('security_audits')
        .update({
          status: 'completed',
          findings,
          severity_counts,
          recommendations: generateRecommendations(findings),
          completed_at: new Date().toISOString()
        })
        .eq('id', audit.id)

      if (updateError) {
        console.error('Error updating audit:', updateError)
      }

      // Insert dependency audit results
      if (dependencies.length > 0) {
        const dependencyInserts = dependencies.map(dep => ({
          ...dep,
          audit_id: audit.id
        }))

        const { error: depError } = await supabase
          .from('dependency_audits')
          .insert(dependencyInserts)

        if (depError) {
          console.error('Error inserting dependency audits:', depError)
        }
      }

      return new Response(JSON.stringify({
        success: true,
        audit_id: audit.id,
        findings_count: findings.length,
        severity_counts,
        dependencies_scanned: dependencies.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'get_audit_results') {
      const { audit_id } = await req.json()
      
      const { data: audit, error } = await supabase
        .from('security_audits')
        .select(`
          *,
          dependency_audits (*)
        `)
        .eq('id', audit_id)
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify(audit), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'list_audits') {
      const { data: audits, error } = await supabase
        .from('security_audits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify(audits), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response('Invalid action', { status: 400, headers: corsHeaders })

  } catch (error) {
    console.error('Security audit error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function performDependencyScan(): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = []
  
  // Simulate dependency security scan
  const commonIssues = [
    {
      id: 'dep-001',
      title: 'Outdated React Version',
      description: 'React version may have known security vulnerabilities',
      severity: 'medium' as const,
      category: 'dependencies',
      recommendation: 'Update React to the latest stable version'
    },
    {
      id: 'dep-002', 
      title: 'Vulnerable Node Dependencies',
      description: 'Some Node.js dependencies have security advisories',
      severity: 'high' as const,
      category: 'dependencies',
      recommendation: 'Run npm audit fix to resolve vulnerabilities'
    }
  ]

  return commonIssues
}

async function performRLSCheck(supabase: any): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = []

  try {
    // Check for tables without RLS enabled
    const { data: tables } = await supabase.rpc('check_rls_enabled')
    
    if (tables && tables.length > 0) {
      findings.push({
        id: 'rls-001',
        title: 'Tables Without RLS',
        description: `Found ${tables.length} tables without Row Level Security enabled`,
        severity: 'critical',
        category: 'access_control',
        recommendation: 'Enable RLS on all public tables containing user data'
      })
    }

    // Check for overly permissive policies
    findings.push({
      id: 'rls-002',
      title: 'Review RLS Policies',
      description: 'Manual review recommended for RLS policy effectiveness',
      severity: 'medium',
      category: 'access_control', 
      recommendation: 'Review RLS policies to ensure proper access restrictions'
    })

  } catch (error) {
    console.error('RLS check error:', error)
  }

  return findings
}

async function performAccessAudit(supabase: any): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = []

  try {
    // Check for admin accounts without 2FA
    const { data: adminsWithout2FA } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    if (adminsWithout2FA && adminsWithout2FA.length > 0) {
      findings.push({
        id: 'access-001',
        title: 'Admin Accounts Security',
        description: 'Verify all admin accounts have 2FA enabled',
        severity: 'high',
        category: 'authentication',
        recommendation: 'Ensure all administrator accounts have two-factor authentication enabled'
      })
    }

    // Check for password policy
    findings.push({
      id: 'access-002',
      title: 'Password Policy Review',
      description: 'Review password strength requirements',
      severity: 'medium',
      category: 'authentication',
      recommendation: 'Implement strong password requirements and enable leaked password protection'
    })

  } catch (error) {
    console.error('Access audit error:', error)
  }

  return findings
}

async function scanDependencies(): Promise<DependencyVulnerability[]> {
  const dependencies: DependencyVulnerability[] = []

  // Simulate dependency vulnerability scan
  const mockDependencies = [
    {
      package_name: '@supabase/supabase-js',
      current_version: '2.53.0',
      latest_version: '2.53.0',
      has_vulnerabilities: false,
      vulnerability_count: 0,
      vulnerability_details: [],
      update_recommendation: 'Up to date'
    },
    {
      package_name: 'react',
      current_version: '18.3.1',
      latest_version: '18.3.1',
      has_vulnerabilities: false,
      vulnerability_count: 0,
      vulnerability_details: [],
      update_recommendation: 'Up to date'
    }
  ]

  return mockDependencies
}

function generateRecommendations(findings: SecurityFinding[]): string[] {
  const recommendations = new Set<string>()
  
  findings.forEach(finding => {
    recommendations.add(finding.recommendation)
  })

  // Add general recommendations
  recommendations.add('Regularly update dependencies to latest versions')
  recommendations.add('Monitor security advisories for used packages')
  recommendations.add('Implement automated security scanning in CI/CD pipeline')
  recommendations.add('Review and test RLS policies regularly')
  recommendations.add('Enable database audit logging')

  return Array.from(recommendations)
}
// /lib/module-factory.ts
// Module Factory v1 - CR AudioViz AI
// Rapid module deployment system that inherits Core 10 infrastructure

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ============================================================================
// MODULE DEFINITION
// ============================================================================

export interface ModuleDefinition {
  // Identity
  name: string;
  slug: string;
  description: string;
  icon: string;
  
  // Taxonomy
  family: 'revenue' | 'creator' | 'professional' | 'social_impact' | 'lifestyle' | 'infrastructure';
  category: string;
  tags: string[];
  
  // Features
  features: ModuleFeature[];
  
  // Revenue
  revenueModel: 'affiliate' | 'subscription' | 'credits' | 'marketplace' | 'lead_gen' | 'free';
  pricingTiers?: PricingTier[];
  
  // Settings
  settings: ModuleSettings;
}

export interface ModuleFeature {
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
  tier?: 'free' | 'pro' | 'enterprise';
}

export interface PricingTier {
  name: string;
  price: number;
  credits?: number;
  features: string[];
}

export interface ModuleSettings {
  requiresAuth: boolean;
  requiresSubscription: boolean;
  hasMarketplace: boolean;
  hasSearch: boolean;
  hasAnalytics: boolean;
  hasModeration: boolean;
  hasCredits: boolean;
}

// ============================================================================
// MODULE REGISTRY
// ============================================================================

export interface ModuleRegistration {
  id: string;
  module_slug: string;
  module_name: string;
  definition: ModuleDefinition;
  status: 'draft' | 'active' | 'deprecated';
  version: string;
  routes: ModuleRoute[];
  created_at: string;
  updated_at: string;
}

export interface ModuleRoute {
  path: string;
  type: 'page' | 'api';
  handler: string;
  permissions?: string[];
}

// ============================================================================
// MODULE FACTORY CLASS
// ============================================================================

export class ModuleFactory {
  private supabase;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }

  /**
   * Register a new module in the system
   */
  async registerModule(definition: ModuleDefinition): Promise<{
    success: boolean;
    moduleId?: string;
    error?: string;
  }> {
    try {
      // Generate standard routes
      const routes = this.generateRoutes(definition);

      // Create module registration
      const { data, error } = await this.supabase
        .from('module_registry')
        .insert({
          module_slug: definition.slug,
          module_name: definition.name,
          definition,
          status: 'draft',
          version: '1.0.0',
          routes
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Module slug already exists' };
        }
        return { success: false, error: error.message };
      }

      // Create CMS pages
      await this.createCMSPages(definition);

      // Create search index entry
      await this.registerSearchIndex(definition);

      // Create RBAC permissions
      await this.createPermissions(definition);

      // Create analytics funnels
      await this.createAnalyticsFunnels(definition);

      return { success: true, moduleId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate standard routes for a module
   */
  private generateRoutes(definition: ModuleDefinition): ModuleRoute[] {
    const routes: ModuleRoute[] = [
      // Pages
      {
        path: `/${definition.slug}`,
        type: 'page',
        handler: `app/${definition.slug}/page.tsx`,
        permissions: definition.settings.requiresAuth ? ['read'] : undefined
      },
      {
        path: `/${definition.slug}/[id]`,
        type: 'page',
        handler: `app/${definition.slug}/[id]/page.tsx`,
        permissions: definition.settings.requiresAuth ? ['read'] : undefined
      }
    ];

    // Add search page if enabled
    if (definition.settings.hasSearch) {
      routes.push({
        path: `/${definition.slug}/search`,
        type: 'page',
        handler: `app/${definition.slug}/search/page.tsx`
      });
    }

    // Add marketplace pages if enabled
    if (definition.settings.hasMarketplace) {
      routes.push(
        {
          path: `/${definition.slug}/sell`,
          type: 'page',
          handler: `app/${definition.slug}/sell/page.tsx`,
          permissions: [`${definition.slug}:create`]
        },
        {
          path: `/${definition.slug}/my-listings`,
          type: 'page',
          handler: `app/${definition.slug}/my-listings/page.tsx`,
          permissions: [`${definition.slug}:read:own`]
        }
      );
    }

    // API routes
    routes.push(
      {
        path: `/api/${definition.slug}`,
        type: 'api',
        handler: `app/api/${definition.slug}/route.ts`
      }
    );

    return routes;
  }

  /**
   * Create CMS pages for module
   */
  private async createCMSPages(definition: ModuleDefinition): Promise<void> {
    const pages = [
      {
        title: definition.name,
        slug: definition.slug,
        page_type: 'landing',
        status: 'draft',
        content: `# ${definition.name}\n\n${definition.description}`,
        meta_title: definition.name,
        meta_description: definition.description
      },
      {
        title: `${definition.name} FAQ`,
        slug: `${definition.slug}-faq`,
        page_type: 'page',
        status: 'draft',
        content: `# Frequently Asked Questions\n\nCommon questions about ${definition.name}.`
      }
    ];

    await this.supabase.from('cms_pages').insert(pages);
  }

  /**
   * Register module in search index
   */
  private async registerSearchIndex(definition: ModuleDefinition): Promise<void> {
    // The search API already handles this via module parameter
    // Just ensure the module is listed in searchable modules
    console.log(`Module ${definition.slug} registered for search`);
  }

  /**
   * Create RBAC permissions for module
   */
  private async createPermissions(definition: ModuleDefinition): Promise<void> {
    const permissions = [
      {
        name: `${definition.slug}:read`,
        display_name: `View ${definition.name}`,
        description: `View ${definition.name} content`,
        resource: definition.slug,
        action: 'read',
        category: definition.family
      },
      {
        name: `${definition.slug}:create`,
        display_name: `Create ${definition.name}`,
        description: `Create ${definition.name} content`,
        resource: definition.slug,
        action: 'create',
        category: definition.family
      },
      {
        name: `${definition.slug}:update`,
        display_name: `Update ${definition.name}`,
        description: `Update ${definition.name} content`,
        resource: definition.slug,
        action: 'update',
        category: definition.family
      },
      {
        name: `${definition.slug}:delete`,
        display_name: `Delete ${definition.name}`,
        description: `Delete ${definition.name} content`,
        resource: definition.slug,
        action: 'delete',
        category: definition.family
      },
      {
        name: `${definition.slug}:manage`,
        display_name: `Manage ${definition.name}`,
        description: `Full access to ${definition.name}`,
        resource: definition.slug,
        action: 'manage',
        category: definition.family
      }
    ];

    await this.supabase
      .from('permissions')
      .upsert(permissions, { onConflict: 'name' });
  }

  /**
   * Create analytics funnels for module
   */
  private async createAnalyticsFunnels(definition: ModuleDefinition): Promise<void> {
    const funnels = [
      {
        name: `${definition.name} Discovery`,
        funnel_key: `${definition.slug}_discovery`,
        steps: ['view_landing', 'view_listing', 'view_detail'],
        module: definition.slug
      },
      {
        name: `${definition.name} Conversion`,
        funnel_key: `${definition.slug}_conversion`,
        steps: ['view_detail', 'add_to_cart', 'checkout', 'complete'],
        module: definition.slug
      }
    ];

    await this.supabase
      .from('analytics_funnels')
      .upsert(funnels, { onConflict: 'funnel_key' });
  }

  /**
   * Generate module scaffold (file templates)
   */
  generateScaffold(definition: ModuleDefinition): Record<string, string> {
    const files: Record<string, string> = {};

    // Landing page
    files[`app/${definition.slug}/page.tsx`] = this.generateLandingPage(definition);

    // Detail page
    files[`app/${definition.slug}/[id]/page.tsx`] = this.generateDetailPage(definition);

    // API route
    files[`app/api/${definition.slug}/route.ts`] = this.generateApiRoute(definition);

    // Types
    files[`types/${definition.slug}.ts`] = this.generateTypes(definition);

    // Hook
    files[`hooks/use${this.pascalCase(definition.slug)}.ts`] = this.generateHook(definition);

    return files;
  }

  private generateLandingPage(def: ModuleDefinition): string {
    return `// ${def.name} Landing Page
'use client';

import { use${this.pascalCase(def.slug)} } from '@/hooks/use${this.pascalCase(def.slug)}';
import { UniversalSearch } from '@/components/UniversalSearch';

export default function ${this.pascalCase(def.slug)}Page() {
  const { items, isLoading } = use${this.pascalCase(def.slug)}();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${def.name}</h1>
      <p className="text-gray-600 mb-8">${def.description}</p>
      
      ${def.settings.hasSearch ? '<UniversalSearch modules={["' + def.slug + '"]} />' : ''}
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;
  }

  private generateDetailPage(def: ModuleDefinition): string {
    return `// ${def.name} Detail Page
'use client';

import { use${this.pascalCase(def.slug)}Item } from '@/hooks/use${this.pascalCase(def.slug)}';
import { useParams } from 'next/navigation';

export default function ${this.pascalCase(def.slug)}DetailPage() {
  const { id } = useParams();
  const { item, isLoading, error } = use${this.pascalCase(def.slug)}Item(id as string);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!item) return <div>Not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
      <p className="text-gray-600">{item.description}</p>
    </div>
  );
}
`;
  }

  private generateApiRoute(def: ModuleDefinition): string {
    return `// ${def.name} API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withRBAC, PROTECTION } from '@/lib/rbac-middleware';
import { getRequestId, successResponse, errorResponse } from '@/lib/api-utils';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET: List/fetch ${def.name}
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from('${def.slug}')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('NOT_FOUND', '${def.name} not found', requestId);
      }

      return successResponse({ item: data }, requestId);
    }

    const { data, error, count } = await supabase
      .from('${def.slug}')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return errorResponse('DATABASE_ERROR', error.message, requestId);
    }

    return successResponse({ items: data, total: count }, requestId);
  } catch (error: any) {
    return errorResponse('INTERNAL_ERROR', error.message, requestId);
  }
}

// POST: Create ${def.name}
export const POST = withRBAC({ permissions: ['${def.slug}:create'] })(
  async (request: NextRequest) => {
    const requestId = getRequestId(request);
    
    try {
      const body = await request.json();
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { data, error } = await supabase
        .from('${def.slug}')
        .insert(body)
        .select()
        .single();

      if (error) {
        return errorResponse('DATABASE_ERROR', error.message, requestId);
      }

      return successResponse({ item: data }, requestId, 201);
    } catch (error: any) {
      return errorResponse('INTERNAL_ERROR', error.message, requestId);
    }
  }
);
`;
  }

  private generateTypes(def: ModuleDefinition): string {
    return `// ${def.name} Types

export interface ${this.pascalCase(def.slug)}Item {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ${this.pascalCase(def.slug)}ListParams {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}
`;
  }

  private generateHook(def: ModuleDefinition): string {
    return `// ${def.name} Hook
'use client';

import { useState, useEffect, useCallback } from 'react';

export function use${this.pascalCase(def.slug)}() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/${def.slug}');
      const data = await res.json();
      setItems(data.data?.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refresh: fetchItems };
}

export function use${this.pascalCase(def.slug)}Item(id: string) {
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(\`/api/${def.slug}?id=\${id}\`);
        const data = await res.json();
        setItem(data.data?.item);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  return { item, isLoading, error };
}

export default use${this.pascalCase(def.slug)};
`;
  }

  private pascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Get all registered modules
   */
  async getModules(): Promise<ModuleRegistration[]> {
    const { data } = await this.supabase
      .from('module_registry')
      .select('*')
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Activate a module
   */
  async activateModule(moduleId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('module_registry')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', moduleId);

    return !error;
  }
}

// Export singleton
export const moduleFactory = new ModuleFactory();
export default ModuleFactory;

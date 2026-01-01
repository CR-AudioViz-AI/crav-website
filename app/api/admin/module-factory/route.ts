// /app/api/admin/module-factory/route.ts
// Module Factory API - CR AudioViz AI
// Timestamp: January 1, 2026 - 5:48 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { ModuleFactory, ModuleDefinition } from '@/lib/module-factory';
import { getRequestId, successResponse, errorResponse } from '@/lib/api-utils';

const moduleFactory = new ModuleFactory();

// GET: List all registered modules
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  
  try {
    const modules = await moduleFactory.getModules();
    
    return successResponse({
      modules,
      total: modules.length,
      timestamp: new Date().toISOString()
    }, requestId);
  } catch (error: any) {
    console.error('[ModuleFactory] GET Error:', error);
    return errorResponse('INTERNAL_ERROR', error.message, requestId);
  }
}

// POST: Register a new module
export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  
  try {
    const body = await request.json();
    const { action, definition, moduleId } = body;

    // Handle different actions
    switch (action) {
      case 'register': {
        if (!definition) {
          return errorResponse('VALIDATION_ERROR', 'Module definition is required', requestId);
        }

        // Validate required fields
        if (!definition.name || !definition.slug) {
          return errorResponse('VALIDATION_ERROR', 'Module name and slug are required', requestId);
        }

        const result = await moduleFactory.registerModule(definition as ModuleDefinition);
        
        if (!result.success) {
          return errorResponse('REGISTRATION_FAILED', result.error || 'Unknown error', requestId);
        }

        return successResponse({
          moduleId: result.moduleId,
          message: `Module "${definition.name}" registered successfully`,
          scaffold: moduleFactory.generateScaffold(definition)
        }, requestId, 201);
      }

      case 'activate': {
        if (!moduleId) {
          return errorResponse('VALIDATION_ERROR', 'Module ID is required', requestId);
        }

        const activated = await moduleFactory.activateModule(moduleId);
        
        if (!activated) {
          return errorResponse('ACTIVATION_FAILED', 'Failed to activate module', requestId);
        }

        return successResponse({
          message: 'Module activated successfully',
          moduleId
        }, requestId);
      }

      case 'scaffold': {
        if (!definition) {
          return errorResponse('VALIDATION_ERROR', 'Module definition is required for scaffold', requestId);
        }

        const scaffold = moduleFactory.generateScaffold(definition as ModuleDefinition);
        
        return successResponse({
          scaffold,
          files: Object.keys(scaffold),
          totalFiles: Object.keys(scaffold).length
        }, requestId);
      }

      default:
        return errorResponse('INVALID_ACTION', `Unknown action: ${action}`, requestId);
    }
  } catch (error: any) {
    console.error('[ModuleFactory] POST Error:', error);
    return errorResponse('INTERNAL_ERROR', error.message, requestId);
  }
}

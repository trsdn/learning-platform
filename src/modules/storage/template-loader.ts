/**
 * Template Loader
 * Loads task templates from JSON files with audio configuration
 */

export interface AudioButtonConfig {
  show: boolean;
  field: string;
}

export interface AudioConfig {
  autoPlay?: {
    onLoad?: string[];
    onReveal?: string[];
    onAnswer?: string[];
  };
  buttons?: Record<string, AudioButtonConfig>;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  schema: Record<string, unknown>;
  audioConfig?: AudioConfig;
  metadata?: Record<string, unknown>;
  examples?: Array<Record<string, unknown>>;
}

// In-memory cache for loaded templates
const templateCache = new Map<string, TaskTemplate>();

/**
 * Load a single template by ID
 */
export async function loadTemplate(templateId: string): Promise<TaskTemplate | null> {
  // Check cache first
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId)!;
  }

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}templates/${templateId}.json`);
    if (!response.ok) {
      console.warn(`Template ${templateId} not found`);
      return null;
    }

    const template: TaskTemplate = await response.json();
    templateCache.set(templateId, template);
    return template;
  } catch (error) {
    console.error(`Failed to load template ${templateId}:`, error);
    return null;
  }
}

/**
 * Get audio configuration for a template
 */
export async function getAudioConfig(templateId: string): Promise<AudioConfig | null> {
  const template = await loadTemplate(templateId);
  return template?.audioConfig || null;
}

/**
 * Clear template cache (useful for testing)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}

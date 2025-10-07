import { describe, it, expect } from 'vitest';
import {
  componentRegistry,
  getAllComponents,
  getComponent,
  searchComponents,
  getAllCategories,
  getComponentsByCategory,
  type ComponentCategory,
} from '@ui/components/admin/utils/component-registry';

describe('component-registry', () => {
  describe('componentRegistry', () => {
    it('should contain all 12 components', () => {
      const components = Object.keys(componentRegistry);
      expect(components).toHaveLength(12);
    });

    it('should have complete metadata for each component', () => {
      Object.values(componentRegistry).forEach((component) => {
        expect(component).toHaveProperty('id');
        expect(component).toHaveProperty('name');
        expect(component).toHaveProperty('description');
        expect(component).toHaveProperty('category');
        expect(component).toHaveProperty('component');
        expect(component).toHaveProperty('variants');
        expect(component).toHaveProperty('importPath');
        expect(component.variants).toBeInstanceOf(Array);
        expect(component.variants.length).toBeGreaterThan(0);
      });
    });

    it('should have variants with complete structure', () => {
      Object.values(componentRegistry).forEach((component) => {
        component.variants.forEach((variant) => {
          expect(variant).toHaveProperty('name');
          expect(variant).toHaveProperty('description');
          expect(variant).toHaveProperty('props');
          expect(typeof variant.name).toBe('string');
          expect(typeof variant.description).toBe('string');
          expect(typeof variant.props).toBe('object');
        });
      });
    });
  });

  describe('getAllComponents', () => {
    it('should return all components as array', () => {
      const components = getAllComponents();
      expect(components).toBeInstanceOf(Array);
      expect(components).toHaveLength(12);
    });

    it('should return components with metadata', () => {
      const components = getAllComponents();
      components.forEach((component) => {
        expect(component).toHaveProperty('id');
        expect(component).toHaveProperty('name');
        expect(component).toHaveProperty('description');
      });
    });
  });

  describe('getComponent', () => {
    it('should return correct component by id', () => {
      const button = getComponent('button');
      expect(button).toBeDefined();
      expect(button?.id).toBe('button');
      expect(button?.name).toBe('Button');
    });

    it('should return component with variants', () => {
      const button = getComponent('button');
      expect(button).toBeDefined();
      expect(button?.variants).toBeDefined();
      expect(button?.variants.length).toBeGreaterThan(0);
    });

    it('should return undefined for non-existent id', () => {
      const result = getComponent('non-existent');
      expect(result).toBeUndefined();
    });

    it('should return all expected components', () => {
      const componentIds = [
        'button',
        'card',
        'input',
        'select',
        'slider',
        'checkbox',
        'feedbackCard',
        'iconButton',
        'masteryBar',
        'statCard',
        'topicCard',
        'audioButton',
      ];

      componentIds.forEach((id) => {
        const component = getComponent(id);
        expect(component).toBeDefined();
        expect(component?.id).toBe(id);
      });
    });
  });

  describe('searchComponents', () => {
    it('should find component by name', () => {
      const results = searchComponents('button');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.name.toLowerCase().includes('button'))).toBe(true);
    });

    it('should find component by partial name', () => {
      const results = searchComponents('butt');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find component by description', () => {
      const results = searchComponents('primary action');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const lowerResults = searchComponents('button');
      const upperResults = searchComponents('BUTTON');
      expect(lowerResults.length).toBe(upperResults.length);
    });

    it('should return empty array for no matches', () => {
      const results = searchComponents('nonexistent-component-xyz');
      expect(results).toEqual([]);
    });

    it('should return multiple results when query matches multiple components', () => {
      const results = searchComponents('card');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', () => {
      const categories = getAllCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should return expected categories', () => {
      const categories = getAllCategories();
      expect(categories).toContain('common');
      expect(categories).toContain('forms');
    });

    it('should not have duplicate categories', () => {
      const categories = getAllCategories();
      const uniqueCategories = [...new Set(categories)];
      expect(categories).toEqual(uniqueCategories);
    });
  });

  describe('getComponentsByCategory', () => {
    it('should return components for common category', () => {
      const commonComponents = getComponentsByCategory('common');
      expect(commonComponents.length).toBeGreaterThan(0);
      commonComponents.forEach((comp) => {
        expect(comp.category).toBe('common');
      });
    });

    it('should return components for forms category', () => {
      const formComponents = getComponentsByCategory('forms');
      expect(formComponents.length).toBeGreaterThan(0);
      formComponents.forEach((comp) => {
        expect(comp.category).toBe('forms');
      });
    });

    it('should return components for cards category', () => {
      const cardComponents = getComponentsByCategory('cards');
      expect(cardComponents.length).toBeGreaterThan(0);
      cardComponents.forEach((comp) => {
        expect(comp.category).toBe('cards');
      });
    });

    it('should return empty array for non-existent category', () => {
      const results = getComponentsByCategory('nonexistent' as ComponentCategory);
      expect(results).toEqual([]);
    });

    it('should return all components when summing all categories', () => {
      const categories = getAllCategories();
      const allFromCategories = categories.flatMap((cat) =>
        getComponentsByCategory(cat)
      );
      expect(allFromCategories).toHaveLength(12);
    });
  });

  describe('Component Structure', () => {
    it('Button should have correct structure', () => {
      const button = getComponent('button');
      expect(button).toBeDefined();
      expect(button?.category).toBe('common');
      expect(button?.variants.length).toBeGreaterThan(5); // Has many variants
    });

    it('Input should have correct structure', () => {
      const input = getComponent('input');
      expect(input).toBeDefined();
      expect(input?.category).toBe('forms');
    });

    it('Card should have correct structure', () => {
      const card = getComponent('card');
      expect(card).toBeDefined();
      expect(card?.category).toBe('cards');
    });

    it('FeedbackCard should have correct structure', () => {
      const feedbackCard = getComponent('feedbackCard');
      expect(feedbackCard).toBeDefined();
      expect(feedbackCard?.category).toBe('feedback');
    });
  });

  describe('Variant Counts', () => {
    it('Button should have 9 variants', () => {
      const button = getComponent('button');
      expect(button?.variants).toHaveLength(9);
    });

    it('all components should have at least 2 variants', () => {
      const allComponents = getAllComponents();
      allComponents.forEach((component) => {
        expect(component.variants.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../services/api';
import { supabase } from '../integrations/supabase/client';

// Mock the Supabase client with a proper structure
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null
          }))
        })),
        limit: vi.fn(() => ({
          data: [],
          error: null
        })),
        group: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      single: vi.fn()
    }))
  }
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeaturedFood', () => {
    it('should return featured food data from Supabase', async () => {
      // Mock data and response
      const mockData = [
        {
          id: 1,
          title: 'Italian Pasta Making',
          description: 'Learn to make pasta',
          price_per_person: 50,
          food_experience_images: [{ url: '/images/pasta.jpg' }],
          user_profiles: { name: 'Chef Marco' }
        }
      ];

      // Use a proper mock setup that matches what we defined above
      const mockFromMethod = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: mockData,
              error: null
            }))
          }))
        }))
      }));
      
      // Replace the from method
      (supabase.from as any) = mockFromMethod;
      
      const result = await apiService.getFeaturedFood();
      
      expect(mockFromMethod).toHaveBeenCalledWith('food_experiences');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Italian Pasta Making');
    });

    it('should return mock data when Supabase query fails', async () => {
      // Mock Supabase error
      const mockSupabaseResponse = {
        data: null,
        error: { message: 'Table does not exist' }
      };
      
      const fromMock = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => mockSupabaseResponse)
          }))
        }))
      }));
      
      (supabase.from as any) = fromMock;
      
      const result = await apiService.getFeaturedFood();

      expect(fromMock).toHaveBeenCalledWith('food_experiences');
      expect(result).toHaveLength(3); // Mock data has 3 items
      expect(result[0].title).toBe('Authentic Italian Pasta Making'); // First mock item
    });
  });

  describe('getFeaturedStays', () => {
    it('should return featured stays data from Supabase', async () => {
      // Mock Supabase response
      const mockData = [
        {
          id: 1,
          title: 'Beach House',
          description: 'Beautiful beach house',
          price_per_night: 150,
          stay_images: [{ url: '/images/beach.jpg' }],
          user_profiles: { name: 'Host Sarah' }
        }
      ];

      (supabase.from as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.eq as any).mockReturnThis();
      (supabase.limit as any).mockResolvedValue({ data: mockData, error: null });

      const result = await apiService.getFeaturedStays();

      expect(supabase.from).toHaveBeenCalledWith('stays');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Beach House');
    });
  });

  describe('getFoodCategories', () => {
    it('should return food categories with counts', async () => {
      // Mock Supabase response
      const mockData = [
        { cuisine_type: 'Italian', count: 10 },
        { cuisine_type: 'Asian', count: 7 }
      ];

      (supabase.from as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.eq as any).mockReturnThis();
      (supabase.group as any).mockResolvedValue({ data: mockData, error: null });

      const result = await apiService.getFoodCategories();

      expect(supabase.from).toHaveBeenCalledWith('food_experiences');
      expect(result).toHaveLength(2);
      expect(result[0].cuisine_type).toBe('Italian');
      expect(result[0].count).toBe(10);
    });
  });
});

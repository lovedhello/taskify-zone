import { apiService } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      group: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('API Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch featured food experiences', async () => {
    const mockData = [{ id: '1', title: 'Food 1', description: 'Desc 1', price_per_person: 20, host_id: 'host1', rating: 4.5 }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await apiService.getFeaturedFood();
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: '1',
        title: 'Food 1',
        description: 'Desc 1',
        price_per_person: 20,
        host: expect.any(Object),
      }),
    ]));
  });

  it('should handle errors when fetching featured food experiences', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: new Error('Failed to fetch') }),
    });

    const result = await apiService.getFeaturedFood();
    expect(result).toEqual([]);
  });

  it('should fetch featured stays', async () => {
    const mockData = [{ id: '2', title: 'Stay 1', description: 'Desc 2', price_per_night: 50, host_id: 'host2' }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await apiService.getFeaturedStays();
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: '2',
        title: 'Stay 1',
        description: 'Desc 2',
        price_per_night: 50,
        host: expect.any(Object),
      }),
    ]));
  });

  it('should handle errors when fetching featured stays', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: new Error('Failed to fetch') }),
    });

    const result = await apiService.getFeaturedStays();
    expect(result).toEqual([]);
  });

  it('should fetch food categories with counts', async () => {
    const mockData = [{ cuisine_type: 'Italian' }, { cuisine_type: 'Italian' }, { cuisine_type: 'Mexican' }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await apiService.getFoodCategories();
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        cuisine_type: 'Italian',
        count: expect.any(Number),
      }),
    ]));
  });

  it('should handle errors when fetching food categories', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: new Error('Failed to fetch') }),
    });

    const result = await apiService.getFoodCategories();
    expect(result).toEqual([]);
  });
});

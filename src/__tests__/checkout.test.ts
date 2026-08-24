/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../app/api/featured/checkout/route';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    })),
  })),
}));

// Mock the DB and Dodo functions
vi.mock('@/lib/featured/db', () => ({
  getFeaturedProjectByRepo: vi.fn(),
  createFeaturedProject: vi.fn(),
  createBid: vi.fn(),
  createPayment: vi.fn(),
  updateBidStatus: vi.fn(),
}));

vi.mock('@/lib/featured/dodo', () => ({
  createCheckoutSession: vi.fn(),
}));

vi.mock('@/lib/affiliate/db', () => ({
  getValidReferralForUser: vi.fn(),
  linkAffiliateReferral: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    get: vi.fn(),
  })),
}));

import { createCheckoutSession } from '@/lib/featured/dodo';
import { getFeaturedProjectByRepo, createBid, createPayment, updateBidStatus } from '@/lib/featured/db';

function createMockRequest(body: any, cookies: Record<string, string> = {}) {
  return {
    json: async () => body,
    headers: new Headers({ origin: 'http://localhost:3000' }),
    cookies: {
      get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined),
    }
  } as any;
}

describe('Checkout Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-key';
    
    // Default mocks for successful flow
    vi.mocked(getFeaturedProjectByRepo).mockResolvedValue({ id: 'proj_123' } as any);
    vi.mocked(createPayment).mockResolvedValue({ id: 'pay_123' } as any);
    vi.mocked(createBid).mockResolvedValue({ id: 'bid_123' } as any);
    vi.mocked(createCheckoutSession).mockResolvedValue({ checkout_url: 'https://checkout.dodo.com' } as any);
    vi.mocked(updateBidStatus).mockResolvedValue(true as any);
  });

  it('Featured uses the Featured product ID', async () => {
    process.env.DODO_PAYMENTS_FEATURED_PRODUCT_ID = 'prod_featured_123';
    
    const req = createMockRequest({ plan: 'featured', repository_url: 'https://github.com/user/repo', project_name: 'proj' });
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.checkout_url).toBe('https://checkout.dodo.com');
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 500 }),
      'prod_featured_123'
    );
  });

  it('Spotlight uses the Spotlight product ID', async () => {
    process.env.DODO_PAYMENTS_SPOTLIGHT_PRODUCT_ID = 'prod_spotlight_123';
    
    const req = createMockRequest({ plan: 'spotlight', repository_url: 'https://github.com/user/repo', project_name: 'proj' });
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 1000 }),
      'prod_spotlight_123'
    );
  });

  it('Missing Featured Product ID returns a clear error', async () => {
    process.env.DODO_PAYMENTS_FEATURED_PRODUCT_ID = ''; // Missing
    
    const req = createMockRequest({ plan: 'featured', repository_url: 'https://github.com/user/repo', project_name: 'proj' });
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(500);
    expect(data.error).toBe('Payment system is missing the product configuration for the featured plan.');
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it('Missing Spotlight Product ID returns a clear error', async () => {
    process.env.DODO_PAYMENTS_SPOTLIGHT_PRODUCT_ID = ''; // Missing
    
    const req = createMockRequest({ plan: 'spotlight', repository_url: 'https://github.com/user/repo', project_name: 'proj' });
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(500);
    expect(data.error).toBe('Payment system is missing the product configuration for the spotlight plan.');
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });
});

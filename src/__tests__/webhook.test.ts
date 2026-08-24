import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../app/api/featured/webhook/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/featured/dodo', () => ({
  verifyAndParseWebhook: vi.fn(),
}));

vi.mock('@/lib/featured/db', () => ({
  getPaymentByWebhookEventId: vi.fn(),
  getPaymentById: vi.fn(),
  updatePaymentStatus: vi.fn(),
  getBidByPaymentId: vi.fn(),
  updateBidStatus: vi.fn(),
  activateProjectPlan: vi.fn(),
  getFeaturedProjectById: vi.fn(),
  createActivityEvent: vi.fn(),
}));

vi.mock('@/lib/affiliate/db', () => ({
  createAffiliateCommission: vi.fn(),
  updateCommissionStatus: vi.fn(),
}));

import { verifyAndParseWebhook } from '@/lib/featured/dodo';
import { getPaymentById, activateProjectPlan, getFeaturedProjectById, getPaymentByWebhookEventId } from '@/lib/featured/db';

describe('Webhook Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    (getPaymentByWebhookEventId as any).mockResolvedValue(null);
    (getPaymentById as any).mockResolvedValue({ id: 'pay_123', status: 'pending', amount_cents: 200 });
    (getFeaturedProjectById as any).mockResolvedValue({ id: 'proj_123', featured_active: false });
  });

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/featured/webhook', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: new Headers({
        'webhook-id': 'wh_123',
        'webhook-signature': 'sig_123',
        'webhook-timestamp': '1234567890',
      }),
    });
  };

  it('rejects if plan metadata is missing', async () => {
    (verifyAndParseWebhook as any).mockReturnValue({
      type: 'payment.succeeded',
      data: {
        metadata: {
          payment_id: 'pay_123',
          featured_project_id: 'proj_123',
          // missing plan
        }
      }
    });

    const req = createMockRequest({});
    const res = await POST(req);
    
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Missing or invalid plan metadata');
    expect(activateProjectPlan).not.toHaveBeenCalled();
  });

  it('activates Boost plan correctly', async () => {
    (verifyAndParseWebhook as any).mockReturnValue({
      type: 'payment.succeeded',
      data: {
        metadata: {
          payment_id: 'pay_123',
          featured_project_id: 'proj_123',
          plan: 'boost'
        }
      }
    });

    const req = createMockRequest({});
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    expect(activateProjectPlan).toHaveBeenCalledWith('proj_123', 'boost', 200, 1, 7);
  });

  it('activates Featured plan correctly', async () => {
    (verifyAndParseWebhook as any).mockReturnValue({
      type: 'payment.succeeded',
      data: {
        metadata: {
          payment_id: 'pay_123',
          featured_project_id: 'proj_123',
          plan: 'featured'
        }
      }
    });

    const req = createMockRequest({});
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    expect(activateProjectPlan).toHaveBeenCalledWith('proj_123', 'featured', 500, 2, 14);
  });

  it('activates Spotlight plan correctly', async () => {
    (verifyAndParseWebhook as any).mockReturnValue({
      type: 'payment.succeeded',
      data: {
        metadata: {
          payment_id: 'pay_123',
          featured_project_id: 'proj_123',
          plan: 'spotlight'
        }
      }
    });

    const req = createMockRequest({});
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    expect(activateProjectPlan).toHaveBeenCalledWith('proj_123', 'spotlight', 1000, 3, 30);
  });

  it('parses nested metadata correctly', async () => {
    (verifyAndParseWebhook as any).mockReturnValue({
      type: 'payment.succeeded',
      data: {
        payment: {
          metadata: {
            payment_id: 'pay_123',
            featured_project_id: 'proj_123',
            plan: 'featured'
          }
        }
      }
    });

    const req = createMockRequest({});
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    expect(activateProjectPlan).toHaveBeenCalledWith('proj_123', 'featured', 500, 2, 14);
  });
});

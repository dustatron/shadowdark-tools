import { nanoid } from 'nanoid';

export interface ShareableContent {
  id: string;
  type: 'list' | 'table';
  data: unknown;
  metadata: {
    createdAt: string;
    expiresAt?: string;
    viewCount?: number;
    maxViews?: number;
    isPublic: boolean;
    createdBy?: string;
  };
}

export interface ShareTokenInfo {
  token: string;
  url: string;
  expiresAt?: string;
  maxViews?: number;
}

export interface ShareOptions {
  expiresInDays?: number;
  maxViews?: number;
  isPublic?: boolean;
}

/**
 * Generate a secure share token
 */
export function generateShareToken(): string {
  // Use nanoid for URL-safe, unique tokens
  // 21 characters gives us ~149 years to have a 1% probability of collision
  return nanoid(21);
}

/**
 * Generate a shorter, more user-friendly token for temporary shares
 */
export function generateShortShareToken(): string {
  // 12 characters for shorter URLs, still very unlikely to collide
  return nanoid(12);
}

/**
 * Create a share token with metadata
 */
export function createShareToken(
  contentId: string,
  contentType: 'list' | 'table',
  options: ShareOptions = {}
): ShareTokenInfo {
  const token = options.expiresInDays && options.expiresInDays <= 7
    ? generateShortShareToken()
    : generateShareToken();

  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const url = buildShareUrl(token);

  return {
    token,
    url,
    expiresAt,
    maxViews: options.maxViews,
  };
}

/**
 * Build the full share URL from a token
 */
export function buildShareUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/shared/${token}`;
}

/**
 * Parse and validate a share token
 */
export function validateShareToken(token: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check token format
  if (!token || typeof token !== 'string') {
    errors.push('Invalid token format');
    return { isValid: false, errors };
  }

  // Check token length (should be either 12 or 21 characters for nanoid)
  if (token.length !== 12 && token.length !== 21) {
    errors.push('Invalid token length');
  }

  // Check for valid characters (nanoid uses URL-safe alphabet)
  const validPattern = /^[A-Za-z0-9_-]+$/;
  if (!validPattern.test(token)) {
    errors.push('Invalid token characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a share token has expired
 */
export function isShareTokenExpired(shareableContent: ShareableContent): boolean {
  const { expiresAt } = shareableContent.metadata;

  if (!expiresAt) {
    return false; // No expiration set
  }

  return new Date(expiresAt) < new Date();
}

/**
 * Check if a share token has exceeded view limits
 */
export function isShareTokenViewLimitExceeded(shareableContent: ShareableContent): boolean {
  const { viewCount = 0, maxViews } = shareableContent.metadata;

  if (!maxViews) {
    return false; // No view limit set
  }

  return viewCount >= maxViews;
}

/**
 * Check if a share token is still valid
 */
export function isShareTokenValid(shareableContent: ShareableContent): {
  isValid: boolean;
  reason?: string;
} {
  if (isShareTokenExpired(shareableContent)) {
    return {
      isValid: false,
      reason: 'Share link has expired',
    };
  }

  if (isShareTokenViewLimitExceeded(shareableContent)) {
    return {
      isValid: false,
      reason: 'Share link has reached maximum view count',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Increment view count for a share token
 */
export function incrementShareViewCount(shareableContent: ShareableContent): ShareableContent {
  return {
    ...shareableContent,
    metadata: {
      ...shareableContent.metadata,
      viewCount: (shareableContent.metadata.viewCount || 0) + 1,
    },
  };
}

/**
 * Get share token statistics
 */
export function getShareTokenStats(shareableContent: ShareableContent): {
  viewCount: number;
  maxViews?: number;
  remainingViews?: number;
  expiresAt?: string;
  isExpired: boolean;
  isViewLimitExceeded: boolean;
  isValid: boolean;
} {
  const { viewCount = 0, maxViews, expiresAt } = shareableContent.metadata;

  const isExpired = isShareTokenExpired(shareableContent);
  const isViewLimitExceeded = isShareTokenViewLimitExceeded(shareableContent);
  const isValid = !isExpired && !isViewLimitExceeded;

  const remainingViews = maxViews ? Math.max(0, maxViews - viewCount) : undefined;

  return {
    viewCount,
    maxViews,
    remainingViews,
    expiresAt,
    isExpired,
    isViewLimitExceeded,
    isValid,
  };
}

/**
 * Create shareable content for a list
 */
export function createShareableList(
  listId: string,
  listData: unknown,
  options: ShareOptions = {}
): ShareableContent {
  const now = new Date().toISOString();
  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  return {
    id: listId,
    type: 'list',
    data: listData,
    metadata: {
      createdAt: now,
      expiresAt,
      viewCount: 0,
      maxViews: options.maxViews,
      isPublic: options.isPublic ?? false,
    },
  };
}

/**
 * Create shareable content for a roll table
 */
export function createShareableTable(
  tableId: string,
  tableData: unknown,
  options: ShareOptions = {}
): ShareableContent {
  const now = new Date().toISOString();
  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  return {
    id: tableId,
    type: 'table',
    data: tableData,
    metadata: {
      createdAt: now,
      expiresAt,
      viewCount: 0,
      maxViews: options.maxViews,
      isPublic: options.isPublic ?? false,
    },
  };
}

/**
 * Generate a QR code data URL for a share link
 */
export function generateShareQRCode(shareUrl: string): string {
  // Simple QR code data URL generation
  // In a real implementation, you might use a QR code library
  const encodedUrl = encodeURIComponent(shareUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
}

/**
 * Copy share URL to clipboard (browser only)
 */
export async function copyShareUrlToClipboard(shareUrl: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch {
    console.error('Failed to copy to clipboard');
    return false;
  }
}

/**
 * Share via Web Share API if available
 */
export async function shareViaWebShareAPI(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title,
      text,
      url,
    });
    return true;
  } catch {
    // User cancelled or error occurred
    console.error('Web Share API failed');
    return false;
  }
}

/**
 * Generate social media share URLs
 */
export function generateSocialShareUrls(shareUrl: string, title: string): {
  twitter: string;
  facebook: string;
  reddit: string;
  email: string;
} {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`Check out this ${title}`);

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
}

/**
 * Format share URL for display (truncate if too long)
 */
export function formatShareUrlForDisplay(url: string, maxLength = 50): string {
  if (url.length <= maxLength) {
    return url;
  }

  const start = url.substring(0, Math.floor(maxLength / 2) - 2);
  const end = url.substring(url.length - Math.floor(maxLength / 2) + 2);
  return `${start}...${end}`;
}

/**
 * Parse share URL to extract token
 */
export function parseShareUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const sharedIndex = pathParts.indexOf('shared');

    if (sharedIndex !== -1 && sharedIndex < pathParts.length - 1) {
      return pathParts[sharedIndex + 1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Default share options for different content types
 */
export const DEFAULT_SHARE_OPTIONS: Record<string, ShareOptions> = {
  temporary: {
    expiresInDays: 1,
    maxViews: 10,
    isPublic: false,
  },
  shortTerm: {
    expiresInDays: 7,
    maxViews: 100,
    isPublic: false,
  },
  longTerm: {
    expiresInDays: 30,
    isPublic: false,
  },
  public: {
    isPublic: true,
  },
  unlimited: {
    isPublic: true,
  },
};
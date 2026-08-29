/**
 * Utility functions for user profile data sanitization and nickname/avatar parsing.
 */

export function extractCleanNicknameAndAvatar(rawNickname?: string, rawAvatarUrl?: string): { nickname: string; avatarUrl: string } {
  let nickname = (rawNickname || '').trim();
  let avatarUrl = (rawAvatarUrl || '').trim();

  // Detect and extract any embedded URLs in the nickname string
  const urlRegex = /(https?:\/\/[^\s]+|data:image\/[^\s]+)/gi;
  const match = nickname.match(urlRegex);

  if (match && match.length > 0) {
    const extractedUrl = match[0];
    if (!avatarUrl || avatarUrl === '🌱' || avatarUrl === '' || !avatarUrl.startsWith('http')) {
      avatarUrl = extractedUrl;
    }
    // Remove the entire URL from the nickname string
    nickname = nickname.replace(extractedUrl, '').trim();
  }

  // Remove any remaining stray http/https fragments or query strings
  nickname = nickname.replace(/https?:\/\/[^\s]*/gi, '').trim();

  // If email was accidentally set as nickname, extract handle
  if (nickname.includes('@')) {
    nickname = nickname.split('@')[0].trim();
  }

  // If empty or raw database ID
  if (!nickname || nickname.startsWith('user_') || nickname.startsWith('guest_') || nickname === 'undefined' || nickname === 'null') {
    nickname = '에코러너';
  }

  // Clean trailing punctuation or delimiters
  nickname = nickname.replace(/^[=\-_\s]+|[=\-_\s]+$/g, '').trim();

  if (!nickname) {
    nickname = '에코러너';
  }

  // Cap nickname length to 12 chars
  if (nickname.length > 12) {
    nickname = nickname.substring(0, 12).trim();
  }

  if (!avatarUrl) {
    avatarUrl = '🌱';
  }

  return { nickname, avatarUrl };
}

export function sanitizeNickname(rawNickname?: string): string {
  return extractCleanNicknameAndAvatar(rawNickname).nickname;
}

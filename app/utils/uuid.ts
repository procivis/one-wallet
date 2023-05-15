import UUID from 'react-native-uuid';

/**
 * Insecure identifier generator
 * @returns {string} UUID v4
 * @example `11edc52b-2918-4d71-9058-f7285e29d894`
 */
export const generateUUID = (): string => UUID.v4() as string;

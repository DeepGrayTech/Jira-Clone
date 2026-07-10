/**
 * Encoding module for Jira Clone application.
 * Provides zero-dependency UTF-8 encoding and decoding functions
 * that work in both browser and Node.js environments.
 */

/**
 * Branch statistics for diagnostic purposes.
 */
interface EncodeStats {
  ascii: number;
  twoByte: number;
  threeByte: number;
  fourByte: number;
}

/**
 * Encodes a string to UTF-8 bytes without external dependencies.
 * Works in both browser and Node.js environments.
 * @param str - Input string to encode
 * @returns Uint8Array containing UTF-8 encoded bytes
 */
export function utf8Encode(str: string): Uint8Array {
  const bytes: number[] = [];
  const stats: EncodeStats = { ascii: 0, twoByte: 0, threeByte: 0, fourByte: 0 };

  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i)!;
    if (cp < 0x80) {
      // Branch 1: ASCII (1 byte)
      bytes.push(cp);
      stats.ascii++;
    } else if (cp < 0x800) {
      // Branch 2: 2-byte UTF-8
      bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
      stats.twoByte++;
      console.log('[utf8Encode] 2字节编码:', { char: str[i], codePoint: cp.toString(16).padStart(4, '0'), hex: [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)].map(b => b.toString(16).padStart(2, '0')).join(' ') });
    } else if (cp < 0x10000) {
      // Branch 3: 3-byte UTF-8 (BMP)
      const b1 = 0xe0 | (cp >> 12);
      const b2 = 0x80 | ((cp >> 6) & 0x3f);
      const b3 = 0x80 | (cp & 0x3f);
      bytes.push(b1, b2, b3);
      stats.threeByte++;
      console.log('[utf8Encode] 3字节编码:', { char: str[i], codePoint: cp.toString(16).padStart(4, '0'), hex: [b1, b2, b3].map(b => b.toString(16).padStart(2, '0')).join(' ') });
    } else {
      // Branch 4: 4-byte UTF-8 (surrogate pair / supplementary plane)
      const b1 = 0xf0 | (cp >> 18);
      const b2 = 0x80 | ((cp >> 12) & 0x3f);
      const b3 = 0x80 | ((cp >> 6) & 0x3f);
      const b4 = 0x80 | (cp & 0x3f);
      bytes.push(b1, b2, b3, b4);
      stats.fourByte++;
      console.log('[utf8Encode] 4字节编码(代理对):', { codePoint: cp.toString(16).padStart(6, '0'), hex: [b1, b2, b3, b4].map(b => b.toString(16).padStart(2, '0')).join(' ') });
      i++; // Skip low surrogate
    }
  }

  const result = new Uint8Array(bytes);
  console.log('[utf8Encode] 编码完成:', {
    inputLength: str.length,
    outputLength: result.length,
    hasMultiByteChars: stats.twoByte > 0 || stats.threeByte > 0 || stats.fourByte > 0,
    stats
  });
  return result;
}

/**
 * Decodes UTF-8 bytes back to a string without external dependencies.
 * Works in both browser and Node.js environments.
 * @param bytes - Uint8Array containing UTF-8 encoded bytes
 * @returns Decoded string, or null if decoding fails
 */
export function utf8Decode(bytes: Uint8Array): string | null {
  try {
    const chars: string[] = [];
    let i = 0;

    while (i < bytes.length) {
      const b1 = bytes[i];
      let codePoint: number;
      let charCount: number;

      if (b1 < 0x80) {
        // Branch 1: ASCII (1 byte)
        codePoint = b1;
        charCount = 1;
      } else if ((b1 & 0xe0) === 0xc0) {
        // Branch 2: 2-byte sequence
        if (i + 1 >= bytes.length) {
          console.warn('[utf8Decode] 2字节序列不完整:', { position: i, byteCount: bytes.length - i });
          return null;
        }
        const b2 = bytes[i + 1];
        codePoint = ((b1 & 0x1f) << 6) | (b2 & 0x3f);
        charCount = 2;
        console.log('[utf8Decode] 2字节解码:', { codePoint: codePoint.toString(16).padStart(4, '0'), bytes: [b1, b2].map(b => b.toString(16).padStart(2, '0')).join(' ') });
      } else if ((b1 & 0xf0) === 0xe0) {
        // Branch 3: 3-byte sequence
        if (i + 2 >= bytes.length) {
          console.warn('[utf8Decode] 3字节序列不完整:', { position: i, byteCount: bytes.length - i });
          return null;
        }
        const b2 = bytes[i + 1];
        const b3 = bytes[i + 2];
        codePoint = ((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
        charCount = 3;
        console.log('[utf8Decode] 3字节解码:', { codePoint: codePoint.toString(16).padStart(4, '0'), bytes: [b1, b2, b3].map(b => b.toString(16).padStart(2, '0')).join(' ') });
      } else if ((b1 & 0xf8) === 0xf0) {
        // Branch 4: 4-byte sequence
        if (i + 3 >= bytes.length) {
          console.warn('[utf8Decode] 4字节序列不完整:', { position: i, byteCount: bytes.length - i });
          return null;
        }
        const b2 = bytes[i + 1];
        const b3 = bytes[i + 2];
        const b4 = bytes[i + 3];
        codePoint = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
        charCount = 4;
        console.log('[utf8Decode] 4字节解码:', { codePoint: codePoint.toString(16).padStart(6, '0'), bytes: [b1, b2, b3, b4].map(b => b.toString(16).padStart(2, '0')).join(' ') });
      } else {
        // Invalid UTF-8 lead byte
        console.warn('[utf8Decode] 无效的UTF-8起始字节:', { position: i, byte: b1.toString(16).padStart(2, '0') });
        return null;
      }

      // Encode code point as JavaScript string
      if (codePoint > 0xffff) {
        // Surrogate pair
        chars.push(String.fromCharCode(0xd800 + ((codePoint - 0x10000) >> 10)));
        chars.push(String.fromCharCode(0xdc00 + ((codePoint - 0x10000) & 0x3ff)));
      } else {
        chars.push(String.fromCharCode(codePoint));
      }

      i += charCount;
    }

    const result = chars.join('');
    console.log('[utf8Decode] 解码完成:', { inputLength: bytes.length, outputLength: result.length });
    return result;
  } catch (err) {
    console.warn('[utf8Decode] 解码异常:', err);
    return null;
  }
}

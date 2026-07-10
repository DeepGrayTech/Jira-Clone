import { generateKey, encryptData, decryptData } from "../lib/encryption";

const mockDecryptResult = new Uint8Array(
  JSON.stringify({ id: "1", title: "Test" })
    .split("")
    .map((c) => c.charCodeAt(0))
);

const mockSubtle = {
  generateKey: jest.fn().mockResolvedValue({
    type: "secret",
    algorithm: { name: "AES-GCM", length: 256 },
    extractable: true,
  }),
  importKey: jest.fn().mockResolvedValue({
    type: "secret",
    algorithm: { name: "AES-GCM", length: 256 },
    extractable: true,
  }),
  exportKey: jest.fn().mockResolvedValue(new Uint8Array(32)),
  encrypt: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
  decrypt: jest.fn().mockResolvedValue(mockDecryptResult),
};

beforeEach(() => {
  jest.clearAllMocks();

  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      length: () => Object.keys(store).length,
      key: (index: number) => Object.keys(store)[index] || null,
    };
  })();

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(globalThis, "crypto", {
    value: {
      subtle: mockSubtle,
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = i;
        }
        return arr;
      },
    },
    writable: true,
  });

  Object.defineProperty(globalThis, "TextEncoder", {
    value: class TextEncoder {
      encode(str: string) {
        return new Uint8Array(str.split("").map((c) => c.charCodeAt(0)));
      }
    },
    writable: true,
  });

  Object.defineProperty(globalThis, "TextDecoder", {
    value: class TextDecoder {
      decode(bytes: Uint8Array) {
        return Array.from(bytes)
          .map((b) => String.fromCharCode(b))
          .join("");
      }
    },
    writable: true,
  });
});

describe("Encryption Functions", () => {
  describe("generateKey", () => {
    it("should generate a new AES-GCM key when no key exists", async () => {
      const key = await generateKey();
      expect(key).toBeDefined();
      expect(mockSubtle.generateKey).toHaveBeenCalled();
    });

    it("should store the generated key in localStorage", async () => {
      await generateKey();
      const storedKey = localStorage.getItem("jira-clone-encryption-key");
      expect(storedKey).not.toBeNull();
    });

    it("should reuse existing key from localStorage", async () => {
      await generateKey();
      const firstKey = localStorage.getItem("jira-clone-encryption-key");

      await generateKey();
      const secondKey = localStorage.getItem("jira-clone-encryption-key");

      expect(firstKey).toBe(secondKey);
    });
  });

  describe("encryptData", () => {
    it("should encrypt data and return a string", async () => {
      const testData = { id: "1", title: "Test Task", status: "TODO" };
      const encrypted = await encryptData(testData);

      expect(encrypted).not.toBeNull();
      expect(typeof encrypted).toBe("string");
      expect(encrypted!.length).toBeGreaterThan(0);
      expect(mockSubtle.encrypt).toHaveBeenCalled();
    });
  });

  describe("decryptData", () => {
    it("should decrypt data back to original", async () => {
      const encrypted = await encryptData({
        id: "1",
        title: "Test",
        status: "TODO",
        priority: "MEDIUM",
      });
      const decrypted = await decryptData(encrypted!);

      expect(decrypted).toEqual({ id: "1", title: "Test" });
      expect(mockSubtle.decrypt).toHaveBeenCalled();
    });

    it("should return null for invalid ciphertext", async () => {
      const invalidData = "invalid-base64-data!!!";
      const result = await decryptData(invalidData);

      expect(result).toBeNull();
    });
  });
});

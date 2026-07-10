import { utf8Encode, utf8Decode } from "../lib/encoding";

describe("utf8Encode", () => {
  describe("空字符串", () => {
    it("应该返回空的 Uint8Array", () => {
      const result = utf8Encode("");
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });
  });

  describe("纯 ASCII 字符", () => {
    it("应该正确编码英文字符串", () => {
      const result = utf8Encode("hello");
      expect(result.length).toBe(5);
      expect(result[0]).toBe(0x68); // 'h'
      expect(result[1]).toBe(0x65); // 'e'
      expect(result[2]).toBe(0x6c); // 'l'
      expect(result[3]).toBe(0x6c); // 'l'
      expect(result[4]).toBe(0x6f); // 'o'
    });

    it("应该把 ASCII 范围外的字符当作多字节处理", () => {
      // DEL (0x7F) 是最后一个 ASCII 字符
      const result = utf8Encode("\x7F");
      expect(result.length).toBe(1);
      expect(result[0]).toBe(0x7f);
    });
  });

  describe("2字节 UTF-8 字符 (U+0080 ~ U+07FF)", () => {
    it("应该正确编码 é (U+00E9)", () => {
      const result = utf8Encode("é");
      expect(result.length).toBe(2);
      expect(result[0]).toBe(0xc3);
      expect(result[1]).toBe(0xa9);
    });

    it("应该正确编码 £ (U+00A3)", () => {
      const result = utf8Encode("£");
      expect(result.length).toBe(2);
      expect(result[0]).toBe(0xc2);
      expect(result[1]).toBe(0xa3);
    });
  });

  describe("3字节 UTF-8 字符 (U+0800 ~ U+FFFF)", () => {
    it("应该正确编码中文字符 中 (U+4E2D)", () => {
      const result = utf8Encode("中");
      expect(result.length).toBe(3);
      expect(result[0]).toBe(0xe4);
      expect(result[1]).toBe(0xb8);
      expect(result[2]).toBe(0xad);
    });

    it("应该正确编码日文字符 あ (U+3042)", () => {
      const result = utf8Encode("あ");
      expect(result.length).toBe(3);
      expect(result[0]).toBe(0xe3);
      expect(result[1]).toBe(0x81);
      expect(result[2]).toBe(0x82);
    });
  });

  describe("4字节 UTF-8 字符 / 代理对 (U+10000+)", () => {
    it("应该正确编码 😀 (U+1F600)", () => {
      const result = utf8Encode("😀");
      expect(result.length).toBe(4);
      expect(result[0]).toBe(0xf0);
      expect(result[1]).toBe(0x9f);
      expect(result[2]).toBe(0x98);
      expect(result[3]).toBe(0x80);
    });

    it("应该正确编码 🎉 (U+1F389)", () => {
      const result = utf8Encode("🎉");
      expect(result.length).toBe(4);
      expect(result[0]).toBe(0xf0);
      expect(result[1]).toBe(0x9f);
      expect(result[2]).toBe(0x8e);
      expect(result[3]).toBe(0x89);
    });

    it("应该正确编码多个连续 emoji", () => {
      const result = utf8Encode("😀🎉");
      expect(result.length).toBe(8);
    });
  });

  describe("混合字符串", () => {
    it("应该正确编码 ASCII + 中文 + Emoji 混合", () => {
      const result = utf8Encode("hello中国😀");
      // hello(5) + 中国(3+3) + 😀(4) = 15
      expect(result.length).toBe(15);
    });
  });
});

describe("utf8Decode", () => {
  describe("空数据", () => {
    it("应该返回空字符串", () => {
      const result = utf8Decode(new Uint8Array(0));
      expect(result).toBe("");
    });
  });

  describe("ASCII 解码", () => {
    it("应该正确解码 ASCII 字节", () => {
      const bytes = new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
      const result = utf8Decode(bytes);
      expect(result).toBe("hello");
    });
  });

  describe("2字节解码", () => {
    it("应该正确解码 é (0xC3 0xA9)", () => {
      const bytes = new Uint8Array([0xc3, 0xa9]);
      const result = utf8Decode(bytes);
      expect(result).toBe("é");
    });
  });

  describe("3字节解码", () => {
    it("应该正确解码 中 (0xE4 0xB8 0xAD)", () => {
      const bytes = new Uint8Array([0xe4, 0xb8, 0xad]);
      const result = utf8Decode(bytes);
      expect(result).toBe("中");
    });
  });

  describe("4字节解码", () => {
    it("应该正确解码 😀 (0xF0 0x9F 0x98 0x80)", () => {
      const bytes = new Uint8Array([0xf0, 0x9f, 0x98, 0x80]);
      const result = utf8Decode(bytes);
      expect(result).toBe("😀");
    });
  });

  describe("不完整序列", () => {
    it("应该对不完整的 2 字节序列返回 null", () => {
      const bytes = new Uint8Array([0xc3]); // 缺少第二个字节
      const result = utf8Decode(bytes);
      expect(result).toBeNull();
    });

    it("应该对不完整的 3 字节序列返回 null", () => {
      const bytes = new Uint8Array([0xe4, 0xb8]); // 缺少第三个字节
      const result = utf8Decode(bytes);
      expect(result).toBeNull();
    });

    it("应该对不完整的 4 字节序列返回 null", () => {
      const bytes = new Uint8Array([0xf0, 0x9f, 0x98]); // 缺少第四个字节
      const result = utf8Decode(bytes);
      expect(result).toBeNull();
    });
  });

  describe("无效起始字节", () => {
    it("应该对 continuation byte (0x80) 开头返回 null", () => {
      const bytes = new Uint8Array([0x80]);
      const result = utf8Decode(bytes);
      expect(result).toBeNull();
    });

    it("应该对无效字节 0xFF 返回 null", () => {
      const bytes = new Uint8Array([0xff]);
      const result = utf8Decode(bytes);
      expect(result).toBeNull();
    });

    it("应该对无效字节 0xFE 返回 null", () => {
      const bytes = new Uint8Array([0xfe]);
      const result = utf8Decode(bytes);
      expect(result).toBeNull();
    });
  });
});

describe("往返测试 (encode → decode)", () => {
  it("纯 ASCII 往返", () => {
    const original = "Hello, World!";
    const encoded = utf8Encode(original);
    const decoded = utf8Decode(encoded);
    expect(decoded).toBe(original);
  });

  it("中文往返", () => {
    const original = "你好世界";
    const encoded = utf8Encode(original);
    const decoded = utf8Decode(encoded);
    expect(decoded).toBe(original);
  });

  it("Emoji 往返", () => {
    const original = "😀🎉💯";
    const encoded = utf8Encode(original);
    const decoded = utf8Decode(encoded);
    expect(decoded).toBe(original);
  });

  it("混合字符串往返", () => {
    const original = "Hello你好😀World世界🎉";
    const encoded = utf8Encode(original);
    const decoded = utf8Decode(encoded);
    expect(decoded).toBe(original);
  });

  it("空字符串往返", () => {
    const original = "";
    const encoded = utf8Encode(original);
    const decoded = utf8Decode(encoded);
    expect(decoded).toBe(original);
  });
});
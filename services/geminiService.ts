
import { GoogleGenAI, Type } from "@google/genai";
import { ExtensionResult } from "../types";

const SYSTEM_INSTRUCTION = `Bạn là một chuyên gia phát triển Chrome Extension (Manifest V3). 
Nhiệm vụ của bạn là tạo ra mã nguồn hoàn chỉnh cho một Chrome Extension dựa trên yêu cầu của người dùng.
Mã nguồn phải bao gồm đầy đủ các tệp cần thiết như manifest.json, popup.html, popup.js, content scripts hoặc background scripts nếu cần.
Đảm bảo mã nguồn tuân thủ các quy tắc bảo mật và hiệu suất mới nhất của Manifest V3.
Nếu cần icon, hãy tạo một hướng dẫn nhỏ trong README hoặc comment thay vì cung cấp file binary.
Kết quả trả về PHẢI là định dạng JSON hợp lệ theo schema yêu cầu.`;

export const generateExtension = async (prompt: string): Promise<ExtensionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Hãy tạo Chrome Extension cho yêu cầu sau: "${prompt}"`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tên của extension" },
          description: { type: Type.STRING, description: "Mô tả ngắn gọn" },
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING, description: "Đường dẫn file (VD: manifest.json, src/popup.js)" },
                content: { type: Type.STRING, description: "Nội dung của file" }
              },
              required: ["path", "content"]
            }
          }
        },
        required: ["name", "description", "files"]
      },
      thinkingConfig: { thinkingBudget: 10000 }
    }
  });

  const resultStr = response.text;
  if (!resultStr) throw new Error("Không nhận được phản hồi từ AI.");
  
  return JSON.parse(resultStr) as ExtensionResult;
};

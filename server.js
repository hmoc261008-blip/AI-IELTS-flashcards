import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Đọc biến môi trường
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo client Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

if (!GEMINI_API_KEY) {
    console.error("LỖI: Không tìm thấy GEMINI_API_KEY trong file .env!");
    process.exit(1); 
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); 
const AI_MODEL = "gemini-2.5-flash";

// Serve static files
app.use(express.static("public"));

// Route /improve
app.post("/improve", async (req, res) => {
    const { sentence, word } = req.body; 

    if (!sentence || !word) {
        return res.status(400).json({ suggestion: "⚠️ Thiếu câu hoặc từ vựng." });
    }

    const prompt = `Bạn là giáo viên IELTS. Nhiệm vụ của bạn là:
1. Đánh giá và cải thiện câu sau: "${sentence}".
2. Cải thiện câu để nghe tự nhiên hơn, sử dụng cấu trúc và từ vựng band cao.
3. **Bắt buộc phải giữ lại từ: "${word}"** trong câu đã sửa.
4. **Chỉ trả về duy nhất câu đã được cải thiện (không thêm lời giải thích hay tiêu đề).**`;

    try {
        const response = await ai.models.generateContent({
            model: AI_MODEL, 
            contents: prompt,
        });

        const suggestion = response.text.trim();
        
        res.json({ suggestion }); 

    } catch (err) {
        console.error("LỖI GỌI API GEMINI:", err.message); 
        res.status(500).json({ suggestion: "⚠️ Lỗi khi kết nối AI." });
    }
});

app.listen(3000, () => {
    console.log("Server đang chạy tại http://localhost:3000");
    console.log("Sử dụng mô hình:", AI_MODEL);
});
import asyncio
import os
import subprocess
import edge_tts

VOICE = "vi-VN-NamMinhNeural"
SCENES = [
    (0.0, 5.0, "Mỗi năm học trôi qua, hàng triệu cây bút bi bốc hơi khỏi mặt bàn mà không để lại dấu vết."),
    (5.0, 10.0, "Xin chào, tôi là Bi. Sáng thứ Hai, tôi còn nằm ngay ngắn trong hộp bút mới tinh."),
    (10.0, 16.0, "Tôi rẻ, viết êm, mực ra đều. Ai đi thi cũng cần đến tôi."),
    (16.0, 22.0, "Nhưng tuổi thọ của tôi không tính bằng lượng mực, mà tính bằng số lần cho mượn."),
    (22.0, 28.0, "Chỉ một câu: Ê, cho mượn cây bút xíu! Là số phận tôi rẽ sang trang khác."),
    (28.0, 34.0, "Một xíu của họ kéo dài từ tiết Toán, qua tiết Văn, rồi bay sang tận lớp bên cạnh."),
    (34.0, 40.0, "Chưa hết! Kẻ thù lớn thứ hai của tôi chính là trọng lực và khe bàn."),
    (40.0, 46.0, "Chỉ cần lăn nhẹ một vòng, tôi lập tức rơi vào hố đen gầm bàn đầy bụi."),
    (46.0, 52.0, "Chẳng ai cúi xuống tìm cây bút năm nghìn. Người ta chỉ mua luôn hộp mới."),
    (52.0, 60.0, "Nên nếu thấy tôi vẫn còn trên bàn, hãy giữ chặt tôi nhé, đừng để tôi đi lạc!")
]

async def main():
    os.makedirs("out/tts", exist_ok=True)
    filter_parts = []
    inputs = []

    for idx, (start, end, text) in enumerate(SCENES):
        path = f"out/tts/seg_{idx:02d}.mp3"
        communicate = edge_tts.Communicate(text, VOICE, rate="+5%")
        await communicate.save(path)
        inputs.extend(["-i", path])
        delay_ms = int(start * 1000)
        filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms}[a{idx}]")

    mix_inputs = "".join(f"[a{i}]" for i in range(len(SCENES)))
    filter_complex = ";".join(filter_parts) + f";{mix_inputs}amix=inputs={len(SCENES)}:normalize=0,apad=whole_dur=60[outa]"

    cmd = ["ffmpeg", "-y", *inputs, "-filter_complex", filter_complex, "-map", "[outa]", "-t", "60", "out/voiceover.mp3"]
    subprocess.run(cmd, check=True)
    print("Created out/voiceover.mp3 (60s)")

if __name__ == "__main__":
    asyncio.run(main())

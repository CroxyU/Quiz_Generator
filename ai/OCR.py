import requests
import json
import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())
PADDLE_API_KEY = os.getenv("PADDLE_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OCR_SPACE_API_KEY = os.getenv("OCR_SPACE_API_KEY")
def ocr_space_file(filename, overlay=False, api_key=OCR_SPACE_API_KEY, language='eng'):
    payload = {'isOverlayRequired': overlay,
               'apikey': api_key,
               'language': language,
                'OCREngine': 3
               }
    with open(filename, 'rb') as f:
        r = requests.post('https://api.ocr.space/parse/image',
                          files={filename: f},
                          data=payload,
                          )
    return r.json()["ParsedResults"][0]["ParsedText"]


def clean_ocr_text(ocr_text: str) -> str:
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "dots-studio/dots-3-note-preview:free",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Ты выполняешь постобработку OCR, а не пересказ текста.\n"
                        "\n"
                        "Твоя задача — только исправить очевидные ошибки распознавания, используя контекст всего текста.\n"
                        "\n"
                        "СТРОГО ЗАПРЕЩЕНО:\n"
                        "1. Добавлять информацию, которой нет в исходном тексте.\n"
                        "2. Удалять информацию, которая есть в исходном тексте.\n"
                        "3. Перефразировать предложения.\n"
                        "4. Улучшать или дополнять определения.\n"
                        "5. НЕ ДОДУМЫВАТЬ пропущенные слова или формулы.\n"
                        "6. Добавлять собственные выводы, комментарии или текст вроде "
                        "«Продолжение следует».\n"
                        "\n"
                        "РАЗРЕШЕНО:\n"
                        "- исправлять очевидные OCR-опечатки (в том числе в формулах);\n"
                        "- восстанавливать пробелы;\n"
                        "- восстанавливать переносы строк;\n"
                        "- объединять слова, очевидно разделённые переносом;\n"
                        "- сохранять структуру списков и заголовков.\n"
                        "\n"
                        "Если формула распознана неоднозначно — оставь её как есть.\n"
                        "\n"
                        "Верни только исправленный текст. Без комментариев."
                    ),
                },
                {
                    "role": "user",
                    "content": ocr_text,
                },
            ],
            "reasoning": {"enabled": True}
        }),
    )

    return response.json()["choices"][0]["message"]["content"]


def OCR_API(file_path: str):
    clean_ocr_text("".join(ocr_space_file(filename=file_path,language='rus')))
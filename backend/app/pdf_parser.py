import pdfplumber
import pytesseract
from PIL import Image
import os

pytesseract.pytesseract.tesseract_cmd = r'C:\Tesseract\tesseract.exe'

os.environ['TESSDATA_PREFIX'] = r'C:\Tesseract'

def parse_pdf(file_path: str):
    with pdfplumber.open(file_path) as pdf:
        text = ""
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text

def parse_image(image_path: str):
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)
    return text

def main():
    pdf_path = 'parser_test/Nedim CV - LX.pdf'
    image_path = 'parser_test/TestCV.png'  

    print("=== PARSIRANI TEKST IZ PDF-a ===")
    pdf_text = parse_pdf(pdf_path)
    print(pdf_text if pdf_text.strip() else "PDF možda nije tekstualan ili je prazan.")

    print("\n=== PARSIRANI TEKST IZ SLIKE ===")
    image_text = parse_image(image_path)
    print(image_text if image_text.strip() else "Slika možda nema prepoznatljiv tekst.")

if __name__ == "__main__":
    main()
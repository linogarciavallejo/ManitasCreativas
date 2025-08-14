
import openpyxl
import sys
import os

def extract_names_from_excel(file_path):
    workbook = openpyxl.load_workbook(file_path)
    sheet = workbook.active
    names = []
    # Column A is index 1
    for row in sheet.iter_rows(min_row=1, min_col=1, max_col=1):
        for cell in row:
            if cell.value:
                names.append(cell.value)
    return names

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_names.py <excel_file_path>")
        print("Example: python extract_names.py 'C:\\path\\to\\your\\file.xlsx'")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    
    if not os.path.exists(excel_file):
        print(f"Error: File '{excel_file}' not found")
        print("Please check the file path and try again")
        sys.exit(1)
    
    print(f"Processing Excel file: {excel_file}")
    
    try:
        extracted_names = extract_names_from_excel(excel_file)
        
        # Generate output filename based on input filename
        base_name = os.path.splitext(os.path.basename(excel_file))[0]
        output_file = f"extracted_names_{base_name}.txt"
        
        with open(output_file, "w", encoding="utf-8") as f:
            for name in extracted_names:
                f.write(name + "\n")
        
        print(f"Successfully extracted {len(extracted_names)} names from {excel_file}")
        print(f"Output saved to: {output_file}")
        
    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)



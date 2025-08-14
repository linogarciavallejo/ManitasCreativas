
import re
import sys
import os

def parse_full_name(full_name):
    # Remove 'Nombre del Alumno' header if present
    if full_name.strip() == 'Nombre del Alumno':
        return None

    # Replace specific wrong accented vowels with correct Spanish accents
    full_name = full_name.replace('è', 'é').replace('ò', 'ó')
    full_name = full_name.replace('à', 'á').replace('ì', 'í').replace('ù', 'ú')
    full_name = full_name.replace('È', 'É').replace('Ò', 'Ó')
    full_name = full_name.replace('À', 'Á').replace('Ì', 'Í').replace('Ù', 'Ú')

    # Clean up extra spaces
    full_name = re.sub(r'\s+', ' ', full_name).strip()

    primer_apellido = ''
    segundo_apellido = ''
    primer_nombre = ''
    segundo_nombre = ''
    tercer_nombre = ''

    if ',' in full_name:
        parts = [p.strip() for p in full_name.split(',', 1)] # Split only on the first comma
        last_names_str = parts[0]
        first_names_str = parts[1] if len(parts) > 1 else ''

        last_names = last_names_str.split()
        primer_apellido = last_names[0] if len(last_names) > 0 else ''
        segundo_apellido = last_names[1] if len(last_names) > 1 else ''

        first_names = first_names_str.split()
        primer_nombre = first_names[0] if len(first_names) > 0 else ''
        segundo_nombre = first_names[1] if len(first_names) > 1 else ''
        tercer_nombre = first_names[2] if len(first_names) > 2 else ''

    else:
        # No comma, assume first two words are last names, rest are first names
        words = full_name.split()
        if len(words) >= 2:
            primer_apellido = words[0]
            segundo_apellido = words[1]
            remaining_names = words[2:]

            if len(remaining_names) > 0:
                primer_nombre = remaining_names[0]
            if len(remaining_names) > 1:
                segundo_nombre = remaining_names[1]
            if len(remaining_names) > 2:
                tercer_nombre = remaining_names[2]

    return {
        'primer_apellido': primer_apellido,
        'segundo_apellido': segundo_apellido,
        'primer_nombre': primer_nombre,
        'segundo_nombre': segundo_nombre,
        'tercer_nombre': tercer_nombre
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_names.py <extracted_names_file>")
        print("Example: python process_names.py extracted_names_KinderA.txt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    if not os.path.exists(input_file):
        print(f"Error: File '{input_file}' not found")
        print("Please check the file path and try again")
        sys.exit(1)
    
    print(f"Processing names from: {input_file}")
    
    try:
        processed_names = []
        with open(input_file, "r", encoding="utf-8") as f:
            for line in f:
                parsed_name = parse_full_name(line.strip())
                if parsed_name:
                    processed_names.append(parsed_name)
        
        # Generate output filename based on input filename
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        # Remove 'extracted_names_' prefix if present
        if base_name.startswith('extracted_names_'):
            base_name = base_name[len('extracted_names_'):]
        output_file = f"processed_names_{base_name}.txt"
        
        with open(output_file, "w", encoding="utf-8") as f:
            for name_dict in processed_names:
                f.write(f"{name_dict['primer_apellido']},{name_dict['segundo_apellido']},{name_dict['primer_nombre']},{name_dict['segundo_nombre']},{name_dict['tercer_nombre']}\n")
        
        print(f"Successfully processed {len(processed_names)} names")
        print(f"Output saved to: {output_file}")
        
    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)



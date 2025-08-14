import csv
from datetime import datetime
import pytz
import sys
import os

def generate_sql_inserts(input_file, output_file, table_name="public.\"Alumnos\""):
    print(f"Intentando generar SQL desde {input_file} a {output_file}")
    try:
        with open(input_file, "r") as infile, open(output_file, "w") as outfile:
            reader = csv.reader(infile)
            for row in reader:
                # Extracting names from processed_names.txt
                primer_apellido = row[0].strip().replace("\"", "\"\"") if len(row) > 0 else ""
                segundo_apellido = row[1].strip().replace("\"", "\"\"") if len(row) > 1 else ""
                primer_nombre = row[2].strip().replace("\"", "\"\"") if len(row) > 2 else ""
                segundo_nombre = row[3].strip().replace("\"", "\"\"") if len(row) > 3 else ""
                tercer_nombre = row[4].strip().replace("\"", "\"\"") if len(row) > 4 else ""

                # Predefined values
                sede_id = 1
                grado_id = 4 # Changed for Parvulos3-Prepa-B
                becado = "NULL"
                beca_parcial_porcentaje = "NULL"
                codigo = "\"codigo\"" # Static code as requested
                estado = 1
                fecha_actualizacion = "NULL"

                # Get current date time in GMT-6 (Central Standard Time without daylight saving)
                tz = pytz.timezone("America/Guatemala") # Example timezone for GMT-6
                fecha_creacion_dt = datetime.now(tz)
                fecha_creacion = f"\'{fecha_creacion_dt.isoformat()}\'"

                seccion = "\"B\"" # Changed for Parvulos3-Prepa-B
                usuario_actualizacion_id = "NULL"
                usuario_creacion_id = 1
                observaciones = "NULL"
                direccion = "NULL"

                # Handle empty strings for optional fields by inserting NULL or empty string
                segundo_nombre_sql = f"\'{segundo_nombre}\'" if segundo_nombre else "NULL"
                segundo_apellido_sql = f"\'{segundo_apellido}\'" if segundo_apellido else "NULL"
                tercer_nombre_sql = f"\'{tercer_nombre}\'" if tercer_nombre else "NULL"

                # SQL INSERT statement
                sql_command = f"INSERT INTO {table_name}(\n"
                sql_command += "\t\"PrimerNombre\", \"SegundoNombre\", \"PrimerApellido\", \"SegundoApellido\", \"SedeId\", \"GradoId\", \"Becado\", \"BecaParcialPorcentaje\", \"Codigo\", \"Estado\", \"FechaActualizacion\", \"FechaCreacion\", \"Seccion\", \"UsuarioActualizacionId\", \"UsuarioCreacionId\", \"Observaciones\", \"Direccion\", \"TercerNombre\")\n"
                sql_command += f"\tVALUES (\'{primer_nombre}\'\n\t, {segundo_nombre_sql}\n\t, \'{primer_apellido}\'\n\t, {segundo_apellido_sql}\n\t, {sede_id}\n\t, {grado_id}\n\t, {becado}\n\t, {beca_parcial_porcentaje}\n\t, \'codigo\'\n\t, {estado}\n\t, {fecha_actualizacion}\n\t, {fecha_creacion}\n\t, \'B\'\n\t, {usuario_actualizacion_id}\n\t, {usuario_creacion_id}\n\t, {observaciones}\n\t, {direccion}\n\t, {tercer_nombre_sql}\n\t);\n\n"
                
                outfile.write(sql_command)
        print(f"SQL generado exitosamente en {output_file}")
    except Exception as e:
        print(f"Error al generar SQL: {e}")

def generate_sql_inserts_with_params(input_file, output_file, grado_id=4, seccion="B", table_name="public.\"Alumnos\""):
    print(f"Intentando generar SQL desde {input_file} a {output_file}")
    try:
        with open(input_file, "r", encoding="utf-8") as infile, open(output_file, "w", encoding="utf-8") as outfile:
            reader = csv.reader(infile)
            for row in reader:
                # Extracting names from processed_names.txt
                primer_apellido = row[0].strip().replace("\"", "\"\"") if len(row) > 0 else ""
                segundo_apellido = row[1].strip().replace("\"", "\"\"") if len(row) > 1 else ""
                primer_nombre = row[2].strip().replace("\"", "\"\"") if len(row) > 2 else ""
                segundo_nombre = row[3].strip().replace("\"", "\"\"") if len(row) > 3 else ""
                tercer_nombre = row[4].strip().replace("\"", "\"\"") if len(row) > 4 else ""

                # Predefined values
                sede_id = 1
                becado = "NULL"
                beca_parcial_porcentaje = "NULL"
                codigo = "\"codigo\"" # Static code as requested
                estado = 1
                fecha_actualizacion = "NULL"

                # Get current date time in GMT-6 (Central Standard Time without daylight saving)
                tz = pytz.timezone("America/Guatemala") # Example timezone for GMT-6
                fecha_creacion_dt = datetime.now(tz)
                fecha_creacion = f"\'{fecha_creacion_dt.isoformat()}\'"

                usuario_actualizacion_id = "NULL"
                usuario_creacion_id = 1
                observaciones = "NULL"
                direccion = "NULL"

                # Handle empty strings for optional fields by inserting NULL or empty string
                segundo_nombre_sql = f"\'{segundo_nombre}\'" if segundo_nombre else "NULL"
                segundo_apellido_sql = f"\'{segundo_apellido}\'" if segundo_apellido else "NULL"
                tercer_nombre_sql = f"\'{tercer_nombre}\'" if tercer_nombre else "NULL"

                # SQL INSERT statement
                sql_command = f"INSERT INTO {table_name}(\n"
                sql_command += "\t\"PrimerNombre\", \"SegundoNombre\", \"PrimerApellido\", \"SegundoApellido\", \"SedeId\", \"GradoId\", \"Becado\", \"BecaParcialPorcentaje\", \"Codigo\", \"Estado\", \"FechaActualizacion\", \"FechaCreacion\", \"Seccion\", \"UsuarioActualizacionId\", \"UsuarioCreacionId\", \"Observaciones\", \"Direccion\", \"TercerNombre\")\n"
                sql_command += f"\tVALUES (\'{primer_nombre}\'\n\t, {segundo_nombre_sql}\n\t, \'{primer_apellido}\'\n\t, {segundo_apellido_sql}\n\t, {sede_id}\n\t, {grado_id}\n\t, {becado}\n\t, {beca_parcial_porcentaje}\n\t, \'codigo\'\n\t, {estado}\n\t, {fecha_actualizacion}\n\t, {fecha_creacion}\n\t, \'{seccion}\'\n\t, {usuario_actualizacion_id}\n\t, {usuario_creacion_id}\n\t, {observaciones}\n\t, {direccion}\n\t, {tercer_nombre_sql}\n\t);\n\n"
                
                outfile.write(sql_command)
        print(f"SQL generado exitosamente en {output_file}")
    except Exception as e:
        print(f"Error al generar SQL: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_sql.py <processed_names_file> [grado_id] [seccion]")
        print("Example: python generate_sql.py processed_names_KinderA.txt 4 B")
        print("Default values: grado_id=4, seccion=B")
        sys.exit(1)
    
    input_names_file = sys.argv[1]
    
    if not os.path.exists(input_names_file):
        print(f"Error: File '{input_names_file}' not found")
        print("Please check the file path and try again")
        sys.exit(1)
    
    # Optional parameters with defaults
    grado_id = int(sys.argv[2]) if len(sys.argv) > 2 else 4
    seccion = sys.argv[3] if len(sys.argv) > 3 else "B"
    
    print(f"Processing file: {input_names_file}")
    print(f"Using grado_id: {grado_id}, seccion: {seccion}")
    
    try:
        # Generate output filename based on input filename
        base_name = os.path.splitext(os.path.basename(input_names_file))[0]
        # Remove 'processed_names_' prefix if present
        if base_name.startswith('processed_names_'):
            base_name = base_name[len('processed_names_'):]
        output_sql_file = f"insert_students_{base_name}.sql"
        
        # Update the function to accept grado_id and seccion as parameters
        generate_sql_inserts_with_params(input_names_file, output_sql_file, grado_id, seccion)
        
    except Exception as e:
        print(f"Error generating SQL: {e}")
        sys.exit(1)



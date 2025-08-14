Alumnos
```
python .\extract_names.py "..\PrimeroPrimaria-A.xlsx"
python .\process_names.py .\extracted_names_PrimeroPrimaria-A.txt
python .\generate_sql.py .\processed_names_PrimeroPrimaria-A.txt 5 A
```

Inscripciones
```
python .\generate_sql_openai_v4.py --excel .\Pagos-SegundoPrimaria-B.xlsx --csv .\data-1754190746579.csv --sql-template .\insert-pago-example.sql --rubro-id 17 --month 1 --year 2025 --cell-range B3:B21  --fee-col H
```

Cuota Anual
```
python .\generate_sql_openai_v4.py --excel .\Pagos-Parvulos2-Kinder-A.xlsx --csv .\data-1753744983072.csv --sql-template .\insert-pago-example.sql --rubro-id 19 --month 1 --year 2025 --cell-range B3:B21 --fee-col H
```

Colegiaturas
```
python .\generate_sql_multi_mes.py --excel .\Pagos-QuintoBachEduca.xlsx --csv .\data-1754952225509.csv --sql-template .\insert-pago-example.sql --rubro-id 24 --month 1 --year 2025 --cell-range B3:B3 --fee-cols H-Q
```





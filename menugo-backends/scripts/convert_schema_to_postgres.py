from pathlib import Path
import re

src_path = Path(__file__).resolve().parent.parent / 'database.sql'
out_path = Path(__file__).resolve().parent.parent / 'database-postgres.sql'
text = src_path.read_text(encoding='utf-8')
lines = text.splitlines()
out_lines = []
post_indexes = []
inside_create = False
current_table = None

def normalize_mysql_functions(line):
    line = re.sub(r'CURDATE\(\)', 'CURRENT_DATE', line, flags=re.IGNORECASE)

    def replace_timestampdiff(match):
        inner = match.group(1)
        depth = 0
        args = []
        current = ''
        for ch in inner:
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
            if ch == ',' and depth == 0:
                args.append(current.strip())
                current = ''
            else:
                current += ch
        if current.strip():
            args.append(current.strip())
        if len(args) == 3:
            return f'(EXTRACT(EPOCH FROM ({args[2]} - {args[1]})) / 60)'
        return match.group(0)

    line = re.sub(
        r'TIMESTAMPDIFF\s*\(\s*(MINUTE\s*,.*)\)',
        replace_timestampdiff,
        line,
        flags=re.IGNORECASE,
    )
    return line

for line in lines:
    s = line.rstrip('\n')
    if re.match(r'^CREATE TABLE(?: IF NOT EXISTS)?', s, re.IGNORECASE):
        inside_create = True
        m = re.search(r'CREATE TABLE(?: IF NOT EXISTS)? `?([^`\s(]+)`?', s, re.IGNORECASE)
        current_table = m.group(1) if m else None
        s = s.replace('`', '')
        out_lines.append(s)
        continue

    if inside_create and s.strip().startswith(')'):
        inside_create = False
        current_table = None
        if out_lines:
            prev = out_lines[-1].rstrip()
            if prev.endswith(','):
                out_lines[-1] = prev[:-1]
        out_lines.append(s)
        continue

    if inside_create:
        s = s.replace('`', '')
        s = re.sub(r'INT PRIMARY KEY AUTO_INCREMENT', 'SERIAL PRIMARY KEY', s, flags=re.IGNORECASE)
        s = re.sub(r'CHAR\(36\) PRIMARY KEY DEFAULT \(UUID\(\)\)', 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', s, flags=re.IGNORECASE)
        s = re.sub(r'CHAR\(36\) NOT NULL DEFAULT \(UUID\(\)\)', 'UUID NOT NULL DEFAULT gen_random_uuid()', s, flags=re.IGNORECASE)
        s = re.sub(r'CHAR\(36\) PRIMARY KEY', 'UUID PRIMARY KEY', s, flags=re.IGNORECASE)
        s = re.sub(r'CHAR\(36\)', 'UUID', s, flags=re.IGNORECASE)
        s = re.sub(r'ON UPDATE CURRENT_TIMESTAMP', '', s, flags=re.IGNORECASE)
        s = re.sub(r'DATETIME', 'TIMESTAMP', s, flags=re.IGNORECASE)
        s = re.sub(r'UNSIGNED', '', s, flags=re.IGNORECASE)
        s = re.sub(r'DEFAULT CURRENT_TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', s, flags=re.IGNORECASE)
        s = normalize_mysql_functions(s)
        s = re.sub(r'JSON\b', 'JSONB', s, flags=re.IGNORECASE)
        s = re.sub(
            r'([a-zA-Z0-9_]+)\s+ENUM\(([^)]+)\)',
            lambda m: f"{m.group(1)} VARCHAR(255) CHECK ({m.group(1)} IN ({m.group(2)}))",
            s,
            flags=re.IGNORECASE,
        )
        index_match = re.match(r'\s*(UNIQUE KEY|KEY|INDEX)\s+([^\s(]+)\s*\((.*)\)\s*,?', s, flags=re.IGNORECASE)
        if index_match and current_table:
            kind = index_match.group(1).upper()
            name = index_match.group(2)
            cols = index_match.group(3).replace('`', '').strip()
            cols = re.sub(r'([a-zA-Z_][a-zA-Z0-9_]*)\(\d+\)', r'\1', cols)
            comma = ',' if s.strip().endswith(',') else ''
            if kind == 'UNIQUE KEY':
                out_lines.append(f'    CONSTRAINT {name} UNIQUE ({cols}){comma}')
            else:
                post_indexes.append(f'CREATE INDEX IF NOT EXISTS {name} ON {current_table} ({cols});')
            continue
        s = re.sub(r'UNIQUE KEY\s+([^\s(]+)\s*\(([^)]+)\)', r'CONSTRAINT \1 UNIQUE (\2)', s, flags=re.IGNORECASE)
        s = re.sub(r'ENGINE=\w+\s*', '', s, flags=re.IGNORECASE)
        s = re.sub(r'DEFAULT CHARSET=[^\s]+', '', s, flags=re.IGNORECASE)
        s = re.sub(r'COLLATE=[^\s]+', '', s, flags=re.IGNORECASE)
        s = re.sub(r'AUTO_INCREMENT=\d+', '', s, flags=re.IGNORECASE)
        out_lines.append(s)
        continue

    s = s.replace('`', '')
    s = normalize_mysql_functions(s)
    s = re.sub(r'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', '', s, flags=re.IGNORECASE)
    if s.strip().upper().startswith('USE '):
        continue
    if s.strip().upper().startswith('CREATE DATABASE'):
        out_lines.append("CREATE DATABASE menugo_db WITH ENCODING 'UTF8' TEMPLATE=template0;")
        continue
    out_lines.append(s)

final = ['-- PostgreSQL schema converted from MySQL schema', 'CREATE EXTENSION IF NOT EXISTS pgcrypto;', '']
final.extend(out_lines)
final.append('')
final.extend(post_indexes)
out_path.write_text('\n'.join(final), encoding='utf-8')
print(f'Generated {out_path} with {len(final)} lines and {len(post_indexes)} index statements.')

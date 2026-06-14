import json
import os
from supabase import create_client

def load_env():
    # Attempt to load from .env file in root
    env = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def seed():
    env = load_env()
    url = env.get('VITE_SUPABASE_URL')
    key = env.get('VITE_SUPABASE_ANON_KEY')
    
    if not url or not key:
        print("No se encontraron credenciales en el archivo .env.")
        url = input("Ingresa tu SUPABASE_URL: ").strip()
        key = input("Ingresa tu SUPABASE_ANON_KEY (anon public): ").strip()
        
    if not url or not key:
        print("Credenciales inválidas. Cancelando subida.")
        return

    print("Conectando a Supabase...")
    try:
        supabase = create_client(url, key)
    except Exception as e:
        print(f"Error al conectar: {e}")
        return

    seed_path = os.path.join('src', 'data', 'products_seed.json')
    if not os.path.exists(seed_path):
        print(f"No se encontró el archivo de semilla en: {seed_path}")
        return

    with open(seed_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"Se cargaron {len(products)} productos locales. Subiendo a Supabase...")
    
    # Strip local string IDs ('p-001') to let Supabase auto-generate UUIDs, 
    # or keep them if they fit in UUID? Wait, the schema defines 'id' as UUID, 
    # so we cannot insert string IDs like 'p-001' into a UUID column.
    # We must remove the 'id' field so Supabase auto-generates the UUID!
    # Let's map and upload.
    uploaded_count = 0
    batch_size = 50
    
    for i in range(0, len(products), batch_size):
        batch = products[i:i+batch_size]
        batch_payload = []
        for p in batch:
            p_copy = p.copy()
            if 'id' in p_copy:
                del p_copy['id'] # Supabase will generate UUID
            batch_payload.append(p_copy)
            
        try:
            res = supabase.table('products').insert(batch_payload).execute()
            uploaded_count += len(batch_payload)
            print(f"Subidos {uploaded_count}/{len(products)} productos...")
        except Exception as e:
            print(f"Error al subir lote: {e}")
            break

    print("\n¡Proceso de semilla completado!")
    print(f"Se subieron con éxito {uploaded_count} productos a la tabla 'products'.")

if __name__ == '__main__':
    seed()

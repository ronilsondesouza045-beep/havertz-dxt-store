-- HAVERTZ.DXT - DATABASE SCHEMA

-- 1. Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  imvu_nick TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Orders Table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  whatsapp TEXT,
  imvu_nick TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('DIRETO', 'PRESENTE')),
  amount_k INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  proof_image_url TEXT,
  status TEXT DEFAULT 'aguardando pagamento' CHECK (status IN ('aguardando pagamento', 'em análise', 'pagamento confirmado', 'em entrega', 'entregue', 'cancelado')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Settings Table
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  pix_key TEXT,
  pix_name TEXT,
  whatsapp TEXT,
  store_notice TEXT,
  store_open BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert Initial Settings
INSERT INTO settings (id, pix_key, pix_name, whatsapp, store_notice, store_open)
VALUES (1, 'seu-pix@exemplo.com', 'Nome do Favorecido', '5511999999999', 'Bem-vindo à Havertz.DXT! Entrega manual e segura.', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. RLS Policies for Orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Only admins can update orders" ON orders FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. RLS Policies for Settings
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Only admins can update settings" ON settings FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8. Functions & Triggers for auto-role (Basic approach)
-- Note: In a real app, you'd use a Trigger or Edge Function to set admin based on email
-- For this demo, the app logic will handle the role assignment after signup if email matches ronisouza495@gmail.com

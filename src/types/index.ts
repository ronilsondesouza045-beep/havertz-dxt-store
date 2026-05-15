export type ProductCategory = 'credits' | 'service' | 'produto_mn' | 'free_fire' | 'seguidores' | 'streaming';

export interface Profile {
  id: string;
  name: string;
  email: string;
  imvu_nick: string;
  whatsapp?: string;
  avatar_url?: string;
  role: 'admin' | 'client';
  created_at: string;
}

export type ReceiptVerificationStatus = 'validado' | 'pendente_verificacao_manual' | 'rejeitado';

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  whatsapp?: string;
  imvu_nick?: string;
  player_id?: string;
  player_nick?: string;
  instagram_handle?: string;
  customer_instagram?: string;
  customer_whatsapp?: string;
  external_proof_received?: boolean;
  external_proof_channel?: 'instagram' | 'whatsapp' | 'outro';
  external_proof_note?: string;
  access_email?: string;
  product_type: string;
  product_name: string;
  product_category: ProductCategory;
  notes?: string;
  main_field_label?: string;
  main_field_value?: string;
  payment_method: string;
  payment_status: string;
  total_price: number;
  amount_k?: number;
  proof_image_url?: string | null;
  proof_file_name?: string;
  proof_verification_status?: ReceiptVerificationStatus;
  proof_verification_reason?: string;
  status: 'aguardando comprovante' | 'aguardando pagamento' | 'em análise' | 'pagamento confirmado' | 'em entrega' | 'entregue' | 'cancelado' | 'removido pelo cliente';
  admin_note?: string;
  is_deleted?: boolean;
  deleted_by?: 'client' | 'admin';
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  pix_key: string;
  pix_name: string;
  whatsapp: string;
  instagram_official?: string;
  whatsapp_official?: string;
  proof_instructions?: string;
  store_notice: string;
  store_open: boolean;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  type?: 'DIRETO' | 'PRESENTE' | string;
  amount_k?: number;
  description?: string;
  image_url?: string;
  requirements?: {
    imvu_nick?: boolean;
    whatsapp?: boolean;
    player_id?: boolean;
    instagram_handle?: boolean;
    access_email?: boolean;
    is_adult?: boolean;
  };
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  rating: number;
  category: string;
  comment: string;
  is_visible: boolean;
  created_at: any;
  updated_at: any;
}

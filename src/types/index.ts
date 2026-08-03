export type UserRole = 'user' | 'mitra' | 'admin';
export type PartnerType = 'bengkel' | 'teknisi' | 'tambal_ban';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type OrderType = 'cari_bantuan' | 'booking_bengkel';
export type VehicleType = 'motor' | 'mobil';

export type OrderStatus =
  | 'menunggu_mitra'
  | 'diterima'
  | 'menuju_lokasi'
  | 'tiba'
  | 'inspeksi'
  | 'menunggu_persetujuan_biaya'
  | 'sedang_dikerjakan'
  | 'selesai'
  | 'dibayar'
  | 'ditutup';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  profile_photo?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PartnerProfile {
  id: string;
  user_id: string;
  partner_type: PartnerType;
  business_name: string;
  address: string;
  latitude: number;
  longitude: number;
  verification_status: VerificationStatus;
  is_online: boolean;
  rating_average: number;
  services?: string | null;
  ktp_photo?: string | null;
  business_photo?: string | null;
  qris_photo?: string | null;
}

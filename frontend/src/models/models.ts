export interface UserModel {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
export interface ClothingItem {
  id: string;
  userId: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  createdAt: string;
  name?: string;
  description?: string;
  colors?: string[];
  seasons?: string[];
  occasions?: string[];
  updatedAt?: string;
  isPublic?: boolean;
}

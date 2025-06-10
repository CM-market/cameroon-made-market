import { API_URL, ImageUploadApi } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

interface MinioConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

const config: MinioConfig = {
  endpoint: import.meta.env.VITE_MINIO_ENDPOINT || 'localhost',
  port: parseInt(import.meta.env.VITE_MINIO_PORT || '9000'),
  useSSL: import.meta.env.VITE_MINIO_USE_SSL === 'false',
  accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY || '',
  secretKey: import.meta.env.VITE_MINIO_SECRET_KEY || '',
  bucketName: import.meta.env.VITE_MINIO_BUCKET_NAME || 'product-images'
};

const token = localStorage.getItem('token');
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (3MB)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds the maximum limit of 3MB`);
    }

    const formData = new FormData();
    formData.append('file', file);
    const response = await ImageUploadApi.upload(file);

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Failed to upload image');
    }

    const imageUrl = response.data;
    return imageUrl;
  } catch (error) {
    throw error;
  }
};

export const getImageUrl = (objectName: string): string => {
  // If the objectName is already a full URL, return it as is
  if (objectName.startsWith('http://') || objectName.startsWith('https://')) {
    return objectName;
  }

  // Remove any /browser/ prefix if present
  const cleanObjectName = objectName.replace('/browser/', '');
    console.log("cleanObjectName: " + cleanObjectName);

  // Construct the URL using the MinIO configuration
  const baseUrl = import.meta.env.VITE_MINIO_PUBLIC_URL || `http://${config.endpoint}:${config.port}`;
  console.log("baseUrl: " + baseUrl);
  console.log("endpoint" + `${baseUrl}/${config.bucketName}/${cleanObjectName}`);
  return `${baseUrl}/${config.bucketName}/${cleanObjectName}`;
}; 
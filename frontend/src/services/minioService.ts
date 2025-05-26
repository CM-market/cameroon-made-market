import { v4 as uuidv4 } from 'uuid';

interface MinioConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}
const API_URL = "http://localhost:8080"

const config: MinioConfig = {
  endpoint: import.meta.env.VITE_MINIO_ENDPOINT || 'localhost',
  port: parseInt(import.meta.env.VITE_MINIO_PORT || '9000'),
  useSSL: import.meta.env.VITE_MINIO_USE_SSL === 'true',
  accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY || '',
  secretKey: import.meta.env.VITE_MINIO_SECRET_KEY || '',
  bucketName: import.meta.env.VITE_MINIO_BUCKET_NAME || 'product-images'
};

const token = localStorage.getItem('token');
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds the maximum limit of 2MB`);
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/products/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to upload image');
    }

    const imageUrl = await response.text();
    return imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
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
  
  // Construct the URL using the MinIO configuration
  const baseUrl = import.meta.env.VITE_MINIO_PUBLIC_URL || `http://${config.endpoint}:${config.port}`;
  console.log("baseUrl: " + baseUrl);
  return `${baseUrl}/${config.bucketName}/${cleanObjectName}`;
}; 
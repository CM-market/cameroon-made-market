import { CreateProductData } from "@/lib/api";

export const createProduct = async (productData: CreateProductData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your authentication header here if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, productData: Partial<CreateProductData>) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add your authentication header here if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const getProduct = async (productId: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
      headers: {
        // Add your authentication header here if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const listProducts = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
      headers: {
        // Add your authentication header here if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}; 
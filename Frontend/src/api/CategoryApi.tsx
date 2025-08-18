import axios from "axios"

axios.defaults.baseURL = "http://localhost:3000/api/";


interface CategoryData {
    title: string;
    slug: string;
    icon?: string;
    isActive?: boolean;
}
export const getCategories = async (options?: {
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'isActive';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}) => {
  const params = new URLSearchParams();
  
  if (options?.sortBy) params.append('sortBy', options.sortBy);
  if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
  if (options?.isActive !== undefined) params.append('isActive', String(options.isActive));
  
  const queryString = params.toString();
  const url = queryString ? `/categories?${queryString}` : '/categories';
  
  const response = await axios.get(url);
  return response.data;
};

export const createCategory = async(data: CategoryData) => {
    try{
        const response = await axios.post("categories",data);
        return response.data;
        
    }catch(error){
        console.error("Error Creation Category:",error)
        throw error;
    }
}
export const updateCategory = async(id:string,data:CategoryData) => {
    try{
        const response = await axios.put(`categories/${id}`,data);
        return response.data;
    }catch(error){
        console.error("Error Updating Category:",error)
        throw error;
    }
}
export const deleteCategory = async(id: string) => {
    try{
        const response = await axios.delete(`categories/${id}`);
        return response.data;
    }catch(error){
        console.error("Error Deleting Category:",error)
        throw error;
    }
}
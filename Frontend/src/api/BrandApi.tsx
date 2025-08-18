import axios from "axios"

axios.defaults.baseURL = "http://localhost:3000/api/";

interface BrandData {
    name: string;
    nameTH?: string;
    slug?: string;
    categories?: { category?: string; logo?: string; isActive?: boolean }[];
}

export const getBrands = async()=>{
    try {
        const response = await axios.get("brands");
        return response.data;
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
}

export const createBrands = async(data:BrandData)=>{
    try {
        const response = await axios.post("brands",data);
        return response.data;
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
}

export const updateBrand = async(id:string, data:BrandData)=>{
    try{   
        const response = await axios.put(`brands/${id}`, data);
        return response.data;

    }catch(error){
        console.error("Error updating brand:", error);
        throw error;
    }
}

export const deleteBrand = async(id: string)=>{
    try {
        const response = await axios.delete(`brands/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting brand:", error);
        throw error;
    }
}
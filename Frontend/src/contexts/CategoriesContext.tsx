import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCategories } from '../api/CategoryApi';

interface Category {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SortOptions {
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'isActive';
  sortOrder: 'asc' | 'desc';
  isActive?: boolean;
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  sortOptions: SortOptions;
  refetchCategories: (options?: Partial<SortOptions>) => Promise<void>;
  setSortOptions: (options: Partial<SortOptions>) => void;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const refetchCategories = async (options?: Partial<SortOptions>) => {
    try {
      setLoading(true);
      const finalOptions = { ...sortOptions, ...options };
     
      if (options) {
        setSortOptions(finalOptions);
      }
      
      const response = await getCategories(finalOptions);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSortOptions = (options: Partial<SortOptions>) => {
    const newOptions = { ...sortOptions, ...options };
    setSortOptions(newOptions);
    refetchCategories(newOptions);
  };

  useEffect(() => {
    refetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ 
      categories, 
      loading, 
      sortOptions,
      refetchCategories,
      setSortOptions: updateSortOptions
    }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
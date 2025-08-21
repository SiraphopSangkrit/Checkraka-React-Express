import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  useDisclosure,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Switch,
  Image,
  Avatar,
} from "@heroui/react";
import { useEffect, useState } from "react";
import FileInputWithPreview from "../../Components/FileInputWithPreview";
import { getCategories } from "../../api/CategoryApi";
import { createBrands, getBrands, updateBrand } from "../../api/BrandApi";

export default function AdminBrand() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [brandName, setBrandName] = useState("");
  const [brandNameTH, setBrandNameTH] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  type CategoryType = {
    _id: string;
    title: string;
  };

  type CategoryWithFile = {
    category: string;
    logo: File | null;
    isActive: boolean;
    existingLogo?: string; // For edit mode
  };

  type BrandType = {
    _id: string;
    name: string;
    nameTH: string;
    slug: string;
    isActive: boolean;
    categories: {
      category: {
        _id: string;
        title: string;
      };
      logo: string;
      isActive: boolean;
    }[];
    createdAt: string;
    updatedAt: string;
  };

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categoryFiles, setCategoryFiles] = useState<CategoryWithFile[]>([]);
  const [brands, setBrands] = useState<BrandType[]>([]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

const fetchBrands = async()=>{
  try {
    const data = await getBrands();
    setBrands(Array.isArray(data.data) ? data.data : []);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
  }
}

  const handleRemoveCategory = (categoryIdToRemove: string) => {
    const newSelectedCategories = new Set(selectedCategories);
    newSelectedCategories.delete(categoryIdToRemove);
    setSelectedCategories(newSelectedCategories);
    
    // Remove from categoryFiles but preserve existing data for potential re-selection
    setCategoryFiles(prev => prev.filter(cf => cf.category !== categoryIdToRemove));
  };

  const handleCategorySelection = (keys: any) => {
    const keySet = new Set(Array.from(keys).map(String));
    setSelectedCategories(keySet as Set<string>);
    
    // Update categoryFiles array based on selection
    const newCategoryFiles = Array.from(keySet).map(categoryId => {
      const existing = categoryFiles.find(cf => cf.category === categoryId);
      
      if (existing) {
        return existing; // Keep existing data including existingLogo
      }
      
      // For new selections in edit mode, check if this category was originally in the brand
      if (isEditMode && editingBrandId) {
        const originalBrand = brands.find(b => b._id === editingBrandId);
        const originalCategory = originalBrand?.categories.find(cat => cat.category._id === categoryId);
        
        if (originalCategory) {
          return {
            category: categoryId as string,
            logo: null,
            isActive: originalCategory.isActive,
            existingLogo: originalCategory.logo
          };
        }
      }
      
      // For completely new categories
      return {
        category: categoryId as string,
        logo: null,
        isActive: true
      };
    });
    
    setCategoryFiles(newCategoryFiles);
  };

  const handleFileChange = (categoryId: string, file: File | null) => {
    setCategoryFiles(prev => 
      prev.map(cf => 
        cf.category === categoryId 
          ? { ...cf, logo: file }
          : cf
      )
    );
  };

  const handleCategoryActiveToggle = (categoryId: string, isActive: boolean) => {
    setCategoryFiles(prev => 
      prev.map(cf => 
        cf.category === categoryId 
          ? { ...cf, isActive: isActive }
          : cf
      )
    );
  };

  const handleEditBrand = (brand: BrandType) => {
    setIsEditMode(true);
    setEditingBrandId(brand._id);
    setBrandName(brand.name);
    setBrandNameTH(brand.nameTH || "");
    
    // Set selected categories
    const brandCategoryIds = brand.categories.map(cat => cat.category._id);
    setSelectedCategories(new Set(brandCategoryIds));
    
    // Set category files with existing data
    const existingCategoryFiles = brand.categories.map(cat => ({
      category: cat.category._id,
      logo: null, // Will be null for existing images, user can upload new ones
      isActive: cat.isActive,
      existingLogo: cat.logo // Store existing logo URL for reference
    }));
    setCategoryFiles(existingCategoryFiles);
    
    onOpen();
  };

  const resetForm = () => {
    setBrandName("");
    setBrandNameTH("");
    setSelectedCategories(new Set());
    setCategoryFiles([]);
    setIsEditMode(false);
    setEditingBrandId(null);
  };

  const handleSave = async () => {
    try {
      if (isEditMode && editingBrandId) {
        // Check if any new files were uploaded
        const hasNewFiles = categoryFiles.some(cf => cf.logo && cf.logo instanceof File);
        
        if (hasNewFiles) {
          // Edit mode with new files - use FormData
          const formData = new FormData();
          
          // Add basic brand data
          formData.append('name', brandName);
          formData.append('nameTH', brandNameTH);
          
          // Add category metadata
          formData.append('categories', JSON.stringify(categoryFiles.map(cf => ({
            category: cf.category,
            isActive: cf.isActive,
            logo: cf.existingLogo // Include existing logo URL for categories without new uploads
          }))));
          
          // Add new files with category reference
          categoryFiles.forEach((cf) => {
            if (cf.logo && cf.logo instanceof File) {
              formData.append(`categoryLogo_${cf.category}`, cf.logo);
            }
          });
          
          const response = await updateBrand(editingBrandId, formData);
          console.log("Brand updated successfully with new files:", response);
        } else {
          // Edit mode without new files - use regular JSON data
          const brandData = {
            name: brandName,
            nameTH: brandNameTH,
            categories: categoryFiles.map(cf => ({
              category: cf.category,
              logo: cf.existingLogo || "https://placehold.co/600x400.png",
              isActive: cf.isActive
            }))
          };

          const response = await updateBrand(editingBrandId, brandData);
          console.log("Brand updated successfully:", response);
        }
      } else {
        // Create mode - use FormData for file uploads
        const formData = new FormData();
        
        // Add basic brand data
        formData.append('name', brandName);
        formData.append('nameTH', brandNameTH);
        
        // Add category metadata (without file data)
        formData.append('categories', JSON.stringify(categoryFiles.map(cf => ({
          category: cf.category,
          isActive: cf.isActive
        }))));
        
        // Add files separately with category reference
        categoryFiles.forEach((cf) => {
          if (cf.logo && cf.logo instanceof File) {
            formData.append(`categoryLogo_${cf.category}`, cf.logo);
          }
        });
        
        const response = await createBrands(formData);
        console.log("Brand created successfully:", response);
      }
      
      // Reset form and refresh
      resetForm();
      await fetchBrands();
      onOpenChange(); 

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} brand:`, error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat._id === categoryId)?.title || '';
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        <Button 
          color="primary" 
          onPress={() => {
            resetForm();
            onOpen();
          }}
        >
          Add New Brand
        </Button>
      </div>

      <Table aria-label="Brands table">
        <TableHeader>
          <TableColumn>BRAND</TableColumn>
          <TableColumn>CATEGORIES</TableColumn>
          <TableColumn>IMAGES</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No brands found">
          {brands.map((brand) => (
            <TableRow key={brand._id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold">{brand.name}</span>
                  {brand.nameTH && (
                    <span className="text-sm text-gray-500">{brand.nameTH}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {brand.categories.map((catWithLogo) => (
                    <Chip
                      key={catWithLogo.category._id}
                      color={catWithLogo.isActive ? "success" : "default"}
                      variant="flat"
                      size="sm"
                    >
                      {catWithLogo.category.title}
                    </Chip>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {brand.categories.map((catWithLogo) => (
                    <div key={catWithLogo.category._id} className="flex flex-col items-center gap-1">
                      <Avatar
                        src={catWithLogo.logo}
                        alt={`${brand.name} - ${catWithLogo.category.title}`}
                        size="sm"
                        className="w-12 h-12"
                        fallback={
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                            {catWithLogo.category.title.charAt(0)}
                          </div>
                        }
                      />
                      <span className="text-xs text-gray-500 text-center">
                        {catWithLogo.category.title}
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">

                  {brand.categories.map((catWithLogo) => (
                    <div className="flex gap-2" key={catWithLogo.category._id}>
                      <p>{catWithLogo.category.title}</p>
                      <Chip
                        color={catWithLogo.isActive ? "success" : "danger"}
                        variant="flat"
                        size="sm"
                        >
                  {catWithLogo.isActive ? "Active" : "Inactive"}
                </Chip>
                  </div>
                  ))}
                  </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    color="primary"
                    onPress={() => handleEditBrand(brand)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" color="danger">
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          onOpenChange();
        }} 
        size="2xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{isEditMode ? "Edit Brand" : "Add New Brand"}</ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <Input
                    label="Brand Name"
                    placeholder="Enter brand name"
                    value={brandName}
                    onValueChange={setBrandName}
                    className="w-full"
                  />
                  <Input
                    label="Brand Name TH"
                    placeholder="Enter brand name TH"
                    value={brandNameTH}
                    onValueChange={setBrandNameTH}
                    className="w-full"
                  />

                  <Select
                    label="Categories" 
                    placeholder="Select Categories"
                    selectionMode="multiple" 
                    selectedKeys={selectedCategories}
                    onSelectionChange={handleCategorySelection}
                    className="w-full"
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat._id}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </Select>

                  

                  {/* File Upload Section for Each Selected Category */}
                  {categoryFiles.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Upload Logo for Each Category</h3>
                      {categoryFiles.map((categoryFile) => (
                        <Card key={categoryFile.category} className="p-4">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <Chip color="primary" variant="flat">
                                  {getCategoryName(categoryFile.category)}
                                </Chip>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show in this category:</span>
                                <Switch
                                  isSelected={categoryFile.isActive}
                                  onValueChange={(isActive) => handleCategoryActiveToggle(categoryFile.category, isActive)}
                                  size="sm"
                                  color="success"
                                />
                              </div>
                            </div>
                          </CardHeader>
                          <CardBody>
                            {isEditMode && categoryFile.existingLogo && !categoryFile.logo && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Current logo:</p>
                                <Avatar
                                  src={categoryFile.existingLogo}
                                  alt={`Current logo for ${getCategoryName(categoryFile.category)}`}
                                  className="w-20 h-20"
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload a new image to replace this logo</p>
                              </div>
                            )}
                            <FileInputWithPreview
                              onFileChange={(file) => handleFileChange(categoryFile.category, file)}
                              accept="image/*"
                              maxSize={5}
                              placeholder={
                                isEditMode 
                                  ? `Upload new logo for ${getCategoryName(categoryFile.category)}` 
                                  : `Upload logo for ${getCategoryName(categoryFile.category)}`
                              }
                              value={categoryFile.logo}
                            />
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isDisabled={
                    !brandName.trim() || 
                    categoryFiles.length === 0 ||
                    (!isEditMode && categoryFiles.some(cf => !cf.logo)) // Only require new files for create mode
                  }
                >
                  {isEditMode ? "Update" : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

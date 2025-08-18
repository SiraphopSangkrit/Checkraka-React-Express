import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Chip,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  useDisclosure,
  Input,
  Checkbox,
  addToast
} from "@heroui/react";
import { useEffect, useState, useMemo } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/CategoryApi";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCategories } from "../../contexts/CategoriesContext";
import { useAsyncList } from "@react-stately/data";
import { Link } from "react-router";

// Define the Category interface
interface Category {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  title: string;
  slug: string;
  icon: string;
  isActive: boolean;
}

export default function AdminProductCategory() {
  const { categories, loading, refetchCategories } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    title: "",
    slug: "",
    icon: "",
    isActive: false,
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onOpenChange: onConfirmChange,
  } = useDisclosure();
  const [isDelete, setIsDelete] = useState<Category | null>(null);

  // Use useAsyncList for sorting
  const list = useAsyncList({
    async load() {
      return {
        items: categories,
      };
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          const first = a[sortDescriptor.column as keyof Category];
          const second = b[sortDescriptor.column as keyof Category];
          
          let cmp: number;
          
          if (typeof first === 'boolean' && typeof second === 'boolean') {
            cmp = first === second ? 0 : first ? 1 : -1;
          } else if (typeof first === 'string' && typeof second === 'string') {
            cmp = first.localeCompare(second);
          } else {
            cmp = 0;
          }

          if (sortDescriptor.direction === "descending") {
            cmp *= -1;
          }

          return cmp;
        }),
      };
    },
  });

  // Update list when categories change
  useEffect(() => {
    list.reload();
  }, [categories]);

  const IconComponent = ({ iconName }: { iconName: string }) => {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    const Icon = icons[iconName];

    if (!Icon) {
      return <LucideIcons.Package size={24} />;
    }

    return <Icon size={24} />;
  };

  // Reset form and open modal for creating new category
  const handleCreate = () => {
    setIsEditing(false);
    setEditingCategory(null);
    setFormData({
      title: "",
      slug: "",
      icon: "",
      isActive: true,
    });
    onOpen();
  };

  // Set form data and open modal for editing existing category
  const handleEdit = (category: Category) => {
    setIsEditing(true);
    setEditingCategory(category);
    setFormData({
      title: category.title,
      slug: category.slug,
      icon: category.icon || "",
      isActive: category.isActive,
    });
    onOpen();
  };

  const handleDelete = (category: Category) => {
    setIsDelete(category);
    onConfirmOpen();
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleInputChange = (
    field: keyof CategoryFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && editingCategory) {
        await updateCategory(editingCategory._id, formData);
      } else {
        await createCategory(formData);
      }
      
      // Refetch with current sort options
      await refetchCategories();
      
      addToast({
        title: isEditing ? "Category updated" : "Category created",
        description: `The category "${formData.title}" has been ${
          isEditing ? "updated" : "created"
        } successfully.`,
        color: "success"
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save category:", error);
      addToast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        color: "danger"
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (isDelete?._id) {
        await deleteCategory(isDelete._id);
        // Refetch categories to update both admin page and sidebar
        await refetchCategories();
        
        addToast({
          title: "Category deleted",
          description: `The category "${isDelete.title}" has been deleted successfully.`,
          color: "danger"
        });
        onConfirmChange(false);
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      addToast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        color: "danger"
      });
    }
  };

 

  return (
    <div className="p-6">
    
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Categories</h1>
        <Button color="primary" onPress={handleCreate}>
          Add New Category
        </Button>
      </div>

      <Table 
        aria-label="Categories table"
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}
      >
        <TableHeader>
          <TableColumn key="title" allowsSorting>NAME</TableColumn>
          <TableColumn key="slug" allowsSorting>SLUG</TableColumn>
          <TableColumn key="icon">ICON</TableColumn>
          <TableColumn key="isActive">STATUS</TableColumn>
          <TableColumn align="center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={list.items}
          emptyContent={list.isLoading || loading ? "Loading..." : "No categories found."}
          isLoading={list.isLoading || loading}
        >
          {(category) => (
            <TableRow key={category._id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {category.icon && <IconComponent iconName={category.icon} />}
                  {category.title}
                </div>
              </TableCell>
              <TableCell>
                <code className="text-small bg-default-100 px-2 py-1 rounded">
                  {category.slug}
                </code>
              </TableCell>
              <TableCell>
                <div className="bg-default-100 px-2 py-1 rounded w-fit">
                  {category.icon}
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  color={category.isActive ? "success" : "danger"}
                  variant="flat"
                  size="sm"
                >
                  {category.isActive ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    onPress={() => handleEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onPress={() => handleDelete(category)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? "Edit Category" : "Add New Category"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Category Name"
                    placeholder="Enter category name"
                    value={formData.title}
                    onValueChange={handleTitleChange}
                    isRequired
                  />

                  <Input
                    label="Icon"
                    placeholder="Package, Car, Settings, etc."
                    value={formData.icon}
                    onValueChange={(value) => handleInputChange("icon", value)}
                    description={<span>
                      Browse icons at{" "}
                      <Link 
                        to="https://lucide.dev/icons/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Lucide Icons
                      </Link>
                    </span>}
                    endContent={
                      formData.icon && (
                        <div className="flex items-center">
                          <IconComponent iconName={formData.icon} />
                        </div>
                      )
                    }
                  />

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isActive"
                      isSelected={formData.isActive}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.checked)
                      }
                      className="w-4 h-4"
                    >
                      Active
                    </Checkbox>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isDisabled={!formData.title.trim()}
                >
                  {isEditing ? "Update Category" : "Add Category"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={isConfirmOpen} onOpenChange={onConfirmChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Category</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this {isDelete?.title } ? 
    
                  </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    handleConfirmDelete();
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

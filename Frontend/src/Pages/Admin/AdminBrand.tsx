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
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
} from "@heroui/react";
import { useEffect, useState } from "react";
import FileInputWithPreview from "../../Components/FileInputWithPreview";
import { getCategories } from "../../api/CategoryApi";

export default function AdminBrand() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [brandName, setBrandName] = useState("");

  type CategoryType = {
    _id: string;
    title: string;
   
  };
  
  const [category, setCategory] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const fetchCategories = async () => {
    // Fetch categories from your API or data source
    const data = await getCategories();
    setCategory(data);
  };
  

  const handleSave = () => {
    // Here you would typically upload the file and save the brand
    console.log("Brand Name:", brandName);
    console.log("Selected File:", selectedFile);

    // Reset form
    setBrandName("");
    setSelectedFile(null);
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold ">Models</h1>
        <Button color="primary" onPress={onOpen}>
          Add New Brand
        </Button>
      </div>

      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>Tony Reichert</TableCell>
            <TableCell>CEO</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow key="2">
            <TableCell>Zoey Lang</TableCell>
            <TableCell>Technical Lead</TableCell>
            <TableCell>Paused</TableCell>
          </TableRow>
          <TableRow key="3">
            <TableCell>Jane Fisher</TableCell>
            <TableCell>Senior Developer</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow key="4">
            <TableCell>William Howard</TableCell>
            <TableCell>Community Manager</TableCell>
            <TableCell>Vacation</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Brand</ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <Input
                    label="Brand Name"
                    placeholder="Enter brand name"
                    value={brandName}
                    onValueChange={setBrandName}
                    className="w-full"
                  />

                  <Autocomplete 
                    label="Category" 
                    placeholder="Search Category"
                    selectedKey={selectedCategory}                          // Controlled value
                    onSelectionChange={(key) => setSelectedCategory(key as string)} // Handle selection
                    className="w-full"
                  >
                    {category.map((cat) => (
                      <AutocompleteItem key={cat._id}>
                        {cat.title}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {/* File Upload Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Brand Logo
                    </label>

                    <FileInputWithPreview
                      onFileChange={setSelectedFile}
                      accept="image/*"
                      maxSize={5}
                      placeholder="Click to upload logo or drag and drop"
                      value={selectedFile}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleSave();
                    onClose();
                  }}
                  isDisabled={!brandName.trim() || !selectedFile}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

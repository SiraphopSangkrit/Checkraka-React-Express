import { useParams, Link } from "react-router";
import { Button } from "@heroui/react";

export default function AdminCategory() {
  const { category } = useParams<{ category: string }>();

  const categoryData = {
    cars: {
     
      brands: ["Toyota", "Honda", "Ford", "BMW"],
    },
    motorcycles: {
    
      brands: ["Yamaha", "Kawasaki", "Harley-Davidson", "Ducati"],
    },
    trucks: {
     
      brands: ["Volvo", "Scania", "Mercedes-Benz"]
    },
    
  };

  const currentCategory = categoryData[category as keyof typeof categoryData];

  if (!currentCategory) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <p>The category "{category}" does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{category ? category.charAt(0).toUpperCase() + category.slice(1) : "Unknown Category"}</h1>
        <Button color="primary">
          Add New {category?.slice(0, -1)}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-content1 rounded-lg p-4  shadow-md" >
          <h3 className="text-lg font-semibold mb-4">Brands</h3>
          <div className="space-y-2">
            {currentCategory.brands.map((brand) => (
              <Link
                key={brand}
                to={`/admin/${category}/brand?name=${brand.toLowerCase()}`}
                className="block p-2 hover:bg-content2 rounded-md transition-colors"
              >
                {brand}
              </Link>
            ))}
          </div>
          <Link to={`/admin/${category}/brand`}>
            <Button className="mt-4 w-full" variant="bordered">
              Manage Brands
            </Button>
          </Link>
        </div>

        <div className="bg-content1 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Models</h3>
          <p className="text-default-500 mb-4">Manage {category} models</p>
          <Button className="w-full" variant="bordered">
            Manage Models
          </Button>
        </div>

        <div className="bg-content1 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total {category}:</span>
              <span className="font-semibold">1,234</span>
            </div>
            <div className="flex justify-between">
              <span>Active listings:</span>
              <span className="font-semibold">987</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useParams, Link } from "react-router";
import {
  Button,
  Table,
  TableBody,
  TableHeader,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/react";

export default function AdminProduct() {
  const { category } = useParams<{ category: string }>();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {category
            ? category.charAt(0).toUpperCase() + category.slice(1)
            : "Unknown Category"}
        </h1>
        <Button color="primary">Add New {category?.slice(0, -1)}</Button>
      </div>
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>ACTION</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>Example Product</TableCell>
            <TableCell>This is an example product description.</TableCell>

            <TableCell>
              <Link
                to={`/product/${category}/edit/1`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </Link>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

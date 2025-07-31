import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Button,
  } from "@heroui/react";


  
export default function AdminProductCategory() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Product Categories</h1>
      <Table aria-label="Example static collection table">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn align="center">Action</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No rows to display."}>
        <TableRow>
          <TableCell>Tony Reichert</TableCell>
          <TableCell>CEO</TableCell>
          <TableCell>
            <div className="flex justify-center">

            <Button color="primary" className="mr-2">Edit</Button>
            <Button color="danger">Delete</Button>
            </div>
            </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    </div>
  );
}
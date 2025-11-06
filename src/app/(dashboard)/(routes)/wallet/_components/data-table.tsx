// DataTable.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useState } from "react";
import TransactionDetailsDialog from "./TransactionDetailsDialog"; // Import the new Dialog component

// Define the structure of a transaction (TData)
type Transaction = {
  type: string;
  amount: number;
  status: string;
  date: string;
  walletaddress: string;
};

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
}

// Ensure TData must conform to the Transaction structure
export function DataTable<TData extends Transaction>({
  columns,
  data,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TData | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const handleRowClick = (row: TData) => {
    setSelectedRow(row);
    setIsOpen(true);
  };

  return (
    <div>
      <div className="rounded-md">
        <Table className="text-dimWhite border-none">
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="bg-transparent border-none w-full  items-center justify-between my-2 cursor-pointer hover:bg-gray-700 rounded-lg transition"
                  onClick={() => handleRowClick(row.original)} // Make row clickable
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-dimWhite"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4 mr-4">
        <Button
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="text-dimWhite rounded-lg bg-black"
        >
          Previous
        </Button>
        <Button
          className="bg-teal-300 text-white"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Dialog/Pop-up to show row details */}
      <TransactionDetailsDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedRow={selectedRow}
      />
    </div>
  );
}

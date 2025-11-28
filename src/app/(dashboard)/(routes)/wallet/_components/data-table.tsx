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
import { useRouter } from "next/navigation";
import TransactionDetailsDialog from "./TransactionDetailsDialog";
import { UserTransactionss } from "./columns";

interface DataTableProps<TData extends UserTransactionss> {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: string;
}

export function DataTable<TData extends UserTransactionss>({
  columns,
  data,
  emptyMessage = "No transactions yet.",
}: DataTableProps<TData>) {
  const router = useRouter();
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
    // If it's a team earning, navigate to detail page
    if (row.isTeamEarning && row.teamEarningDate) {
      router.push(`/wallet/team-earnings/${row.teamEarningDate}`);
      return;
    }
    
    // Otherwise, show transaction details dialog
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
                  className="bg-transparent border-none w-full items-center justify-between my-2 cursor-pointer hover:bg-white/5 rounded-lg transition"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-dimWhite">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getRowModel().rows.length > 0 && (
      <div className="flex items-center justify-end space-x-2 py-4 mr-4">
        <Button
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
            className="text-dimWhite rounded-lg bg-white/10 hover:bg-white/20"
        >
          Previous
        </Button>
        <Button
            className="bg-teal-500 text-white hover:bg-teal-400"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      )}

      <TransactionDetailsDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedRow={selectedRow}
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { AdminAdd } from "@/components/admin/admin-add";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

export default function page() {
  return (
    <>
      <div className='w-full min-h-screen'>
        <div className='mt-10 p-4 '>
          <div className='flex flex-row items-center gap-2 justify-between'>
            <div className='flex gap-4'>
              <Input
                placeholder='Enter account name'
                className='bg-white min-w-[400px] mx-auto'
              />
              {/* <div
                        className='relative hidden sm:flex w-fit h-fit hover:scale-105 transition-transform duration-200 bg-[#FAF9F6] rounded-lg'>
                        <Input placeholder='Search...' />
                    </div> */}

              <Button variant={"secondary"}> Add Account </Button>
            </div>
            {/*<Button variant={'secondary'}> Add Account </Button>*/}
            <AdminAdd />
          </div>

          <div className='mt-8  '>
            <Table className='bg-white text-black rounded-lg '>
              <TableHeader className='p-10'>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>ID #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className='font-medium'>
                      1
                    </TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}

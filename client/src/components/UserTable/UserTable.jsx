import React, { useEffect, useMemo, useState } from "react";
import userService from "@/services/users.service";
import _ from "lodash";

//COMPONENTS
import UserSheet from "@/components/UserTable/UserSheet";
import UserImport from "../UserImport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, ChevronDown, Import } from "lucide-react";

//TABLE FORMATTING
const columns = [
  { label: "First Name", key: "firstName" },
  { label: "Last Name", key: "lastName" },
  { label: "Email", key: "email" },
  { label: "Role", key: "role" },
  { label: "Created At", key: "createdAt" },
  { label: "Updated At", key: "updatedAt" },
];

const UserTable = () => {
  const testUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // STATES
  const [columnVisibility, setColumnVisibility] = useState(
    JSON.parse(localStorage.getItem("columnVisibilityPreferences")) || {
      lastName: true,
      firstName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  );
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState("lastName");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [pageDialog, setPageDialog] = useState(1);
  const [open, setOpen] = useState(false);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const importDescription = [
    "Insert datas",
    "Colums mapping :",
    "Import Preview :",
    "Import successful",
  ];

  //FUNCTIONS & HANDLERS
  // Fetch users or search results
  const fetchUsers = async (
    currentPage,
    currentSortBy,
    currentOrder,
    query = ""
  ) => {
    setIsSearching(!!query);
    try {
      const response = query
        ? await userService.searchUsers(
            query,
            currentPage,
            limit,
            currentSortBy,
            currentOrder
          )
        : await userService.getAllUsers(
            currentPage,
            limit,
            currentSortBy,
            currentOrder
          );
      console.log(response.data);
      setUsers(response.data.searchedUsers || response.data.users);
      setTotalUsers(response.data.totalUsers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search field
  const debounceSearch = useMemo(() =>
    _.debounce((query) => {
      setDebouncedSearch(query);
    }, 300)
  );

  //Handle the search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    debounceSearch(e.target.value);
  };

  // Handle column visibility change
  const handleVisilityChange = (columnKey, isChecked) => {
    setColumnVisibility((prev) => {
      const updatedVisibility = { ...prev, [columnKey]: isChecked };
      localStorage.setItem(
        "columnVisibilityPreferences",
        JSON.stringify(updatedVisibility)
      );
      return updatedVisibility;
    });
  };

  // Sort on a given column
  const handleSort = (column) => {
    const newOrder = order === "asc" ? "desc" : "asc";
    setSortBy(column);
    setOrder(newOrder);
  };

  // Move to the page number
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  //Refresh the table when the sheet is closed after save button has been clicked
  const refreshUsers = () => {
    fetchUsers(page, sortBy, order, debouncedSearch);
  };

  //HOOK
  // Render the fetched users when page, sortBy, order change or after a debounced search
  useEffect(() => {
    fetchUsers(page, sortBy, order, debouncedSearch);
  }, [page, sortBy, order, debouncedSearch, open]);

  return (
    <div>
      {/* Top block with the search field and the column visibility button */}
      <div className="flex w-full justify-between items-center py-4">
        <Input
          className="max-w-sm"
          placeholder="Search for a name or email..."
          value={search}
          onChange={handleSearchChange}
        />
        <div className="flex">
          {/* Add user button to create a new user to the list  */}
          <UserSheet onSave={refreshUsers} />
          {/* Bulk import of a list of users  */}
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) setPageDialog(1); // Réinitialiser pageDialog à 1 quand on ferme la modale
            }}
          >
            <DialogTrigger asChild>
              <Button className="mr-2">
                <Import />
                Import a list
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import a list of users</DialogTitle>
                <DialogDescription>
                  {importDescription[`${pageDialog}` - 1]}
                </DialogDescription>
              </DialogHeader>
              <div>
                <UserImport
                  pageDialog={pageDialog}
                  setPageDialog={setPageDialog}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Dropdown to select the column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <ChevronDown /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={columnVisibility[column.key]}
                  onCheckedChange={(isChecked) =>
                    handleVisilityChange(column.key, isChecked)
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table block */}
      <div className="rounded-md border">
        <Table>
          {/* Mapping over the columns'label */}
          <TableHeader>
            <TableRow>
              {columns.map(
                (column) =>
                  columnVisibility[column.key] && (
                    <TableHead key={column.key} className="p-0 m-0">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.key)}
                      >
                        {column.label}
                        <ArrowUpDown />
                      </Button>
                    </TableHead>
                  )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Displaying skeleton while waiting for the server response */}
            {isSearching && (
              <TableRow>
                {columns.map(
                  (column) =>
                    columnVisibility[column.key] && (
                      <TableCell key={column.key}>
                        <Skeleton className="w-[100px] h-[10px] rounded-full" />
                      </TableCell>
                    )
                )}
              </TableRow>
            )}

            {/* Displaying the fetched users */}
            {!isSearching &&
              users.length > 0 &&
              users.map((user) => (
                <TableRow key={user._id}>
                  {columns.map(
                    (column) =>
                      columnVisibility[column.key] && (
                        <TableCell key={column.key} className="pl-4">
                          {(() => {
                            switch (column.key) {
                              case "createdAt":
                                return new Date(
                                  user.createdAt
                                ).toLocaleDateString();
                              case "updatedAt":
                                return new Date(
                                  user.updatedAt
                                ).toLocaleDateString();
                                Displaying;

                              default:
                                return user[column.key];
                            }
                          })()}
                        </TableCell>
                      )
                  )}
                  <TableCell>
                    <UserSheet user={user} onSave={refreshUsers} />
                  </TableCell>
                </TableRow>
              ))}

            {/* If the fetched response has no users */}
            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center font-semibold"
                >
                  🥺 No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom block with the users displayed count and the navigation throw pages buttons */}
      <div className="flex justify-between items-center w-full py-4">
        <p className="font-thin text-sm italic">{totalUsers} users </p>
        <div>
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            variant="outline"
            className="mx-2"
          >
            Prev
          </Button>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            variant="outline"
            className="mx-2"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;

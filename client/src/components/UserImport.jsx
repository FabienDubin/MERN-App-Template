import { useEffect, useState } from "react";
import { DEFAULT_PASS } from "@/config/defaultPassword.config";
import userService from "@/services/users.service";
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronRight, ChevronLeft, AlertCircle, Import } from "lucide-react";

// Helper function to format names
const capitalize = (str) => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()); // Met la première lettre en majuscule
};

// Helper function to check emails
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// List of valid roles to check roles
const validRoles = ["user", "moderator", "admin"];

const UserImport = ({ pageDialog, setPageDialog }) => {
  // STATES
  // const [pageDialog, setPageDialog] = useState(1);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mappedHeaders, setMappedHeaders] = useState({});
  const [errors, setErrors] = useState([]);

  // HANDLERS
  //Handle the data pasting from excel
  const handlePaste = (event) => {
    setInput(event.target.value);
  };

  //Handle the parsing of the datas per user
  const parseUsers = () => {
    const rows = input.trim().split("\n");
    if (rows.length < 2) return alert("Incorrect format.");

    // Extract headers and normalize names
    const rawHeaders = rows[0].split("\t").map((h) => h.trim().toLowerCase());
    setHeaders(rawHeaders);

    // Automatique mapping
    const schemaKeys = {
      nom: "lastName",
      lastname: "lastName",
      "last name": "lastName",
      prenom: "firstName",
      prénom: "firstName",
      "first name": "firstName",
      firstname: "firstName",
      email: "email",
      role: "role",
    };
    const defaultMapping = Object.fromEntries(
      rawHeaders.map((h) => [h, schemaKeys[h] || ""])
    );

    setMappedHeaders(defaultMapping);

    setPageDialog(2); // Move to pageDialog 2
  };

  //Handle column mapping
  const applyMapping = () => {
    const rows = input.trim().split("\n").slice(1);
    let parsedUsers = [];
    let validationErrors = [];
    rows.forEach((row, rowIndex) => {
      const values = row.split("\t");
      let user = { password: DEFAULT_PASS };
      let rowErrors = [];
      headers.forEach((header, index) => {
        const key = mappedHeaders[header];
        if (key) {
          let value = values[index]?.trim();
          if (key === "firstName" || key === "lastName")
            value = capitalize(value);
          if (key === "role") {
            value = value.toLowerCase();
            if (!validRoles.includes(value)) {
              rowErrors.push(`Invalid role on line ${rowIndex + 2} : ${value}`);
            }
          }
          if (key === "email") {
            value = value.toLowerCase();
            if (!isValidEmail(value)) {
              rowErrors.push(
                `Invalid email on line ${rowIndex + 2} : ${value}`
              );
            }
          }
          user[key] = value;
        }
      });
      parsedUsers.push({ ...user, hasError: rowErrors.length > 0 });
      validationErrors.push(...rowErrors);
    });
    setUsers(parsedUsers);
    setErrors(validationErrors);
    setPageDialog(3);
  };

  //Handle api call to server
  const sendToServer = async () => {
    const validUsers = users.filter((user) => !user.hasError);
    try {
      const response = await userService.bulkImport(validUsers);
      if (response.status === 200) {
        setErrors(response.data.errors || []);
        setPageDialog(4);
      } else {
        alert("Import Error");
      }
    } catch (error) {
      console.error(error);
      alert("Import Error", error);
    }
  };

  return (
    <div>
      {/* STEP 1 - Paste data */}
      {pageDialog === 1 && (
        <>
          <Textarea
            rows="10"
            cols="70"
            value={input}
            onChange={handlePaste}
            placeholder="Copy-paste data from Excel with headers"
          />
          <div className="flex justify-end">
            <Button className="mt-4 w-1/3" onClick={parseUsers}>
              Next
              <ChevronRight />
            </Button>
          </div>
        </>
      )}

      {/* STEP 2 - Map columns */}
      {pageDialog === 2 && (
        <>
          {headers.map((header, index) => (
            <div key={index}>
              <div className="flex justify-start items-center my-2">
                <Label className="w-1/4">{header} → </Label>
                <Select
                  className="w-2/3"
                  value={mappedHeaders[header]}
                  onValueChange={(value) =>
                    setMappedHeaders({
                      ...mappedHeaders,
                      [header]: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ignore">Ignore</SelectItem>
                    <SelectItem value="lastName">Last Name</SelectItem>
                    <SelectItem value="firstName">First Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-8">
            <Button className="w-full mr-1" onClick={() => setPageDialog(1)}>
              <ChevronLeft />
              Back
            </Button>
            <Button className="w-full ml-1" onClick={applyMapping}>
              Next <ChevronRight />
            </Button>
          </div>
        </>
      )}

      {/* STEP 3 - Preview */}
      {pageDialog === 3 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Last Name</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{user.lastName}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {errors.length > 0 && (
            <div className="my-4">
              <hr />
              <Alert variant="destructive" className="my-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error detected!</AlertTitle>
                <AlertDescription>
                  The following lines won't be imported
                  <ul>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
          <div className="flex justify-between">
            <Button className="w-full mr-1" onClick={() => setPageDialog(2)}>
              <ChevronLeft /> Back
            </Button>
            <Button className="w-full ml-1" onClick={sendToServer}>
              <Import /> Import
            </Button>
          </div>
        </>
      )}

      {/* STEP 4 - CONFIRMATION */}
      {pageDialog === 4 && (
        <div>
          <div className="flex flex-col items-center">
            <img
              className="h-[80px] w-[80px]"
              src="/CompletionAnim.gif"
              alt="completion animation"
            />
          </div>
          <p>Import has been done 🌈</p>

          <Button className="w-full mt-8" onClick={() => setPageDialog(1)}>
            Import agaiin
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserImport;

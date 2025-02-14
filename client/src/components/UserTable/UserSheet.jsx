import React, { useState } from "react";
import userService from "@/services/users.service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserRoundPlus } from "lucide-react";
import UserForm from "./UserForm";
import { useToast } from "@/hooks/use-toast";

const UserSheet = ({ user, onSave }) => {
  const isEditMode = Boolean(user);

  //STATES
  const [open, setOpen] = useState(false);

  //TOAST
  const { toast } = useToast();

  //HANDLERS
  //Close the sheet when save button is clicked
  const handleClose = () => {
    setOpen(false);
    if (onSave) {
      onSave();
    }
  };

  //
  const handleDeleteUser = async () => {
    console.log("user to delete", user._id);
    const username = user.firstName;
    try {
      const response = await userService.deleteUser(user._id);
      toast({
        title: "Bye bye👋",
        description: `${username} has been deleted`,
      });
      setOpen(false);
      onSave();
    } catch (error) {
      console.log(error);
      toast({
        title: "Oups, we've got a problem",
        message: "",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {isEditMode ? (
          <MoreHorizontal />
        ) : (
          <Button className="mx-2">
            <UserRoundPlus />
            Create a user
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? `Edit ${user.firstName}'s profile` : "Create User"}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col justify-between h-full">
          <UserForm user={user} onClose={handleClose} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mb-6 w-full">
                Delete user
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  {user?.firstName}'s user account and remove its data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500"
                  onClick={() => handleDeleteUser()}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserSheet;

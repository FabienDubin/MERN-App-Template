import React, { useContext, useState } from "react";
import userService from "@/services/users.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { FALLBACK_IMG } from "@/config/envVar.config";
import authService from "@/services/auth.service";
import { DEFAULT_PASS } from "@/config/envVar.config";
import { AuthContext } from "@/context/auth.context";
import { useToast } from "@/hooks/use-toast";

const UserForm = ({ user, onClose }) => {
  const isEditMode = Boolean(user);
  const { toast } = useToast();
  //CONTEXT
  const { user: authenticatedUser, updateUser } = useContext(AuthContext);

  //STATES
  const [formData, setFormData] = useState(
    user || {
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
      image: null,
      password: DEFAULT_PASS,
    }
  );
  const [previewImage, setPreviewImage] = useState(user?.image || FALLBACK_IMG);
  const [imageFile, setImageFile] = useState(null);

  //HANDLERS
  //Handles the text typed in the form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //Handles the role selector
  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  //Handles the image file input
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  //Handle the password reset action when the button is triggered
  const sendPasswordReset = async () => {
    if (!formData.email) {
      toast({
        title: "Email is required",
        description: "Please enter your email address",
        status: "error",
      });
      return;
    }
    const email = formData.email;
    console.log({ email });
    try {
      const response = await authService.forgotPassword({ email });
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for further instructions",
      });
    } catch (error) {
      console.log(error);
    }
  };

  //Handle the form submission
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let updatedUser = formData;

      if (imageFile) {
        const response = await userService.updateUserImage(
          formData._id,
          imageFile
        );
        updatedUser = { ...formData, image: response.data.updatedUser.image };
        setPreviewImage(response.data.updatedUser.image);
      }

      if (isEditMode) {
        await userService.updateUser(formData._id, updatedUser);
      } else {
        const response = await authService.signup(updatedUser);
        updatedUser = response.data;
      }
      if (window.location.pathname === "/dashboard/users") {
        onClose();
        toast({
          title: `${
            isEditMode
              ? `${user.firstName}'s profile updated`
              : "User created successfully!"
          }`,
          description: `${
            isEditMode
              ? "Everything is under control!"
              : `${formData.firstName} can now sign in with the default password: ${DEFAULT_PASS}`
          }`,
        });
      }
      if (window.location.pathname === "/profile") {
        updateUser(updatedUser);
        toast({
          title: "Your profile has been updated!",
          description: "Everything is under control!",
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <form onSubmit={handleSave} className="my-5">
      {/* No image section in the creation form */}
      {isEditMode && (
        <div className="flex flex-col gap-2">
          <Label>Profile Image</Label>
          <div className="flex items-center gap-4">
            <img
              src={previewImage}
              alt="Profile image"
              className="h-16 w-16 rounded-full object-cover"
            />
            <Label className="cursor-pointer border border-input bg-background shadow-sm rounded-md p-2">
              <Input
                type="file"
                className="hidden"
                onChange={handleImageChange}
              />
              <Pencil className="w-4 inline-block mr-2" /> Change
            </Label>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Label>First Name</Label>
        <Input
          name="firstName"
          placeholder="First Name"
          required
          value={formData.firstName}
          onChange={handleChange}
        />
      </div>

      <div className="mt-4">
        <Label>Last Name</Label>
        <Input
          name="lastName"
          required
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>

      <div className="mt-4">
        <Label>Email</Label>
        <Input
          name="email"
          type="email"
          required
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* Only visible in the dashboard users page  */}
      {window.location.pathname === "/dashboard/users" && (
        <div className="mt-4">
          <Label>Role</Label>
          <Select defaultValue={formData.role} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        className="mt-4"
        onClick={(e) => {
          e.preventDefault();
          sendPasswordReset();
        }}
        variant="outline"
        disabled={!isEditMode}
      >
        Reset password
      </Button>
      <div className="flex justify-end mt-5 ">
        <Button type="submit" className="w-32">
          {isEditMode ? "Save" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

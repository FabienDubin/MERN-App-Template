import UserForm from "@/components/UserTable/UserForm";
import { AuthContext } from "@/context/auth.context";
import React, { useContext } from "react";

const Profile = () => {
  //CONTEXT
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col w-2/3 mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Hello {user.firstName} 👋,</h1>
      <h2 className="text-xl mb-4">Welcome to your profile!</h2>
      <UserForm user={user} />
    </div>
  );
};

export default Profile;

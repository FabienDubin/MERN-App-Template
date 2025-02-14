import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className=" text-7xl md:text-9xl font-bold drop-shadow-xl text-center uppercase">
        Oops! This page does not exist.
      </h1>
      <Link to="/">
        <Button className="w-full">
          <Home />
          Go back Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;

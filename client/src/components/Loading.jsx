import { useState, useEffect } from "react";

import { Progress } from "@/components/ui/progress";

const Loading = () => {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} className="w-[60%]" />;
};

export default Loading;

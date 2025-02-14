import React from "react";
import { useTheme } from "@/components/ThemeProvider";

const Monogram = () => {
  // THEME
  const { theme } = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      className="fill-foreground"
      preserveAspectRatio="xMidYMid meet"
      // Edit the viewbox
      viewBox="0 0 159.7 159.6"
    >
      {/* Paste the code here to replace the existing SVG path with your own custom logo design. */}

      <path
        className="st0"
        d="M143,142.9H16.7V16.6h126.3v126.3ZM27.7,131.9h104.3V27.6H27.7v104.3Z"
      />
      <g>
        <g>
          <path
            className="st0"
            d="M53.4,66.8v-14.6h-3.2v-5.8h3.2v-5.5h6.5v5.5h3.7v5.8h-3.7v14.6h-6.5Z"
          />
          <path
            className="st0"
            d="M67,66.8v-28.8h6.5v9.4c.7-.5,1.5-.9,2.4-1.2.9-.3,1.8-.4,2.9-.4,1.5,0,2.8.3,4,1,1.1.7,2,1.7,2.7,2.9s1,2.8,1,4.6v12.4h-6.5v-11.5c0-1.1-.2-1.9-.7-2.6s-1.3-1-2.3-1-1.9.3-2.5.9-.9,1.5-.9,2.6v11.5h-6.5,0Z"
          />
          <path
            className="st0"
            d="M108,65.9c-1.8.8-3.6,1.2-5.4,1.4-1.8.2-3.5,0-5.1-.3-1.6-.4-3-1-4.2-2s-2.2-2.1-2.9-3.5-1-3.1-1-4.9.3-3,.8-4.3,1.2-2.5,2.2-3.4,2.1-1.8,3.4-2.3,2.7-.8,4.2-.8,2.6.2,3.7.7c1.1.4,2.1,1.1,2.9,1.9.8.8,1.5,1.8,2,2.9.5,1.1.8,2.3.9,3.6.1,1.3,0,2.7-.2,4.2h-13c.5,1,1.3,1.7,2.5,2.1s2.6.6,4.2.4c1.6-.2,3.3-.6,5.2-1.3v5.6h0s0,0,0,0ZM99.7,51.6c-.8,0-1.5.2-2.1.6-.6.4-1.1,1.1-1.5,1.9h7.1c-.3-.9-.8-1.6-1.4-2s-1.3-.6-2.2-.6h0Z"
          />
        </g>
        <path
          className="st0"
          d="M53.9,121.6v-51.6h19c1.5,5.2,2.9,10.4,4.4,15.7,1.4,5.3,2.9,10.5,4.3,15.7,1.4-5.2,2.8-10.4,4.3-15.7,1.4-5.3,2.9-10.5,4.3-15.7h18.7c0,8.5.1,17.1.1,25.8s.1,17.3.2,25.8h-12.8v-35c-1.5,5.8-3.1,11.6-4.6,17.5s-3.1,11.7-4.6,17.5h-11.5c-1.5-5.7-3-11.4-4.6-17.2s-3-11.5-4.6-17.2v34.4h-12.5,0Z"
        />
      </g>
    </svg>
  );
};

export default Monogram;

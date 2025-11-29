import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { ChakraProvider } from "@chakra-ui/react";

// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    <QueryClientProvider client={queryClient}>
      {/* <ChakraProvider> */}
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      {/* </ChakraProvider> */}
      <Toaster position="top-center" />
    </QueryClientProvider>
  </RecoilRoot>
);

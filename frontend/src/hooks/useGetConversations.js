import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { conversationsAtom } from "../store/atom/messagesAtom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function useGetConversations() {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);

      try {
        const res = await axiosInstance.get("/messages/conversations");
        if (res.data) {
          // console.log(res.data);
          setConversations(res.data);
        } else return toast.error(`Conversations Not Found 😥`);
      } catch (error) {
        toast.error(`${error.message} 😥`);
      } finally {
        setLoading(false);
      }
    };
    getConversations();
  }, [setConversations]);

  return { conversations, setConversations, loading };
}

export default useGetConversations;

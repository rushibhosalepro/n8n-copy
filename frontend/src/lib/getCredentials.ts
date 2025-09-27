import api from "@/lib/api";

export const getCredential = async (nodeType: string) => {
  try {
    const res = await api.get(`/credential/${nodeType}`);
    // console.log(res.data);
    return res.data;
  } catch (error) {}
};

// src/CurrentTime.jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function CurrentTime({ api }) {
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: [api],
    queryFn: () => axios.get(api).then(res => res.data)
  });

  if (isLoading) return `Loading ${api}...`;
  if (error) return "Erreur: " + error.message;

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, margin: 10 }}>
      <p>API: {data.api}</p>
      <p>Time from DB: {data.now}</p>
      <div>{isFetching ? "Updating..." : ""}</div>
    </div>
  );
}

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function EditPayableRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === "string") {
      router.replace(`/payables/${id}`);
    }
  }, [id, router]);

  return null;
}

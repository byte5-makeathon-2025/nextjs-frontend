import { Suspense } from "react";
import CreateWish from "./create-wish";

export default function Page() {
  return (
    <Suspense>
      <CreateWish />
    </Suspense>
  );
}

import { DOC_TYPES } from "@/lib/docTypes";
import DocCreatorClient from "./DocCreatorClient";

export function generateStaticParams() {
  return DOC_TYPES.map((docType) => ({ docType }));
}

export default function DocCreator() {
  return <DocCreatorClient />;
}

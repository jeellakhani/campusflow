import { Metadata } from "next";
import { LostFoundForm } from "@/components/lost-found/lost-found-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Report Lost/Found Item" };

export default function NewLostFoundPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Report an Item"
        description="Post details about an item you've lost or found."
      />
      <LostFoundForm />
    </div>
  );
}

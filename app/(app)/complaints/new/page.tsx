import { Metadata } from "next";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "New Complaint" };

export default function NewComplaintPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Report an Issue"
        description="Submit a new complaint to the administration."
      />
      <ComplaintForm />
    </div>
  );
}

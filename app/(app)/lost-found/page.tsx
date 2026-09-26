import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeDate } from "@/lib/utils";
import { Search, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { LostFoundPost } from "@/types";

export const metadata = { title: "Lost & Found" };

export default async function LostFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  let query = supabase
    .from("lost_found_posts")
    .select("*, profiles(full_name)")
    .eq("is_resolved", false)
    .order("created_at", { ascending: false });

  if (params.type) query = query.eq("type", params.type);
  if (params.category) query = query.eq("category", params.category);

  const { data: posts } = await query;

  const categories = ["electronics", "documents", "clothing", "accessories", "books", "keys", "wallet", "phone", "other"];

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Lost & Found"
        description="Find lost items or report items you've found."
        action={{ label: "Report Item", href: "/lost-found/new" }}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <Button variant={!params.type ? "default" : "outline"} size="sm" asChild>
            <Link href={`/lost-found${params.category ? `?category=${params.category}` : ""}`}>All</Link>
          </Button>
          <Button variant={params.type === "lost" ? "default" : "outline"} size="sm" asChild>
            <Link href={`/lost-found?type=lost${params.category ? `&category=${params.category}` : ""}`}>Lost Items</Link>
          </Button>
          <Button variant={params.type === "found" ? "default" : "outline"} size="sm" asChild>
            <Link href={`/lost-found?type=found${params.category ? `&category=${params.category}` : ""}`}>Found Items</Link>
          </Button>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No items found"
          description="There are no items matching your current filters."
          action={{ label: "Report Item", href: "/lost-found/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(posts as LostFoundPost[]).map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              {post.image_url ? (
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <Image src={post.image_url} alt={post.item_name} fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Search className="h-8 w-8 text-primary/40" />
                </div>
              )}
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base line-clamp-1">{post.item_name}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${post.type === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {post.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{post.description}</p>
                <div className="space-y-1.5 text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="line-clamp-1">{post.location}</span>
                  </div>
                  {post.contact_info && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">{post.contact_info}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <span className="capitalize">{post.category}</span>
                    <span>{formatRelativeDate(post.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

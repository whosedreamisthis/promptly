import { Suspense } from "react";
import NotebookView from "@/components/notebook/NotebookView";

async function NotebookContent({
  params,
}: PageProps<"/notebooks/[notebookId]">) {
  const { notebookId } = await params;
  return <NotebookView notebookId={notebookId} />;
}

export default function NotebookPage(
  props: PageProps<"/notebooks/[notebookId]">,
) {
  return (
    <Suspense fallback={null}>
      <NotebookContent {...props} />
    </Suspense>
  );
}

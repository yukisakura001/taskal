import ProjectDetail from "./ProjectDetail";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  
  return (
    <div>
      <ProjectDetail projectId={projectId} />
    </div>
  );
}

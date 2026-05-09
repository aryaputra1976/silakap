import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

export function HeaderBreadcrumbs() {
  return (
    <div className="flex flex-row items-center flex-wrap gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbSeparator className="text-xs text-muted-foreground px-2.5">
            /
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>

          <Button size="sm" variant="secondary">
            Draft
          </Button>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

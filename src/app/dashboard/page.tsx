import { redirect } from "next/navigation";
import { pageRoutes } from "@/lib/routes";

export default function DashboardIndexPage() {
	redirect(pageRoutes.dashboard.profile);
}

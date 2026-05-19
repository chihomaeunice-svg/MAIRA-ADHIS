import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getStatusColor } from "@/lib/utils";

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  status: string;
  lastActivity: string;
}

interface RecentCasesProps {
  cases: Case[];
}

export function RecentCases({ cases }: RecentCasesProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h3 className="font-semibold text-navy-900">Recent Cases</h3>
        <Link
          href="/cases"
          className="text-sm text-gold-500 hover:text-gold-600 font-medium flex items-center"
        >
          View all <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="divide-y divide-gray-50">
        {cases.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            No cases found
          </div>
        ) : (
          cases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-mono">
                    {c.caseNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900 mt-0.5 truncate">
                  {c.title}
                </div>
                <div className="text-xs text-gray-500">{c.clientName}</div>
              </div>
              <div className="text-xs text-gray-400 text-right flex-shrink-0 ml-4">
                {c.lastActivity}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export default function DashboardSidebar({ className, ...props }: SidebarProps) {
  return (
    <div {...props} className={cn('py-4 space-y-4', className)}>
      <div className="py-2 pr-3 md:pl-3">
        <div className="space-y-1">
          <Button variant="secondary" className="justify-start w-full" asChild>
            <Link href="/">
              <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 text-green-500">
                <g fill="currentColor" fill-rule="evenodd">
                  <path
                    fill-rule="nonzero"
                    d="M6 4.5h12A1.5 1.5 0 0 1 19.5 6v2.5h-15V6A1.5 1.5 0 0 1 6 4.5z"
                    opacity=".1"
                  ></path>
                  <path
                    fill-rule="nonzero"
                    d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6zm1 3h10a.5.5 0 1 1 0 1H7a.5.5 0 0 1 0-1z"
                  ></path>
                  <text
                    font-family="-apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
                    font-size="9"
                    transform="translate(4 2)"
                    font-weight="500"
                  >
                    <tspan x="8" y="15" text-anchor="middle">
                      17
                    </tspan>
                  </text>
                </g>
              </svg>
              Today
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start w-full" asChild>
            <Link href="/">
              <CalendarIcon className="w-4 h-5 mr-2 text-orange-500" />
              Upcoming
            </Link>
          </Button>
        </div>
      </div>
      <div className="py-2 pr-3 md:pl-3">
        <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight">Projects</h2>
        <div className="space-y-1">
          <Button variant="ghost" className="justify-start w-full" asChild>
            <Link href="/">Daily Tasks</Link>
          </Button>
          <Button variant="ghost" className="justify-start w-full" asChild>
            <Link href="/">Agile Development Tracker</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

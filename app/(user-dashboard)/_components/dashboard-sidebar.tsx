import { cn } from '@/lib/utils';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import NavLink from '@/app/(user-dashboard)/_components/nav-link';

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export default function DashboardSidebar({ className, ...props }: SidebarProps) {
  return (
    <div {...props} className={cn('py-4 space-y-4', className)}>
      <div className="py-2 md:px-6">
        <div className="space-y-3">
          <NavLink
            href="/today"
            icon={
              <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 text-green-900 dark:text-green-500">
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
            }
          >
            Today
          </NavLink>
          <NavLink href="/chat" icon={<ChatBubbleIcon className="w-4 h-5 mr-2 text-orange-500" />}>
            AI Assistant
          </NavLink>
          {/* <NavLink
            href="/upcoming"
            icon={<CalendarIcon className="w-4 h-5 mr-2 text-orange-500" />}
          >
            Upcoming
          </NavLink> */}
        </div>
      </div>
      <div className="py-2 md:px-6">
        <h2 className="px-4 mb-4 text-lg font-semibold tracking-tight">Projects</h2>
        <div className="space-y-3">
          <NavLink href="/projects/1">Daily Tasks</NavLink>
          <NavLink href="/projects/2">Agile Development Tracker</NavLink>
        </div>
      </div>
    </div>
  );
}

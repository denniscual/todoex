import { ReloadIcon } from '@radix-ui/react-icons';

export default function Loading() {
  return (
    <div className="fixed top-0 z-[100] max-h-screen w-full p-4 sm:bottom-0 sm:right-0 sm:top-auto md:max-w-[300px] slide-in-from-bottom-full">
      <div className="flex items-center gap-2 p-4 bg-transparent border rounded-md">
        <ReloadIcon className="w-4 h-4 mr-2 animate-spin text-foreground" />
        <span className="text-sm font-semibold">Loading...</span>
      </div>
    </div>
  );
}

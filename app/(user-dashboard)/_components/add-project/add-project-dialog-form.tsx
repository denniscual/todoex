'use client';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AddProjectDialogForm(props: {
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  return (
    <form>
      <DialogHeader>
        <DialogTitle>Add project</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <Input placeholder="E.g Daily Tasks" name="title" id="title" className="col-span-3" />
        </div>
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea rows={4} name="description" id="description" className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button type="submit">Add</Button>
      </DialogFooter>
    </form>
  );
}

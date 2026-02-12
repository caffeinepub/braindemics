import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/useQueries';
import { format } from 'date-fns';

export default function NotificationsBell() {
  const { data: notifications = [], isLoading } = useGetNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    try {
      return format(Number(timestamp) / 1000000, 'MMM dd, HH:mm');
    } catch {
      return 'Recently';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="h-auto p-1 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : unreadCount === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <p className="text-sm font-medium">{notification.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(notification.timestamp)}
                </p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

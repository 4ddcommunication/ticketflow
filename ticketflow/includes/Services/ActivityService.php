<?php

namespace Ticketflow\Services;

use Ticketflow\Models\ActivityLog;

defined('ABSPATH') || exit;

class ActivityService
{
    public function log(int $ticket_id, string $action, array $extra = []): void
    {
        $data = [
            'ticket_id' => $ticket_id,
            'user_id'   => get_current_user_id() ?: null,
            'action'    => $action,
        ];

        if (isset($extra['old_value'])) {
            $data['old_value'] = $extra['old_value'];
        }
        if (isset($extra['new_value'])) {
            $data['new_value'] = $extra['new_value'];
        }
        if (isset($extra['metadata'])) {
            $data['metadata'] = $extra['metadata'];
        }

        ActivityLog::create($data);
    }

    public function get_ticket_activity(int $ticket_id, int $limit = 50): array
    {
        $logs = ActivityLog::get_by_ticket($ticket_id, $limit);

        return array_map(function ($log) {
            $user = $log->user_id ? get_userdata($log->user_id) : null;
            return [
                'id'         => (int) $log->id,
                'ticket_id'  => (int) $log->ticket_id,
                'user'       => $user ? [
                    'id'   => (int) $user->ID,
                    'name' => $user->display_name,
                ] : null,
                'action'     => $log->action,
                'old_value'  => $log->old_value,
                'new_value'  => $log->new_value,
                'metadata'   => $log->metadata ? json_decode($log->metadata, true) : null,
                'created_at' => $log->created_at,
            ];
        }, $logs);
    }
}

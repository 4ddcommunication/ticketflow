<?php

namespace Ticketflow\Models;

use Ticketflow\Database\Schema;

defined('ABSPATH') || exit;

class ActivityLog
{
    private static function table(): string
    {
        return Schema::table('activity_log');
    }

    public static function create(array $data): int|false
    {
        global $wpdb;
        $data['created_at'] = current_time('mysql', true);
        if (isset($data['metadata']) && is_array($data['metadata'])) {
            $data['metadata'] = wp_json_encode($data['metadata']);
        }
        $result = $wpdb->insert(self::table(), $data);
        return $result ? (int) $wpdb->insert_id : false;
    }

    public static function get_by_ticket(int $ticket_id, int $limit = 50): array
    {
        global $wpdb;
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM %i WHERE ticket_id = %d ORDER BY created_at DESC LIMIT %d",
            self::table(),
            $ticket_id,
            $limit
        ));
        return $results ?: [];
    }
}

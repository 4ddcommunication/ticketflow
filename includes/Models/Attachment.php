<?php

namespace Ticketflow\Models;

use Ticketflow\Database\Schema;

defined('ABSPATH') || exit;

class Attachment
{
    private static function table(): string
    {
        return Schema::table('attachments');
    }

    public static function find(int $id): ?object
    {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM %i WHERE id = %d",
            self::table(),
            $id
        ));
    }

    public static function create(array $data): int|false
    {
        global $wpdb;
        $data['created_at'] = current_time('mysql', true);
        $result = $wpdb->insert(self::table(), $data);
        return $result ? (int) $wpdb->insert_id : false;
    }

    public static function delete(int $id): bool
    {
        global $wpdb;
        return (bool) $wpdb->delete(self::table(), ['id' => $id]);
    }

    public static function get_by_ticket(int $ticket_id): array
    {
        global $wpdb;
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM %i WHERE ticket_id = %d ORDER BY created_at ASC",
            self::table(),
            $ticket_id
        ));
        return $results ?: [];
    }

    public static function get_by_reply(int $reply_id): array
    {
        global $wpdb;
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM %i WHERE reply_id = %d ORDER BY created_at ASC",
            self::table(),
            $reply_id
        ));
        return $results ?: [];
    }
}
